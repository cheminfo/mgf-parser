import sortX from 'ml-array-xy-sort-x';
import uniqueX from 'ml-arrayxy-uniquex';

/**
 * parses MGF files into a JSON
 * @param {string} rawData input data (MGF)
 * @param {object} options recordTypes allows to filter the data entries based on their type
 * @returns {array<object>} parsed data
 */
export function parse(rawData, options = {}) {
  const { recordTypes = '' } = options;
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
      let lineArray = line.split('=');
      entry.meta[lineArray[0]] = lineArray[1];
    } else if (line.substring(0, 3) === 'END') {
      // detect end of an entry and push it to results
      entry.data = sortX(ms);
      uniqueX(entry.data);
      results.push(entry);
    } else {
      // handling the case where line is a mass spectrum entry
      let lineArray = line.split(' ');
      if (lineArray.length !== 2) {
        throw new Error(`Error: Data line number ${i} could not be processed`);
      }
      // creating mass spectrum (1 array of mz and 1 array of intensities)
      ms.x.push(Number(lineArray[0]));
      ms.y.push(Number(lineArray[1]));
    }
  }
  return results;
}
