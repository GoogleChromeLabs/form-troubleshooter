export function pluralize(count: number, single: string, multiple?: string, zero?: string): string {
  if (count === 1) {
    return single;
  }

  const plural = multiple ?? `${single}s`;
  if (count === 0) {
    return zero ?? plural;
  }
  return plural;
}

export function truncate(input: string, length: number, indicator = '...'): string {
  const truncateLength = length - indicator.length;

  if (indicator.length >= length) {
    return indicator;
  }

  if (input.length > length) {
    return input.substring(0, truncateLength).trimEnd() + indicator;
  }

  return input.substring(0, length);
}
