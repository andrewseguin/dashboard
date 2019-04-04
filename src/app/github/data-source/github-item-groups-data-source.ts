import {Item} from 'app/github/app-types/item';
import {DataSource} from 'app/package/data-source/data-source';
import {FiltererContextProvider} from 'app/package/data-source/filterer';
import {GrouperContextProvider} from 'app/package/data-source/grouper';
import {Provider} from 'app/package/data-source/provider';
import {Sorter} from 'app/package/data-source/sorter';
import {ViewerContextProvider} from 'app/package/data-source/viewer';
import {Recommendation} from 'app/repository/services/dao/config/recommendation';
import {getRecommendations} from 'app/repository/utility/get-recommendations';
import {combineLatest, Observable, of} from 'rxjs';
import {map} from 'rxjs/operators';
import {Label} from '../app-types/label';
import {MatcherContext} from './item-filter-metadata';
import {
  GithubItemGroupingContextProvider as GithubItemGroupingContext
} from './item-grouper-metadata';
import {GithubItemDataMetadata} from './item-provider-metadata';
import {GithubItemSortingMetadata} from './item-sorter-metadata';
import {ViewContext} from './item-viewer-metadata';

export class GithubItemDataSource extends DataSource<Item> {
  constructor(items: Observable<Item[]>) {
    super();

    // Create data source components
    this.provider = new Provider(GithubItemDataMetadata, items);
    this.sorter = new Sorter(GithubItemSortingMetadata, of(null));

    // Set initial state
    this.sorter.setState({sort: 'created', reverse: true});
  }
}

export function createGrouperContextProvider(labels: Observable<Label[]>):
    GrouperContextProvider<GithubItemGroupingContext> {
  return labels.pipe(map(labels => ({labelsMap: createLabelsMap(labels)})));
}

export function createViewerContextProvider(
    labels: Observable<Label[]>,
    recommendations: Observable<Recommendation[]>): ViewerContextProvider<Item, ViewContext> {
  return combineLatest(recommendations, labels).pipe(map(results => {
    const recommendations = results[0];
    const labelsMap = createLabelsMap(results[1]);
    return (item: Item) => ({item, labelsMap, recommendations});
  }));
}

export function createFiltererContextProvider(
    labels: Observable<Label[]>,
    recommendations: Observable<Recommendation[]>): FiltererContextProvider<MatcherContext> {
  return combineLatest(recommendations, labels).pipe(map(results => {
    const labelsMap = createLabelsMap(results[1]);
    return {
      labelsMap,
      getRecommendations: (item: Item) => getRecommendations(item, results[0], labelsMap)
    };
  }));
}

/** Create a map of labels keyed by their ID and name. */
function createLabelsMap(labels: Label[]) {
  const labelsMap = new Map<string, Label>();
  labels.forEach(label => {
    labelsMap.set(label.id, label);
    labelsMap.set(label.name, label);
  });
  return labelsMap;
}
