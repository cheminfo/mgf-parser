import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { MF } from 'mf-parser';
import { Molecule } from 'openchemlib';

import { parse, ParsedEntry } from '../src/index.ts';

const data = readFileSync(
  join(import.meta.dirname, '../src/__tests__/data/UNPD_ISDB_R_p04.mgf'),
  'utf8',
);

const parsedData = parse(data);

interface MassDifference {
  entry: number;
  data: string;
  check: number;
  diff: number;
}

interface VerifyOptions {
  massError?: number;
}

// eslint-disable-next-line no-console
console.log(verifyData(parsedData));

function verifyData(entries: ParsedEntry[], options: VerifyOptions = {}) {
  const { massError = 1e-4 } = options;
  const differences: {
    allTheSame: boolean;
    mass: MassDifference[];
  } = {
    allTheSame: true,
    mass: [],
  };

  for (let i = 0; i < entries.length; i++) {
    const dataSmiles = entries[i].meta.SMILES;
    const dataMass = entries[i].meta.EXACTMASS;

    const molecule = Molecule.fromSmiles(dataSmiles);
    const mf = molecule.getMolecularFormula().formula;

    const mfInfo = new MF(mf).getInfo();
    const mass = mfInfo.monoisotopicMass;

    const massDiff = Math.abs(Number(dataMass) - mass);
    if (massDiff > massError) {
      const massEntry: MassDifference = {
        entry: i,
        data: dataMass,
        check: mass,
        diff: massDiff,
      };
      // eslint-disable-next-line no-console
      console.log(massEntry);

      differences.mass.push(massEntry);
    }
  }

  if (differences.mass.length !== 0) {
    differences.allTheSame = false;
  }

  return differences;
}
