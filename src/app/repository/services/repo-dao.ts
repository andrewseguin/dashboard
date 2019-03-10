import {Injectable} from '@angular/core';
import {DB, deleteDb, openDb} from 'idb';
import {BehaviorSubject, Observable, Subject} from 'rxjs';
import {filter, map, takeUntil} from 'rxjs/operators';
import {ActivatedRepository} from './activated-repository';
import {Item, Label, Issue, PullRequest, Contributor} from './dao';
import {Dashboard} from './dao/dashboards-dao';
import {Query} from './dao/queries-dao';
import {Recommendation} from './dao/recommendations-dao';

export interface RepoConfig {
  dashboards: Dashboard[];
  queries: Query[];
  recommendations: Recommendation[];
}

export interface Repo {
  empty: boolean;
  config: RepoConfig;
  items: Item[];
  itemsMap: Map<number, Item>;
  issues: Issue[];
  issuesMap: Map<number, Item>;
  pullRequests: PullRequest[];
  pullRequestsMap: Map<number, PullRequest>;
  labels: Label[];
  labelsMap: Map<string|number, Label>;
  contributors: Contributor[];
  contributorsMap: Map<number, Contributor>;
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
export class RepoDao {
  repository: string;

  repo = new BehaviorSubject<Repo|null>(null);

  config = new BehaviorSubject<Repo|null>(null);

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
        db.createObjectStore('items', {keyPath: 'number'});
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
      this.update();
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

  getItem(item: number): Observable<Item> {
    return this.repo.pipe(filter(repo => !!repo), map(repo => repo.itemsMap.get(item)));
  }

  setItems(items: Item[]): Promise<void> {
    return this.setValues(items, 'items');
  }

  setLabels(labels: Label[]): Promise<void> {
    return this.setValues(labels, 'labels');
  }

  setContributors(contributors: Contributor[]): Promise<void> {
    return this.setValues(contributors, 'contributors');
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
          this.repo.next(null);
          this.initialize(this.repository);
        });
  }

  private setValues(values: any[], collectionId: CollectionId) {
    this.values[collectionId].next(values);

    return this.db
        .then(db => {
          const transaction = db.transaction(collectionId, 'readwrite');
          const store = transaction.objectStore(collectionId);
          values.forEach(v => store.put(v));
          return transaction.complete;
        })
        .then(() => this.update());
  }

  values: {[key in CollectionId]: BehaviorSubject<null|any[]>} = {
    dashboards: new BehaviorSubject<null|Dashboard[]>(null),
    queries: new BehaviorSubject<null|Query[]>(null),
    recommendations: new BehaviorSubject<null|Recommendation[]>(null),
    items: new BehaviorSubject<null|Item[]>(null),
    labels: new BehaviorSubject<null|Label[]>(null),
    contributors: new BehaviorSubject<null|Contributor[]>(null),
  };

  private update() {
    this.db
        .then(db => {
          const stores: CollectionId[] =
              ['items', 'labels', 'contributors', 'dashboards', 'queries', 'recommendations'];
          const promises =
              stores.map(store => db.transaction(store, 'readonly').objectStore(store).getAll());
          return Promise.all(promises);
        })
        .then(result => {
          const items = result[0];
          const labels = result[1];
          const contributors = result[2];
          const dashboards = result[3];
          const queries = result[4];
          const recommendations = result[5];


          const itemsMap = new Map<number, PullRequest>();
          items.forEach(o => itemsMap.set(o.number, o));

          const issues = result[0].filter((issue: Item) => !issue.pr);
          const issuesMap = new Map<number, Item>();
          issues.forEach(o => issuesMap.set(o.number, o));

          const pullRequests = result[0].filter((issue: PullRequest) => !!issue.pr);
          const pullRequestsMap = new Map<number, PullRequest>();
          issues.forEach(o => issuesMap.set(o.number, o));

          const labelsMap = new Map<number, Label>();
          labels.forEach(o => labelsMap.set(o.id, o));
          labels.forEach(o => labelsMap.set(o.name, o));

          const contributorsMap = new Map<number, Contributor>();
          contributors.forEach(o => contributorsMap.set(o.id, o));

          this.repo.next({
            items,
            itemsMap,
            issues,
            issuesMap,
            pullRequests,
            pullRequestsMap,
            labels,
            labelsMap,
            contributors,
            contributorsMap,
            config: {dashboards, queries, recommendations},
            empty: ![...issues, ...labels, ...contributors].length
          });
        });
  }
}
