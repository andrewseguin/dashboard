import {NgModule} from '@angular/core';
import {Login} from './login';
import {MaterialModule} from 'app/material.module';
import {CommonModule} from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

@NgModule({
  imports: [
    CommonModule,
    MaterialModule,
    ReactiveFormsModule,
  ],
  declarations: [Login],
  exports: [Login],
})
export class LoginModule { }
