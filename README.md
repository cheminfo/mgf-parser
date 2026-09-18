# mgf-parser

[![NPM version][npm-image]][npm-url]
[![build status][ci-image]][ci-url]
[![npm download][download-image]][download-url]

Parse an MGF file into a JSON.

## Installation

`$ npm i mgf-parser`

## Usage

```js
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { parse } from 'mgf-parser';

const rawData = readFileSync(join(import.meta.dirname, './data.mgf'), 'utf8');

const result = parse(rawData, { uniqueX: true, maxY: 100 });

// result[0].kind -> 'IONS'
// result[0].meta -> { TITLE: 'Spectrum 1', PEPMASS: '983.6', ... }
// result[0].data -> { x: [846.6, 846.8, ...], y: [25.08, 15.12, ...] }
```

### `parse(rawData[, options])`

Parses the text input `rawData` and returns one entry per `BEGIN` / `END` block:

| Property | Type                     | Description                                                 |
| -------- | ------------------------ | ----------------------------------------------------------- |
| `kind`   | `string`                 | Record type, i.e. what follows `BEGIN` — usually `IONS`.    |
| `meta`   | `Record<string, string>` | Parameters of the entry, on top of the global parameters.   |
| `data`   | `DataXY`                 | The mass spectrum, as `x` (m/z) and `y` (intensity) arrays. |

Options:

| Option        | Type      | Default     | Description                                                                                 |
| ------------- | --------- | ----------- | ------------------------------------------------------------------------------------------- |
| `recordTypes` | `string`  | `''`        | Regular expression the record type must match. By default all entries are returned.         |
| `sortX`       | `boolean` | `false`     | Sort the spectrum by increasing m/z.                                                        |
| `uniqueX`     | `boolean` | `false`     | Merge repeating m/z values, summing their intensities. Implies `sortX`.                     |
| `normedY`     | `boolean` | `false`     | Normalize the spectrum so that the sum of the intensities is 1.                             |
| `maxY`        | `number`  | `undefined` | Rescale the spectrum so that the largest intensity equals `maxY`. Conflicts with `normedY`. |

### Supported syntax

The parser follows the [Mascot generic format](https://www.matrixscience.com/help/data_file_help.html):

- Parameters declared before the first `BEGIN` are global: they are copied into
  the `meta` of every entry, where a parameter of the entry overrides them.
- Lines starting with `#`, `;`, `!` or `/` are comments, and blank lines are ignored.
- A peak line holds an m/z and an intensity, optionally followed by the fragment
  charge, which is ignored. Values may be separated by ` `, `\t`, `,` or `;`.

An unparsable line, or fragment ions found outside of a `BEGIN` / `END` block,
throws an error mentioning the line number.

## [API Documentation](https://cheminfo.github.io/mgf-parser/)

## License

[MIT](./LICENSE)

[npm-image]: https://img.shields.io/npm/v/mgf-parser.svg
[npm-url]: https://www.npmjs.com/package/mgf-parser
[ci-image]: https://github.com/cheminfo/mgf-parser/workflows/Node.js%20CI/badge.svg?branch=main
[ci-url]: https://github.com/cheminfo/mgf-parser/actions?query=workflow%3A%22Node.js+CI%22
[download-image]: https://img.shields.io/npm/dm/mgf-parser.svg
[download-url]: https://www.npmjs.com/package/mgf-parser
