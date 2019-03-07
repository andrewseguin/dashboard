import {ChangeDetectionStrategy, Component, Input} from '@angular/core';
import {Markdown} from 'app/repository/services/markdown';
import {UserComment} from 'app/service/github';
import { SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'comment-view',
  styleUrls: ['comment-view.scss'],
  templateUrl: 'comment-view.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CommentView {
  @Input() comment: UserComment;

  messageMarkdown: SafeHtml;

  constructor(private markdown: Markdown) {}

  ngOnInit() {
    this.messageMarkdown = this.markdown.render(this.comment.message);
  }
}
