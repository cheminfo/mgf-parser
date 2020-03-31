import { readFileSync } from 'fs';
import { join } from 'path';

import MGF from './MGF';

let rawData = readFileSync(join(__dirname, 'UNPD_ISDB_R_p04.mgf'), 'utf8');

MGF.parse(rawData); // this is the goal
