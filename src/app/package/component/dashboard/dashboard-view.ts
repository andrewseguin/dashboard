import {CdkDragDrop, moveItemInArray, transferArrayItem} from '@angular/cdk/drag-drop';
import {ChangeDetectionStrategy, Component, EventEmitter, Input, Output} from '@angular/core';
import {MatDialog, MatDialogConfig} from '@angular/material';
import {take} from 'rxjs/operators';
import {Column, ColumnGroup, Dashboard, DisplayType, Widget} from './dashboard';
import {EditWidget, EditWidgetData} from './edit-widget/edit-widget';
import {DataSource} from './widget-view/widget-view';

@Component({
  selector: 'dashboard-view',
  templateUrl: 'dashboard-view.html',
  styleUrls: ['dashboard-view.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {'[class.edit-mode]': 'edit'}
})
export class DashboardView {
  @Input() dashboard: Dashboard;

  @Input() edit: boolean;

  @Input() dataSources: Map<string, DataSource>;

  @Input() widgetConfigs: {[key in DisplayType]: any};

  @Output() dashboardChange = new EventEmitter<Dashboard>();

  @Output() openWidget = new EventEmitter<Widget>();

  constructor(private dialog: MatDialog) {}

  addColumnGroup() {
    if (!this.dashboard.columnGroups) {
      this.dashboard.columnGroups = [];
    }

    this.dashboard.columnGroups.push({columns: [{widgets: []}]});
    this.save();
  }

  addColumn(columnGroup: ColumnGroup) {
    columnGroup.columns.push({widgets: []});
    this.save();
  }

  addWidget(column: Column) {
    this.editWidget(column, {}, column.widgets.length);
  }

  duplicateWidget(column: Column, widget: Widget, index: number) {
    const newWidget = {...widget};
    column.widgets.splice(index, 0, newWidget);
  }

  editWidget(column: Column, widget: Widget, index: number) {
    const data: EditWidgetData = {
      widget,
      dataSources: this.dataSources,
    };

    const config: MatDialogConfig<EditWidgetData> = {data, width: '650px'};

    this.dialog.open(EditWidget, config).afterClosed().pipe(take(1)).subscribe((result: Widget) => {
      if (result) {
        column.widgets[index] = {...result};
        this.save();
      }
    });
  }

  removeColumnGroup(index: number) {
    if (this.dashboard.columnGroups) {
      this.dashboard.columnGroups.splice(index, 1);
      this.save();
    }
  }

  removeColumn(columnGroup: ColumnGroup, index: number) {
    columnGroup.columns.splice(index, 1);
    this.save();
  }

  removeWidget(column: Column, index: number) {
    column.widgets.splice(index, 1);
    this.save();
  }

  private save() {
    this.dashboardChange.emit(this.dashboard);
  }

  dropWidget(event: CdkDragDrop<Widget[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(
          event.previousContainer.data, event.container.data, event.previousIndex,
          event.currentIndex);
    }
    this.save();
  }
}
