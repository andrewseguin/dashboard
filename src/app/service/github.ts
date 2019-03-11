import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {
  Contributor,
  githubContributorToContributor,
  githubIssueToIssue,
  Item
} from 'app/repository/services/dao';
import {githubLabelToLabel, Label} from 'app/repository/services/dao/labels-dao';
import {getLinkMap} from 'app/utility/link-map';
import {empty, Observable, of} from 'rxjs';
import {expand, map, mergeMap} from 'rxjs/operators';
import {Gist} from './github-types/gist';

export interface CombinedPagedResults<T> {
  total: number;
  current: T[];
  accumulated: T[];
  completed: number;
}

const GIST_DESCRIPTION = 'Dashboard Config';

@Injectable({providedIn: 'root'})
export class Github {
  constructor(private http: HttpClient) {}

  getItemsCount(repo: string, since?: string): Observable<number> {
    let query = `q=type:issue repo:${repo}`;
    if (since) {
      query += ` updated:>${since}`;
    }
    const url = this.constructUrl('search/issues', query);
    return this.query(url).pipe(map(result => (result.body as any).total_count));
  }

  getIssues(repo: string, since?: string): Observable<CombinedPagedResults<Item>> {
    const query = since ? `per_page=100&state=all&since=${since}` : 'per_page=100&state=all';
    const url = this.constructUrl(`repos/${repo}/issues`, query);
    return this.getPagedResults<GithubIssue, Item>(url, githubIssueToIssue);
  }

  getLabels(repo: string): Observable<CombinedPagedResults<Label>> {
    const url = this.constructUrl(`repos/${repo}/labels`, `per_page=100`);
    return this.getPagedResults<GithubLabel, Label>(url, githubLabelToLabel);
  }

  getGists(): Observable<CombinedPagedResults<Gist>> {
    const url = this.constructUrl(`gists`, `per_page=100`);
    return this.getPagedResults<Gist, Gist>(url, g => g);
  }

  getTimeline(repo: string, id: string): Observable<CombinedPagedResults<TimelineEvent>> {
    const url = this.constructUrl(`repos/${repo}/issues/${id}/events`, 'per_page=100');
    return this.getPagedResults<GithubTimelineEvent, TimelineEvent>(
        url, githubTimelineEventtoTimelineEvent);
  }

  getGist(id: string): Observable<Gist> {
    const url = this.constructUrl(`gists/${id}`);
    return this.query<Gist>(url).pipe(map(result => {
      const gist = result.body;

      // Transform keys so that understores in keys become slashes to match repo
      // string
      const transformedFiles = {};
      Object.keys(gist.files).forEach(key => {
        transformedFiles[key.replace('_', '/')] = gist.files[key];
      });
      gist.files = transformedFiles;

      return gist;
    }));
  }

  getDashboardGist(): Observable<Gist|null> {
    return this.getGists().pipe(mergeMap(result => {
      if (result.completed === result.total) {
        const gists = result.accumulated;

        for (let i = 0; i < gists.length; i++) {
          if (gists[i].description.indexOf(GIST_DESCRIPTION) === 0) {
            return this.getGist(gists[i].id);
          }
        }

        return of(null);
      }
    }));
  }

  getComments(repo: string, id: string): Observable<CombinedPagedResults<UserComment>> {
    const url = this.constructUrl(`repos/${repo}/issues/${id}/comments`, 'per_page=100');
    return this.getPagedResults<GithubComment, UserComment>(url, githubCommentToUserComment);
  }

  editGist(id: string, filename: string, content: string) {
    filename = filename.replace('/', '_');

    const files = {};
    files[filename] = {filename, content};
    const url = this.constructUrl(`gists/${id}`, 'random=' + Math.random());
    return this.patch(url, {files});
  }

  getContributors(repo: string): Observable<CombinedPagedResults<Contributor>> {
    const url = this.constructUrl(`repos/${repo}/contributors`, `per_page=100`);
    return this.getPagedResults<GithubContributor, Contributor>(
        url, githubContributorToContributor);
  }

