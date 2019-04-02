import { FiltererMetadata } from 'app/package/data-source/filterer';
import { DateQuery, InputQuery, NumberQuery, Query, StateQuery } from 'app/package/data-source/query';
import { arrayContainsQuery, dateMatchesEquality, numberMatchesEquality, stateMatchesEquality, stringContainsQuery } from 'app/package/utility/query-matcher';
import { Recommendation } from 'app/repository/services/dao/config/recommendation';
import { ListDao } from 'app/repository/services/dao/list-dao';
import { map } from 'rxjs/operators';
import { Item } from '../app-types/item';
import { Label } from '../app-types/label';

export interface MatcherContext {
  item: Item;
  labelsMap: Map<string, Label>;
  recommendations: Recommendation[];
}

export interface AutocompleteContext {
  items: ListDao<Item>;
  labels: ListDao<Label>;
}

export const ItemsFilterMetadata =
    new Map<string, FiltererMetadata<MatcherContext, AutocompleteContext>>([

      /** InputQuery Filters */

      [
        'title', {
          label: 'Title',
          queryType: 'input',
          matcher: (c: MatcherContext, q: Query) => {
            return stringContainsQuery(c.item.title, q as InputQuery);
          },
          autocomplete: (c: AutocompleteContext) => {
            return c.items.list.pipe(map(items => items.map(issue => issue.title)));
          }
        }
      ],

      [
        'assignees', {
          label: 'Assignee',
          queryType: 'input',
          matcher: (c: MatcherContext, q: Query) => {
            return arrayContainsQuery(c.item.assignees, q as InputQuery);
          },
          autocomplete: (c: AutocompleteContext) => {
            return c.items.list.pipe(map(items => {
              const assigneesSet = new Set<string>();
              items.forEach(item => item.assignees.forEach(a => assigneesSet.add(a)));

              const assignees: string[] = [];
              assigneesSet.forEach(a => assignees.push(a));
              assignees.sort((a, b) => a.toLowerCase() < b.toLowerCase() ? -1 : 1);
              return assignees;
            }));
          }
        }
      ],

      [
        'body', {
          label: 'Body',
          queryType: 'input',
          matcher: (c: MatcherContext, q: Query) => {
            return stringContainsQuery(c.item.body, q as InputQuery);
          },
        }
      ],

      [
        'labels', {
          label: 'Labels',
          queryType: 'input',
          matcher: (c: MatcherContext, q: Query) => {
            const labelIds = c.item.labels.map(labelId => `${labelId}`);
            return arrayContainsQuery(
                labelIds.map(l => {
                  const label = c.labelsMap.get(l);

                  if (!label) {
                    return '';
                  }

                  return label.name;
                }),
                q as InputQuery);
          },
          autocomplete: (c: AutocompleteContext) => {
            return c.labels.list.pipe(map(labels => labels.map(issue => issue.name).sort()));
          }
        }
      ],

      /** NumberQuery Filters */

      [
        'commentCount', {
          label: 'Comment Count',
          queryType: 'number',
          matcher: (c: MatcherContext, q: Query) => {
            return numberMatchesEquality(c.item.comments, q as NumberQuery);
          }
        }
      ],
      [
        'reactionCount', {
          label: 'Reaction Count',
          queryType: 'number',
          matcher: (c: MatcherContext, q: Query) => {
            return numberMatchesEquality(c.item.reactions['+1'], q as NumberQuery);
          }
        }
      ],

      [
        'days-since-created', {
          label: 'Days Since Created',
          queryType: 'number',
          matcher: (c: MatcherContext, q: Query) => {
            const dayInMs = 1000 * 60 * 60 * 24;
            const nowMs = new Date().getTime();
            const createdDateMs = new Date(c.item.created).getTime();
            const days = Math.round(Math.abs(nowMs - createdDateMs) / dayInMs);

            return numberMatchesEquality(days, q as NumberQuery);
          }
        }
      ],

      [
        'days-since-updated', {
          label: 'Days Since Updated',
          queryType: 'number',
          matcher: (c: MatcherContext, q: Query) => {
            const dayInMs = 1000 * 60 * 60 * 24;
            const nowMs = new Date().getTime();
            const createdDateMs = new Date(c.item.updated).getTime();
            const days = Math.round(Math.abs(nowMs - createdDateMs) / dayInMs);

            return numberMatchesEquality(days, q as NumberQuery);
          }
        }
      ],

      [
        'days-open', {
          label: 'Days Open',
          queryType: 'number',
          matcher: (c: MatcherContext, q: Query) => {
            const dayInMs = 1000 * 60 * 60 * 24;

            // If item has not yet been closed, use current time
            const closedDateMs = new Date(c.item.closed).getTime() || new Date().getTime();
            const createdDateMs = new Date(c.item.created).getTime();
            const days = Math.round(Math.abs(closedDateMs - createdDateMs) / dayInMs);

            return numberMatchesEquality(days, q as NumberQuery);
          }
        }
      ],

      /** DateQuery Filters */

      [
        'created', {
          label: 'Date Created',
          queryType: 'date',
          matcher: (c: MatcherContext, q: Query) => {
            return dateMatchesEquality(c.item.created, q as DateQuery);
          }
        }
      ],

      /** StateQuery */

      [
        'state', {
          label: 'State',
          queryType: 'state',
          queryTypeData: {
            states: [
              'open',
              'closed',
            ],
          },
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
          label: 'Recommendation',
          queryType: 'state',
          queryTypeData: {
            states: [
              'empty',
              'at least one warning',
              'at least one suggestion',
            ],
          },
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
