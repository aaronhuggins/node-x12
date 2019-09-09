# Node-X12
A simple ASC X12 parser, generator, query engine, and mapper for NodeJS. Created originally for the [TC Toolbox](https://github.com/TrueCommerce/vscode-tctoolbox) project by TrueCommerce; the public repository for TC Toolbox has been taken offline. The original, parser-only library may be found at [node-x12](https://github.com/TrueCommerce/node-x12), which is still public at this time but no longer maintained.

## Features
- Near-complete class object model of ASC X12 parts *
- Simplified object notation class for EDI (which allows JSON support)
- Parser *
- Generator
- Query Engine *
- Transaction set to object mapping
- Convenience methods for several generating/mapping scenarios

Features marked with an asterisk were initially developed by TrueCommerce and released under an MIT license. Without the good work done by TrueCommerce up until 2016, this library would not exist.

### Query Language
The query language makes it possible to directly select values from the class object model. This also drives the transaction mapping functionality; in fact, the `FOREACH()` macro was added specifically to support this feature.

|Section|Example|Description|
|:-----:|:-----:|-----------|
|**Macros**|`FOREACH("LX")=>`|Defines a multi-value operation on a query.|
|**HL Path**|`HL+O+P+I`|Defines a path through a series of HL segments.|
|**Parent Segment Path**|`PO1-REF`|Defines a path through a series of adjacent segments.|
|**Element Reference**|`REF02`|Defines an element by position.|
|**Value**|`"DP"`|Defines a value to be checked when evaluating qualifiers.|

**Example 1: Select `REF02` Elements**<br />
`REF02`

**Example 2: Select `REF02` Elements With a `PO` Qualifier in `REF01`**<br />
`REF02:REF01["PO"]`

**Example 3: Select Line-Level PO Numbers (850)**<br />
`PO1-REF02:REF01["PO"]`

**Example 4: Select ASN Line Quantities**<br />
`HL+S+O+P+I-LIN-SN102`

**Example 5: Select values from a loop series**<br />
`FOREACH("LX")=>MAN02:MAN01["CP"]`

### Gotchas
Implementers of ASC X12 are not guaranteed to conform completely to spec. There are scenarios that this library WILL NOT be able to handle and WILL NEVER be added. Despite the addition of functionality beyond the base parser from the original libray, the goal of this library is to remain a simple implementation of the spec. Some examples of scenarios this library won't handle:
- Control characters in the content of an element
- Mixed encrypted/non-encrypted documents
- Missing elements in XYZ tag

Such issues should be resolved between a user of this library and the implementer of ASC X12 documents they are working with.

A scenario we are looking to fix in the immediate future: fat EDI documents. These are documents we define as having multiple, complete, valid documents in a single file. This library will eventually split such a file into an array of X12Interchange objects. Currently, a user of this library will need to handle that logic on their own or work with their implementer.

## Documentation
Additional documentation can be found in the wiki. Currently, it is out-of-date. Future documentation is slated to be self-hosted within the repository, and generated from JSDoc. Please keep an eye out for a documentation over-haul in the near future.

## Usage
```js
const { 
    X12Generator,
    X12Parser,
    X12TransactionMap
} = require('node-x12')

// Parse valid ASC X12 EDI into an object.
const parser = new X12Parser(true);
const interchange = parser.parse('...raw X12 data...');

// Generate valid ASC X12 EDI from an object.
const jsen = {
    options: {
        elementDelimiter: '*',
        segmentTerminator: '\n',
    },
    header: ['00', '', '00', '', 'ZZ', '10000000', '01', '100000000', '100000', '0425', '|', '00403', '100748195', '0', 'P', '>'],
    functionalGroups: [...etc]
}
const generator = new X12Generator(jsen)

// Query X12 like an object model
const engine = new X12QueryEngine();
const results = engine.query(interchange, 'REF02:REF01["IA"]');

results.forEach((result) => {
    // Do something with each result.

    // result.interchange
    // result.functionalGroup
    // result.transaction
    // result.segment
    // result.element
    // result.value OR result.values
});

// Map transaction sets to javascript objects
const map = {
    status: 'W0601',
    poNumber: 'W0602',
    poDate: 'W0603',
    shipto_name: 'N102:N101[\"ST\"]',
    shipto_address: 'N1-N301:N101[\"ST\"]',
    shipto_city: 'N1-N401:N101[\"ST\"]',
    shipto_state: 'N1-N402:N101[\"ST\"]',
    shipto_zip: 'N1-N403:N101[\"ST\"]'
}

interchange.functionalGroups.forEach((group) => {
    group.transactions.forEach((transaction) => {        
        console.log(transaction.toObject(map))
    })
})

```