  createDashboardGist(): Observable<Gist> {
    const url = 'https://api.github.com/gists';
    const body = {
      files: {dashboardConfig: {content: '{}'}},
      description: 'Dashboard Config',
      public: false,
    };

    return this.post<Gist>(url, body);
  }

  private getPagedResults<T, R>(url: string, transform: (values: T) => R):
      Observable<CombinedPagedResults<R>> {
    let completed = 0;
    let total = 0;
    let accumulated = [];

    return this.get<T>(url).pipe(
        expand(result => result.next ? this.get(result.next) : empty()), map(result => {
          completed++;
          const transformedResponse = result.response.map(transform);
          const current = transformedResponse;
          accumulated = current.concat(transformedResponse);

          // Determine this on the first pass but not subsequent ones. The
          // last page will have result.numPages equal to 1 since it is
          // missing.
          if (!total) {
            total = result.numPages;
          }

          return {completed, total, current, accumulated};
        }));
  }

  private constructUrl(path: string, query = '', avoidCache = true) {
    const domain = 'https://api.github.com';
    return `${domain}/${path}?${query}${avoidCache ? '&' + new Date().toISOString() : ''}`;
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
        'Accept': accept,
      })
    });
  }

  post<T>(url: string, body: any): Observable<T> {
    return this.http.post<T>(url, body, {
      headers: new HttpHeaders({
        'Authorization': `token ${localStorage.getItem('accessToken')}`,
      })
    });
  }

  patch<T>(url: string, body: any): Observable<T> {
    return this.http.patch<T>(url, body, {
      headers: new HttpHeaders({
        'Authorization': `token ${localStorage.getItem('accessToken')}`,
      })
    });
  }

  get<T>(url: string): Observable<{response: T[], next: string|null, numPages: number}> {
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

export interface GithubComment {
  id: number;
  node_id: string;
  url: string;
  html_url: string;
  body: string;
  user: User;
  created_at: string;
  updated_at: string;
}

export interface GithubActor {
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

export interface GithubTimelineEvent {
  id: number;
  node_id: string;
  url: string;
  actor: GithubActor;
  event: string;
  commit_id: string;
  commit_url: string;
  created_at: string;
  label: {name: string, color: string};
  labels: {name: string, color: string}[];
  lock_reason: string;
  assignee: User;
  assignees: User[];

  assigner: User;
  dismissed_review: any;
  milestone: {title: string};
  rename: {from: string, to: string};
  requested_reviewers: any;
  review_requester: any;
}

export interface TimelineEvent {
  actor: string;
  type: string;
  created: string;
  labels: string[];
  lockReason: string;
  assignees: string[];
  assigner: string;
  dismissed_review: any;
  milestone: {title: string};
  rename: {from: string, to: string};
  requestedReviewers: any;
  reviewRequester: any;
}

export interface UserComment {
  message: string;
  user: string;
  created: string;
  updated: string;
}

function githubCommentToUserComment(o: GithubComment): UserComment {
  return {
    message: o.body,
    user: o.user.login,
    created: o.created_at,
    updated: o.updated_at,
  };
}


function githubTimelineEventtoTimelineEvent(o: GithubTimelineEvent): TimelineEvent {
  return {
    actor: o.actor.login,
    type: o.event,
    created: o.created_at,
    labels: o.label ? [o.label.name] : o.labels ? o.labels.map(l => l.name) : [],
    lockReason: o.lock_reason,
    assignees: o.assignee ? [o.assignee.login] : o.assignees ? o.assignees.map(a => a.login) : [],
    assigner: o.assigner && o.assigner.login,
    dismissed_review: o.dismissed_review,
    milestone: o.milestone,
    rename: o.rename,
    requestedReviewers: o.requested_reviewers,
    reviewRequester: o.review_requester,
  };
}
