import {DatePipe} from '@angular/common';
import {ViewerMetadata} from 'app/package/items-renderer/viewer';
import {Recommendation} from 'app/repository/services/dao/config/recommendation';
import {Item} from '../app-types/item';
import {Label} from '../app-types/label';
import {getBorderColor, getTextColor} from '../utility/label-colors';

export type GithubItemView =
    'title'|'reporter'|'assignees'|'labels'|'warnings'|'suggestions'|'creationDate'|'updatedDate';

export interface ViewContext {
  item: Item;
  labelsMap: Map<string, Label>;
  recommendations: Recommendation[];
}

export const GithubItemViewerMetadata =
    new Map<GithubItemView, ViewerMetadata<GithubItemView, ViewContext>>([
      [
        'title',
        {
          id: 'title',
          label: 'Title',
          containerClassList: 'title theme-text',
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
          containerStyles: {fontSize: '13px'},
          containerClassList: 'theme-secondary-text',
          render: (c: ViewContext) => [{text: `Reporter: ${c.item.reporter}`}],
        },
      ],

      [
        'creationDate',
        {
          id: 'creationDate',
          label: 'Date Created',
          containerStyles: {fontSize: '13px'},
          containerClassList: 'theme-secondary-text',
          render: (c: ViewContext) => {
            const datePipe = new DatePipe('en-us');
            return [{text: `Created: ${datePipe.transform(c.item.created)}`}];
          },
        },
      ],

      [
        'updatedDate',
        {
          id: 'updatedDate',
          label: 'Date Last Updated',
          containerStyles: {fontSize: '13px'},
          containerClassList: 'theme-secondary-text',
          render: (c: ViewContext) => {
            const datePipe = new DatePipe('en-us');
            return [{text: `Last updated: ${datePipe.transform(c.item.updated)}`}];
          },
        },
      ],

      [
        'assignees',
        {
          id: 'assignees',
          label: 'Assignees',
          containerStyles: {fontSize: '13px'},
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
          containerStyles: {fontSize: '13px'},
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
          containerStyles: {fontSize: '13px'},
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
            flexWrap: 'wrap',
            fontSize: '13px',
            marginTop: '8px',
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
                marginBottom: '4px',
              };

              return {text: label.name, styles};
            });
          },
        },
      ],
    ]);
