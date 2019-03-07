import {DB, openDb} from 'idb';
import {BehaviorSubject, Observable} from 'rxjs';
import {filter, map} from 'rxjs/operators';

import {Contributor, Item, Label, PullRequest} from './github';

export interface Repo {
  empty: boolean;
  items: Item[];
  itemsMap: Map<number, Item>;
  issues: Item[];
  issuesMap: Map<number, Item>;
  pullRequests: PullRequest[];
  pullRequestsMap: Map<number, PullRequest>;
  labels: Label[];
  labelsMap: Map<number, Label>;
  contributors: Contributor[];
  contributorsMap: Map<number, Contributor>;
}

const DB_VERSION = 1;

export class RepoDao {
  id: string;

  repo: BehaviorSubject<Repo|null>;

  private db: Promise<DB>;

  constructor() {}

  initialize(repoId: string) {
    this.id = repoId;
    this.repo = new BehaviorSubject<Repo|null>(null);
    this.db = openDb(this.id, DB_VERSION, function(db) {
      if (!db.objectStoreNames.contains('issues')) {
        db.createObjectStore('issues', {keyPath: 'number'});
      }
      if (!db.objectStoreNames.contains('labels')) {
        db.createObjectStore('labels', {keyPath: 'id'});
      }
      if (!db.objectStoreNames.contains('contributors')) {
        db.createObjectStore('contributors', {keyPath: 'id'});
      }
    });
    this.db.then(() => this.update());
  }

  getItem(item: number): Observable<Item> {
    return this.repo.pipe(filter(repo => !!repo), map(repo => repo.itemsMap.get(item)));
  }

  setIssues(issues: Item[]): Promise<void> {
    return this.setValues(issues, 'issues');
  }

  setLabels(labels: Label[]): Promise<void> {
    return this.setValues(labels, 'labels');
  }

  setContributors(contributors: Contributor[]): Promise<void> {
    return this.setValues(contributors, 'contributors');
  }

  private setValues(values: any[], objectStore: string) {
    return this.db
        .then(db => {
          const transaction = db.transaction(objectStore, 'readwrite');
          const store = transaction.objectStore(objectStore);
          values.forEach(v => store.put(v));
          return transaction.complete;
        })
        .then(() => this.update());
  }

  private update() {
    this.db
        .then(db => {
          return Promise.all([
            db.transaction('issues', 'readonly').objectStore('issues').getAll(),
            db.transaction('labels', 'readonly').objectStore('labels').getAll(),
            db.transaction('contributors', 'readonly').objectStore('contributors').getAll()
          ]);
        })
        .then(result => {
          const items = result[0];
          const itemsMap = new Map<number, PullRequest>();
          items.forEach(o => itemsMap.set(o.number, o));

          const issues = result[0].filter((issue: Item) => !issue.pr);
          const issuesMap = new Map<number, Item>();
          issues.forEach(o => issuesMap.set(o.number, o));

          const pullRequests = result[0].filter((issue: PullRequest) => !!issue.pr);
          const pullRequestsMap = new Map<number, PullRequest>();
          issues.forEach(o => issuesMap.set(o.number, o));

          const labels = result[1];
          const labelsMap = new Map<number, Label>();
          labels.forEach(o => labelsMap.set(o.id, o));
          labels.forEach(o => labelsMap.set(o.name, o));

          const contributors = result[2];
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
            empty: ![...issues, ...labels, ...contributors].length
          });
        });
  }
}
