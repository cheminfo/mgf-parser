// Command to run this file: `node --experimental-strip-types demo.ts | more`

import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { parse } from '../src/index.ts';

const data = readFileSync(
  join(import.meta.dirname, '../src/__tests__/data/UNPD_ISDB_R_p04.mgf'),
  'utf8',
);

const parsedData = parse(data, {
  uniqueX: true,
  normedY: true,
});

// eslint-disable-next-line no-console
console.log('Number of entries:', parsedData.length);

// eslint-disable-next-line no-console
console.log(JSON.stringify(parsedData, undefined, 2));
