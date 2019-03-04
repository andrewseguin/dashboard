import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {BehaviorSubject, Observable, of, Subject} from 'rxjs';
import {filter, map, mergeMap, take, takeUntil} from 'rxjs/operators';

import {Github} from './github';
import {Gist} from './github-types/gist';

export interface Collection<T> {
  [key: string]: T;
}

export interface DashboardConfig {
  useDarkTheme: boolean;
}

export interface RepoConfig {
  [key: string]: Collection<any>;
}

export interface ConfigValues {
  dashboardConfig?: DashboardConfig;
  [key: string]: DashboardConfig|RepoConfig;
}

@Injectable({providedIn: 'root'})
export class Config {
  config = new BehaviorSubject<ConfigValues|null>(null);
  _gist = new BehaviorSubject<Gist|null>(null);

  _configValuesGist: Observable<Gist>;

  constructor(private github: Github) {
    this.getConfigValuesGist().subscribe(gist => this._gist.next(gist));
    this.syncFromGist();
  }

  saveDashboardConfig(dashboardConfig: DashboardConfig) {
    this.saveToGist('dashboardConfig', dashboardConfig);
  }

  getRepoConfig(repository: string): Observable<RepoConfig> {
    return this.config.pipe(
        filter(config => !!config),
        map(config => (config[repository] as RepoConfig) || {}));
  }

  saveRepoConfigCollection(
      repository: string, id: string, collection: Collection<any>) {
    const saved = new Subject();
    this.getRepoConfig(repository)
        .pipe(takeUntil(saved))
        .subscribe(repoConfig => {
          repoConfig[id] = collection;
          this.saveToGist(repository, repoConfig);
          saved.next();
          saved.complete();

          const currentConfig = this.config.value;
          currentConfig[repository] = repoConfig;
          this.config.next(currentConfig);
        });
  }

  private saveToGist(filename: string, content: DashboardConfig|RepoConfig) {
    const saved = new Subject();
    const saveFn = mergeMap((gist: Gist) => {
      return this.github.editGist(gist.id, filename, JSON.stringify(content));
    });
    this._gist.pipe(takeUntil(saved), filter(gist => !!gist), saveFn)
        .subscribe(() => {
          saved.next();
          saved.complete();
        });
  }

  private syncFromGist() {
    const synced = new Subject();
    this._gist.pipe(takeUntil(synced)).subscribe(gist => {
      if (gist) {
        const settings: ConfigValues = {};
        Object.keys(gist.files).forEach(fileName => {
          settings[fileName] = JSON.parse(gist.files[fileName].content);
        });
        this.config.next(settings);

        synced.next();
        synced.complete();
      }
    });
  }

  private getConfigValuesGist(): Observable<Gist> {
    return this.github.getGists().pipe(
        map(result => {
          if (result.completed === result.total) {
            const gists = result.current;

            let configGist: Gist;
            gists.forEach(gist => {
              if (gist.description.indexOf('Dashboard Config') === 0) {
                configGist = gist;
              }
            });

            return configGist;
          }
        }),
        mergeMap(gist => {
          return gist ? this.github.getGist(gist.id) : this.github.createGist();
        }));
  }
}
