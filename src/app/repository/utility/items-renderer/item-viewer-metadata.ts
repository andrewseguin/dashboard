import {ViewingMetadata} from 'app/package/items-renderer/item-viewer';

export type View = 'reporter'|'assignees'|'labels'|'warnings'|'suggestions';

export const ViewIds: View[] = ['reporter', 'assignees', 'labels', 'warnings', 'suggestions'];

export interface GithubItemView {
  reporter: boolean;
  assignees: boolean;
  labels: boolean;
  warnings: boolean;
  suggestions: boolean;
}

export const GithubItemViewerMetadata = new Map<View, ViewingMetadata<View>>([
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
