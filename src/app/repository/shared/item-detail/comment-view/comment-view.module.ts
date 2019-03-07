import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {TimeAgoPipeModule} from 'app/app.module';
import {MaterialModule} from 'app/material.module';
import {CommentView} from './comment-view';

@NgModule({
  imports: [CommonModule, MaterialModule, TimeAgoPipeModule],
  declarations: [CommentView],
  exports: [CommentView],
})
export class CommentViewModule {
}
