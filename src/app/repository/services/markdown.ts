import {Injectable} from '@angular/core';
import {DomSanitizer, SafeHtml} from '@angular/platform-browser';
import * as hljs from 'highlight.js';
import * as Remarkable from 'remarkable';
import {RepoDao} from 'app/repository/services/repo-dao';
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

  getItemBodyMarkdown(id: number): Observable<SafeHtml> {
    return this.repoDao.getItem(id).pipe(map(item => this.render(item.body)));
  }

  render(text: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(this.md.render(text));
  }

}
