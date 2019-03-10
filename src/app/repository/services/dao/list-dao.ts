import {Auth} from 'app/service/auth';
import {BehaviorSubject, Observable, Subject, Subscription} from 'rxjs';
import {filter, map, take} from 'rxjs/operators';
import {CollectionId, RepoDao} from '../repo-dao';

export interface IdentifiedObject {
  id?: string;
  dbAdded?: string;
  dbModified?: string;
}

export abstract class ListDao<T extends IdentifiedObject> {
  protected destroyed = new Subject();

  private subscription: Subscription;

  private config: Observable<T[]> = this.repoDao.values[this.collectionId].pipe(filter(v => !!v));

  get list(): BehaviorSubject<T[]|null> {
    this.subscribe();
    return this._list;
  }
  _list = new BehaviorSubject<T[]>(null);

  get map(): BehaviorSubject<Map<string, T>> {
    this.subscribe();

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

  protected constructor(
      protected auth: Auth, protected repoDao: RepoDao, protected collectionId: CollectionId) {
    auth.tokenChanged.subscribe(token => {
      if (!token) {
        this.unsubscribe();
      }
    });
  }

  ngOnDestroy() {
    this.unsubscribe();
    this.destroyed.next();
    this.destroyed.complete();
  }

  // TODO: Combine with add
  addBulk(objArr: T[]): Promise<void> {
    objArr.forEach(o => this.decorateForAdd(o));

    return new Promise(resolve => {
      this.list.pipe(filter(list => !!list), take(1)).subscribe(list => {
        list = list.concat(objArr);
        this.repoDao.setCollection(this.collectionId, list);
        resolve();
      });
    });
  }

  add(obj: T): Promise<string> {
    this.decorateForAdd(obj);

    return new Promise(resolve => {
      this.list.pipe(filter(list => !!list), take(1)).subscribe(list => {
        list.push(obj);
        this.repoDao.setCollection(this.collectionId, list);
        resolve(obj.id);
      });
    });
  }

  get(id: string): Observable<T> {
    return this.map.pipe(map(map => map ? map.get(id) : null));
  }

  update(id: string, update: T) {
    update.dbModified = new Date().toISOString();

    this.map.pipe(filter(map => !!map), take(1)).subscribe(map => {
      map.set(id, {...(map.get(id) as object), ...(update as object)} as T);
      const values = [];
      map.forEach(value => values.push(value));
      this.repoDao.setCollection(this.collectionId, values);
    });
  }

  remove(id: string) {
    this.map.pipe(filter(map => !!map), take(1)).subscribe(map => {
      map.delete(id);
      const values = [];
      map.forEach(value => values.push(value));
      this.repoDao.setCollection(this.collectionId, values);
    });
  }

  private subscribe() {
    if (!this.subscription) {
      this.subscription = this.config.subscribe(v => this._list.next(v));
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

    obj.dbAdded = new Date().toISOString();
    obj.dbModified = new Date().toISOString();
  }

  private createId(): string {
    return Math.random().toString(16).substring(2);
  }
}
