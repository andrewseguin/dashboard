import {Injectable} from "@angular/core";
import {DomSanitizer} from "@angular/platform-browser";
import * as hljs from 'highlight.js';
import * as Remarkable from 'remarkable';

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

  constructor(private sanitizer: DomSanitizer) {}

  render(text: string) {
    return this.sanitizer.bypassSecurityTrustHtml(this.md.render(text));
  }
}
