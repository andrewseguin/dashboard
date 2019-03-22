import {ViewingMetadata} from 'app/package/items-renderer/item-viewer';

export type GithubItemView = 'reporter'|'assignees'|'labels'|'warnings'|'suggestions';

export const GithubItemViewerMetadata = new Map<GithubItemView, ViewingMetadata<GithubItemView>>([
  [
    'reporter',
    {
      id: 'reporter',
      label: 'Reporter',
    },
  ],
  [
    'assignees',
    {
      id: 'assignees',
      label: 'Assignees',
    },
  ],
  [
    'labels',
    {
      id: 'labels',
      label: 'Labels',
    },
  ],
  [
    'warnings',
    {
      id: 'warnings',
      label: 'Warnings',
    },
  ],
  [
    'suggestions',
    {
      id: 'suggestions',
      label: 'Suggestions',
    },
  ],
]);
