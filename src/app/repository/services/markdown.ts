import {Injectable} from '@angular/core';
import {DomSanitizer, SafeHtml} from '@angular/platform-browser';
import * as hljs from 'highlight.js';
import * as Remarkable from 'remarkable';
import {Observable} from 'rxjs';
import {filter, map} from 'rxjs/operators';
import {ItemsDao} from './dao';

@Injectable()
export class Markdown {
  highlightFn =
      (str: string, lang: string) => {
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

  md = new Remarkable({html: true, breaks: true, linkify: true, highlight: this.highlightFn});

  constructor(private sanitizer: DomSanitizer, private itemsDao: ItemsDao) {}

  getItemBodyMarkdown(id: string): Observable<SafeHtml> {
    return this.itemsDao.get(id).pipe(filter(v => !!v), map(item => this.render(item!.body)));
  }

  render(text: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(this.md.render(text));
  }
}
