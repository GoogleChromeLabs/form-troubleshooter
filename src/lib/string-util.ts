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
