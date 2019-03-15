import {ChangeDetectionStrategy, ChangeDetectorRef, Component} from '@angular/core';
import {FormControl, FormGroup} from '@angular/forms';
import {MatSnackBar} from '@angular/material';
import {ActiveRepo} from 'app/repository/services/active-repo';
import {Contributor, Item, Label} from 'app/repository/services/dao';
import {Dao} from 'app/repository/services/dao/dao';
import {RepoLoadState} from 'app/repository/services/repo-load-state';
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

  totalLabelsCount =
      this.activeRepo.repository.pipe(filter(v => !!v), mergeMap((repository => {
                                        return this.github.getLabels(repository!)
                                            .pipe(
                                                filter(result => result.completed === result.total),
                                                map(result => result.accumulated.length));
                                      })));

  totalItemCount =
      combineLatest(this.activeRepo.repository, this.formGroup.valueChanges.pipe(startWith(null)))
          .pipe(filter(result => !!result[0]), mergeMap(result => {
                  const repository = result[0]!;
                  const since = this.getIssuesDateSince();
                  return this.github.getItemsCount(repository!, since);
                }));

  isEmpty = this.repoLoadState.isEmpty;

  private destroyed = new Subject();

  constructor(
      private loadedRepos: LoadedRepos, private activeRepo: ActiveRepo, private dao: Dao,
      public repoLoadState: RepoLoadState, private snackbar: MatSnackBar, private github: Github,
      private cd: ChangeDetectorRef) {
    const lastMonth = new Date();
    lastMonth.setDate(new Date().getDate() - 30);
    this.formGroup.get('issueDate')!.setValue(lastMonth, {emitEvent: false});

    this.isLoading.pipe(takeUntil(this.destroyed)).subscribe(isLoading => {
      isLoading ? this.formGroup.disable() : this.formGroup.enable();
    });
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
        (values: Label[]) => this.dao.labels.update(values));

    const getIssues = this.getValues(
        'issues', repository => this.github.getIssues(repository, this.getIssuesDateSince()),
        (values: Item[]) => this.dao.items.update(values));

    const getContributors = this.getValues(
        'contributor', repository => this.github.getContributors(repository),
        (values: Contributor[]) => this.dao.contributors.update(values));

    getContributors
        .pipe(
            mergeMap(() => getLabels), mergeMap(() => getIssues),
            mergeMap(() => this.activeRepo.repository), takeUntil(this.destroyed))
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
    return this.activeRepo.repository.pipe(
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
