import {ChangeDetectionStrategy, Component, Input} from '@angular/core';

@Component({
  selector: 'widget',
  styleUrls: ['widget.scss'],
  templateUrl: 'widget.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'theme-background-card theme-border',
  }
})
export class Widget {
  @Input() widget: Widget;
}
