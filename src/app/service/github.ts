import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {getLinkMap} from 'app/utility/link-map';
import {BehaviorSubject, empty, merge, Observable, of, Subject} from 'rxjs';
import {catchError, concatMap, delay, expand, map, mergeMap, tap} from 'rxjs/operators';

export interface CombinedPagedResults<T> {
  total: number;
  current: T[];
  completed: number;
}

@Injectable({providedIn: 'root'})
export class Github {
  constructor(private http: HttpClient) {}

  getOutdatedIssuesCount(since: string) {
    let query = `q=type:issue repo:angular/material2`;
    if (since) {
      query += ` updated:>${since}`;
    }
    const url = this.constructUrl('search/issues', query);
    return this.query(url).pipe(
        map(result => (result.body as any).total_count));
  }

  getIssues(since?: string):
      Observable<CombinedPagedResults<GithubIssueResult>> {
    const query = since ? `per_page=100&state=all&since=${since}` :
                          'per_page=100&state=all';
    const url = this.constructUrl('repos/angular/material2/issues', query);

    return this.getPagedResults<GithubIssueResult>(url);
  }

  private getPagedResults<T>(url: string): Observable<CombinedPagedResults<T>> {
    let completed = 0;
    let total = 0;
    let current = [];

    return this.get<T>(url).pipe(
        expand(result => result.next ? this.get(result.next) : empty()),
        map(result => {
          completed++;
          current = current.concat(result.response);

          // Determine this on the first pass but not subsequent ones. The last
          // page will have result.numPages equal to 1 since it is missing.
          if (!total) {
            total = result.numPages;
          }

          return {completed, total, current};
        }));
  }

  private constructUrl(path: string, query: string) {
    const domain = 'https://api.github.com';
    return `${domain}/${path}?${query}`;
  }

  query<T>(url: string) {
    return this.http.get<T>(url, {
      observe: 'response',
      headers: new HttpHeaders(
          {'Authorization': `token ${localStorage.getItem('accessToken')}`})
    });
  }

  get<T>(url: string):
      Observable<{response: T, next: string|null, numPages: number}> {
    return this.query<T>(url).pipe(map(result => {
      const response = result.body;
      const linkMap = getLinkMap(result.headers);
      const next = linkMap.get('next');

      let numPages = 1;
      if (linkMap.get('last')) {
        numPages = +linkMap.get('last').split('&page=')[1];
      }
      return {response, next, numPages};
    }));
  }
}



export interface GithubUser {
  login: string;
  id: number;
  node_id: string;
  avatar_url: string;
  gravatar_id: string;
  url: string;
  html_url: string;
  followers_url: string;
  following_url: string;
  gists_url: string;
  starred_url: string;
  subscriptions_url: string;
  organizations_url: string;
  repos_url: string;
  events_url: string;
  received_events_url: string;
  type: string;
  site_admin: boolean;
}

export interface GithubIssueResult {
  url: string;
  repository_url: string;
  labels_url: string;
  comments_url: string;
  events_url: string;
  html_url: string;
  id: number;
  node_id: string;
  number: number;
  title: string;
  user: GithubUser;
  labels: any[];
  state: string;
  locked: boolean;
  assignee?: any;
  assignees: any[];
  milestone?: any;
  comments: number;
  created_at: string;
  updated_at: string;
  closed_at: string;
  author_association: string;
  body: string;
}
