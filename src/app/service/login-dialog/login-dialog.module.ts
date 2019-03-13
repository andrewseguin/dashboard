import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {ReactiveFormsModule} from '@angular/forms';
import {MaterialModule} from 'app/material.module';
import {LoginDialog} from './login-dialog';

@NgModule({
  imports: [
    CommonModule,
    MaterialModule,
    ReactiveFormsModule,
  ],
  declarations: [LoginDialog],
  exports: [LoginDialog],
  entryComponents: [LoginDialog]
})
export class LoginDialogModule {
}
