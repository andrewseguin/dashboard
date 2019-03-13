import { Item } from "app/repository/services/dao";

export function getAssignees(items: Item[]): string[] {
  const assigneesSet = new Set<string>();
  items!.forEach(item => item.assignees.forEach(a => assigneesSet.add(a)));

  const assignees: string[] = [];
  assigneesSet.forEach(a => assignees.push(a));
  assignees.sort((a, b) => a.toLowerCase() < b.toLowerCase() ? -1 : 1);
  return assignees;
}
