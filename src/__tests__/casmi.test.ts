import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { expect, test } from 'vitest';

import { parse } from '../index.ts';

test('parse casmi mgf file throws on invalid pre-header lines', () => {
  const data = readFileSync(
    join(import.meta.dirname, './data/casmi.mgf'),
    'utf8',
  );

  expect(() => parse(data)).toThrowError('Could not parse line number 2');
});
