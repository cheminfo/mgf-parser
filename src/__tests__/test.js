import { readFileSync } from 'fs';
import { join } from 'path';

import max from 'ml-array-max';
import sum from 'ml-array-sum';

import { parse } from '..';

let data = readFileSync(join(__dirname, '../../data/test.mgf'), 'utf8');
let corruptedData = readFileSync(
  join(__dirname, '../../data/lackingEqual.mgf'),
  'utf8',
);
let otherEntryTypeData = readFileSync(
  join(__dirname, '../../data/wrongEntryType.mgf'),
  'utf8',
);

let twoEntryTypesData = readFileSync(
  join(__dirname, '../../data/twoEntryTypes.mgf'),
  'utf8',
);

let basicSpectrumData = readFileSync(
  join(__dirname, '../../data/basicSpectrum.mgf'),
  'utf8',
);

let tabDelimitedData = readFileSync(
  join(__dirname, '../../data/tabDelimitedSpectrum.mgf'),
  'utf8',
);

describe('index', () => {
  it('parse test database', () => {
    let result = parse(data);
    expect(result).toHaveLength(1);
    expect(result).toMatchSnapshot();
    // console.log(result);
  });
  it('parse tab delimited spectrum', () => {
    let result = parse(tabDelimitedData);
    expect(parse(data)).toHaveLength(1);
    expect(result[0].data.x).toHaveLength(214);
    // console.log(result);
  });
  it('metadata corrupted (lacking "=")', () => {
    expect(() => parse(corruptedData)).toThrow(
      'Parsing error at line number 7',
    );
  });
  it('other entry type', () => {
    expect(parse(otherEntryTypeData)[0].kind).toBe('PEPTIDES');
  });
  // testing options
  it('default options (sortX = false and uniqueX = false)', () => {
    let result = parse(basicSpectrumData);
    expect(result).toStrictEqual([
      {
        data: { x: [4, 5, 5, 1, 2, 4], y: [44, 55, 5, 111, 32, 64] },
        kind: 'IONS',
        meta: {},
      },
    ]);
  });
  it('filter entry type IONS', () => {
    let result = parse(twoEntryTypesData, { recordTypes: 'IONS' });
    expect(result).toHaveLength(1);
    expect(result[0].kind).toBe('IONS');
  });
  it('sortX = true and uniqueX = false', () => {
    let result = parse(basicSpectrumData, { sortX: true, uniqueX: false });
    expect(result).toStrictEqual([
      {
        data: { x: [1, 2, 4, 4, 5, 5], y: [111, 32, 44, 64, 55, 5] },
        kind: 'IONS',
        meta: {},
      },
    ]);
  });
  it('sortX = true and uniqueX = true', () => {
    let result = parse(basicSpectrumData, { sortX: true, uniqueX: true });
    expect(result).toStrictEqual([
      {
        data: { x: [1, 2, 4, 5], y: [111, 32, 108, 60] },
        kind: 'IONS',
        meta: {},
      },
    ]);
  });
  it('sortX = false and uniqueX = true', () => {
    let result = parse(basicSpectrumData, { uniqueX: true });
    expect(result).toStrictEqual([
      {
        data: { x: [1, 2, 4, 5], y: [111, 32, 108, 60] },
        kind: 'IONS',
        meta: {},
      },
    ]);
  });
  it('normedY = true', () => {
    let result = parse(basicSpectrumData, { normedY: true });
    expect(sum(result[0].data.y)).toBe(1);
  });
  it('maxY = 100', () => {
    let result = parse(basicSpectrumData, { maxY: 100 });
    expect(max(result[0].data.y)).toBe(100);
  });
  it('should throw error (normedY = true, maxY = 100', () => {
    expect(() =>
      parse(basicSpectrumData, { maxY: 100, normedY: true }),
    ).toThrow('Option maxY must be undefined if normedY is true');
  });
});
