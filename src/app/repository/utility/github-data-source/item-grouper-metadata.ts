import {
  getGroupByListValues,
  getGroupByValue,
  GroupingMetadata
} from 'app/package/items-renderer/item-grouper';
import {Item, Label} from 'app/repository/services/dao';

export type Group = 'all'|'reporter'|'label'|'assignee';

export interface TitleTransformContext {
  labelsMap: Map<string, Label>;
}

export const GithubItemGroupingMetadata =
    new Map<Group, GroupingMetadata<Item, Group, TitleTransformContext>>([
      [
        'all', {
          id: 'all',
          label: 'All',
          groupingFunction: (items: Item[]) => [{id: 'all', title: 'All', items}],
          titleTransform: () => ''
        }
      ],
      [
        'reporter', {
          id: 'reporter',
          label: 'Reporter',
          groupingFunction: (items: Item[]) => getGroupByValue(items, 'reporter'),
        }
      ],
      [
        'label', {
          id: 'label',
          label: 'Label',
          groupingFunction: (items: Item[]) => getGroupByListValues(items, 'labels'),
          titleTransform: (title: string, c: TitleTransformContext) => {
            if (!title) {
              return 'No labels';
            }

            const label = c.labelsMap.get(title);
            return label ? label.name : 'No label';
          }
        }
      ],
      [
        'assignee', {
          id: 'assignee',
          label: 'Assignee',
          groupingFunction: (items: Item[]) => getGroupByListValues(items, 'assignees'),
        }
      ],
    ]);