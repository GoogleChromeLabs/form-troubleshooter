/**
 * Groups items in an array by the specified group by function.
 */
export function groupBy<T, S = T, U = T>(
  array: T[],
  groupByFn: (item: T) => S = (item: T) => item as unknown as S,
  valueFn: (item: T) => U = (item: T) => item as unknown as U,
): Map<S, U[]> {
  const map = new Map<S, U[]>();

  array.forEach(item => {
    const key = groupByFn(item);
    const value = valueFn(item);
    let items = map.get(key);
    if (items) {
      items.push(value);
    } else {
      items = [value];
      map.set(key, items);
    }
  });

  return map;
}
