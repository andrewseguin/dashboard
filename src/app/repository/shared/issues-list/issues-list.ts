import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  NgZone,
  Output
} from '@angular/core';
import {Selection} from 'app/repository/services';
import {IssueGroup} from 'app/repository/services/issues-renderer/issue-grouping';
import {
  IssueRendererOptionsState
} from 'app/repository/services/issues-renderer/issue-renderer-options';
import {IssuesFilterMetadata} from 'app/repository/services/issues-renderer/issues-filter-metadata';
import {IssuesRenderer} from 'app/repository/services/issues-renderer/issues-renderer';
import {fromEvent, Observable, Observer, Subject} from 'rxjs';
import {auditTime, debounceTime, delay, takeUntil} from 'rxjs/operators';

@Component({
  selector: 'issues-list',
  templateUrl: 'issues-list.html',
  styleUrls: ['issues-list.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [IssuesRenderer]
})
export class IssuesList {
  destroyed = new Subject();
  private elementScrolled: Observable<Event> = Observable.create(
      (observer: Observer<Event>) => this.ngZone.runOutsideAngular(
          () => fromEvent(this.elementRef.nativeElement, 'scroll')
                    .pipe(takeUntil(this.destroyed))
                    .subscribe(observer)));

  loadingIssues: boolean;

  issueGroups: IssueGroup[];
  renderedIssueGroups: IssueGroup[];
  issuesToDisplay = 20;

  issueFilterMetadata = IssuesFilterMetadata;

  @Input()
  set issuesRendererOptionsState(state: IssueRendererOptionsState) {
    this.issuesRenderer.options.setState(state);
  }

  @Input() printMode: boolean;

  @Output() issuesRendererOptionsChanged = new EventEmitter<IssueRendererOptionsState>();

  constructor(
      public issuesRenderer: IssuesRenderer, public cd: ChangeDetectorRef, public ngZone: NgZone,
      public selection: Selection, public elementRef: ElementRef) {}

  ngOnInit() {
    this.issuesRenderer.initialize('issue');
    const options = this.issuesRenderer.options;
    options.changed.pipe(debounceTime(100), takeUntil(this.destroyed)).subscribe(() => {
      this.issuesRendererOptionsChanged.next(options.getState());
      this.elementRef.nativeElement.scrollTop = 0;
    });

    // After 200ms of scrolling, add 50 more issues if near bottom of screen
    this.elementScrolled.pipe(auditTime(200), takeUntil(this.destroyed)).subscribe(() => {
      const el = this.elementRef.nativeElement;
      const viewHeight = el.getBoundingClientRect().height;
      const scrollTop = el.scrollTop;
      const scrollHeight = el.scrollHeight;

      const distanceFromBottom = scrollHeight - scrollTop - viewHeight;
      if (distanceFromBottom < 1000 && scrollTop > 200) {
        this.issuesToDisplay += 40;
        this.render();
        this.ngZone.run(() => this.cd.markForCheck());
      } else if (scrollTop < 200) {
        if (this.issuesToDisplay != 20) {
          this.issuesToDisplay = 20;
          this.render();
          this.ngZone.run(() => this.cd.markForCheck());
        }
      }
    });

    // When issue groups change, render the first ten, then debounce and
    // render more
    this.issuesRenderer.issueGroups.pipe(takeUntil(this.destroyed)).subscribe(issueGroups => {
      this.issueGroups = issueGroups;
      this.render();
    });
  }

  ngOnDestroy() {
    this.destroyed.next();
    this.destroyed.complete();
  }

  render() {
    this.renderedIssueGroups = [];
    this.renderMoreIssues(this.issuesToDisplay);
    this.cd.markForCheck();
  }

  /** Render more issues, shoud only be called by render and itself. */
  renderMoreIssues(threshold: number) {
    // Return if there are no groups to render
    if (!this.issueGroups || !this.issueGroups.length) {
      return;
    }

    // If no groups are rendered yet, start by adding the first group
    if (!this.renderedIssueGroups.length) {
      this.renderNextGroup();
    }

    const groupIndex = this.renderedIssueGroups.length - 1;
    const renderGroup = this.renderedIssueGroups[groupIndex];
    const renderLength = renderGroup.issues.length;

    const actualGroup = this.issueGroups[groupIndex];
    const actualLength = actualGroup.issues.length;

    // Return if all issues have been rendered
    if (this.renderedIssueGroups.length === this.issueGroups.length &&
        renderGroup.issues.length === actualGroup.issues.length) {
      this.loadingIssues = false;
      return;
    } else {
      this.loadingIssues = true;
    }

    const difference = actualLength - renderLength;

    if (difference > threshold) {
      renderGroup.issues = actualGroup.issues.slice(0, renderLength + threshold);
    } else {
      renderGroup.issues = actualGroup.issues.slice();
      this.renderNextGroup();
      this.renderMoreIssues(threshold - difference);
    }
  }

  renderNextGroup() {
    if (this.issueGroups.length === this.renderedIssueGroups.length) {
      return;
    }

    const nextRenderedIssueGroup = this.issueGroups[this.renderedIssueGroups.length];
    this.renderedIssueGroups.push({...nextRenderedIssueGroup, issues: []});
  }

  getIssueGroupKey(_i: number, issueGroup: IssueGroup) {
    return issueGroup.id;
  }

  selectGroup(index: number) {
    this.selection.issues.select(...this.issueGroups[index].issues.map(r => r.number));
  }
}
