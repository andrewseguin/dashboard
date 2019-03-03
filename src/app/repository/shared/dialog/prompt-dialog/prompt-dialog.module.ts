import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {ReactiveFormsModule} from '@angular/forms';
import {PromptDialog} from 'app/repository/shared/dialog/prompt-dialog/prompt-dialog';
import {MaterialModule} from 'app/material.module';

@NgModule({
  imports: [
    CommonModule,
    MaterialModule,
    ReactiveFormsModule,
  ],
  declarations: [PromptDialog],
  exports: [PromptDialog],
  entryComponents: [PromptDialog]
})
export class PromptDialogModule {
}
