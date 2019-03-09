import {NgModule} from '@angular/core';
import {MaterialModule} from 'app/material.module';

import {ItemDetailModule} from '../../item-detail/item-detail.module';

import {ItemDetailDialog} from './item-detail-dialog';


@NgModule({
  imports: [
    MaterialModule,
    ItemDetailModule,
  ],
  declarations: [ItemDetailDialog],
  exports: [ItemDetailDialog],
  entryComponents: [ItemDetailDialog]
})
export class IssueDetailDialogModule {
}
