import {Component} from '@angular/core';

interface ConfigTab {
  id: string;
  label: string;
}

@Component({
  selector: 'config-page',
  styleUrls: ['config-page.scss'],
  templateUrl: 'config-page.html',
})
export class ConfigPage {
  selectedTabIndex = 0;
  tabs: ConfigTab[] = [
    {
      id: 'cache',
      label: 'Cache',
    },
    {
      id: 'recommendations',
      label: 'Recommendations',
    },
  ];

  constructor() {}
}
