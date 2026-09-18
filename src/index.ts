import type { DataXY } from 'cheminfo-types';
import { xNormed, xySortX, xyUniqueX } from 'ml-spectra-processing';

const BEGIN_REGEXP = /^BEGIN\b\s*(?<kind>.*)$/;
const END_REGEXP = /^END\b/;
const COMMENT_REGEXP = /^[!#;/]/;
const PEAK_SEPARATOR_REGEXP = /[ \t,;]+/;

export interface ParseOptions {
  /**
   * Allows to filter the data entries based on their type. The value is used as
   * a regular expression matched against the record type following `BEGIN`.
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
  /**
   * Parameters of the entry. The global parameters declared before the first
   * `BEGIN` are used as defaults and are overridden by the parameters of the entry.
   */
  meta: Record<string, string>;
  /**
   * Record type of the entry, i.e. what follows `BEGIN`, usually `IONS`.
   */
  kind: string;
}

/**
 * Parses MGF files into a JSON. The spectrum can be delimited by ' ', '\t', ',' or ';'.
 * Comment lines (starting with '#', ';', '!' or '/'), blank lines and the optional
 * third column of a peak line (the fragment charge) are ignored.
 * @param rawData - Input data (MGF).
 * @param options - Parsing options.
 * @returns Parsed data entries.
 */
export function parse(
  rawData: string,
  options: ParseOptions = {},
): ParsedEntry[] {
  const { recordTypes = '', uniqueX = false, normedY = false, maxY } = options;

  if (normedY && maxY !== undefined) {
    throw new Error('Option maxY must be undefined if normedY is true');
  }

  const shouldSortX = uniqueX || (options.sortX ?? false);
  const recordTypesRegExp = new RegExp(recordTypes);

  const lines = rawData.split(/\r?\n/);
  const results: ParsedEntry[] = [];
  const globalMeta: Record<string, string> = {};

  let entry: ParsedEntry | undefined;
  let peaks: DataXY<number[]> = { x: [], y: [] };
  let shouldSkip = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]?.trim();
    if (!line || COMMENT_REGEXP.test(line)) continue;

    const begin = BEGIN_REGEXP.exec(line);
    if (begin) {
      const kind = begin.groups?.kind ?? '';
      shouldSkip = !recordTypesRegExp.test(kind);
      entry = { data: { x: [], y: [] }, meta: { ...globalMeta }, kind };
      peaks = { x: [], y: [] };
      continue;
    }

    if (END_REGEXP.test(line)) {
      if (entry && !shouldSkip) {
        entry.data = treatSpectrum(peaks, {
          shouldSortX,
          uniqueX,
          normedY,
          maxY,
        });
        results.push(entry);
      }
      entry = undefined;
      shouldSkip = false;
      continue;
    }

    if (shouldSkip) continue;

    const equalPosition = line.indexOf('=');
    if (equalPosition !== -1) {
      const key = line.slice(0, equalPosition);
      const value = line.slice(equalPosition + 1);
      if (entry) {
        entry.meta[key] = value;
      } else {
        globalMeta[key] = value;
      }
      continue;
    }

    const fields = line.split(PEAK_SEPARATOR_REGEXP);
    const x = Number(fields[0]);
    const y = Number(fields[1]);
    if (Number.isNaN(x) || Number.isNaN(y)) {
      throw new Error(`Could not parse line number ${i + 1}`);
    }
    if (!entry) {
      throw new Error(
        `Found fragment ion data outside of a BEGIN/END block on line number ${i + 1}`,
      );
    }
    peaks.x.push(x);
    peaks.y.push(y);
  }

  return results;
}

interface TreatSpectrumOptions {
  shouldSortX: boolean;
  uniqueX: boolean;
  normedY: boolean;
  maxY?: number;
}

function treatSpectrum(
  peaks: DataXY<number[]>,
  options: TreatSpectrumOptions,
): DataXY {
  const { shouldSortX, uniqueX, normedY, maxY } = options;

  let spectrum: DataXY = shouldSortX ? xySortX(peaks) : peaks;
  if (uniqueX) {
    spectrum = xyUniqueX(spectrum, { algorithm: 'sum' });
  }

  if (normedY) {
    return { x: spectrum.x, y: xNormed(spectrum.y) };
  }
  if (maxY !== undefined) {
    return {
      x: spectrum.x,
      y: xNormed(spectrum.y, { algorithm: 'max', value: maxY }),
    };
  }
  return spectrum;
}
