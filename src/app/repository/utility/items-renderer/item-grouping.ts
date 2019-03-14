import {AutoGroup, ItemGrouping} from 'app/package/items-renderer/item-grouping';
import {Group} from 'app/package/items-renderer/item-renderer-options';
import {Item, Label} from 'app/repository/services/dao';

export class GithubItemGrouping extends ItemGrouping<Item> {
  constructor(labels: Map<string, Label>) {
    const autoGroups: AutoGroup<Group>[] = [
      {key: 'reporter', type: 'value'},
      {
        key: 'labels',
        type: 'list',
        transform: labelId => labelId ? labels.get(`${labelId}`)!.name : 'No Label'
      },
      {
        key: 'assignees',
        type: 'list',
        transform: labelId => labelId ? labels.get(`${labelId}`)!.name : 'No Label'
      },
    ];
    super(autoGroups);
  }
}
