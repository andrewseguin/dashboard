import {Item} from 'app/service/github';
import {tokenizeItem} from './tokenize-item';

export function itemMatchesSearch(token: string, issue: Item) {
  const str = tokenizeItem(issue);
  return str.indexOf(token.toLowerCase()) != -1;
}
