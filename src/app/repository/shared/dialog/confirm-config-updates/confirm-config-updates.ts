import {ChangeDetectionStrategy, Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA} from '@angular/material';
import {Dashboard, Query, Recommendation} from 'app/repository/services/dao';
import {LocalToRemoteComparison} from 'app/repository/services/dao/list-dao';

export interface ConfirmConfigUpdatesData {
  dashboards: LocalToRemoteComparison<Dashboard>;
  recommendations: LocalToRemoteComparison<Recommendation>;
  queries: LocalToRemoteComparison<Query>;
}

@Component({
  templateUrl: 'confirm-config-updates.html',
  styleUrls: ['confirm-config-updates.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConfirmConfigUpdates {
  confirmations = ['dashboards', 'queries', 'recommendations'];

  constructor(@Inject(MAT_DIALOG_DATA) public data: ConfirmConfigUpdatesData) {}
}
