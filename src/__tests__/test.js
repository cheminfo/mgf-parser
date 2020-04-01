import { readFileSync } from 'fs';
import { join } from 'path';

import { parse } from '..';

let data = readFileSync(join(__dirname, '../../data/test.mgf'), 'utf8');
let corruptedData = readFileSync(
  join(__dirname, '../../data/corrupted.mgf'),
  'utf8',
);
let otherEntryTypeData = readFileSync(
  join(__dirname, '../../data/wrongEntryType.mgf'),
  'utf8',
);

describe('index', () => {
  it('parse test database', () => {
    let result = parse(data);
    expect(parse(data)).toHaveLength(1);
    expect(result).toMatchSnapshot();
    // console.log(result);
  });
  it('metadata corrupted (lacking "=")', () => {
    expect(() => parse(corruptedData)).toThrow(
      'Error: Data line number 7 could not be processed',
    );
  });
  it('wrong entry type', () => {
    expect(parse(otherEntryTypeData)[0].kind).toBe('PEPTIDES');
  });
});
