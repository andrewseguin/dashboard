import {IFilterMetadata} from 'app/package/items-renderer/search-utility/filter';
import {
  DateQuery,
  InputQuery,
  NumberQuery,
  Query,
  StateQuery
} from 'app/package/items-renderer/search-utility/query';
import {
  arrayContainsQuery,
  dateMatchesEquality,
  numberMatchesEquality,
  stateMatchesEquality,
  stringContainsQuery
} from 'app/package/items-renderer/search-utility/query-matcher';
import {Item, ItemsDao, Label, LabelsDao, Recommendation} from 'app/repository/services/dao';
import {filter, map} from 'rxjs/operators';

export interface MatcherContext {
  item: Item;
  labelsMap: Map<string, Label>;
  recommendations: Recommendation[];
}

export interface AutocompleteContext {
  itemsDao: ItemsDao;
  labelsDao: LabelsDao;
}

export const ItemsFilterMetadata =
    new Map<string, IFilterMetadata<MatcherContext, AutocompleteContext>>([

      /** InputQuery Filters */

      [
        'title', {
          displayName: 'Title',
          queryType: 'input',
          matcher: (c: MatcherContext, q: Query) => {
            return stringContainsQuery(c.item.title, q as InputQuery);
          },
          autocomplete: (c: AutocompleteContext) => {
            return c.itemsDao.list.pipe(filter(list => !!list), map(items => {
                                          return items!.map(issue => issue.title);
                                        }));
          }
        }
      ],

      [
        'assignees', {
          displayName: 'Assignee',
          queryType: 'input',
          matcher: (c: MatcherContext, q: Query) => {
            return arrayContainsQuery(c.item.assignees, q as InputQuery);
          },
          autocomplete: (c: AutocompleteContext) => {
            return c.itemsDao.list.pipe(
                filter(list => !!list), map(items => {
                  const assigneesSet = new Set<string>();
                  items!.forEach(i => i.assignees.forEach(a => assigneesSet.add(a)));

                  const assignees: string[] = [];
                  assigneesSet.forEach(a => assignees.push(a));
                  return assignees;
                }));
          }
        }
      ],

      [
        'body', {
          displayName: 'Body',
          queryType: 'input',
          matcher: (c: MatcherContext, q: Query) => {
            return stringContainsQuery(c.item.body, q as InputQuery);
          },
        }
      ],

      [
        'labels', {
          displayName: 'Labels',
          queryType: 'input',
          matcher: (c: MatcherContext, q: Query) => {
            return arrayContainsQuery(
                c.item.labels.map(l => {
                  const label = c.labelsMap.get(l);

                  if (!label) {
                    return '';
                  }

                  return label.name;
                }),
                q as InputQuery);
          },
          autocomplete: (c: AutocompleteContext) => {
            return c.labelsDao.list.pipe(
                filter(list => !!list), map(labels => labels!.map(issue => issue.name).sort()));
          }
        }
      ],

      /** NumberQuery Filters */

      [
        'commentCount', {
          displayName: 'Comment Count',
          queryType: 'number',
          matcher: (c: MatcherContext, q: Query) => {
            return numberMatchesEquality(c.item.comments, q as NumberQuery);
          }
        }
      ],

      /** DateQuery Filters */

      [
        'created', {
          displayName: 'Date Created',
          queryType: 'date',
          matcher: (c: MatcherContext, q: Query) => {
            return dateMatchesEquality(c.item.created, q as DateQuery);
          }
        }
      ],

      /** StateQuery */

      [
        'state', {
          displayName: 'State',
          queryType: 'state',
          queryTypeData: {states: ['open', 'closed']},
          matcher: (c: MatcherContext, q: Query) => {
            const values = new Map<string, boolean>([
              ['open', c.item.state === 'open'],
              ['closed', c.item.state === 'closed'],
            ]);
            const stateQuery = q as StateQuery;
            return stateMatchesEquality(values.get(stateQuery.state)!, stateQuery);
          },
        }
      ],

      [
        'recommendation', {
          displayName: 'Recommendation',
          queryType: 'state',
          queryTypeData: {states: ['empty', 'at least one warning', 'at least one suggestion']},
          matcher: (c: MatcherContext, q: Query) => {
            const values = new Map<string, boolean>([
              ['empty', !c.recommendations.length],
              ['at least one warning', c.recommendations.some(r => r.type === 'warning')],
              ['at least one suggestion', c.recommendations.some(r => r.type === 'suggestion')],
            ]);
            const stateQuery = q as StateQuery;
            return stateMatchesEquality(values.get(stateQuery.state)!, stateQuery);
          },
        }
      ],
    ]);
