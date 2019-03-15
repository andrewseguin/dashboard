import {Injectable} from '@angular/core';
import {Subject} from 'rxjs';
import {RepoIndexedDb} from '../repo-indexed-db';
import {Contributor} from './contributors-dao';
import {Dashboard} from './dashboards-dao';
import {Item} from './items-dao';
import {Label} from './labels-dao';
import {ListDao} from './list-dao';
import {Query} from './queries-dao';
import {Recommendation} from './recommendations-dao';

export interface RepoStore {
  items: ListDao<Item>;
  labels: ListDao<Label>;
  contributors: ListDao<Contributor>;
  dashboards: ListDao<Dashboard>;
  queries: ListDao<Query>;
  recommendations: ListDao<Recommendation>;
}

@Injectable()
export class Dao {
  store: Map<string, RepoStore> = new Map();

  private destroyed = new Subject();

  constructor() {}

  get(repository: string): RepoStore {
    if (!this.store.has(repository)) {
      const repoIndexedDb = new RepoIndexedDb(repository!);
      this.store.set(repository, {
        items: new ListDao<Item>('items', repoIndexedDb),
        labels: new ListDao<Label>('labels', repoIndexedDb),
        contributors: new ListDao<Contributor>('contributors', repoIndexedDb),
        dashboards: new ListDao<Dashboard>('dashboards', repoIndexedDb),
        queries: new ListDao<Query>('queries', repoIndexedDb),
        recommendations: new ListDao<Recommendation>('recommendations', repoIndexedDb),
      });
    }

    return this.store.get(repository)!;
  }

  ngOnDestroy() {
    this.destroyed.next();
    this.destroyed.complete();
  }
}
