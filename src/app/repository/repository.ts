import {ChangeDetectionStrategy, Component} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {Config} from 'app/service/config';
import {combineLatest, interval, Subject} from 'rxjs';
import {filter, mergeMap, take, takeUntil} from 'rxjs/operators';
import {ActivatedRepository} from './services/activated-repository';
import {DashboardsDao, ItemsDao, QueriesDao, RecommendationsDao} from './services/dao';
import {DaoState} from './services/dao/dao-state';
import {Updater} from './services/updater';


@Component({
  templateUrl: 'repository.html',
  styleUrls: ['repository.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Repository {
  destroyed = new Subject();

  constructor(
      private router: Router, private updater: Updater, private dashboardsDao: DashboardsDao,
      private queriesDao: QueriesDao, private daoState: DaoState,
      private recommendationsDao: RecommendationsDao, private config: Config,
      private activatedRoute: ActivatedRoute, private itemsDao: ItemsDao,
      private activatedRepository: ActivatedRepository) {
    this.activatedRoute.params.pipe(takeUntil(this.destroyed)).subscribe(params => {
      const org = params['org'];
      const name = params['name'];
      this.activatedRepository.repository.next(`${org}/${name}`);
    });

    // TODO: Load from gist, merge with repo, and store back to gist

    combineLatest(this.dashboardsDao.list, this.queriesDao.list, this.recommendationsDao.list)
        .pipe(filter(result => result.every(r => !!r)), takeUntil(this.destroyed))
        .subscribe(result => {
          const dashboards = result[0];
          const queries = result[1];
          const recommendations = result[2];

          this.config.saveRepoConfigToGist(
              this.activatedRepository.repository.value, {dashboards, queries, recommendations});
        });

    this.daoState.isEmpty.pipe(take(1)).subscribe(isEmpty => {
      if (isEmpty) {
        this.router.navigate([`${this.activatedRepository.repository.value}/database`]);
      } else {
        this.initializAutoIssueUpdates();
      }
    });
  }

  ngOnDestroy() {
    this.destroyed.next();
    this.destroyed.complete();
  }

  private initializAutoIssueUpdates() {
    interval(60 * 1000)
        .pipe(mergeMap(() => this.itemsDao.list), filter(list => !!list))
        .subscribe(items => {
          if (items.length) {
            this.updater.updateIssues(this.activatedRepository.repository.value);
          }
        });

    this.updater.updateContributors(this.activatedRepository.repository.value);
    this.updater.updateLabels(this.activatedRepository.repository.value);
  }
}
