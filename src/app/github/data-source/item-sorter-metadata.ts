import { SortingMetadata } from 'app/package/data-source/sorter';
import { Item } from '../app-types/item';

export type Sort = 'created'|'updated'|'title'|'plusOneReactions'|'minusOneReactions';

export const GithubItemSortingMetadata = new Map<Sort, SortingMetadata<Item, Sort, null>>([
  [
    'created', {
      id: 'created',
      label: 'Date Opened',
      comparator: () => (a: Item, b: Item) => a.created < b.created ? -1 : 1,
    }
  ],

  [
    'updated', {
      id: 'updated',
      label: 'Last Updated',
      comparator: () => (a: Item, b: Item) => a.updated < b.updated ? -1 : 1,
    }
  ],

  [
    'title', {
      id: 'title',
      label: 'Title',
      comparator: () => (a: Item, b: Item) =>
          a.title.toLowerCase() < b.title.toLowerCase() ? -1 : 1,
    }
  ],

  [
    'plusOneReactions', {
      id: 'plusOneReactions',
      label: '+1 Reactions',
      comparator: () => (a: Item, b: Item) => a.reactions['+1'] < b.reactions['+1'] ? -1 : 1,
    }
  ],
]);
