import {Item} from 'app/github/app-types/item';

export function getAssignees(items: Item[]): string[] {
  const assigneesSet = new Set<string>();
  items.forEach(item => item.assignees.forEach(a => assigneesSet.add(a)));

  const assignees: string[] = [];
  assigneesSet.forEach(a => assignees.push(a));
  assignees.sort((a, b) => a.toLowerCase() < b.toLowerCase() ? -1 : 1);
  return assignees;
}
