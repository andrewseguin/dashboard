import {ChangeDetectionStrategy, Component} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {RepoDao} from 'app/repository/services/dao/repo-dao';
import {Config} from 'app/service/config';
import {combineLatest, interval, Subject} from 'rxjs';
import {filter, mergeMap, takeUntil} from 'rxjs/operators';
import {ActivatedRepository} from './services/activated-repository';
import {DashboardsDao, QueriesDao, RecommendationsDao} from './services/dao';
import {Updater} from './services/updater';


@Component({
  templateUrl: 'repository.html',
  styleUrls: ['repository.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Repository {
  destroyed = new Subject();

  constructor(
      public repoDao: RepoDao, private router: Router, private updater: Updater,
      private dashboardsDao: DashboardsDao, private queriesDao: QueriesDao,
      private recommendationsDao: RecommendationsDao, private config: Config,
      private activatedRoute: ActivatedRoute, private activatedRepository: ActivatedRepository) {
    this.activatedRoute.params.pipe(takeUntil(this.destroyed)).subscribe(params => {
      const org = params['org'];
      const name = params['name'];
      this.activatedRepository.repository.next(`${org}/${name}`);
    });


    // TODO: Load from gist, merge with repo, and store back to gist

    combineLatest(this.dashboardsDao.list, this.queriesDao.list, this.recommendationsDao.list)
        .pipe(
            filter(result => !!result[0] && !!result[1] && !!result[2]), takeUntil(this.destroyed))
        .subscribe(result => {
          const dashboards = result[0];
          const queries = result[1];
          const recommendations = result[2];

          this.config.saveRepoConfigToGist(
              this.activatedRepository.repository.value, {dashboards, queries, recommendations});
        });

    const checked = new Subject();
    this.repoDao.repo.pipe(takeUntil(checked)).subscribe(result => {
      if (!result) {
        return;
      }

      checked.next();
      checked.complete();

      if (result.empty) {
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
        .pipe(mergeMap(() => this.repoDao.repo), filter(repo => !repo.empty))
        .subscribe(() => {
          this.updater.updateIssues(this.activatedRepository.repository.value);
        });

    this.updater.updateContributors(this.activatedRepository.repository.value);
    this.updater.updateLabels(this.activatedRepository.repository.value);
  }
}
