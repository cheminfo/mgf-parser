import normalizeY from 'ml-array-normed';
import sortArrayXY from 'ml-array-xy-sort-x';
import uniqueArrayXY from 'ml-arrayxy-uniquex';

/**
 * parses MGF files into a JSON. The spectrum can be delimited by ' ', '\t', ',' or ';'.
 * @param {string} rawData input data (MGF)
 * @param {object} options
 * @param {string} [options.recordTypes = ''] allows to filter the data entries based on their type
 * @param {boolean} [options.sortX = false] should the MS spectrum be sorted by x values
 * @param {boolean} [options.uniqueX = false] should merge the repeating x values of MS spectrum (summing the y values together). Sets sortX to true if true.
 * @param {boolean} [options.normedY = false] should the MS spectrum be normalized (sum of y values = 1)
 * @param {number} [options.maxY = undefined] if not undefined, rescale MS spectrum so that max Y value equals maxY (must be bigger than 0)
 * @returns {array<object>} parsed data
 */
export function parse(rawData, options = {}) {
  const {
    recordTypes = '',
    uniqueX = false,
    normedY = false,
    maxY = undefined,
  } = options;

  let sortX = uniqueX
    ? true
    : options.sortX === undefined
    ? false
    : options.sortX;

  let lines = rawData.split(/[\r\n]+/);
  let results = [];
  let entry;
  let ms;
  let skip = false;

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];

    // verify if line is the beginning of an entry
    if (line.startsWith('BEGIN')) {
      // console.log({ linePointer });
      entry = {
        data: {},
        meta: {},
      };
      ms = { x: [], y: [] };
      entry.kind = line.substring(6);
      if (!entry.kind.match(recordTypes)) {
        skip = true;
      } else {
        skip = false;
      }
    } else if (skip) {
      continue;
    } else if (line.includes('=')) {
      // verify if line is part of the metadata
      let equalPos = line.indexOf('=');
      let key = line.substring(0, equalPos);
      let value = line.substring(equalPos + 1);

      entry.meta[key] = value;
    } else if (line.substring(0, 3) === 'END') {
      // detect end of an entry and push it to results
      let treatedSpectrum = { x: [], y: [] };

      if (sortX && uniqueX) {
        treatedSpectrum = sortArrayXY(ms);
        uniqueArrayXY(treatedSpectrum);
      } else if (sortX && !uniqueX) {
        treatedSpectrum = sortArrayXY(ms);
      } else if (!sortX && !uniqueX) {
        treatedSpectrum = ms;
      }

      if (normedY && maxY === undefined) {
        entry.data.x = treatedSpectrum.x;
        entry.data.y = normalizeY(treatedSpectrum.y);
      } else if (!normedY && maxY !== undefined) {
        entry.data.x = treatedSpectrum.x;
        entry.data.y = normalizeY(treatedSpectrum.y, {
          algorithm: 'max',
          maxValue: maxY,
        });
      } else if (!normedY && maxY === undefined) {
        entry.data = treatedSpectrum;
      } else if (normedY && maxY !== undefined) {
        throw new Error('Option maxY must be undefined if normedY is true');
      }

      results.push(entry);
    } else {
      // handling the case where line is a mass spectrum entry
      let lineArray = line.split(/[ \t,;]+/); // considering multiple delimiter types
      if (lineArray.length !== 2) {
        throw new Error(`Parsing error at line number ${i}`);
      }
      // creating mass spectrum (1 array of mz and 1 array of intensities)
      ms.x.push(Number(lineArray[0]));
      ms.y.push(Number(lineArray[1]));
    }
  }
  return results;
}
