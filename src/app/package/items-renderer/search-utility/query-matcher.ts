import {DateQuery, InputQuery, NumberQuery, StateQuery} from './query';

export function stringContainsQuery(str: string, query: InputQuery) {
  if (!str) {
    return false;
  }

  let input = query.input;
  if (!input) {
    return true;
  }

  if (input === '""') {
    input = '';
  }

  switch (query.equality) {
    case 'contains':
      return str.toLowerCase().indexOf(input.toLowerCase()) !== -1;
    case 'is':
      return str.toLowerCase() === input.toLowerCase();
    case 'notContains':
      return str.toLowerCase().indexOf(input.toLowerCase()) === -1;
    case 'notIs':
      return str.toLowerCase() !== input.toLowerCase();
    default:
      throw Error(`Unknown equality: ${query.equality}`);
  }
}

export function numberMatchesEquality(num: number, query: NumberQuery) {
  if (!query.value && query.value !== 0) {
    return true;
  }

  switch (query.equality) {
    case 'greaterThan':
      return num > query.value;
    case 'lessThan':
      return num < query.value;
    case 'equalTo':
      // Double-equals to cast in cases where the number was stored as a string
      return num == query.value;
    default:
      throw Error(`Unknown equality: ${query.equality}`);
  }
}

export function dateMatchesEquality(dateStr: string, query: DateQuery) {
  if (!query.date) {
    return true;
  }

  if (!dateStr) {
    return false;
  }

  const date = new Date(dateStr);
  const queryDate = new Date(query.date);

  switch (query.equality) {
    case 'after':
      return date > queryDate;
    case 'before':
      return date < queryDate;
    case 'on':
      return date.toISOString() === queryDate.toISOString();
    default:
      throw Error(`Unknown equality: ${query.equality}`);
  }
}


export function stateMatchesEquality(state: boolean, query: StateQuery) {
  if (!query.state) {
    return true;
  }

  switch (query.equality) {
    case 'is':
      return state;
    case 'notIs':
      return !state;
    default:
      throw Error(`Unknown equality: ${query.equality}`);
  }
}

export function arrayContainsQuery(arr: string[], query: InputQuery) {
  const str = arr.map(v => `"${v}"`).sort().toString() || '[]';
  const input = query.input ? query.input.split(',').map(v => `"${v}"`).sort().toString() : '[]';

  return stringContainsQuery(str, {input, equality: query.equality});
}
