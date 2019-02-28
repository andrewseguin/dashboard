import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {getLinkMap} from 'app/utility/link-map';
import {empty, Observable} from 'rxjs';
import {expand, map} from 'rxjs/operators';

export interface CombinedPagedResults<T> {
  total: number;
  current: T[];
  completed: number;
}

@Injectable({providedIn: 'root'})
export class Github {
  constructor(private http: HttpClient) {}

  getOutdatedIssuesCount(repo: string, since?: string) {
    let query = `q=type:issue repo:${repo}`;
    if (since) {
      query += ` updated:>${since}`;
    }
    const url = this.constructUrl('search/issues', query);
    return this.query(url).pipe(
        map(result => (result.body as any).total_count));
  }

  getIssues(repo: string, since?: string):
      Observable<CombinedPagedResults<Issue>> {
    const query = since ? `per_page=100&state=all&since=${since}` :
                          'per_page=100&state=all';
    const url = this.constructUrl(`repos/${repo}/issues`, query);
    return this.getPagedResults<GithubIssue, Issue>(url, githubIssueToIssue);
  }

  getLabels(repo: string): Observable<CombinedPagedResults<Label>> {
    const url = this.constructUrl(`repos/${repo}/labels`, `per_page=100`);
    return this.getPagedResults<GithubLabel, Label>(url, githubLabelToLabel);
  }

  getContributors(repo: string): Observable<CombinedPagedResults<Contributor>> {
    const url = this.constructUrl(`repos/${repo}/contributors`, `per_page=100`);
    return this.getPagedResults<GithubContributor, Contributor>(
        url, githubContributorToContributor);
  }

  private getPagedResults<T, R>(url: string, transform: (values: T) => R):
      Observable<CombinedPagedResults<R>> {
    let completed = 0;
    let total = 0;
    let current = [];

    return this.get<T>(url).pipe(
        expand(
            result => (result.next && completed < 3) ? this.get(result.next) :
                                                       empty()),
        map(result => {
          completed++;
          const transformedResponse = result.response.map(transform);
          current = current.concat(transformedResponse);

          // Determine this on the first pass but not subsequent ones. The last
          // page will have result.numPages equal to 1 since it is missing.
          if (!total) {
            total = Math.min(result.numPages, 3);
          }

          return {completed, total, current};
        }));
  }

  private constructUrl(path: string, query: string) {
    const domain = 'https://api.github.com';
    return `${domain}/${path}?${query}`;
  }

  query<T>(url: string) {
    const accept = [];

    // Label descriptions
    accept.push('application/vnd.github.symmetra-preview+json');

    // Issue reactions
    accept.push('application/vnd.github.squirrel-girl-preview');

    return this.http.get<T>(url, {
      observe: 'response',
      headers: new HttpHeaders({
        'Authorization': `token ${localStorage.getItem('accessToken')}`,
        'Accept': accept
      })
    });
  }

  get<T>(url: string):
      Observable<{response: T[], next: string|null, numPages: number}> {
    return this.query<T[]>(url).pipe(map(result => {
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


export interface User {
  login: string;
  avatar_url: string;
  id: number;
  node_id: string;
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

export interface Reactions {
  url: string;
  total_count: number;
  '+1': number;
  '-1': number;
  laugh: number;
  hooray: number;
  confused: number;
  heart: number;
  rocket: number;
  eyes: number;
}
export interface GithubIssue {
  url: string;
  id: number;
  node_id: string;
  number: number;
  title: string;
  user: User;
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
  reactions: Reactions;

  repository_url: string;
  labels_url: string;
  comments_url: string;
  events_url: string;
  html_url: string;
  pull_request: any;
}

export interface GithubLabel {
  id: number;
  node_id: string;
  url: string;
  name: string;
  description: string;
  color: string;
  default: boolean;
}

export interface GithubContributor {
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
  contributions: number;
}

export interface Issue {
  assignees: string[];
  body: string;
  title: string;
  comments: number;
  labels: string[];
  number: number;
  state: string;
  reporter: string;
  created: string;
  updated: string;
  reactions: Reactions;
  pr: boolean;
}

export interface Label {
  id: number;
  name: string;
  description: string;
  color: string;
}

export interface Contributor {
  login: string;
  id: number;
  avatar_url: string;
  contributions: number;
}

function githubIssueToIssue(o: GithubIssue): Issue {
  return {
    assignees: o.assignees.map(a => a.login),
    body: o.body,
    title: o.title,
    comments: o.comments,
    labels: o.labels.map(l => l.id),
    number: o.number,
    state: o.state,
    reporter: o.user.login,
    created: o.created_at,
    updated: o.updated_at,
    reactions: o.reactions,
    pr: !!o.pull_request
  };
}

function githubLabelToLabel(o: GithubLabel): Label {
  return {id: o.id, name: o.name, description: o.description, color: o.color};
}


function githubContributorToContributor(o: GithubContributor): Contributor {
  return {
    login: o.login,
    id: o.id,
    avatar_url: o.avatar_url,
    contributions: o.contributions
  };
}
