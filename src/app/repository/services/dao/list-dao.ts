import {Auth} from 'app/service/auth';
import {BehaviorSubject, Observable} from 'rxjs';
import {filter, map, take} from 'rxjs/operators';
import {RepoIndexedDb, StoreId} from '../repo-indexed-db';

export interface IdentifiedObject {
  id?: string;
  dbAdded?: string;
  dbModified?: string;
}

export abstract class ListDao<T extends IdentifiedObject> {
  get list(): BehaviorSubject<T[]|null> {
    return this._list;
  }
  _list = new BehaviorSubject<T[]|null>(null);

  get map(): BehaviorSubject<Map<string, T>> {
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
      protected auth: Auth, protected repoIndexedDb: RepoIndexedDb,
      protected collectionId: StoreId) {
    this.repoIndexedDb.initialValues[collectionId].pipe(take(1)).subscribe(values => {
      this._list.next(values);
    });
  }

  add(item: T): string;
  add(items: T[]): string[];
  add(itemOrItems: T|T[]): string|string[] {
    const items = (itemOrItems instanceof Array) ? itemOrItems : [itemOrItems];
    items.forEach(o => this.decorateForDb(o));
    this.repoIndexedDb.updateValues(items, this.collectionId);
    this.list.next([...this._list.value, ...items]);
    return items.map(obj => obj.id);
  }

  get(id: string): Observable<T> {
    return this.map.pipe(map(map => map ? map.get(id) : null));
  }

  update(item: T): void;
  update(items: T[]): void;
  update(itemOrItems: T|T[]): void {
    const items = (itemOrItems instanceof Array) ? itemOrItems : [itemOrItems];
    items.forEach(obj => {
      if (!obj.id) {
        throw new Error('Must have an on the object in order to update: ' + JSON.stringify(obj));
      }
    });

    items.forEach(obj => this.decorateForDb(obj));
    this.repoIndexedDb.updateValues(items, this.collectionId);

    this.map.pipe(filter(map => !!map), take(1)).subscribe(map => {
      items.forEach(obj => {
        map.set(obj.id, {...(map.get(obj.id) as object), ...(obj as object)} as T);
      });

      const values = [];
      map.forEach(value => values.push(value));
      this.list.next(values);
    });
  }

  remove(id: string): void;
  remove(ids: string[]): void;
  remove(idOrIds: string|string[]) {
    const ids = (idOrIds instanceof Array) ? idOrIds : [idOrIds];
    this.repoIndexedDb.removeValues(ids, this.collectionId);

    this.map.pipe(filter(map => !!map), take(1)).subscribe(map => {
      ids.forEach(id => map.delete(id));

      const values = [];
      map.forEach(value => values.push(value));
      this.list.next(values);
    });
  }

  private decorateForDb(obj: T) {
    if (!obj.id) {
      obj.id = this.createId();
    }

    if (!obj.dbAdded) {
      obj.dbAdded = new Date().toISOString();
    }

    obj.dbModified = new Date().toISOString();
  }

  private createId(): string {
    return Math.random().toString(16).substring(2);
  }
}
