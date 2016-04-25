# X12
A simple ASC X12 parser for NodeJS. Created originally for the [TC Toolbox](https://github.com/TrueCommerce/vscode-tctoolbox) project.

## Usage
```typescript
'use strict';

import { X12Parser, X12QueryEngine } from 'x12/core';

// parse (deserialize) X12 EDI
let parser = new X12Parser(true);
let interchange = parser.parseX12('...raw X12 data...');

// OR use the query engine to query a document
// Syntax Documentation: https://github.com/TrueCommerce/node-x12/wiki/x12queryengine-api#element-reference-syntax
let engine = new X12QueryEngine(parser);
let results = engine.query('REF02:REF01["IA"]');

results.forEach((result) => {
    // do something with each result
    
    // result.interchange
    // result.functionalGroup
    // result.transaction
    // result.segment
    // result.element(.value)
});
```