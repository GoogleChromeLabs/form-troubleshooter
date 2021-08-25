/* Copyright 2021 Google LLC.
SPDX-License-Identifier: Apache-2.0 */

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

export function truncate(
  input: string | null | undefined,
  length: number,
  indicator = '...',
): string | null | undefined {
  if (!input) {
    return input;
  }

  const truncateLength = length - indicator.length;

  if (indicator.length >= length) {
    return indicator;
  }

  if (input.length > length) {
    return input.substring(0, truncateLength).trimEnd() + indicator;
  }

  return input.substring(0, length);
}

export function condenseWhitespace(
  input: string | null | undefined,
  mode: 'leading-trailing' | 'all' = 'leading-trailing',
): string | null | undefined {
  if (!input) {
    return input;
  }

  if (mode === 'leading-trailing') {
    return input.replace(/^\s+/, ' ').replace(/\s+$/, ' ');
  }
  return input.replace(/\s+/g, ' ');
}

export function escapeRegExp(str: string | null | undefined): string | null | undefined {
  return str ? str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') : str;
}
