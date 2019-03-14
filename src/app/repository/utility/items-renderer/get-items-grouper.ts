import {filter, map} from 'rxjs/operators';
import {LabelsDao} from '../../services/dao';
import {GithubItemGrouping} from './item-grouping';


export function getItemsGrouper(labelsDao: LabelsDao) {
  return labelsDao.map.pipe(filter(v => !!v), map(labelsMap => {
                              return new GithubItemGrouping(labelsMap!);
                            }));
}
