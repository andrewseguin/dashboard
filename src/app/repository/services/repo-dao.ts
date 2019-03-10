import {Injectable} from '@angular/core';
import {DB, deleteDb, openDb} from 'idb';
import {BehaviorSubject, Subject} from 'rxjs';
import {filter, takeUntil} from 'rxjs/operators';
import {ActivatedRepository} from './activated-repository';
import {Contributor, Item, Label} from './dao';
import {Dashboard} from './dao/dashboards-dao';
import {Query} from './dao/queries-dao';
import {Recommendation} from './dao/recommendations-dao';

export interface RepoConfig {
  dashboards: Dashboard[];
  queries: Query[];
  recommendations: Recommendation[];
}

const DB_VERSION = 1;

export type GithubCollectionId = 'items'|'labels'|'contributors';

export type ConfigCollectionId = 'dashboards'|'queries'|'recommendations';
export const ConfigCollectionIds: ConfigCollectionId[] =
    ['dashboards', 'queries', 'recommendations'];

export const CollectionIds: CollectionId[] =
    ['items', 'labels', 'contributors', 'dashboards', 'queries', 'recommendations'];

export type CollectionId = GithubCollectionId|ConfigCollectionId;

@Injectable()
export class RepoDao2 {
  repository: string;

  values: {[key in CollectionId]: BehaviorSubject<null|any[]>} = {
    dashboards: new BehaviorSubject<null|Dashboard[]>(null),
    queries: new BehaviorSubject<null|Query[]>(null),
    recommendations: new BehaviorSubject<null|Recommendation[]>(null),
    items: new BehaviorSubject<null|Item[]>(null),
    labels: new BehaviorSubject<null|Label[]>(null),
    contributors: new BehaviorSubject<null|Contributor[]>(null),
  };

  private db: Promise<DB>;

  private destroyed = new Subject();

  constructor(activatedRepository: ActivatedRepository) {
    activatedRepository.repository
        .pipe(filter(repository => !!repository), takeUntil(this.destroyed))
        .subscribe(repository => {
          this.initialize(repository);
        });
  }

  ngOnDestroy() {
    this.destroyed.next();
    this.destroyed.complete();
  }

  initialize(repository: string) {
    this.repository = repository;

    this.db = openDb(this.repository, DB_VERSION, function(db) {
      if (!db.objectStoreNames.contains('items')) {
        db.createObjectStore('items', {keyPath: 'id'});
      }
      if (!db.objectStoreNames.contains('labels')) {
        db.createObjectStore('labels', {keyPath: 'id'});
      }
      if (!db.objectStoreNames.contains('contributors')) {
        db.createObjectStore('contributors', {keyPath: 'id'});
      }

      ConfigCollectionIds.forEach(collectionId => {
        if (!db.objectStoreNames.contains(collectionId)) {
          db.createObjectStore(collectionId, {keyPath: 'id'});
        }
      });
    });
    this.db.then(() => CollectionIds.forEach(id => {
      this.initializeAllValues();
    }));
  }

  initializeAllValues() {
    const stores = ['items', 'labels', 'contributors', 'dashboards', 'queries', 'recommendations'];
    stores.forEach(store => {
      this.db
          .then(db => {
            return db.transaction(store, 'readonly').objectStore(store).getAll();
          })
          .then(result => {
            this.values[store].next(result);
          });
    });
  }

  setCollection(collectionId: CollectionId, values: any[]): Promise<void> {
    return this.setValues(values, collectionId);
  }

  removeData() {
    this.db
        .then(db => {
          db.close();
          return deleteDb(this.repository);
        })
        .then(() => {
          this.initialize(this.repository);
        });
  }

  private setValues(values: any[], collectionId: CollectionId) {
    this.values[collectionId].next(values);

    return this.db.then(db => {
      const transaction = db.transaction(collectionId, 'readwrite');
      const store = transaction.objectStore(collectionId);
      values.forEach(v => store.put(v));
      return transaction.complete;
    });
  }
}
