import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {getLinkMap} from 'app/utility/link-map';
import {empty, Observable} from 'rxjs';
import {expand, map} from 'rxjs/operators';
import {Gist} from './github-types/gist';

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
    return this.query(url).pipe(map(result => (result.body as any).total_count));
  }

  getIssues(repo: string, since?: string): Observable<CombinedPagedResults<Issue>> {
    const query = since ? `per_page=100&state=all&since=${since}` : 'per_page=100&state=all';
    const url = this.constructUrl(`repos/${repo}/issues`, query);
    return this.getPagedResults<GithubIssue, Issue>(url, githubIssueToIssue);
  }

  getLabels(repo: string): Observable<CombinedPagedResults<Label>> {
    const url = this.constructUrl(`repos/${repo}/labels`, `per_page=100`);
    return this.getPagedResults<GithubLabel, Label>(url, githubLabelToLabel);
  }

  getGists(): Observable<CombinedPagedResults<Gist>> {
    const url = this.constructUrl(`gists`, `per_page=100`);
    return this.getPagedResults<Gist, Gist>(url, g => g);
  }

  getTimeline(repo: string, id: number): Observable<CombinedPagedResults<TimelineEvent>> {
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

  getComments(repo: string, id: number): Observable<CombinedPagedResults<UserComment>> {
    const url = this.constructUrl(`repos/${repo}/issues/${id}/comments`, 'per_page=100');
    return this.getPagedResults<GithubComment, UserComment>(url, githubCommentToUserComment);
  }

  editGist(id: string, filename: string, content: string) {
    filename = filename.replace('/', '_');

    const files = {};
    files[filename] = {filename, content};
    const url = this.constructUrl(`gists/${id}`);
    return this.patch(url, {files});
  }

  getContributors(repo: string): Observable<CombinedPagedResults<Contributor>> {
    const url = this.constructUrl(`repos/${repo}/contributors`, `per_page=100`);
    return this.getPagedResults<GithubContributor, Contributor>(
        url, githubContributorToContributor);
  }

  createGist(): Observable<Gist> {
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
    let current = [];

    return this.get<T>(url).pipe(
        expand(result => result.next ? this.get(result.next) : empty()), map(result => {
          completed++;
          const transformedResponse = result.response.map(transform);
          current = current.concat(transformedResponse);

          // Determine this on the first pass but not subsequent ones. The
          // last page will have result.numPages equal to 1 since it is
          // missing.
          if (!total) {
            total = result.numPages;
          }

          return {completed, total, current};
        }));
  }

  private constructUrl(path: string, query = '') {
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
  labels: {name: string, color: string}[];
  lock_reason: string;
  assignees: string[];

  assigner: any;
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

export interface Issue {
  assignees: string[];
  body: string;
  title: string;
  comments: number;
  labels: number[];
  number: number;
  state: string;
  reporter: string;
  created: string;
  updated: string;
  reactions: Reactions;
  pr: boolean;
  url: string;
}

export interface PullRequest extends Issue {}

export interface Label {
  id: number;
  name: string;
  description: string;
  color: string;
  textColor: string;
  borderColor: string;
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
    pr: !!o.pull_request,
    url: o.html_url,
  };
}

function githubLabelToLabel(o: GithubLabel): Label {
  const textColor = getTextColor(o.color);
  const borderColor = getBorderColor(o.color);
  return {
    id: o.id,
    name: o.name,
    description: o.description,
    color: o.color,
    textColor,
    borderColor
  };
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
    labels: o.labels ? o.labels.map(l => l.name) : null,
    lockReason: o.lock_reason,
    assignees: o.assignees,
    assigner: o.assigner && o.assigner.login,
    dismissed_review: o.dismissed_review,
    milestone: o.milestone,
    rename: o.rename,
    requestedReviewers: o.requested_reviewers,
    reviewRequester: o.review_requester,
  };
}


function githubContributorToContributor(o: GithubContributor): Contributor {
  return {login: o.login, id: o.id, avatar_url: o.avatar_url, contributions: o.contributions};
}

function getTextColor(color: string) {
  const R = parseInt(color.slice(0, 2), 16);
  const G = parseInt(color.slice(0, 2), 16);
  const B = parseInt(color.slice(0, 2), 16);

  return (R * 0.299 + G * 0.587 + B * 0.114) > 186 ? 'black' : 'white';
}


function getBorderColor(color: string) {
  // TODO get a better function for this; something the value is something
  // like 9.e where it becomes "9."
  let R = (parseInt(color.slice(0, 2), 16) * .9).toString(16).slice(0, 2);
  let G = (parseInt(color.slice(2, 4), 16) * .9).toString(16).slice(0, 2);
  let B = (parseInt(color.slice(4, 6), 16) * .9).toString(16).slice(0, 2);

  return R + G + B;
}
