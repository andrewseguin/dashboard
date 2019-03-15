import {ChangeDetectionStrategy, ChangeDetectorRef, Component} from '@angular/core';
import {FormControl, FormGroup} from '@angular/forms';
import {MatSnackBar} from '@angular/material';
import {ActivatedRepository} from 'app/repository/services/activated-repository';
import {
  Contributor,
  ContributorsDao,
  Item,
  ItemsDao,
  Label,
  LabelsDao
} from 'app/repository/services/dao';
import {DaoState} from 'app/repository/services/dao/dao-state';
import {Github} from 'app/service/github';
import {LoadedRepos} from 'app/service/loaded-repos';
import {BehaviorSubject, combineLatest, Observable, Subject} from 'rxjs';
import {filter, map, mergeMap, startWith, takeUntil, tap} from 'rxjs/operators';


interface StorageState {
  id: string;
  label: string;
  progress?: {type: 'determinate'|'indeterminate', value?: number};
}

@Component({
  selector: 'load-data',
  styleUrls: ['load-data.scss'],
  templateUrl: 'load-data.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoadData {
  state: StorageState|null = null;

  isLoading = new BehaviorSubject<boolean>(false);

  completedTypes = new Set();

  formGroup = new FormGroup(
      {issueDateType: new FormControl('last updated since'), issueDate: new FormControl('')});

  totalLabelsCount = this.activatedRepository.repository.pipe(
      filter(v => !!v), mergeMap((repository => {
        return this.github.getLabels(repository!)
            .pipe(
                filter(result => result.completed === result.total),
                map(result => result.accumulated.length));
      })));

  totalItemCount =
      combineLatest(
          this.activatedRepository.repository, this.formGroup.valueChanges.pipe(startWith(null)))
          .pipe(filter(result => !!result[0]), mergeMap(result => {
                  const repository = result[0]!;
                  const since = this.getIssuesDateSince();
                  return this.github.getItemsCount(repository!, since);
                }));

  isEmpty = combineLatest(this.labelsDao.list, this.itemsDao.list, this.contributorsDao.list)
                .pipe(filter(results => results.every(v => !!v)), map(results => {
                        const labels = results[0]!;
                        const items = results[1]!;
                        const contributors = results[2]!;
                        return !labels.length && !items.length && !contributors.length;
                      }));

  private destroyed = new Subject();

  constructor(
      private loadedRepos: LoadedRepos, public daoState: DaoState,
      private activatedRepository: ActivatedRepository, private itemsDao: ItemsDao,
      private contributorsDao: ContributorsDao, private labelsDao: LabelsDao,
      private snackbar: MatSnackBar, private github: Github, private cd: ChangeDetectorRef) {
    const lastMonth = new Date();
    lastMonth.setDate(new Date().getDate() - 30);
    this.formGroup.get('issueDate')!.setValue(lastMonth, {emitEvent: false});
  }

  ngOnDestroy() {
    this.destroyed.next();
    this.destroyed.complete();
    this.isLoading.next(false);
  }

  store() {
    this.isLoading.next(true);

    const getLabels = this.getValues(
        'labels', repository => this.github.getLabels(repository),
        (values: Label[]) => this.labelsDao.update(values));

    const getIssues = this.getValues(
        'issues', repository => this.github.getIssues(repository, this.getIssuesDateSince()),
        (values: Item[]) => this.itemsDao.update(values));

    const getContributors = this.getValues(
        'contributor', repository => this.github.getContributors(repository),
        (values: Contributor[]) => this.contributorsDao.update(values));

    getLabels
        .pipe(
            mergeMap(() => getContributors), mergeMap(() => getIssues),
            mergeMap(() => this.activatedRepository.repository), takeUntil(this.destroyed))
        .subscribe(repository => {
          this.state = null;
          this.snackbar.open(`Successfully loaded data`, '', {duration: 2000});
          this.loadedRepos.addLoadedRepo(repository!);
          this.isLoading.next(false);
          this.cd.markForCheck();
        });
  }

  getValues(
      type: string, loadFn: (repository: string) => Observable<any>,
      saver: (values: any) => void): Observable<void> {
    return this.activatedRepository.repository.pipe(
        filter(v => !!v), tap(() => {
          this.state = {
            id: 'loading',
            label: `Loading ${type}`,
            progress: {
              type: 'determinate',
              value: 0,
            }
          };
          this.cd.markForCheck();
        }),
        mergeMap(repository => loadFn(repository!)), tap(result => {
          this.state!.progress!.value = result.completed / result.total * 100;
          this.cd.markForCheck();
          saver(result.current);
        }),
        filter(result => result.completed === result.total));
  }

  private getIssuesDateSince() {
    const issueDateType = this.formGroup.value.issueDateType;
    const issueDate = this.formGroup.value.issueDate;
    let since = '';
    if (issueDateType === 'last updated since') {
      since = new Date(issueDate).toISOString().substring(0, 10);
    }

    return since;
  }
}
