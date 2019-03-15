import {filter, map} from 'rxjs/operators';
import {Label} from '../../services/dao';
import {GithubItemGrouping} from './item-grouping';
import { ListDao } from 'app/repository/services/dao/list-dao';


export function getItemsGrouper(labelsDao: ListDao<Label>) {
  return labelsDao.map.pipe(filter(v => !!v), map(labelsMap => {
                               return new GithubItemGrouping(labelsMap!);
                             }));
}
