import {tokenizeItem} from './tokenize-item';
import { Item } from '../services/dao';

export function itemMatchesSearch(token: string, issue: Item) {
  const str = tokenizeItem(issue);
  return str.indexOf(token.toLowerCase()) != -1;
}
