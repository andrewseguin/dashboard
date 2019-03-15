import {Injectable} from '@angular/core';
import {Subject} from 'rxjs';
import {filter} from 'rxjs/operators';
import {ActivatedRepository} from '../activated-repository';
import {RepoIndexedDb} from '../repo-indexed-db';
import {Contributor} from './contributors-dao';
import {Dashboard} from './dashboards-dao';
import {Item} from './items-dao';
import {Label} from './labels-dao';
import {ListDao} from './list-dao';
import {Query} from './queries-dao';
import {Recommendation} from './recommendations-dao';

@Injectable()
export class Dao {
  items = new ListDao<Item>('items');
  labels = new ListDao<Label>('labels');
  contributors = new ListDao<Contributor>('contributors');
  dashboards = new ListDao<Dashboard>('dashboards');
  queries = new ListDao<Query>('queries');
  recommendations = new ListDao<Recommendation>('recommendations');

  private destroyed = new Subject();

  private repoIndexedDb: RepoIndexedDb;

  constructor(activatedRepository: ActivatedRepository) {
    activatedRepository.repository.pipe(filter(v => !!v)).subscribe(repository => {
      if (this.repoIndexedDb && this.repoIndexedDb.repository === repository) {
        return;
      }

      if (this.repoIndexedDb) {
        this.repoIndexedDb.close();
      }

      this.items = new ListDao<Item>('items');
      this.labels = new ListDao<Label>('labels');
      this.contributors = new ListDao<Contributor>('contributors');
      this.dashboards = new ListDao<Dashboard>('dashboards');
      this.queries = new ListDao<Query>('queries');
      this.recommendations = new ListDao<Recommendation>('recommendations');

      const repoIndexedDb = new RepoIndexedDb(repository!);
      this.items.initialize(repoIndexedDb);
      this.labels.initialize(repoIndexedDb);
      this.contributors.initialize(repoIndexedDb);
      this.dashboards.initialize(repoIndexedDb);
      this.queries.initialize(repoIndexedDb);
      this.recommendations.initialize(repoIndexedDb);
    });
  }

  ngOnDestroy() {
    this.destroyed.next();
    this.destroyed.complete();
  }
}
