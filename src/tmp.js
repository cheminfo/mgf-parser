import { readFileSync } from 'fs';
import { join } from 'path';

import { parse } from '.';

// UNPD_ISDB_R_p04.mgf
let rawData = readFileSync(
  join(__dirname, '../data/UNPD_ISDB_R_p04.mgf'),
  'utf8',
);

parse(rawData); // this is the goal

// console.log(parsedData.length);
// console.log(parsedData);
// console.dir(parsedData[0].data.meta);
