import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {merge, of, Observable} from 'rxjs';
import {catchError, delay, map, mergeMap, tap} from 'rxjs/operators';
import {getLinkMap} from 'app/utility/link-map';

export interface CombinedPagedResults<T> {
  total: number;
  currentResults: T[];
  completed: number;
}

@Injectable({
  providedIn: 'root'
})
export class Github {
  openIssues = [];

  constructor(private http: HttpClient) {}

  getAllIssues(since?: string): Observable<CombinedPagedResults<GithubIssueResult>> {
    const query = since ? `per_page=100&state=all&since=${since}` : 'per_page=100&state=all';
    const url = this.constructUrl('repos/angular/material2/issues', query);
    return this.getPagedResults<GithubIssueResult>(url).pipe(map(results => {
      const issues = results.currentResults.filter(r => !r['pull_request']);
      return {
        currentResults: issues,
        completed: results.completed,
        total: results.total
      };
    }));
  }

  getOutdatedIssuesCount(since: string) {
    let query = `q=type:issue repo:angular/material2`;
    if (since) {
      query += ` updated:>${since}`;
    }
    const url = this.constructUrl('search/issues', query);
    return this.query(url).pipe(map(result => (result.body as any).total_count));
  }

  private getPagedResults<T>(url: string): Observable<CombinedPagedResults<T>> {
    let completedQueries = 0;
    let numPages = 1;
    let currentResults = [];

    return this.query(url).pipe(
      tap(result => {
        const linkMap = getLinkMap(result.headers);
        //numPages = +linkMap.get('last').split('&page=')[1];
      }),
      mergeMap(() => {
        const queries = [];
        for (let i = 1; i <= numPages; i++) {
          queries.push(of(null).pipe(
            delay(2000 * i),  // Delay request by 2 seconds to avoid abuse detection
            mergeMap(() => this.query(url + `&page=${i}`)),
            catchError(result => {
              // TODO: Handle errors
              return [];
            }),
            map(result => result['body'])));
        }

        return merge(...queries);
      }),
      map(result => {
        completedQueries++;
        currentResults = currentResults.concat(result);
        return {
          currentResults,
          completed: completedQueries,
          total: numPages
        }
      }))
  }

  private constructUrl(path: string, query: string) {
    const domain = 'https://api.github.com';
    return `${domain}/${path}?${query}`;
  }

  query(url: string) {
    return this.http.get(url, {
      observe: 'response',
      headers: new HttpHeaders({
        'Authorization': `token ${localStorage.getItem('accessToken')}`
      })
    });
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
