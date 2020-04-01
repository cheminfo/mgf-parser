import { readFileSync } from 'fs';
import { join } from 'path';

import { MF } from 'mf-parser';
import { Molecule } from 'openchemlib';

import { parse } from '../src';

let data = readFileSync(join(__dirname, '../data/UNPD_ISDB_R_p04.mgf'), 'utf8');

const parsedData = parse(data);

console.log(verifyData(parsedData));

function verifyData(parsedData, options = {}) {
  const { massError = 1e-4 } = options;
  let differences = {
    allTheSame: true,
    mass: [],
  };

  let dataSmiles;
  let dataMass;
  let mass;

  for (let i = 0; i < parsedData.length; i++) {
    dataSmiles = parsedData[i].meta.SMILES;
    dataMass = parsedData[i].meta.EXACTMASS;

    const molecule = Molecule.fromSmiles(dataSmiles);
    let mf = molecule.getMolecularFormula().formula;

    const mfInfo = new MF(mf).getInfo();
    mass = mfInfo.monoisotopicMass;

    // checking if monoisotopic masses are the same
    let massDiff = Math.abs(dataMass - mass);
    if (massDiff > massError) {
      let entry = {
        entry: i,
        data: dataMass,
        check: mass,
        diff: massDiff,
      };
      console.log(entry);

      differences.mf.push(entry);
    }
  }

  if (differences.mass.length !== 0) {
    differences.allTheSame = false;
  }

  return differences;
}
