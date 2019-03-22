import {ViewingMetadata} from 'app/package/items-renderer/item-viewer';
import {Item, Label, Recommendation} from 'app/repository/services/dao';
import {getBorderColor, getTextColor} from '../label-colors';

export type GithubItemView = 'title'|'reporter'|'assignees'|'labels'|'warnings'|'suggestions';

export interface ViewContext {
  item: Item;
  labelsMap: Map<string, Label>;
  recommendations: Recommendation[];
}

export const GithubItemViewerMetadata =
    new Map<GithubItemView, ViewingMetadata<GithubItemView, ViewContext>>([
      [
        'title',
        {
          id: 'title',
          label: 'Title',
          containerClassList: 'title',
          containerStyles: {
            marginBottom: '4px',
            fontSize: '15px',
          },
          render: (c: ViewContext) => [{text: c.item.title}],
        },
      ],

      [
        'reporter',
        {
          id: 'reporter',
          label: 'Reporter',
          containerClassList: 'theme-secondary-text',
          render: (c: ViewContext) => [{text: `Reporter: ${c.item.reporter}`}],
        },
      ],

      [
        'assignees',
        {
          id: 'assignees',
          label: 'Assignees',
          containerClassList: 'theme-secondary-text',
          render: (c: ViewContext) => {
            if (!c.item.assignees.length) {
              return [];
            }
            return [{text: `Assignees: ${c.item.assignees.join(',')}`}];
          }
        },
      ],

      [
        'suggestions',
        {
          id: 'suggestions',
          label: 'Suggestions',
          containerClassList: 'theme-secondary-text',
          render: (c: ViewContext) => {
            return c.recommendations.filter(r => r.type === 'suggestion')
                .map(r => ({text: r.message || ''}));
          },
        },
      ],

      [
        'warnings',
        {
          id: 'warnings',
          label: 'Warnings',
          containerClassList: 'theme-warn',
          render: (c: ViewContext) => {
            return c.recommendations.filter(r => r.type === 'warning').map(r => ({
                                                                             text: r.message || ''
                                                                           }));
          },
        },
      ],

      [
        'labels',
        {
          id: 'labels',
          label: 'Labels',
          containerStyles: {
            display: 'flex',
            justifyContent: 'flex-end',
          },
          render: (c: ViewContext) => {
            return c.item.labels.map(id => {
              const label = c.labelsMap.get(`${id}`);

              if (!label) {
                return {text: ''};
              }

              const styles = {
                color: getTextColor(label.color),
                borderColor: getBorderColor(label.color),
                backgroundColor: '#' + label.color,
                display: 'inline-block',
                padding: '4px 8px',
                borderRadius: '4px',
                marginRight: '4px',
              };

              return {text: label.name, styles};
            });
          },
        },
      ],
    ]);
