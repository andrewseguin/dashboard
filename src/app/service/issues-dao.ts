import {openDb, DB} from "idb";
import {GithubIssueResult} from "./github";
import {BehaviorSubject} from "rxjs";

export interface Issue {
  assignees: string[];
  body: string;
  comments: number;
  url: string;
  labels: string[];
  number: number;
  state: string;
  reporter: string;
  created: string;
  updated: string;
}

export class IssuesDao {
  issues = new BehaviorSubject<Issue[] | null>(null);

  private dbPromise: Promise<DB>;

  constructor() {
    this.dbPromise = openDb('test-db2', 1, function (db) {
      if (!db.objectStoreNames.contains('issues')) {
        db.createObjectStore('issues', {keyPath: 'number'});
      }
    });

    this.updateIssues();
  }

  addIssues(githubIssueResults: GithubIssueResult[]): Promise<void> {
    const issues = this.convertGithubIssueResultsToIssue(githubIssueResults);

    return this.dbPromise.then(db => {
      const transaction = db.transaction('issues', 'readwrite');
      const store = transaction.objectStore('issues');

      issues.forEach(issue => store.put(issue));

      return transaction.complete;
    }).then(() => {
      this.updateIssues();
    });
  }

  private updateIssues() {
    this.dbPromise.then(db => {
      return db.transaction('issues', 'readonly').objectStore('issues').getAll();
    }).then(issues => {
      this.issues.next(issues);
    });
  }

  private convertGithubIssueResultsToIssue(githubIssueResults: GithubIssueResult[]): Issue[] {
    return githubIssueResults.map(issue => {
      return {
        assignees: issue.assignees.map(a => a.login),
        body: issue.body,
        comments: issue.comments,
        url: issue.html_url,
        labels: issue.labels.map(l => l.id),
        number: issue.number,
        state: issue.state,
        reporter: issue.user.login,
        created: issue.created_at,
        updated: issue.updated_at,
      };
    });
  }
}
