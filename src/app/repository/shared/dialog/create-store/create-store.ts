import {ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';
import {Contributor, Github, Item, Label} from 'app/service/github';
import {RepoDao} from 'app/service/repo-dao';
import {Observable, Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';

export interface PromptDialogData {
  repo: string;
}

interface CreateStoreState {
  id: string;
  label: string;
  progress?: {type: 'determinate'|'indeterminate', value?: number}
}

@Component({
  selector: 'create-store',
  templateUrl: 'create-store.html',
  styleUrls: ['create-store.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CreateStore {
  totalIssueCount: number;

  state: CreateStoreState|null = null;

  private destroyed = new Subject();

  constructor(
      private dialogRef: MatDialogRef<CreateStore, void>, public github: Github,
      private repoDao: RepoDao, private cd: ChangeDetectorRef,
      @Inject(MAT_DIALOG_DATA) public data: PromptDialogData) {
    this.github.getItemsCount(data.repo).subscribe(result => {
      this.totalIssueCount = result;
      this.cd.markForCheck();
    });
  }

  ngOnDestroy() {
    this.destroyed.next();
    this.destroyed.complete();
  }

  async store() {
    await this.getValues(
        'issues', () => this.github.getIssues(this.data.repo),
        (values: Item[]) => this.repoDao.setItems(values));

    await this.getValues(
        'labels', () => this.github.getLabels(this.data.repo),
        (values: Label[]) => this.repoDao.setLabels(values));

    await this.getValues(
        'contributors', () => this.github.getContributors(this.data.repo),
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
}
