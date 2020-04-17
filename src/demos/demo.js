/* eslint-disable no-console */
// Command to run this file: `node -r esm demo.js | more`

import { readFileSync } from 'fs';
import { join } from 'path';

import { parse } from '..';

let data = readFileSync(
  join(__dirname, '../../data/UNPD_ISDB_R_p04.mgf'),
  'utf8',
);

const parsedData = parse(data, {
  uniqueX: true,
  normedY: true,
});

console.log('Number of entries:', parsedData.length);

console.log(JSON.stringify(parsedData, undefined, 2));
