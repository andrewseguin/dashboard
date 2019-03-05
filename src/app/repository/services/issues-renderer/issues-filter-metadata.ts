import {getRecommendations} from 'app/repository/utility/get-recommendations';
import {arrayContainsQuery, dateMatchesEquality, numberMatchesEquality, stateMatchesEquality, stringContainsQuery} from 'app/repository/utility/search/query-matcher';
import {filter, map} from 'rxjs/operators';

import {AutocompleteContext, IFilterMetadata, MatcherContext} from '../../utility/search/filter';
import {DateQuery, InputQuery, NumberQuery, StateQuery} from '../../utility/search/query';

export const IssuesFilterMetadata = new Map<string, IFilterMetadata>([

  /** InputQuery Filters */

  [
    'title', {
      displayName: 'Title',
      queryType: 'input',
      matcher: (c: MatcherContext, q: InputQuery) => {
        return stringContainsQuery(c.issue.title, q);
      },
      autocomplete: (c: AutocompleteContext) => {
        return c.repoDao.repo.pipe(map(repo => {
          return repo.issues.map(issue => issue.title);
        }));
      }
    }
  ],

  [
    'assignees', {
      displayName: 'Assignee',
      queryType: 'input',
      matcher: (c: MatcherContext, q: InputQuery) => {
        return arrayContainsQuery(c.issue.assignees, q);
      },
      autocomplete: (c: AutocompleteContext) => {
        return c.repoDao.repo.pipe(map(repo => {
          const assigneesSet = new Set<string>();
          repo.issues.forEach(
              i => i.assignees.forEach(a => assigneesSet.add(a)));

          const assignees = [];
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
      matcher: (c: MatcherContext, q: InputQuery) => {
        return stringContainsQuery(c.issue.body, q);
      },
    }
  ],

  [
    'labels', {
      displayName: 'Labels',
      queryType: 'input',
      matcher: (c: MatcherContext, q: InputQuery) => {
        return arrayContainsQuery(
            c.issue.labels.map(l => c.repo.labelsMap.get(l).name), q);
      },
      autocomplete: (c: AutocompleteContext) => {
        return c.repoDao.repo.pipe(
            filter(repo => !!repo), map(repo => {
              return repo.labels.map(issue => issue.name);
            }));
      }
    }
  ],

  /** NumberQuery Filters */

  [
    'commentCount', {
      displayName: 'Comment Count',
      queryType: 'number',
      matcher: (c: MatcherContext, q: NumberQuery) => {
        return numberMatchesEquality(c.issue.comments, q);
      }
    }
  ],

  /** DateQuery Filters */

  [
    'created', {
      displayName: 'Date Created',
      queryType: 'date',
      matcher: (c: MatcherContext, q: DateQuery) => {
        return dateMatchesEquality(c.issue.created, q);
      }
    }
  ],

  /** StateQuery */

  [
    'state', {
      displayName: 'State',
      queryType: 'state',
      queryTypeData: {states: ['open', 'closed']},
      matcher: (c: MatcherContext, q: StateQuery) => {
        const values = new Map<string, boolean>([
          ['open', c.issue.state === 'open'],
          ['closed', c.issue.state === 'closed'],
        ]);
        return stateMatchesEquality(values.get(q.state), q);
      },
    }
  ],
]);
