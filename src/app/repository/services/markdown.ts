import {Injectable} from '@angular/core';
import {DomSanitizer, SafeHtml} from '@angular/platform-browser';
import * as hljs from 'highlight.js';
import * as Remarkable from 'remarkable';
import {RepoDao} from 'app/service/repo-dao';
import {map} from 'rxjs/operators';
import {Observable} from 'rxjs';

@Injectable()
export class Markdown {
  highlightFn = (str, lang) => {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return hljs.highlight(lang, str).value;
      } catch (err) {
      }
    }

    try {
      return hljs.highlightAuto(str).value;
    } catch (err) {
    }

    return '';  // use external default escaping
  }

  md = new Remarkable({
    html: true,
    breaks: true,
    linkify: true,
    highlight: this.highlightFn
  });

  constructor(private sanitizer: DomSanitizer, private repoDao: RepoDao) {}

  getIssueBodyMarkdown(issueId: number): Observable<SafeHtml> {
    return this.repoDao.getIssue(issueId).pipe(map(issue => this.render(issue.body)));
  }

  render(text: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(this.md.render(text));
  }

}
