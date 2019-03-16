import {AutoGroup, ItemGrouping} from 'app/package/items-renderer/item-grouping';
import {Group} from 'app/package/items-renderer/item-renderer-options';
import {Item, Label} from 'app/repository/services/dao';

export class GithubItemGrouping extends ItemGrouping<Item> {
  constructor(labels: Map<string, Label>) {
    const autoGroups: AutoGroup<Group>[] = [
      {group: 'reporter', key: 'reporter', type: 'value'},
      {
        group: 'label',
        key: 'labels',
        type: 'list',
        transform: labelId => {
          const label = labels.get(`${labelId}`);
          return label ? label.name : 'No Label';
        }
      },
      {
        group: 'assignee',
        key: 'assignees',
        type: 'list',
      },
    ];
    super(autoGroups);
  }
}
