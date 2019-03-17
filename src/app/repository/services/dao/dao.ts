import {Injectable} from '@angular/core';
import {Config} from 'app/service/config';
import {combineLatest, Subject} from 'rxjs';
import {debounceTime, take, takeUntil} from 'rxjs/operators';
import {RepoIndexedDb} from '../../utility/repo-indexed-db';
import {RepoGist} from '../repo-gist';
import {Contributor} from './contributor';
import {Dashboard} from './dashboard';
import {Item} from './item';
import {Label} from './label';
import {ListDao} from './list-dao';
import {Query} from './query';
import {Recommendation} from './recommendation';

export interface RepoStore {
  repository: string;
  items: ListDao<Item>;
  labels: ListDao<Label>;
  contributors: ListDao<Contributor>;
  dashboards: ListDao<Dashboard>;
  queries: ListDao<Query>;
  recommendations: ListDao<Recommendation>;
}

export type RepoDaoType = 'items'|'labels'|'contributors';


@Injectable()
export class Dao {
  private stores: Map<string, RepoStore> = new Map();

  private destroyed = new Subject();

  private repoIndexedDb = new RepoIndexedDb('angular/material2');

  items = new ListDao<Item>('items', this.repoIndexedDb);
  labels = new ListDao<Label>('labels', this.repoIndexedDb);
  queries = new ListDao<Query>('queries', this.repoIndexedDb);
  recommendations = new ListDao<Recommendation>('recommendations', this.repoIndexedDb);

  constructor(private config: Config, private repoGist: RepoGist) {}

  get(repository: string): RepoStore {
    if (!this.stores.has(repository)) {
      const repoIndexedDb = new RepoIndexedDb(repository!);
      const newStore = {
        repository,
        items: new ListDao<Item>('items', repoIndexedDb),
        labels: new ListDao<Label>('labels', repoIndexedDb),
        contributors: new ListDao<Contributor>('contributors', repoIndexedDb),
        dashboards: new ListDao<Dashboard>('dashboards', repoIndexedDb),
        queries: new ListDao<Query>('queries', repoIndexedDb),
        recommendations: new ListDao<Recommendation>('recommendations', repoIndexedDb),
      };
      this.stores.set(repository, newStore);

      // Sync and then start saving
      this.repoGist.sync(repository, newStore).pipe(take(1)).subscribe(() => {
        this.saveConfigChangesToGist(repository, newStore);
      });
    }

    return this.stores.get(repository)!;
  }

  ngOnDestroy() {
    this.destroyed.next();
    this.destroyed.complete();
  }

  /** Persist changes to config lists to gist */
  saveConfigChangesToGist(repository: string, store: RepoStore) {
    const configDaoLists = [store.dashboards.list, store.queries.list, store.recommendations.list];
    combineLatest(...configDaoLists)
        .pipe(debounceTime(500), takeUntil(this.destroyed))
        .subscribe(result => {
          const dashboards = result[0]!;
          const queries = result[1]!;
          const recommendations = result[2]!;

          this.config.saveRepoConfigToGist(repository, {dashboards, queries, recommendations});
        });
  }
}
