import {ChangeDetectionStrategy, Component, Input} from '@angular/core';
import {MatDialog} from '@angular/material';
import {ActivatedRoute, Router} from '@angular/router';
import {Item} from 'app/service/github';
import {isMobile} from 'app/utility/media-matcher';
import {map} from 'rxjs/operators';
import {IssueDetailDialog} from '../../dialog/issue-detail-dialog/issue-detail-dialog';


@Component({
  selector: 'items-group',
  templateUrl: 'items-group.html',
  styleUrls: ['items-group.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ItemsGroup {
  @Input() items: Item[];

  @Input() title: string;

  trackByItemNumber = (_i, item: Item) => item.number;

  activeItem =
      this.activatedRoute.queryParamMap.pipe(map(queryParamMap => +queryParamMap.get('item')));

  constructor(
      private router: Router, private dialog: MatDialog, private activatedRoute: ActivatedRoute) {}

  navigateToItem(item: number) {
    if (!isMobile()) {
      this.router.navigate([], {
        relativeTo: this.activatedRoute.parent,
        queryParams: {item: item},
        queryParamsHandling: 'merge',
      });
    } else {
      this.dialog.open(IssueDetailDialog, {data: {item}});
    }
  }
}
