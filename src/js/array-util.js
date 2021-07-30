/**
 * Groups items in an array by the specified group by function.
 * @template T, S
 * @param {T[]} array
 * @param {(item: T) => S} groupByFn
 * @returns {Map<S, T[]>}
 */
export function groupBy(array, groupByFn = (item) => item) {
  const map = new Map();

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
