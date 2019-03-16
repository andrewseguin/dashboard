import {ListDao} from 'app/repository/services/dao/list-dao';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';

export function getValuesFromList(listDao: ListDao<any>, property: string): Observable<string[]> {
  return listDao.list.pipe(map(list => {
    const values = list.map(r => r[property]).filter(p => !!p);
    return Array.from(new Set(values));
  }));
}
