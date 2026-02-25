import type { DataXY } from 'cheminfo-types';
import { xNormed, xySortX, xyUniqueX } from 'ml-spectra-processing';

export interface ParseOptions {
  /**
   * Allows to filter the data entries based on their type.
   */
  recordTypes?: string;
  /**
   * Should the MS spectrum be sorted by x values.
   * @default false
   */
  sortX?: boolean;
  /**
   * Should merge the repeating x values of MS spectrum (summing the y values together).
   * Sets sortX to true if true.
   * @default false
   */
  uniqueX?: boolean;
  /**
   * Should the MS spectrum be normalized (sum of y values = 1).
   * @default false
   */
  normedY?: boolean;
  /**
   * If not undefined, rescale MS spectrum so that max Y value equals maxY (must be bigger than 0).
   */
  maxY?: number;
}

export interface ParsedEntry {
  data: DataXY;
  meta: Record<string, string>;
  kind: string;
}

/**
 * Parses MGF files into a JSON. The spectrum can be delimited by ' ', '\t', ',' or ';'.
 * @param rawData - Input data (MGF).
 * @param options - Parsing options.
 * @returns Parsed data entries.
 */
export function parse(
  rawData: string,
  options: ParseOptions = {},
): ParsedEntry[] {
  const { recordTypes = '', uniqueX = false, normedY = false, maxY } = options;

  const sortX = uniqueX ? true : (options.sortX ?? false);

  const lines = rawData.split(/\r?\n/);
  const results: ParsedEntry[] = [];
  let entry: ParsedEntry = {
    data: { x: [], y: [] },
    meta: {},
    kind: '',
  };
  let ms: { x: number[]; y: number[] } = { x: [], y: [] };
  let skip = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]?.trim();
    if (!line) continue;

    if (line.startsWith('BEGIN')) {
      entry = {
        data: { x: [], y: [] },
        meta: {},
        kind: line.slice(6),
      };
      ms = { x: [], y: [] };
      if (!entry.kind.match(recordTypes)) {
        skip = true;
      } else {
        skip = false;
      }
    } else if (skip) {
      continue;
    } else if (line.includes('=')) {
      const equalPosition = line.indexOf('=');
      const key = line.slice(0, Math.max(0, equalPosition));
      const value = line.slice(Math.max(0, equalPosition + 1));
      entry.meta[key] = value;
    } else if (line.startsWith('END')) {
      let treatedSpectrum: DataXY = { x: [], y: [] };

      if (sortX && uniqueX) {
        treatedSpectrum = xyUniqueX(xySortX(ms), { algorithm: 'sum' });
      } else if (sortX && !uniqueX) {
        treatedSpectrum = xySortX(ms);
      } else if (!sortX && !uniqueX) {
        treatedSpectrum = ms;
      }

      if (normedY && maxY === undefined) {
        entry.data.x = treatedSpectrum.x;
        entry.data.y = xNormed(treatedSpectrum.y);
      } else if (!normedY && maxY !== undefined) {
        entry.data.x = treatedSpectrum.x;
        entry.data.y = xNormed(treatedSpectrum.y, {
          algorithm: 'max',
          value: maxY,
        });
      } else if (!normedY && maxY === undefined) {
        entry.data = treatedSpectrum;
      } else if (normedY && maxY !== undefined) {
        throw new Error('Option maxY must be undefined if normedY is true');
      }

      results.push(entry);
    } else {
      const lineArray = line.split(/[ \t,;]+/);
      if (lineArray.length !== 2) {
        throw new Error(`Could not parse line number ${i + 1}`);
      }
      ms.x.push(Number(lineArray[0]));
      ms.y.push(Number(lineArray[1]));
    }
  }
  return results;
}
