# TOC
   - [X12Core](#x12core)
   - [X12Formatting](#x12formatting)
   - [X12Generator](#x12generator)
   - [X12Mapping](#x12mapping)
   - [X12ObjectModel](#x12objectmodel)
   - [X12Parser](#x12parser)
   - [X12QueryEngine](#x12queryengine)
<a name=""></a>
 
<a name="x12core"></a>
# X12Core
should export members.

```js
if (!Object.keys(core).includes('X12Parser')) {
    throw new Error('X12 core is missing X12Parser.');
}
```

should create ArgumentNullError.

```js
const error = new Errors_1.ArgumentNullError('test');
if (error.message !== 'The argument, \'test\', cannot be null.') {
    throw new Error('ArgumentNullError did not return the correct message.');
}
```

should create GeneratorError.

```js
const error = new Errors_1.GeneratorError('test');
if (error.message !== 'test') {
    throw new Error('GeneratorError did not return the correct message.');
}
```

should create ParserError.

```js
const error = new Errors_1.ParserError('test');
if (error.message !== 'test') {
    throw new Error('ParserError did not return the correct message.');
}
```

should create QuerySyntaxError.

```js
const error = new Errors_1.QuerySyntaxError('test');
if (error.message !== 'test') {
    throw new Error('QuerySyntaxError did not return the correct message.');
}
```

<a name="x12formatting"></a>
# X12Formatting
should replicate the source data unless changes are made.

```js
const edi = fs.readFileSync('test/test-data/850.edi', 'utf8');
const parser = new core_1.X12Parser(true);
const interchange = parser.parse(edi);
const options = {
    format: true,
    endOfLine: '\n'
};
const edi2 = interchange.toString(options);
if (edi !== edi2) {
    throw new Error(`Formatted EDI does not match source. Found ${edi2}, expected ${edi}.`);
}
```

should replicate the source data for a fat interchange unless changes are made.

```js
const edi = fs.readFileSync('test/test-data/850_fat.edi', 'utf8');
const parser = new core_1.X12Parser(true);
const interchange = parser.parse(edi);
const options = {
    format: true,
    endOfLine: '\n'
};
const edi2 = interchange.toString(options);
if (edi !== edi2) {
    throw new Error(`Formatted EDI does not match source. Found ${edi2}, expected ${edi}.`);
}
```

<a name="x12generator"></a>
# X12Generator
should replicate the source data unless changes are made.

```js
const edi = fs.readFileSync('test/test-data/850.edi', 'utf8');
const parser = new core_1.X12Parser(true);
const notation = parser.parse(edi).toJSEDINotation();
const options = {
    format: true,
    endOfLine: '\n'
};
const generator = new core_1.X12Generator(notation, options);
const edi2 = generator.toString();
if (edi !== edi2) {
    throw new Error(`Formatted EDI does not match source. Found ${edi2}, expected ${edi}.`);
}
```

should replicate the source data to and from JSON unless changes are made.

```js
const edi = fs.readFileSync('test/test-data/850.edi', 'utf8');
const parser = new core_1.X12Parser(true);
const interchange = parser.parse(edi);
const options = {
    format: true,
    endOfLine: '\n'
};
const json = JSON.stringify(interchange);
const generator = new core_1.X12Generator(JSON.parse(json), options);
const edi2 = generator.toString();
if (edi !== edi2) {
    throw new Error(`Formatted EDI does not match source. Found ${edi2}, expected ${edi}.`);
}
```

<a name="x12mapping"></a>
# X12Mapping
should map transaction.

```js
const parser = new core_1.X12Parser();
const interchange = parser.parse(edi);
const transaction = interchange.functionalGroups[0].transactions[0];
const mapper = new core_1.X12TransactionMap(JSON.parse(mapJson), transaction);
const result = JSON.stringify(mapper.toObject());
if (result !== resultJson) {
    throw new Error(`Formatted JSON does not match source. Found ${result}, expected ${resultJson}.`);
}
```

<a name="x12objectmodel"></a>
# X12ObjectModel
should create X12Interchange with string delimiters.

```js
const interchange = new core_1.X12Interchange('~', '*');
if (interchange.elementDelimiter !== '*') {
    throw new Error('Instance of X12Interchange not successfully created.');
}
```

should cast functional group to JSON.

```js
const parser = new core_1.X12Parser();
const interchange = parser.parse(edi);
const functionalGroup = interchange.functionalGroups[0];
if (typeof functionalGroup.toJSON() !== 'object') {
    throw new Error('Instance of X12FunctionalGroup not cast to JSON.');
}
```

should cast transaction set to JSON.

```js
const parser = new core_1.X12Parser();
const interchange = parser.parse(edi);
const functionalGroup = interchange.functionalGroups[0];
const transaction = functionalGroup.transactions[0];
if (typeof transaction.toJSON() !== 'object') {
    throw new Error('Instance of X12FunctionalGroup not cast to JSON.');
}
```

should cast segment to JSON.

```js
const parser = new core_1.X12Parser();
const interchange = parser.parse(edi);
const functionalGroup = interchange.functionalGroups[0];
const transaction = functionalGroup.transactions[0];
const segment = transaction.segments[0];
if (typeof segment.toJSON() !== 'object') {
    throw new Error('Instance of X12FunctionalGroup not cast to JSON.');
}
```

<a name="x12parser"></a>
# X12Parser
should parse a valid X12 document without throwing an error.

```js
const edi = fs.readFileSync('test/test-data/850.edi', 'utf8');
const parser = new core_1.X12Parser();
parser.parse(edi);
```

should parse a fat X12 document without throwing an error.

```js
const edi = fs.readFileSync('test/test-data/850_fat.edi', 'utf8');
const parser = new core_1.X12Parser(true);
parser.parse(edi);
```

should produce accurate line numbers for files with line breaks.

```js
const edi = fs.readFileSync('test/test-data/850_3.edi', 'utf8');
const parser = new core_1.X12Parser();
const interchange = parser.parse(edi);
const segments = [].concat([interchange.header, interchange.functionalGroups[0].header, interchange.functionalGroups[0].transactions[0].header], interchange.functionalGroups[0].transactions[0].segments, [interchange.functionalGroups[0].transactions[0].trailer, interchange.functionalGroups[0].trailer, interchange.trailer]);
for (let i = 0; i < segments.length; i++) {
    const segment = segments[i];
    if (i !== segment.range.start.line) {
        throw new Error(`Segment line number incorrect. Expected ${i}, found ${segment.range.start.line}.`);
    }
}
```

should throw an ArgumentNullError.

```js
const parser = new core_1.X12Parser();
let error;
try {
    parser.parse(undefined);
}
catch (err) {
    error = err;
}
if (error.name !== 'ArgumentNullError') {
    throw new Error('ArgumentNullError expected when first argument to X12Parser.parse() is undefined.');
}
```

should throw an ParserError.

```js
const parser = new core_1.X12Parser(true);
let error;
try {
    parser.parse('');
}
catch (err) {
    error = err;
}
if (error.name !== 'ParserError') {
    throw new Error('ParserError expected when document length is too short and parser is strict.');
}
```

should find mismatched elementDelimiter.

```js
const edi = fs.readFileSync('test/test-data/850.edi', 'utf8');
const parser = new core_1.X12Parser(true);
let error;
try {
    parser.parse(edi, { elementDelimiter: '+' });
}
catch (err) {
    error = err;
}
if (error.name !== 'ParserError') {
    throw new Error('ParserError expected when elementDelimiter in document does not match and parser is strict.');
}
```

<a name="x12queryengine"></a>
# X12QueryEngine
should handle basic element references.

```js
const edi = fs.readFileSync('test/test-data/850.edi', 'utf8');
const parser = new core_1.X12Parser(true);
const engine = new core_1.X12QueryEngine(parser);
const results = engine.query(edi, 'REF02');
if (results.length !== 2) {
    throw new Error('Expected two matching elements for REF02.');
}
```

should handle qualified element references.

```js
const edi = fs.readFileSync('test/test-data/850.edi', 'utf8');
const parser = new core_1.X12Parser(true);
const engine = new core_1.X12QueryEngine(parser);
const results = engine.query(edi, 'REF02:REF01["DP"]');
if (results.length !== 1) {
    throw new Error('Expected one matching element for REF02:REF01["DP"].');
}
else if (results[0].value !== '038') {
    throw new Error('Expected REF02 to be "038".');
}
```

should handle segment path element references.

```js
const edi = fs.readFileSync('test/test-data/850.edi', 'utf8');
const parser = new core_1.X12Parser(true);
const engine = new core_1.X12QueryEngine(parser);
const results = engine.query(edi, 'PO1-PID05:PID01["F"]');
if (results.length !== 6) {
    throw new Error(`Expected six matching elements for PO1-PID05:PID01["F"]; received ${results.length}.`);
}
```

should handle HL path element references.

```js
const edi = fs.readFileSync('test/test-data/856.edi', 'utf8');
const parser = new core_1.X12Parser(true);
const engine = new core_1.X12QueryEngine(parser);
const results = engine.query(edi, 'HL+S+O+I-LIN03');
if (results[0].value !== '87787D' || results[1].value !== '99887D') {
    throw new Error('Expected two matching elements for HL+S+O+I-LIN03.');
}
```

should handle FOREACH macro references.

```js
const edi = fs.readFileSync('test/test-data/850.edi', 'utf8');
const parser = new core_1.X12Parser(true);
const engine = new core_1.X12QueryEngine(parser);
const result = engine.querySingle(edi, 'FOREACH(PO1)=>PID05:PID01["F"]');
if (result.values.length !== 6) {
    throw new Error(`Expected six matching elements for FOREACH(PO1)=>PID05:PID01["F"]; received ${result.values.length}.`);
}
```

should handle CONCAT macro references.

```js
const edi = fs.readFileSync('test/test-data/850.edi', 'utf8');
const parser = new core_1.X12Parser(true);
const engine = new core_1.X12QueryEngine(parser);
const result = engine.querySingle(edi, 'CONCAT(REF02:REF01["DP"], & )=>REF02:REF01["PS"]');
if (result.value !== '038 & R') {
    throw new Error(`Expected '038 & R'; received '${result.value}'.`);
}
```

should return valid range information for segments and elements.

```js
const edi = fs.readFileSync('test/test-data/850.edi', 'utf8');
const parser = new core_1.X12Parser(true);
const engine = new core_1.X12QueryEngine(parser);
const result = engine.querySingle(edi, 'BEG03');
if (result.segment.range.start.line !== 3) {
    throw new Error(`Start line for segment is incorrect; found ${result.segment.range.start.line}, expected 3.`);
}
if (result.segment.range.start.character !== 0) {
    throw new Error(`Start char for segment is incorrect; found ${result.segment.range.start.character}, expected 0.`);
}
if (result.element.range.start.line !== 3) {
    throw new Error(`Start line for element is incorrect; found ${result.element.range.start.line}, expected 3.`);
}
if (result.element.range.start.character !== 10) {
    throw new Error(`Start char for element is incorrect; found ${result.element.range.start.character}, expected 10.`);
}
if (result.segment.range.end.line !== 3) {
    throw new Error(`End line for segment is incorrect; found ${result.segment.range.end.line}, expected 3.`);
}
if (result.segment.range.end.character !== 41) {
    throw new Error(`End char for segment is incorrect; found ${result.segment.range.end.character}, expected 41.`);
}
if (result.element.range.end.line !== 3) {
    throw new Error(`End line for element is incorrect; found ${result.element.range.end.line}, expected 3.`);
}
if (result.element.range.end.character !== 20) {
    throw new Error(`End char for element is incorrect; found ${result.element.range.end.character}, expected 20.`);
}
```

should handle envelope queries.

```js
const edi = fs.readFileSync('test/test-data/850.edi', 'utf8');
const parser = new core_1.X12Parser(true);
const engine = new core_1.X12QueryEngine(parser);
const results = engine.query(edi, 'ISA06');
if (results.length === 1) {
    if (results[0].value.trim() !== '4405197800') {
        throw new Error(`Expected 4405197800, found ${results[0].value}.`);
    }
}
else {
    throw new Error(`Expected exactly one result. Found ${results.length}.`);
}
```

should handle queries for files with line feed segment terminators.

```js
const edi = fs.readFileSync('test/test-data/850_2.edi', 'utf8');
const parser = new core_1.X12Parser(true);
const engine = new core_1.X12QueryEngine(parser);
const result = engine.querySingle(edi, 'REF02:REF01["DP"]');
if (result.value.trim() !== '038') {
    throw new Error(`Expected 038, found ${result.value}.`);
}
```

should handle chained qualifiers.

```js
const edi = fs.readFileSync('test/test-data/850.edi', 'utf8');
const parser = new core_1.X12Parser(true);
const engine = new core_1.X12QueryEngine(parser);
const results = engine.query(edi, 'REF02:REF01["DP"]:BEG02["SA"]');
if (results.length === 1) {
    if (results[0].value.trim() !== '038') {
        throw new Error(`Expected 038, found ${results[0].value}.`);
    }
}
else {
    throw new Error(`Expected exactly one result. Found ${results.length}.`);
}
```

