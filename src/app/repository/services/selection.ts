import {Injectable} from '@angular/core';
import {SelectionModel} from '@angular/cdk/collections';
import {Router} from '@angular/router';
import {takeUntil} from 'rxjs/operators';
import {Subject} from 'rxjs';
import {ESCAPE} from '@angular/cdk/keycodes';

@Injectable()
export class Selection {
  selectableB = new SelectionModel<string>(true);
  issues = new SelectionModel<number>(true);

  private destroyed = new Subject();

  private handleEscape = (e: KeyboardEvent) => {
    if (e.keyCode === ESCAPE) {
      this.selectableB.clear();
      this.issues.clear();
    }
  }

  constructor(private router: Router) {
    this.router.events.pipe(takeUntil(this.destroyed)).subscribe(() => {
      this.selectableB.clear();
      this.issues.clear();
    });

    document.body.addEventListener('keydown', this.handleEscape);
  }

  ngOnDestroy() {
    document.body.removeEventListener('keydown', this.handleEscape);

    this.destroyed.next();
    this.destroyed.complete();
  }
}
