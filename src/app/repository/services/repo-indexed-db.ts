import {Injectable} from '@angular/core';
import {DB, deleteDb, openDb} from 'idb';
import {Subject} from 'rxjs';
import {filter, takeUntil} from 'rxjs/operators';
import {ActivatedRepository} from './activated-repository';

const DB_VERSION = 1;

export type StoreId = 'items'|'labels'|'contributors'|'dashboards'|'queries'|'recommendations';

export const StoreIds: StoreId[] =
    ['items', 'labels', 'contributors', 'dashboards', 'queries', 'recommendations'];

@Injectable()
export class RepoIndexedDb {
  initialValues: {[key in StoreId]?: Subject<any[]>} = {};

  private repository: string;

  private db: Promise<DB>;

  private destroyed = new Subject();

  constructor(activatedRepository: ActivatedRepository) {
    StoreIds.forEach(id => this.initialValues[id] = new Subject<any[]>());

    activatedRepository.repository
        .pipe(filter(repository => !!repository), takeUntil(this.destroyed))
        .subscribe(repository => {
          this.repository = repository;
          this.openDb();
        });
  }

  ngOnDestroy() {
    this.destroyed.next();
    this.destroyed.complete();
  }

  removeData() {
    this.db
        .then(db => {
          db.close();
          return deleteDb(this.repository);
        })
        .then(() => this.openDb());
  }

  updateValues(values: any[], collectionId) {
    return this.db.then(db => {
      const transaction = db.transaction(collectionId, 'readwrite');
      const store = transaction.objectStore(collectionId);
      values.forEach(v => store.put(v));
      return transaction.complete;
    });
  }

  removeValues(ids: string[], collectionId: string) {
    return this.db.then(db => {
      const transaction = db.transaction(collectionId, 'readwrite');
      const store = transaction.objectStore(collectionId);
      ids.forEach(id => store.delete(id));
      return transaction.complete;
    });
  }

  private openDb() {
    this.db = openDb(this.repository, DB_VERSION, function(db) {
      StoreIds.forEach(collectionId => {
        if (!db.objectStoreNames.contains(collectionId)) {
          db.createObjectStore(collectionId, {keyPath: 'id'});
        }
      });
    });
    this.db.then(() => this.initializeAllValues());
  }

  private initializeAllValues() {
    StoreIds.forEach(id => {
      this.db.then(db => db.transaction(id, 'readonly').objectStore(id).getAll()).then(result => {
        this.initialValues[id].next(result);
      });
    });
  }
}
