import {Item} from 'app/github/app-types/item';
import {DataSource} from 'app/package/data-source/data-source';
import {Filterer, FiltererContextProvider} from 'app/package/data-source/filterer';
import {Grouper, GrouperContextProvider} from 'app/package/data-source/grouper';
import {Provider} from 'app/package/data-source/provider';
import {Sorter} from 'app/package/data-source/sorter';
import {Viewer, ViewerContextProvider} from 'app/package/data-source/viewer';
import {Recommendation} from 'app/repository/services/dao/config/recommendation';
import {getRecommendations} from 'app/repository/utility/get-recommendations';
import {combineLatest, Observable, of} from 'rxjs';
import {map} from 'rxjs/operators';
import {Label} from '../app-types/label';
import {tokenizeItem} from '../utility/tokenize-item';
import {AutocompleteContext, ItemsFilterMetadata, MatcherContext} from './item-filter-metadata';
import {
  GithubItemGroupingContextProvider as GithubItemGroupingContext,
  GithubItemGroupingMetadata
} from './item-grouper-metadata';
import {GithubItemDataMetadata} from './item-provider-metadata';
import {GithubItemSortingMetadata} from './item-sorter-metadata';
import {GithubItemViewerMetadata, ViewContext} from './item-viewer-metadata';

export class GithubItemDataSource extends DataSource<Item> {
  constructor(
      items: Observable<Item[]>, private recommendations: Observable<Recommendation[]>,
      private labels: Observable<Label[]>) {
    super();

    // Create data source facet components
    this.provider = new Provider(GithubItemDataMetadata, items);
    this.grouper = new Grouper(GithubItemGroupingMetadata, this.createGrouperContextProvider());
    this.sorter = new Sorter(GithubItemSortingMetadata, of(null));
    this.viewer = new Viewer(GithubItemViewerMetadata, this.createViewerContextProvider());
    this.filterer = new Filterer(ItemsFilterMetadata, this.createFiltererContextProvider());

    // Set initial state
    this.viewer.setState({views: this.viewer.getViews().map(v => v.id)});
    this.sorter.setState({sort: 'created', reverse: true});
    this.grouper.setState({group: 'all'});

    // Customize filterer properties
    this.filterer.tokenizeItem = tokenizeItem;
    this.filterer.autocompleteContext = ({items, labels} as AutocompleteContext);
  }

  private createGrouperContextProvider(): GrouperContextProvider<GithubItemGroupingContext> {
    return this.labels.pipe(map(labels => ({labelsMap: createLabelsMap(labels)})));
  }

  private createViewerContextProvider(): ViewerContextProvider<Item, ViewContext> {
    return combineLatest(this.recommendations, this.labels).pipe(map(results => {
      const recommendations = results[0];
      const labelsMap = createLabelsMap(results[1]);
      return (item: Item) => ({item, labelsMap, recommendations});
    }));
  }

  private createFiltererContextProvider(): FiltererContextProvider<Item, MatcherContext> {
    return combineLatest(this.recommendations, this.labels).pipe(map(results => {
      const labelsMap = createLabelsMap(results[1]);
      return (item: Item) => {
        const recommendations = getRecommendations(item, results[0], labelsMap);
        return {item, labelsMap, recommendations};
      };
    }));
  }
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
