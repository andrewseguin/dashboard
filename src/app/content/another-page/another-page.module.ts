import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {MaterialModule} from 'app/material.module';

import {AnotherPage} from './another-page';

const routes: Routes = [{path: '', component: AnotherPage}];

@NgModule({imports: [RouterModule.forChild(routes)], exports: [RouterModule]})
export class AnotherPageRoutingModule {
}

@NgModule({
  imports: [CommonModule, AnotherPageRoutingModule, MaterialModule],
  declarations: [AnotherPage],
  exports: [AnotherPage],
})
export class AnotherPageModule {
}
