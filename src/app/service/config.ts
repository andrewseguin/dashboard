import {Injectable} from '@angular/core';
import {Dashboard} from 'app/repository/services/dao/dashboards-dao';
import {Query} from 'app/repository/services/dao/queries-dao';
import {Recommendation} from 'app/repository/services/dao/recommendations-dao';
import {Observable, of} from 'rxjs';
import {filter, map, mergeMap, take} from 'rxjs/operators';
import {Github} from './github';


export interface DashboardConfig {
  useDarkTheme: boolean;
}

export interface RepoConfig {
  queries: Query[];
  dashboards: Dashboard[];
  recommendations: Recommendation[];
}

export interface ConfigValues {
  dashboardConfig?: DashboardConfig;
  [key: string]: DashboardConfig|RepoConfig;
}

@Injectable({providedIn: 'root'})
export class Config {
  constructor(private github: Github) {}

  saveDashboardConfig(dashboardConfig: DashboardConfig) {
    this.saveToGist('dashboardConfig', dashboardConfig);
  }

  getDashboardConfig(): Observable<DashboardConfig> {
    return this.syncFromGist<DashboardConfig>('dashboardConfig');
  }

  saveRepoConfigToGist(repository: string, repoConfig: RepoConfig): Promise<void> {
    return this.saveToGist(repository, repoConfig);
  }

  getRepoConfig(repository: string): Observable<RepoConfig> {
    return this.syncFromGist<RepoConfig>(repository);
  }

  private saveToGist(filename: string, content: DashboardConfig|RepoConfig): Promise<void> {
    return new Promise(resolve => {
      this.github.getDashboardGist()
          .pipe(
              mergeMap(gist => gist ? of(gist) : this.github.createDashboardGist()),
              mergeMap(
                  gist =>
                      this.github.editGist(gist.id, filename, JSON.stringify(content, null, 2))),
              take(1))
          .subscribe(() => resolve());
    });
  }

  private syncFromGist<T>(filename: string): Observable<T> {
    return this.github.getDashboardGist().pipe(filter(gist => !!gist), map(gist => {
                                                 const file = gist.files[filename];
                                                 return file ? JSON.parse(file.content) : {};
                                               }));
  }
}
