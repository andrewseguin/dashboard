import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'home-page',
  templateUrl: 'home-page.html',
  styleUrls: ['home-page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'theme-background',
  }
})
export class HomePage {
}
