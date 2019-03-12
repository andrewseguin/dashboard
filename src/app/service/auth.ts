import {Injectable, NgZone} from '@angular/core';
import {AngularFireAuth} from '@angular/fire/auth';
import {auth} from 'firebase/app';
import {Subject} from 'rxjs';

@Injectable({providedIn: 'root'})
export class Auth {
  set token(token: string|null) {
    window.localStorage.setItem('accessToken', token || '');
    this.tokenChanged.next();
  }
  get token(): string|null {
    return window.localStorage.getItem('accessToken');
  }

  tokenChanged = new Subject();

  constructor(private afAuth: AngularFireAuth, private ngZone: NgZone) {
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

  signIn() {
    const githubAuthProvider = new auth.GithubAuthProvider();
    return this.afAuth.auth.signInWithPopup(githubAuthProvider).then(result => {
      if (result) {
        this.ngZone.run(() => this.token = (result!.credential! as any).accessToken as string);
      }
    });
  }
}
