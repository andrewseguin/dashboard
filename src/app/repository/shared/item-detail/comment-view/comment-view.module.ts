import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { TimeAgoPipeModule } from 'app/app.module';
import { CommentView } from './comment-view';

@NgModule({
  imports: [CommonModule, TimeAgoPipeModule],
  declarations: [CommentView],
  exports: [CommentView],
})
export class CommentViewModule {
}
