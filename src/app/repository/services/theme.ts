import {Injectable} from '@angular/core';
import {Config} from 'app/service/config';
import {filter, take} from 'rxjs/operators';

@Injectable()
export class Theme {
  isLight: boolean;

  constructor(private config: Config) {
    this.syncState();

    this.config.getDashboardConfig().pipe(filter(v => !!v), take(1)).subscribe((dashboardConfig => {
      if (dashboardConfig!.useDarkTheme && this.isLight) {
        this.toggle();
      }
    }));
  }

  toggle() {
    document.body.classList.toggle('light-theme');
    document.body.classList.toggle('dark-theme');
    this.syncState();

    localStorage.setItem('light', String(this.isLight));
    this.config.saveDashboardConfig({useDarkTheme: !this.isLight});
  }

  private syncState() {
    this.isLight = document.body.classList.contains('light-theme');
  }
}
