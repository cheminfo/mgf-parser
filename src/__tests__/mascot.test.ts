import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { expect, test } from 'vitest';

import { parse } from '../index.ts';

const mascotData = readFileSync(
  join(import.meta.dirname, './data/mascotExample.mgf'),
  'utf8',
);

const orphanPeakData = readFileSync(
  join(import.meta.dirname, './data/orphanPeak.mgf'),
  'utf8',
);

test('skips comment lines and blank lines', () => {
  const result = parse(mascotData);

  expect(result).toHaveLength(2);
  expect(result[0]?.kind).toBe('IONS');
  expect(result[0]?.data.x).toStrictEqual([
    846.6, 846.8, 847.6, 1640.1, 1640.6, 1895.5,
  ]);
  expect(result[0]?.data.y).toStrictEqual([73, 44, 67, 291, 54, 49]);
});

test('global parameters are defaults overridden by the entry parameters', () => {
  const result = parse(mascotData);

  expect(result[0]?.meta).toStrictEqual({
    COM: 'Mascot generic format example',
    MASS: 'Monoisotopic',
    CHARGE: '2+',
    TITLE: 'Spectrum 1',
    PEPMASS: '983.6',
  });
  expect(result[1]?.meta).toStrictEqual({
    COM: 'Mascot generic format example',
    MASS: 'Monoisotopic',
    CHARGE: '2+ and 3+',
    TITLE: 'Spectrum 2',
    PEPMASS: '1084.9 1234',
    SCANS: '3',
    RTINSECONDS: '25',
  });
});

test('ignores the optional charge column of a peak line', () => {
  const result = parse(mascotData);

  expect(result[1]?.data.x).toStrictEqual([
    345.1, 370.2, 460.2, 1673.3, 1674, 1675.3,
  ]);
  expect(result[1]?.data.y).toStrictEqual([237, 128, 108, 1007, 974, 79]);
});

test('throws on fragment ions found outside of a BEGIN/END block', () => {
  expect(() => parse(orphanPeakData)).toThrow(
    'Found fragment ion data outside of a BEGIN/END block on line number 2',
  );
});
