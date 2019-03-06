import {CdkPortal} from '@angular/cdk/portal';
import {ChangeDetectionStrategy, ChangeDetectorRef, Component, ViewChild} from '@angular/core';
import {MatDialog} from '@angular/material';
import {ActivatedRoute, Router} from '@angular/router';
import {Subject, Subscription} from 'rxjs';
import {filter, take, takeUntil} from 'rxjs/operators';

import {Header} from '../services';
import {ActivatedRepository} from '../services/activated-repository';
import {Column, ColumnGroup, Dashboard, DashboardsDao} from '../services/dao/dashboards-dao';
import {EditWidget} from '../shared/dialog/edit-widget/edit-widget';


@Component({
  styleUrls: ['dashboard-page.scss'],
  templateUrl: 'dashboard-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardPage {
  set dashboard(dashboard: Dashboard) {
    this._dashboard = dashboard;
    this.header.title.next(this.dashboard.name);
  }
  get dashboard(): Dashboard {
    return this._dashboard;
  }
  private _dashboard: Dashboard;

  private destroyed = new Subject();

  private getSubscription: Subscription;

  @ViewChild(CdkPortal) toolbarActions: CdkPortal;

  constructor(
      private router: Router, private activatedRoute: ActivatedRoute,
      private dashboardsDao: DashboardsDao, private activatedRepository: ActivatedRepository,
      private header: Header, private cd: ChangeDetectorRef, private dialog: MatDialog) {
    this.activatedRoute.params.pipe(takeUntil(this.destroyed)).subscribe(params => {
      const id = params['id'];

      if (this.getSubscription) {
        this.getSubscription.unsubscribe();
      }

      this.getSubscription =
          this.dashboardsDao.map.pipe(takeUntil(this.destroyed), filter(map => !!map))
              .subscribe(map => {
                if (map.get(id)) {
                  this.dashboard = map.get(id);
                } else {
                  this.router.navigate([`${this.activatedRepository.repository.value}/dashboards`]);
                }
                this.cd.markForCheck();
              });
    });
  }

  ngOnInit() {
    this.header.toolbarOutlet.next(this.toolbarActions);
  }

  ngOnDestroy() {
    this.header.toolbarOutlet.next(null);
    this.destroyed.next();
    this.destroyed.complete();
  }

  addColumnGroup() {
    this.dashboard.columnGroups.push({columns: []});
    this.dashboardsDao.update(this.dashboard.id, this.dashboard);
  }

  addColumn(columnGroup: ColumnGroup) {
    columnGroup.columns.push({widgets: []});
    this.dashboardsDao.update(this.dashboard.id, this.dashboard);
  }

  addWidget(column: Column) {
    const config = {
      width: '650px',
      data: {
        name: 'New Widget',
      }
    };

    this.dialog.open(EditWidget, config).afterClosed().pipe(take(1)).subscribe(result => {
      if (result) {
        column.widgets.push({id: 'blah'});
        this.dashboardsDao.update(this.dashboard.id, this.dashboard);
      }
    });
  }
}
