import {BehaviorSubject, Observable} from 'rxjs';
import {filter, map, take} from 'rxjs/operators';
import {RepoIndexedDb, StoreId} from '../repo-indexed-db';

export interface IdentifiedObject {
  id?: string;
  dbAdded?: string;
  dbModified?: string;
}

export interface SyncResponse<T> {
  toAdd: T[];
  toUpdate: T[];
  toRemove: T[];
}

export class ListDao<T extends IdentifiedObject> {
  get list(): BehaviorSubject<T[]|null> {
    return this._list;
  }
  _list = new BehaviorSubject<T[]|null>(null);

  get map(): BehaviorSubject<Map<string, T>|null> {
    if (!this._map) {
      this._map = new BehaviorSubject<Map<string, T>|null>(new Map<string, T>());
      this.list.subscribe(list => {
        if (list) {
          const map = new Map<string, T>();
          list.forEach(obj => map.set(obj.id!, obj));
          this._map.next(map);
        } else {
          this._map.next(null);
        }
      });
    }

    return this._map;
  }
  _map: BehaviorSubject<Map<string, T>|null>;

  private repoIndexedDb: RepoIndexedDb;

  constructor(protected collectionId: StoreId, repoIndexedDb: RepoIndexedDb) {
    this.repoIndexedDb = repoIndexedDb;
    const initialValues = this.repoIndexedDb.initialValues[this.collectionId];
    if (!initialValues) {
      throw Error('Object store not initialized: ' + this.collectionId);
    }

    initialValues.pipe(take(1)).subscribe(values => this._list.next(values));
  }

  add(item: T): string;
  add(items: T[]): string[];
  add(itemOrItems: T|T[]): string|string[] {
    const items = (itemOrItems instanceof Array) ? itemOrItems : [itemOrItems];
    items.forEach(decorateForDb);
    this.repoIndexedDb.updateValues(items, this.collectionId);
    this.list.next([...(this._list.value || []), ...items]);
    return items.map(obj => obj.id!);
  }

  get(id: string): Observable<T|null> {
    return this.map.pipe(map(map => (map && map.get(id)) ? map.get(id)! : null));
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

    items.forEach(decorateForDb);
    this.repoIndexedDb.updateValues(items, this.collectionId);

    this.map.pipe(filter(map => !!map), take(1)).subscribe(map => {
      items.forEach(obj => {
        map!.set(obj.id!, {...(map!.get(obj.id!) as object), ...(obj as object)} as T);
      });

      const values: T[] = [];
      map!.forEach(value => values.push(value));
      this.list.next(values);
    });
  }

  /**
   * Incoming items will be considered the source-of-truth - items already existing will be updated
   * to reflect this list, and stored items that do not appear will be removed.
   */
  sync(items: T[]): Promise<SyncResponse<T>> {
    return new Promise(resolve => {
      const syncMap = new Map<string, T>();
      items.forEach(item => {
        syncMap.set(item.id!, item);
      });

      this.map.pipe(filter(v => !!v), take(1)).subscribe(map => {
        const toRemove: T[] = [];
        map!.forEach((value, key) => {
          if (!syncMap.has(key)) {
            toRemove.push(value);
          }
        });

        const toAdd: T[] = [];
        const toUpdate: T[] = [];
        syncMap.forEach(item => {
          if (!map!.get(item.id!)) {
            toAdd.push(item);
          } else {
            const dbModifiedItemNew = item.dbModified || '';
            const dbModifiedItemCurrent = map!.get(item.id!)!.dbModified!;
            if (dbModifiedItemNew > dbModifiedItemCurrent) {
              toUpdate.push(item);
            }
          }
        });
        resolve({toAdd, toUpdate, toRemove});
      });
    });
  }

  remove(id: string): void;
  remove(ids: string[]): void;
  remove(idOrIds: string|string[]) {
    const ids = (idOrIds instanceof Array) ? idOrIds : [idOrIds];
    this.repoIndexedDb.removeValues(ids, this.collectionId);

    this.map.pipe(filter(map => !!map), take(1)).subscribe(map => {
      ids.forEach(id => map!.delete(id));

      const values: T[] = [];
      map!.forEach(value => values.push(value));
      this.list.next(values);
    });
  }

  removeAll() {
    this.repoIndexedDb
        .removeValues((this._list.value || []).map(item => item.id!), this.collectionId)
        .then(() => {
          this.list.next([]);
        });
  }
}

function decorateForDb(obj: any) {
  if (!obj.id) {
    obj.id = createId();
  }

  if (!obj.dbAdded) {
    obj.dbAdded = new Date().toISOString();
  }

  obj.dbModified = new Date().toISOString();
}

function createId(): string {
  return Math.random().toString(16).substring(2);
}
