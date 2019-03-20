import {ChangeDetectionStrategy, Component} from '@angular/core';
import {LoadedRepos} from 'app/service/loaded-repos';
import {Observable} from 'rxjs';
import {map, mergeMap} from 'rxjs/operators';
import {ActiveStore} from '../services/active-store';
import {DataDaoType, DataStore} from '../services/dao/data/data-dao';
import {Remover} from '../services/remover';
import {isRepoStoreEmpty} from '../utility/is-repo-store-empty';


@Component({
  selector: 'database-page',
  styleUrls: ['database-page.scss'],
  templateUrl: 'database-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DatabasePage {
  isEmpty = this.activeStore.data.pipe(mergeMap(store => isRepoStoreEmpty(store)));

  isLoaded = this.activeStore.name.pipe(map(activeStore => this.loadedRepos.isLoaded(activeStore)));

  repoLabels = this.activeStore.data.pipe(
      mergeMap(store => store.labels.list), map(labels => labels.map(l => l.id)));

  counts: {[key in DataDaoType]: Observable<number>} = {
    items: getStoreListCount(this.activeStore.data, 'items'),
    labels: getStoreListCount(this.activeStore.data, 'labels'),
    contributors: getStoreListCount(this.activeStore.data, 'contributors'),
  };

  repoDaoTypeInfo: {type: DataDaoType, label: string, count: Observable<number>}[] = [
    {type: 'items', label: 'Issues and pull requests', count: this.counts.items},
    {type: 'labels', label: 'Labels', count: this.counts.labels},
    {type: 'contributors', label: 'Contributors', count: this.counts.contributors},
  ];

  constructor(
      public activeStore: ActiveStore, private loadedRepos: LoadedRepos, public remover: Remover) {}
}

function getStoreListCount(store: Observable<DataStore>, type: DataDaoType) {
  return store.pipe(mergeMap(store => store[type].list), map(list => list.length));
}
