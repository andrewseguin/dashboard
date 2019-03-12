import {ChangeDetectionStrategy, Component, NgZone, OnDestroy} from '@angular/core';
import {AngularFireAuth} from '@angular/fire/auth';
import {FormControl} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {Auth} from 'app/service/auth';
import {sendEvent} from 'app/utility/analytics';
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

  accessTokenInput = new FormControl('');

  private destroyed = new Subject();

  constructor(
      private afAuth: AngularFireAuth, private route: Router,
      private activatedRoute: ActivatedRoute, private ngZone: NgZone, private auth: Auth) {
    const queryParamAccessToken = this.activatedRoute.snapshot.queryParamMap.get('accessToken');
    if (queryParamAccessToken) {
      this.accessTokenInput.setValue(queryParamAccessToken);
      this.loginManually();
    }


    if (this.auth.token) {
      this.navigateToSite();
    }

    this.afAuth.authState.pipe(takeUntil(this.destroyed)).subscribe(auth => {
      if (!auth) {
        this.checkingAuth.next(false);
        return;
      }

      sendEvent('login', 'valid');
      this.navigateToSite();
    });
  }

  ngOnDestroy() {
    this.destroyed.next();
    this.destroyed.complete();
  }

  loginWithGithub() {
    this.auth.signIn();
  }

  loginManually() {
    if (this.accessTokenInput.value) {
      this.auth.token = this.accessTokenInput.value;
      this.navigateToSite();
    }
  }

  private navigateToSite() {
    let hash = window.location.hash.substr(1);
    if (hash) {
      this.route.navigate([hash]);
    } else {
      this.route.navigate(['']);
    }
  }
}
