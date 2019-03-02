import {DB, openDb} from 'idb';
import {BehaviorSubject} from 'rxjs';
import {Issue, Label, Contributor} from './github';
import {map} from 'rxjs/operators';

export interface Repo {
  empty: boolean;
  issues: Issue[];
  issuesMap: Map<number, Issue>;
  labels: Label[];
  contributors: Contributor[];
}

const DB_VERSION = 1;

export class RepoDao {
  id: string;

  repo: BehaviorSubject<Repo | null>;

  private db: Promise<DB>;

  constructor() {}

  initialize(repoId: string) {
    this.id = repoId;
    this.repo = new BehaviorSubject<Repo | null>(null);
    this.db = openDb(this.id, DB_VERSION, function (db) {
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

  getIssue(issueId: number) {
    return this.repo.pipe(map(repo => {
      if (repo) {
        return repo.issuesMap.get(issueId);
      }
    }));
  }

  setIssues(issues: Issue[]): Promise<void> {
    return this.setValues(issues, 'issues');
  }

  setLabels(labels: Label[]): Promise<void> {
    return this.setValues(labels, 'labels');
  }

  setContributors(contributors: Contributor[]): Promise<void> {
    return this.setValues(contributors, 'contributors');
  }

  private setValues(values: any[], objectStore: string) {
    return this.db.then(db => {
      const transaction = db.transaction(objectStore, 'readwrite');
      const store = transaction.objectStore(objectStore);
      values.forEach(v => store.put(v));
      return transaction.complete;
    }).then(() => this.update());
  }

  private update() {
    this.db.then(db => {
      return Promise.all([
        db.transaction('issues', 'readonly').objectStore('issues').getAll(),
        db.transaction('labels', 'readonly').objectStore('labels').getAll(),
        db.transaction('contributors', 'readonly').objectStore('contributors').getAll()
      ]);
    }).then(result => {
      const empty = ![...result[0], ...result[1], ...result[2]].length;

      const issues = result[0];
      const issuesMap = new Map<number, Issue>();
      issues.forEach(issue => issuesMap.set(issue.number, issue));

      this.repo.next({issues, issuesMap, labels: result[1], contributors: result[2], empty});
    });
  }
}
