import {ProviderMetadata} from 'app/package/items-renderer/item-provider';
import {Item} from '../app-types/item';

export const GithubItemDataMetadata = new Map<string, ProviderMetadata<Item>>([
  [
    'opened', {
      id: 'opened',
      label: 'Date Opened',
      type: 'date',
      accessor: (item: Item) => item.created,
    }
  ],
  [
    'closed', {
      id: 'closed',
      label: 'Date Closed',
      type: 'date',
      accessor: (item: Item) => item.closed,
    }
  ],
]);
