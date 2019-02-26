import {ChangeDetectionStrategy, Component, OnDestroy} from '@angular/core';
import {AngularFireAuth} from '@angular/fire/auth';
import {MatSnackBar} from '@angular/material';
import {Router} from '@angular/router';
import {sendEvent} from 'app/utility/analytics';
import {auth} from 'firebase/app';
import {BehaviorSubject, Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';

@Component({
  selector: 'login',
  templateUrl: 'login.html',
  styleUrls: ['login.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'theme-background',
  }
})
export class Login implements OnDestroy {
  checkingAuth = new BehaviorSubject<boolean>(true);

  private destroyed = new Subject();

  constructor(
      private afAuth: AngularFireAuth, private snackBar: MatSnackBar,
      private route: Router) {
    this.afAuth.authState.pipe(takeUntil(this.destroyed)).subscribe(auth => {
      if (!auth) {
        this.checkingAuth.next(false);
        return;
      }

      sendEvent('login', 'valid');
      let hash = window.location.hash.substr(1);
      if (hash) {
        this.route.navigate([hash]);
      } else {
        this.route.navigate(['home']);
      }
    });
  }

  ngOnDestroy() {
    this.destroyed.next();
    this.destroyed.complete();
  }

  login() {
    this.checkingAuth.next(true);
    const googleAuthProvider = new auth.GoogleAuthProvider();
    googleAuthProvider.setCustomParameters({prompt: 'select_account'});
    this.afAuth.auth.signInWithPopup(googleAuthProvider);
  }
}
