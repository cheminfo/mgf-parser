import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { xMaxValue, xSum } from 'ml-spectra-processing';
import { expect, test } from 'vitest';

import { parse } from '../index.js';

const data = readFileSync(join(import.meta.dirname, './data/test.mgf'), 'utf8');
const corruptedData = readFileSync(
  join(import.meta.dirname, './data/lackingEqual.mgf'),
  'utf8',
);
const otherEntryTypeData = readFileSync(
  join(import.meta.dirname, './data/wrongEntryType.mgf'),
  'utf8',
);

const twoEntryTypesData = readFileSync(
  join(import.meta.dirname, './data/twoEntryTypes.mgf'),
  'utf8',
);

const basicSpectrumData = readFileSync(
  join(import.meta.dirname, './data/basicSpectrum.mgf'),
  'utf8',
);

const tabDelimitedData = readFileSync(
  join(import.meta.dirname, './data/tabDelimitedSpectrum.mgf'),
  'utf8',
);

const emptyLinesData = readFileSync(
  join(import.meta.dirname, './data/emptyLines.mgf'),
  'utf8',
);

test('parse test database', () => {
  const result = parse(data);

  expect(result).toHaveLength(1);

  const first = result[0];

  expect(first).toBeDefined();
  expect(first?.kind).toBe('IONS');
  expect(first?.meta.PEPMASS).toBe('349.20095');
  expect(first?.data.x).toHaveLength(93);
});

test('parse tab delimited spectrum', () => {
  const result = parse(tabDelimitedData);

  expect(parse(data)).toHaveLength(1);
  expect(result[0]?.data.x).toHaveLength(214);
});

test('metadata corrupted (lacking "=")', () => {
  expect(() => parse(corruptedData)).toThrowError(
    'Could not parse line number 8',
  );
});

test('other entry type', () => {
  expect(parse(otherEntryTypeData)[0]?.kind).toBe('PEPTIDES');
});

test('default options (sortX = false and uniqueX = false)', () => {
  const result = parse(basicSpectrumData);

  expect(result).toStrictEqual([
    {
      data: { x: [4, 5, 5, 1, 2, 4], y: [44, 55, 5, 111, 32, 64] },
      kind: 'IONS',
      meta: {},
    },
  ]);
});

test('filter entry type IONS', () => {
  const result = parse(twoEntryTypesData, { recordTypes: 'IONS' });

  expect(result).toHaveLength(1);
  expect(result[0]?.kind).toBe('IONS');
});

test('sortX = true and uniqueX = false', () => {
  const result = parse(basicSpectrumData, { sortX: true, uniqueX: false });

  expect(result).toStrictEqual([
    {
      data: {
        x: Float64Array.from([1, 2, 4, 4, 5, 5]),
        y: Float64Array.from([111, 32, 44, 64, 55, 5]),
      },
      kind: 'IONS',
      meta: {},
    },
  ]);
});

test('sortX = true and uniqueX = true', () => {
  const result = parse(basicSpectrumData, { sortX: true, uniqueX: true });

  expect(result).toStrictEqual([
    {
      data: { x: [1, 2, 4, 5], y: [111, 32, 108, 60] },
      kind: 'IONS',
      meta: {},
    },
  ]);
});

test('sortX = false and uniqueX = true', () => {
  const result = parse(basicSpectrumData, { uniqueX: true });

  expect(result).toStrictEqual([
    {
      data: { x: [1, 2, 4, 5], y: [111, 32, 108, 60] },
      kind: 'IONS',
      meta: {},
    },
  ]);
});

test('normedY = true', () => {
  const result = parse(basicSpectrumData, { normedY: true });
  const firstY = result[0]?.data.y;

  expect(firstY).toBeDefined();
  expect(xSum(firstY as number[])).toBe(1);
});

test('maxY = 100', () => {
  const result = parse(basicSpectrumData, { maxY: 100 });
  const firstY = result[0]?.data.y;

  expect(firstY).toBeDefined();
  expect(xMaxValue(firstY as number[])).toBe(100);
});

test('should throw error (normedY = true, maxY = 100)', () => {
  expect(() =>
    parse(basicSpectrumData, { maxY: 100, normedY: true }),
  ).toThrowError('Option maxY must be undefined if normedY is true');
});

test('tests empty lines and corrupted', () => {
  expect(() => parse(emptyLinesData)).toThrowError(
    'Could not parse line number 21',
  );
});
