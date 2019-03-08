import {Component, ChangeDetectionStrategy} from '@angular/core';

interface ConfigTab {
  id: string;
  label: string;
}

@Component({
  selector: 'config-page',
  styleUrls: ['config-page.scss'],
  templateUrl: 'config-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConfigPage {
  tabs: ConfigTab[] = [

    {
      id: 'recommendations',
      label: 'Recommendations',
    },
    {
      id: 'cache',
      label: 'Cache',
    },
  ];

  constructor() {}
}
