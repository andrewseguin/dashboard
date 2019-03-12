import {Injectable} from '@angular/core';

@Injectable()
export class Theme {
  isLight: boolean;

  constructor() {}

  toggle() {
    document.body.classList.toggle('light-theme');
    document.body.classList.toggle('dark-theme');
    this.syncState();

    localStorage.setItem('light', String(this.isLight));
    // TODO: Update the user's setting
  }

  private syncState() {
    this.isLight = document.body.classList.contains('light-theme');
  }
}
