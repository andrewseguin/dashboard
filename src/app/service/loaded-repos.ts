import {Injectable} from '@angular/core';
import {BehaviorSubject} from 'rxjs';

export type GithubAuthScope = 'gist'|'repo';

@Injectable({providedIn: 'root'})
export class LoadedRepos {
  set repos(loadedRepos: string[]) {
    const loadedReposStr = loadedRepos.length ? loadedRepos.join(',') : '';
    window.localStorage.setItem('loadedRepos', loadedReposStr);
    this.repo$.next(loadedRepos);
  }
  get repos(): string[] {
    const loadedReposStr = window.localStorage.getItem('loadedRepos') || '';
    return loadedReposStr ? loadedReposStr.split(',') : [];
  }
  repo$ = new BehaviorSubject<string[]>(this.repos);

  addLoadedRepo(repo: string) {
    this.repos = [...this.repos, repo];
  }

  removeLoadedRepo(repo: string) {
    const index = this.repos.indexOf(repo);
    this.repos = [...this.repos].splice(index, 1);
  }
}
