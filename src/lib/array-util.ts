/**
 * Groups items in an array by the specified group by function.
 */
export function groupBy<T, S>(array: T[], groupByFn: (item: T) => S = (item: T) => item as unknown as S): Map<S, T[]> {
  const map = new Map<S, T[]>();

  array.forEach(item => {
    const key = groupByFn(item);
    let items = map.get(key);
    if (items) {
      items.push(item);
    } else {
      items = [item];
      map.set(key, items);
    }
  });

  return map;
}
