import {ChangeDetectionStrategy, ChangeDetectorRef, Component} from '@angular/core';
import {FormControl, FormGroup} from '@angular/forms';
import {ActivatedRepository} from 'app/repository/services/activated-repository';
import {Contributor, Github, Item, Label} from 'app/service/github';
import {RepoDao} from 'app/service/repo-dao';
import {combineLatest, Observable, Subject} from 'rxjs';
import {filter, map, mergeMap, startWith, takeUntil} from 'rxjs/operators';


interface StorageState {
  id: string;
  label: string;
  progress?: {type: 'determinate'|'indeterminate', value?: number}
}

@Component({
  selector: 'load-data',
  styleUrls: ['load-data.scss'],
  templateUrl: 'load-data.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoadData {
  state: StorageState|null = null;

  formGroup =
      new FormGroup({issueDateType: new FormControl('since'), issueDate: new FormControl('')});

  totalLabelsCount = this.activatedRepository.repository.pipe(mergeMap((repository => {
    if (repository) {
      return this.github.getLabels(repository)
          .pipe(
              filter(result => result.completed === result.total),
              map(result => result.current.length));
    }
  })));

  totalIssueCount = combineLatest(this.formGroup.valueChanges, this.activatedRepository.repository)
                        .pipe(startWith(null), mergeMap(() => {
                                const since = this.getIssuesDateSince();
                                const repository = this.activatedRepository.repository.value;
                                return this.github.getItemsCount(repository, since);
                              }));

  private destroyed = new Subject();

  constructor(
      private activatedRepository: ActivatedRepository, private repoDao: RepoDao,
      private github: Github, private cd: ChangeDetectorRef) {
    const lastMonth = new Date();
    lastMonth.setDate(new Date().getDate() - 30);
    this.formGroup.get('issueDate').setValue(lastMonth, {emitEvent: false});
  }

  ngOnDestroy() {
    this.destroyed.next();
    this.destroyed.complete();
  }

  async store() {
    const repository = this.activatedRepository.repository.value;

    await this.getValues(
        'issues', () => this.github.getIssues(repository, this.getIssuesDateSince()),
        (values: Item[]) => this.repoDao.setItems(values));

    await this.getValues(
        'labels', () => this.github.getLabels(repository),
        (values: Label[]) => this.repoDao.setLabels(values));

    await this.getValues(
        'contributors', () => this.github.getContributors(repository),
        (values: Contributor[]) => this.repoDao.setContributors(values));

    this.state = {
      id: 'complete',
      label: 'Complete',
    };
    this.cd.markForCheck();
  }

  async getValues(
      type: string, loadFn: () => Observable<any>,
      saver: (values: any) => Promise<void>): Promise<void> {
    return new Promise<void>(resolve => {
      this.state = {
        id: 'loading',
        label: `Loading ${type}`,
        progress: {
          type: 'determinate',
          value: 0,
        }
      };

      loadFn().pipe(takeUntil(this.destroyed)).subscribe(result => {
        this.state.progress.value = result.completed / result.total * 100;
        this.cd.markForCheck();

        if (result.completed === result.total) {
          saver(result.current)
              .then(() => {
                this.state = {
                  id: 'saving',
                  label: `Saving ${type}`,
                  progress: {type: 'indeterminate'},
                };
                this.cd.markForCheck();
              })
              .then(resolve);
        }
      });
    });
  }

  private getIssuesDateSince() {
    const issueDateType = this.formGroup.value.issueDateType;
    const issueDate = this.formGroup.value.issueDate;
    let since = '';
    if (issueDateType === 'since') {
      since = new Date(issueDate).toISOString().substring(0, 10);
    }

    return since;
  }
}
