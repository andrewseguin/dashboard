import {AngularFireAuth} from '@angular/fire/auth';
import {Collection, Config} from 'app/service/config';
import {sendEvent} from 'app/utility/analytics';
import {BehaviorSubject, Observable, Subject, Subscription} from 'rxjs';
import {filter, map, take} from 'rxjs/operators';

export interface IdentifiedObject {
  id?: string;
  dateCreated?: string;
  dateModified?: string;
}

export abstract class ListDao<T extends IdentifiedObject> {
  private needsSubscription = false;

  protected destroyed = new Subject();

  private subscription: Subscription;

  get list(): BehaviorSubject<T[]|null> {
    if (!this.subscription) {
      this.subscribe();
    }
    return this._list;
  }
  _list = new BehaviorSubject<T[]>(null);

  get map(): BehaviorSubject<Map<string, T>> {
    if (!this.subscription) {
      this.subscribe();
    }

    if (!this._map) {
      this._map = new BehaviorSubject<Map<string, T>>(new Map());
      this.list.subscribe(list => {
        if (list) {
          const map = new Map<string, T>();
          list.forEach(obj => map.set(obj.id, obj));
          this._map.next(map);
        } else {
          this._map.next(null);
        }
      });
    }

    return this._map;
  }
  _map: BehaviorSubject<Map<string, T>>;

  set path(path: string) {
    this._path = path;
    this.collection = this.config.getRepoConfig(path).pipe(
        map(c => c[this.collectionId] || []));

    // If a list has already been accessed, unsubscribe from the previous
    // collection and get values from the new collection
    if (this.subscription || this.needsSubscription) {
      this.subscribe();
      this.needsSubscription = false;
    }
  }
  get path(): string {
    return this._path;
  }
  _path: string;

  protected collection: Observable<Collection<T>>;

  protected constructor(
      protected afAuth: AngularFireAuth, protected config: Config,
      protected collectionId) {
    afAuth.authState.subscribe(auth => {
      if (!auth) {
        this.unsubscribe();
      }
    });
  }
  ngOnDestroy() {
    this.unsubscribe();
    this.destroyed.next();
    this.destroyed.complete();
  }

  add(obj: T): Promise<string> {
    this.decorateForAdd(obj);
    this.sendDaoEvent('add');

    return new Promise(resolve => {
      this.list.pipe(filter(list => !!list), take(1)).subscribe(list => {
        list.push(obj);
        this.config.saveRepoConfigCollection(
            this.path, this.collectionId, list);
        resolve(obj.id);
      });
    });
  }

  get(id: string): Observable<T> {
    return this.map.pipe(map(map => map ? map.get(id) : null));
  }

  update(id: string, update: T) {
    update.dateModified = new Date().toISOString();
    this.sendDaoEvent('update');

    this.map.pipe(filter(map => !!map), take(1)).subscribe(map => {
      map.set(id, {...(map.get(id) as object), ...(update as object)} as T);
      const values = [];
      this._map.forEach(value => values.push(value));
      this.config.saveRepoConfigCollection(
          this.path, this.collectionId, values);
    });
  }

  remove(id: string) {
    this.sendDaoEvent('remove');

    this.map.pipe(filter(map => !!map), take(1)).subscribe(map => {
      map.delete(id);
      const values = [];
      map.forEach(value => values.push(value));
      this.config.saveRepoConfigCollection(
          this.path, this.collectionId, values);
    });
  }

  private subscribe() {
    // Unsubscribe from the current collection
    this.unsubscribe();

    if (!this.collection) {
      this.needsSubscription = true;
    } else {
      this.subscription =
          this.collection.subscribe(v => this._list.next(Object.values(v)));
    }
  }

  unsubscribe() {
    if (this.subscription) {
      this.subscription.unsubscribe();
      this.subscription = null;
      this._list.next(null);
    }
  }

  private decorateForAdd(obj: T) {
    if (!obj.id) {
      obj.id = this.createId();
    }

    obj.dateCreated = new Date().toISOString();
    obj.dateModified = new Date().toISOString();
  }

  private sendDaoEvent(action: 'add'|'update'|'remove') {
    sendEvent(this.path, `db_${action}`);
  }

  private createId(): string {
    return Math.random().toString(16).substring(2);
  }
}
