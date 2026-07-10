# mgf-parser

[![NPM version][npm-image]][npm-url]
[![build status][ci-image]][ci-url]
[![npm download][download-image]][download-url]

Parse an MGF file into a JSON.

## Installation

`$ npm i mgf-parser`

## Usage

```js
parse(rawData[, options])
```

Parses the text input `rawdata` into a JSON.

```js
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { parse } from 'mgf-parser';

const rawData = readFileSync(join(import.meta.dirname, './data.mgf'), 'utf8');

const result = parse(rawData);

// result is the parsed data (array of objects)
```

## [API Documentation](https://cheminfo.github.io/mgf-parser/)

## License

[MIT](./LICENSE)

[npm-image]: https://img.shields.io/npm/v/mgf-parser.svg
[npm-url]: https://www.npmjs.com/package/mgf-parser
[ci-image]: https://github.com/cheminfo/mgf-parser/workflows/Node.js%20CI/badge.svg?branch=main
[ci-url]: https://github.com/cheminfo/mgf-parser/actions?query=workflow%3A%22Node.js+CI%22
[download-image]: https://img.shields.io/npm/dm/mgf-parser.svg
[download-url]: https://www.npmjs.com/package/mgf-parser
