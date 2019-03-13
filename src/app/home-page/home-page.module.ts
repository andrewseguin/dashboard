import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {ReactiveFormsModule} from '@angular/forms';
import {RouterModule} from '@angular/router';
import {MaterialModule} from 'app/material.module';
import {HomePage} from './home-page';

@NgModule({
  imports: [CommonModule, MaterialModule, ReactiveFormsModule, RouterModule],
  declarations: [HomePage],
  exports: [HomePage],
})
export class LoginModule {
}
