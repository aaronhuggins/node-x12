# Node-X12

An ASC X12 parser, generator, query engine, and mapper written for NodeJS. Parsing supports reading from streams to conserve resources in memory-intensive operations.

[![Denoland/X Module](https://shield.deno.dev/x/x12)](https://deno.land/x/x12)
![GitHub last commit](https://img.shields.io/github/last-commit/aaronhuggins/node-x12)
![GitHub contributors](https://img.shields.io/github/contributors/aaronhuggins/node-x12)
![npm collaborators](https://img.shields.io/npm/collaborators/node-x12)<br />
![GitHub top language](https://img.shields.io/github/languages/top/aaronhuggins/node-x12)
![GitHub code size in bytes](https://img.shields.io/github/languages/code-size/aaronhuggins/node-x12)
![npm](https://img.shields.io/npm/dw/node-x12)
![NPM](https://img.shields.io/npm/l/node-x12)<br />
[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=ahuggins-nhs_node-x12&metric=alert_status)](https://sonarcloud.io/dashboard?id=ahuggins-nhs_node-x12)
[![Maintainability Rating](https://sonarcloud.io/api/project_badges/measure?project=ahuggins-nhs_node-x12&metric=sqale_rating)](https://sonarcloud.io/dashboard?id=ahuggins-nhs_node-x12)
[![Security Rating](https://sonarcloud.io/api/project_badges/measure?project=ahuggins-nhs_node-x12&metric=security_rating)](https://sonarcloud.io/dashboard?id=ahuggins-nhs_node-x12)

## Installing

Simply import into your runtime: [Deno](https://deno.land/x/x12), browser, [Node ESM, or Node CommonJS](https://www.npmjs.com/package/node-x12). Browser imports can be handled via your favorite bundler, or using Skypack CDN.

For NPM: `npm i node-x12`

## Features

Contributions by TrueCommerce up to April 2016:

- Near-complete class object model of ASC X12 parts
- Parser
- Query Engine

Enhancements original to this fork:

- Simplified object notation class for EDI (allows for easy JSON support)
- Streaming Parser (allows for parsing of large EDI files with reduced memory overhead)
- Generator
- Transaction set to object mapping
- Object to transaction set mapping, now with support for [Liquid syntax](/docs/TransactionMapping.md#liquid-macro-language)
- Support for fat EDI documents
- Convenience methods for several generating/mapping scenarios
- Intellisense support in VSCode with packaged type declarations

See the [API](/docs/API.md) for more information.

#### Future

This library is in [maintenance mode as of 2021](https://github.com/aaronhuggins/node-x12/issues/24). Development of a next-generation ASC X12 parser is taking place in [js-edi](https://github.com/aaronhuggins/js-edi). This new library will support both ASC X12 and EDIFACT, as well as a more fleshed-out query language, by leveraging Antler4 grammars which closely follow publicly-provided details of their specs.

### Query Language

The query language makes it possible to directly select values from the class object model. See [Query Language](/docs/QueryLanguage.md) for more information.

**Example 1: Select `REF02` Elements**<br />
`REF02`

**Example 2: Select `REF02` Elements With a `PO` Qualifier in `REF01`**<br />
`REF02:REF01["PO"]`

**Example 3: Select Line-Level PO Numbers (850)**<br />
`PO1-REF02:REF01["PO"]`

**Example 4: Select ASN Line Quantities**<br />
`HL+S+O+P+I-LIN-SN102`

**Example 5: Select values from a loop series**<br />
`FOREACH(LX)=>MAN02:MAN01["CP"]`

### Fat EDI Documents

Some vendors will concatenate multiple valid EDI documents into a single request or file. This **DOES NOT CONFORM** to the ASC X12 spec, but it does happen. Implementing support for this scenario was trivial. When parsing an EDI document, it will be handled one of two ways:

1. When strict, the parser will return an `X12FatInterchange` object with property `interchanges`, an array of `X12Interchange` objects
2. When not strict, the parser will merge valid EDI documents into a single interchange

In the latter of the two scenarios, the parser will set the header and trailer to the last available ISA and IEA segments. The element data of the discarded ISA and IEA segments will be lost if the original fat EDI document is not preserved. If all the header and trailer information is important to your organization, we recommend setting the parser to strict so that you get all the data into an object, or else go back to your implementer and request that they fix their EDI.

### Gotchas

Implementers of ASC X12 are not guaranteed to conform completely to spec. There are scenarios that this library WILL NOT be able to handle and WILL NEVER be added. Despite the addition of functionality beyond the base parser from the original libray, the goal of this library is to remain a simple implementation of the spec. Some examples of scenarios this library won't handle:

- Control characters in the content of an element
- Mixed encrypted/non-encrypted documents
- Missing elements in XYZ tag

Such issues should be resolved between a user of this library and the implementer of ASC X12 documents they are working with.

## Documentation

Additional documentation can be found [self-hosted](/docs/TOC.md) within the repository.

## Examples

```js
const { X12Generator, X12Parser, X12TransactionMap } = require('node-x12')

// Parse valid ASC X12 EDI into an object.
const parser = new X12Parser(true)
let interchange = parser.parse('...raw X12 data...')

// Parse a stream of valid ASC X12 EDI
const ediStream = fs.createReadStream('someFile.edi')
const segments = []

ediStream
  .pipe(parser)
  .on('data', data => {
    segments.push(data)
  })
  .on('end', () => {
    interchange = parser.getInterchangeFromSegments(segments)
  })

// Generate valid ASC X12 EDI from an object.
const jsen = {
  options: {
    elementDelimiter: '*',
    segmentTerminator: '\n'
  },
  header: [
    '00',
    '',
    '00',
    '',
    'ZZ',
    '10000000',
    '01',
    '100000000',
    '100000',
    '0425',
    '|',
    '00403',
    '100748195',
    '0',
    'P',
    '>'
  ],
  functionalGroups: [...etc]
}
const generator = new X12Generator(jsen)

// Query X12 like an object model
const engine = new X12QueryEngine()
const results = engine.query(interchange, 'REF02:REF01["IA"]')

results.forEach(result => {
  // Do something with each result.
  // result.interchange
  // result.functionalGroup
  // result.transaction
  // result.segment
  // result.element
  // result.value OR result.values
})

// Map transaction sets to javascript objects
const map = {
  status: 'W0601',
  poNumber: 'W0602',
  poDate: 'W0603',
  shipto_name: 'N102:N101["ST"]',
  shipto_address: 'N1-N301:N101["ST"]',
  shipto_city: 'N1-N401:N101["ST"]',
  shipto_state: 'N1-N402:N101["ST"]',
  shipto_zip: 'N1-N403:N101["ST"]'
}

interchange.functionalGroups.forEach(group => {
  group.transactions.forEach(transaction => {
    console.log(transaction.toObject(map))
  })
})
```

## Credit

Created originally for the [TC Toolbox](https://github.com/TrueCommerce/vscode-tctoolbox) project by TrueCommerce; the public repository for TC Toolbox has been taken offline. The original, parser-only library may be found at [TrueCommerce/node-x12](https://github.com/TrueCommerce/node-x12), which is still public at this time but no longer maintained. Without the good work done by TrueCommerce up until 2016, this library would not exist.

Thanks to [@DotJoshJohnson](https://github.com/DotJoshJohnson).
