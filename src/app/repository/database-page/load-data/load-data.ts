import {ChangeDetectionStrategy, ChangeDetectorRef, Component} from '@angular/core';
import {FormControl, FormGroup} from '@angular/forms';
import {MatSnackBar} from '@angular/material';
import {ActiveStore} from 'app/repository/services/active-store';
import {isRepoStoreEmpty} from 'app/repository/utility/is-repo-store-empty';
import {Github} from 'app/service/github';
import {LoadedRepos} from 'app/service/loaded-repos';
import {BehaviorSubject, combineLatest, Observable, of, Subject} from 'rxjs';
import {filter, map, mergeMap, startWith, takeUntil, tap} from 'rxjs/operators';
import { Label } from 'app/github/app-types/label';
import { Item } from 'app/github/app-types/item';
import { Contributor } from 'app/github/app-types/contributor';


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
      this.activeRepo.name.pipe(filter(v => !!v), mergeMap((repository => {
                                  return this.github.getLabels(repository!)
                                      .pipe(
                                          filter(result => result.completed === result.total),
                                          map(result => result.accumulated.length));
                                })));

  totalItemCount =
      combineLatest(this.activeRepo.name, this.formGroup.valueChanges.pipe(startWith(null)))
          .pipe(filter(result => !!result[0]), mergeMap(result => {
                  const repository = result[0]!;
                  const since = this.getIssuesDateSince();
                  return this.github.getItemsCount(repository!, since);
                }));

  isEmpty = this.activeRepo.data.pipe(mergeMap(store => isRepoStoreEmpty(store)));

  private destroyed = new Subject();

  constructor(
      private loadedRepos: LoadedRepos, private activeRepo: ActiveStore,
      private snackbar: MatSnackBar, private github: Github, private cd: ChangeDetectorRef) {
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
    const repository = this.activeRepo.activeName;
    const store = this.activeRepo.activeData;

    this.isLoading.next(true);

    const getLabels = this.getValues(
        repository, 'labels', repository => this.github.getLabels(repository),
        (values: Label[]) => store.labels.update(values));

    const getIssues = this.getValues(
        repository, 'issues',
        repository => this.github.getIssues(repository, this.getIssuesDateSince()),
        (values: Item[]) => store.items.update(values));

    const getContributors = this.getValues(
        repository, 'contributor', repository => this.github.getContributors(repository),
        (values: Contributor[]) => store.contributors.update(values));

    getContributors.pipe(mergeMap(() => getLabels), mergeMap(() => getIssues)).subscribe(() => {
      this.state = null;
      this.snackbar.open(`Successfully loaded data`, '', {duration: 2000});
      this.loadedRepos.addLoadedRepo(repository);
      this.isLoading.next(false);
      this.cd.markForCheck();
    });
  }

  getValues(
      repository: string, type: string, loadFn: (repository: string) => Observable<any>,
      saver: (values: any) => void): Observable<void> {
    return of(null).pipe(
        tap(() => {
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
        mergeMap(() => loadFn(repository)), tap(result => {
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
