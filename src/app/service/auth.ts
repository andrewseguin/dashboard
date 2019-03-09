import {Injectable} from '@angular/core';

@Injectable({providedIn: 'root'})
export class Auth {
  set token(token: string) {
    window.localStorage.setItem('accessToken', token);
  }
  get token(): string {
    return window.localStorage.getItem('accessToken');
  }

  constructor() {
    // Check if the URL location has the access token embedded
    const search = window.location.search;
    if (search) {
      let tokens = search.substring(1).split('&');
      tokens.forEach(token => {
        const key = token.split('=')[0];
        const value = token.split('=')[1];
        if (key === 'accessToken') {
          this.token = value;
        }
      });
    }
  }
}
