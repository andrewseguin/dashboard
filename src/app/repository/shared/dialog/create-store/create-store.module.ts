import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {MaterialModule} from 'app/material.module';
import {CreateStore} from './create-store';

@NgModule({
  imports: [
    CommonModule,
    MaterialModule,
  ],
  declarations: [CreateStore],
  exports: [CreateStore],
  entryComponents: [CreateStore]
})
export class CreateStoreModule {
}
