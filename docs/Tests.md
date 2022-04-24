# TOC

- [X12Core](#x12core)
- [X12Formatting](#x12formatting)
- [X12Generator](#x12generator)
- [X12Mapping](#x12mapping)
- [X12ObjectModel](#x12objectmodel)
- [X12Parser](#x12parser)
- [X12QueryEngine](#x12queryengine)
- [X12ValidationEngine](#x12validationengine)
  <a name=""></a>

<a name="x12core"></a>

# X12Core

should export members.

```js
if (!Object.keys(core).includes("X12Parser")) {
  throw new Error("X12 core is missing X12Parser.");
}
```

should create ArgumentNullError.

```js
const error = new Errors_1.ArgumentNullError("test");
if (error.message !== "The argument, 'test', cannot be null.") {
  throw new Error("ArgumentNullError did not return the correct message.");
}
```

should create GeneratorError.

```js
const error = new Errors_1.GeneratorError("test");
if (error.message !== "test") {
  throw new Error("GeneratorError did not return the correct message.");
}
```

should create ParserError.

```js
const error = new Errors_1.ParserError("test");
if (error.message !== "test") {
  throw new Error("ParserError did not return the correct message.");
}
```

should create QuerySyntaxError.

```js
const error = new Errors_1.QuerySyntaxError("test");
if (error.message !== "test") {
  throw new Error("QuerySyntaxError did not return the correct message.");
}
```

should create X12Diagnostic.

```js
const diag = new X12Diagnostic_1.X12Diagnostic();
if (!(diag instanceof X12Diagnostic_1.X12Diagnostic)) {
  throw new Error("Could not create X12Diagnostic.");
}
```

<a name="x12formatting"></a>

# X12Formatting

should replicate the source data unless changes are made.

```js
const edi = fs.readFileSync("test/test-data/850.edi", "utf8");
const parser = new core_1.X12Parser(true);
const interchange = parser.parse(edi);
const edi2 = interchange.toString();
if (edi !== edi2) {
  throw new Error(
    `Formatted EDI does not match source. Found ${edi2}, expected ${edi}.`,
  );
}
```

should replicate the source data for a fat interchange unless changes are made.

```js
const edi = fs.readFileSync("test/test-data/850_fat.edi", "utf8");
const parser = new core_1.X12Parser(true);
const interchange = parser.parse(edi);
const options = {
  format: true,
  endOfLine: "\n",
};
const edi2 = interchange.toString(options);
if (edi !== edi2) {
  throw new Error(
    `Formatted EDI does not match source. Found ${edi2}, expected ${edi}.`,
  );
}
```

<a name="x12generator"></a>

# X12Generator

should create X12Generator.

```js
const generator = new core_1.X12Generator();
const notation = generator.getJSEDINotation();
const options = generator.getOptions();
generator.setJSEDINotation(new core_1.JSEDINotation());
generator.setOptions({});
if (
  !(notation instanceof core_1.JSEDINotation) || typeof options !== "object"
) {
  throw new Error("Could not correctly create instance of X12Generator.");
}
```

should replicate the source data unless changes are made.

```js
const edi = fs.readFileSync("test/test-data/850.edi", "utf8");
const parser = new core_1.X12Parser(true);
const notation = parser.parse(edi).toJSEDINotation();
const generator = new core_1.X12Generator(notation);
const edi2 = generator.toString();
if (edi !== edi2) {
  throw new Error(
    `Formatted EDI does not match source. Found ${edi2}, expected ${edi}.`,
  );
}
```

should replicate the source data to and from JSON unless changes are made.

```js
const edi = fs.readFileSync("test/test-data/850.edi", "utf8");
const parser = new core_1.X12Parser(true);
const interchange = parser.parse(edi);
const json = JSON.stringify(interchange);
const generator = new core_1.X12Generator(JSON.parse(json));
const edi2 = generator.toString();
if (edi !== edi2) {
  throw new Error(
    `Formatted EDI does not match source. Found ${edi2}, expected ${edi}.`,
  );
}
```

should not generate 271 with 3 ST elements using default segment headers.

```js
const fileEdi = fs.readFileSync("test/test-data/271.edi", "utf8").split("~");
const i = new core_1.X12Interchange();
i.setHeader(fileEdi[0].split("*").slice(1));
const fg = i.addFunctionalGroup();
fg.setHeader(fileEdi[1].split("*").slice(1));
const t = fg.addTransaction();
let error;
try {
  t.setHeader(fileEdi[2].split("*").slice(1));
} catch (err) {
  error = err.message;
}
if (
  error !== 'Segment "ST" with 3 elements does meet the required count of 2.'
) {
  throw new Error(
    "271 with 3 ST elements parsing succeed which should not happen",
  );
}
```

should generate 271 with 3 ST elements using custom segment headers.

```js
const fileEdi = fs.readFileSync("test/test-data/271.edi", "utf8").split("~");
const i = new core_1.X12Interchange({
  segmentHeaders: [
    core_1.ISASegmentHeader,
    core_1.GSSegmentHeader,
    {
      tag: "ST",
      layout: {
        ST01: 3,
        ST02: 9,
        ST02_MIN: 4,
        ST03: 35,
        ST03_MIN: 1,
        COUNT: 3,
        PADDING: false,
      },
    },
  ],
});
i.setHeader(fileEdi[0].split("*").slice(1));
const fg = i.addFunctionalGroup();
fg.setHeader(fileEdi[1].split("*").slice(1));
const t = fg.addTransaction();
t.setHeader(fileEdi[2].split("*").slice(1));
```

should validate custom segment headers.

```js
const edi = fs.readFileSync("test/test-data/271.edi", "utf8");
const options = {
  segmentHeaders: [
    core_1.ISASegmentHeader,
    core_1.GSSegmentHeader,
    {
      tag: "ST",
      layout: {
        ST01: 3,
        ST02: 9,
        ST02_MIN: 4,
        ST03: 35,
        ST03_MIN: 1,
        COUNT: 3,
        PADDING: false,
      },
    },
    {
      tag: "HL",
      layout: {
        HL01: 3,
        HL02: 9,
        HL02_MIN: 4,
        HL03: 35,
        HL03_MIN: 1,
        COUNT: 3,
        PADDING: false,
      },
    },
  ],
};
const parser = new core_1.X12Parser(true);
const interchange = parser.parse(edi);
const json = JSON.stringify(interchange);
let error;
try {
  const generator = new core_1.X12Generator(JSON.parse(json), options);
  generator.toString();
} catch (err) {
  error = err.message;
}
if (
  error !== 'Segment "HL" with 4 elements does meet the required count of 3.'
) {
  throw new Error(
    "271 with custom segment headers parsing succeed which should not happen",
  );
}
```

<a name="x12mapping"></a>

# X12Mapping

should map transaction to data.

```js
const parser = new core_1.X12Parser();
const interchange = parser.parse(edi);
const transaction = interchange.functionalGroups[0].transactions[0];
const mapper = new core_1.X12TransactionMap(JSON.parse(mapJson), transaction);
const result = JSON.stringify(mapper.toObject());
if (result !== resultJson) {
  throw new Error(
    `Formatted JSON does not match source. Found ${result}, expected ${resultJson}.`,
  );
}
```

should map data to transaction with custom macro.

```js
const transaction = new core_1.X12Transaction();
const mapper = new core_1.X12TransactionMap(
  JSON.parse(transactionJson),
  transaction,
);
const data = JSON.parse(transactionData);
const result = mapper.fromObject(data, {
  toFixed: function toFixed(key, places) {
    return {
      val: parseFloat(key).toFixed(places),
    };
  },
});
if (!(result instanceof core_1.X12Transaction)) {
  throw new Error(`An error occured when mapping an object to a transaction.`);
}
```

should map data to transaction with LiquidJS.

```js
const transaction = new core_1.X12Transaction();
const mapper = new core_1.X12TransactionMap(
  JSON.parse(transactionJsonLiquid),
  transaction,
  "liquidjs",
);
const data = JSON.parse(transactionData);
const result = mapper.fromObject(data, {
  to_fixed: (value, places) => parseFloat(value).toFixed(places),
});
if (!(result instanceof core_1.X12Transaction)) {
  throw new Error(`An error occured when mapping an object to a transaction.`);
}
```

<a name="x12objectmodel"></a>

# X12ObjectModel

should create X12Interchange with string delimiters.

```js
const interchange = new core_1.X12Interchange("~", "*");
if (interchange.elementDelimiter !== "*") {
  throw new Error("Instance of X12Interchange not successfully created.");
}
```

should create X12FatInterchange.

```js
const parser = new core_1.X12Parser();
const interchange = parser.parse(edi);
const fatInterchange = new core_1.X12FatInterchange([interchange]);
const str = fatInterchange.toString();
const json = fatInterchange.toJSON();
if (!Array.isArray(json) || typeof str !== "string") {
  throw new Error("Instance of X12FatInterchange not successfully created.");
}
```

should create X12Segment.

```js
const segment = new core_1.X12Segment();
const noElement = segment.replaceElement("1", 1);
const noInsert = segment.insertElement("1", 1);
const noneToRemove = segment.removeElement(1);
const defaultVal = segment.valueOf(1, "2");
segment.setTag("WX");
segment.addElement("1");
segment.insertElement("2", 1);
segment.removeElement(2);
if (
  noElement !== null ||
  noInsert !== null ||
  noneToRemove !== false ||
  defaultVal !== "2" ||
  segment.elements.length !== 1 ||
  segment.elements[0].value !== "2"
) {
  throw new Error(
    "Instance of segment or methods did not execute as expected.",
  );
}
```

should cast functional group to JSON.

```js
const parser = new core_1.X12Parser();
const interchange = parser.parse(edi);
const functionalGroup = interchange.functionalGroups[0];
if (typeof functionalGroup.toJSON() !== "object") {
  throw new Error("Instance of X12FunctionalGroup not cast to JSON.");
}
```

should cast transaction set to JSON.

```js
const parser = new core_1.X12Parser();
const interchange = parser.parse(edi);
const functionalGroup = interchange.functionalGroups[0];
const transaction = functionalGroup.transactions[0];
if (typeof transaction.toJSON() !== "object") {
  throw new Error("Instance of X12FunctionalGroup not cast to JSON.");
}
```

should cast segment to JSON.

```js
const parser = new core_1.X12Parser();
const interchange = parser.parse(edi);
const functionalGroup = interchange.functionalGroups[0];
const transaction = functionalGroup.transactions[0];
const segment = transaction.segments[0];
if (typeof segment.toJSON() !== "object") {
  throw new Error("Instance of X12FunctionalGroup not cast to JSON.");
}
```

should construct JSEDINotation objects.

```js
const notation = new core_1.JSEDINotation();
const group = new JSEDINotation_1.JSEDIFunctionalGroup();
const transaction = new JSEDINotation_1.JSEDITransaction();
if (
  !(notation instanceof core_1.JSEDINotation) ||
  !(group instanceof JSEDINotation_1.JSEDIFunctionalGroup) ||
  !(transaction instanceof JSEDINotation_1.JSEDITransaction)
) {
  throw new Error(
    "One or more JS EDI Notation objects could not be constructed.",
  );
}
```

<a name="x12parser"></a>

# X12Parser

should parse a valid X12 document without throwing an error.

```js
const edi = fs.readFileSync("test/test-data/850.edi", "utf8");
const parser = new core_1.X12Parser();
parser.parse(edi);
```

should parse a fat X12 document without throwing an error.

```js
const edi = fs.readFileSync("test/test-data/850_fat.edi", "utf8");
const parser = new core_1.X12Parser(true);
parser.parse(edi);
```

should parse and reconstruct a valid X12 stream without throwing an error.

```js
(async () => {
  return new Promise((resolve, reject) => {
    const ediStream = fs.createReadStream("test/test-data/850.edi", "utf8");
    const parser = new core_1.X12Parser();
    const segments = [];
    ediStream.on("error", (error) => {
      reject(error);
    });
    parser.on("error", (error) => {
      reject(error);
    });
    ediStream
      .pipe(parser)
      .on("data", (data) => {
        segments.push(data);
      })
      .on("end", () => {
        const edi = fs.readFileSync("test/test-data/850.edi", "utf8");
        const interchange = parser.getInterchangeFromSegments(segments);
        if (interchange.toString() !== edi) {
          reject(
            new Error("Expected parsed EDI stream to match raw EDI document."),
          );
        }
        resolve();
      });
  });
});
```

should produce accurate line numbers for files with line breaks.

```js
const edi = fs.readFileSync("test/test-data/850_3.edi", "utf8");
const parser = new core_1.X12Parser();
const interchange = parser.parse(edi);
const segments = [].concat(
  [
    interchange.header,
    interchange.functionalGroups[0].header,
    interchange.functionalGroups[0].transactions[0].header,
  ],
  interchange.functionalGroups[0].transactions[0].segments,
  [
    interchange.functionalGroups[0].transactions[0].trailer,
    interchange.functionalGroups[0].trailer,
    interchange.trailer,
  ],
);
for (let i = 0; i < segments.length; i++) {
  const segment = segments[i];
  if (i !== segment.range.start.line) {
    throw new Error(
      `Segment line number incorrect. Expected ${i}, found ${segment.range.start.line}.`,
    );
  }
}
```

should throw an ArgumentNullError.

```js
const parser = new core_1.X12Parser();
let error;
try {
  parser.parse(undefined);
} catch (err) {
  error = err;
}
if (error.name !== "ArgumentNullError") {
  throw new Error(
    "ArgumentNullError expected when first argument to X12Parser.parse() is undefined.",
  );
}
```

should throw an ParserError.

```js
const parser = new core_1.X12Parser(true);
let error;
try {
  parser.parse("");
} catch (err) {
  error = err;
}
if (error.name !== "ParserError") {
  throw new Error(
    "ParserError expected when document length is too short and parser is strict.",
  );
}
```

should find mismatched elementDelimiter.

```js
const edi = fs.readFileSync("test/test-data/850.edi", "utf8");
const parser = new core_1.X12Parser(true);
let error;
try {
  parser.parse(edi, { elementDelimiter: "+" });
} catch (err) {
  error = err;
}
if (error.name !== "ParserError") {
  throw new Error(
    "ParserError expected when elementDelimiter in document does not match and parser is strict.",
  );
}
```

<a name="x12queryengine"></a>

# X12QueryEngine

should handle basic element references.

```js
const edi = fs.readFileSync("test/test-data/850.edi", "utf8");
const parser = new core_1.X12Parser(true);
const engine = new core_1.X12QueryEngine(parser);
const results = engine.query(edi, "REF02");
if (results.length !== 2) {
  throw new Error("Expected two matching elements for REF02.");
}
```

should handle qualified element references.

```js
const edi = fs.readFileSync("test/test-data/850.edi", "utf8");
const parser = new core_1.X12Parser(true);
const engine = new core_1.X12QueryEngine(parser);
const results = engine.query(edi, 'REF02:REF01["DP"]');
if (results.length !== 1) {
  throw new Error('Expected one matching element for REF02:REF01["DP"].');
} else if (results[0].value !== "038") {
  throw new Error('Expected REF02 to be "038".');
}
```

should handle segment path element references.

```js
const edi = fs.readFileSync("test/test-data/850.edi", "utf8");
const parser = new core_1.X12Parser(true);
const engine = new core_1.X12QueryEngine(parser);
const results = engine.query(edi, 'PO1-PID05:PID01["F"]');
if (results.length !== 6) {
  throw new Error(
    `Expected six matching elements for PO1-PID05:PID01["F"]; received ${results.length}.`,
  );
}
```

should handle HL path element references.

```js
const edi = fs.readFileSync("test/test-data/856.edi", "utf8");
const parser = new core_1.X12Parser(true);
const engine = new core_1.X12QueryEngine(parser);
const results = engine.query(edi, "HL+S+O+I-LIN03");
if (results[0].value !== "87787D" || results[1].value !== "99887D") {
  throw new Error("Expected two matching elements for HL+S+O+I-LIN03.");
}
```

should handle HL paths where HL03 is a number.

```js
const edi = fs.readFileSync("test/test-data/271.edi", "utf8");
const parser = new core_1.X12Parser(true);
const engine = new core_1.X12QueryEngine(parser);
const results = engine.query(edi, "HL+20+21+22-NM101");
if (results.length !== 2) {
  throw new Error("Expected two matching elements for HL+20+21+22-NM101.");
}
```

should handle FOREACH macro references.

```js
const edi = fs.readFileSync("test/test-data/850.edi", "utf8");
const parser = new core_1.X12Parser(true);
const engine = new core_1.X12QueryEngine(parser);
const result = engine.querySingle(edi, 'FOREACH(PO1)=>PID05:PID01["F"]');
if (result.values.length !== 6) {
  throw new Error(
    `Expected six matching elements for FOREACH(PO1)=>PID05:PID01["F"]; received ${result.values.length}.`,
  );
}
```

should handle CONCAT macro references.

```js
const edi = fs.readFileSync("test/test-data/850.edi", "utf8");
const parser = new core_1.X12Parser(true);
const engine = new core_1.X12QueryEngine(parser);
const result = engine.querySingle(
  edi,
  'CONCAT(REF02:REF01["DP"], & )=>REF02:REF01["PS"]',
);
if (result.value !== "038 & R") {
  throw new Error(`Expected '038 & R'; received '${result.value}'.`);
}
```

should return valid range information for segments and elements.

```js
const edi = fs.readFileSync("test/test-data/850.edi", "utf8");
const parser = new core_1.X12Parser(true);
const engine = new core_1.X12QueryEngine(parser);
const result = engine.querySingle(edi, "BEG03");
if (result.segment.range.start.line !== 3) {
  throw new Error(
    `Start line for segment is incorrect; found ${result.segment.range.start.line}, expected 3.`,
  );
}
if (result.segment.range.start.character !== 0) {
  throw new Error(
    `Start char for segment is incorrect; found ${result.segment.range.start.character}, expected 0.`,
  );
}
if (result.element.range.start.line !== 3) {
  throw new Error(
    `Start line for element is incorrect; found ${result.element.range.start.line}, expected 3.`,
  );
}
if (result.element.range.start.character !== 10) {
  throw new Error(
    `Start char for element is incorrect; found ${result.element.range.start.character}, expected 10.`,
  );
}
if (result.segment.range.end.line !== 3) {
  throw new Error(
    `End line for segment is incorrect; found ${result.segment.range.end.line}, expected 3.`,
  );
}
if (result.segment.range.end.character !== 41) {
  throw new Error(
    `End char for segment is incorrect; found ${result.segment.range.end.character}, expected 41.`,
  );
}
if (result.element.range.end.line !== 3) {
  throw new Error(
    `End line for element is incorrect; found ${result.element.range.end.line}, expected 3.`,
  );
}
if (result.element.range.end.character !== 20) {
  throw new Error(
    `End char for element is incorrect; found ${result.element.range.end.character}, expected 20.`,
  );
}
```

should handle envelope queries.

```js
const edi = fs.readFileSync("test/test-data/850.edi", "utf8");
const parser = new core_1.X12Parser(true);
const engine = new core_1.X12QueryEngine(parser);
const results = engine.query(edi, "ISA06");
if (results.length === 1) {
  if (results[0].value.trim() !== "4405197800") {
    throw new Error(`Expected 4405197800, found ${results[0].value}.`);
  }
} else {
  throw new Error(`Expected exactly one result. Found ${results.length}.`);
}
```

should handle queries for files with line feed segment terminators.

```js
const edi = fs.readFileSync("test/test-data/850_2.edi", "utf8");
const parser = new core_1.X12Parser(true);
const engine = new core_1.X12QueryEngine(parser);
const result = engine.querySingle(edi, 'REF02:REF01["DP"]');
if (result.value.trim() !== "038") {
  throw new Error(`Expected 038, found ${result.value}.`);
}
```

should handle chained qualifiers.

```js
const edi = fs.readFileSync("test/test-data/850.edi", "utf8");
const parser = new core_1.X12Parser(true);
const engine = new core_1.X12QueryEngine(parser);
const results = engine.query(edi, 'REF02:REF01["DP"]:BEG02["SA"]');
if (results.length === 1) {
  if (results[0].value.trim() !== "038") {
    throw new Error(`Expected 038, found ${results[0].value}.`);
  }
} else {
  throw new Error(`Expected exactly one result. Found ${results.length}.`);
}
```

<a name="x12validationengine"></a>

# X12ValidationEngine

should create validation rule.

```js
const rule = new X12ValidationEngine_1.X12ValidationRule({ engine: /ab+c/gu });
assert.deepStrictEqual(
  rule instanceof X12ValidationEngine_1.X12ValidationRule,
  true,
);
```

should create validation rule from JSON.

```js
const ruleJson = JSON.parse(validationRule850);
const rule = new X12ValidationEngine_1.X12InterchangeRule(ruleJson);
const stringJson = JSON.stringify(rule);
assert.deepStrictEqual(JSON.parse(stringJson), ruleJson);
// fs.writeFileSync('test/test-data/850_validation.rule.json', JSON.stringify(rule, null, 2))
```

should create validation rule regardless of header or trailer.

```js
const ruleJson = JSON.parse(validationRuleNoHeader850);
const rule = new X12ValidationEngine_1.X12InterchangeRule(ruleJson);
assert.deepStrictEqual(
  rule instanceof X12ValidationEngine_1.X12InterchangeRule,
  true,
);
// fs.writeFileSync('test/test-data/850_validation.rule.json', JSON.stringify(rule, null, 2))
```

should validate X12 document.

```js
const ruleJson = JSON.parse(validationRuleSimple850);
const parser = new core_1.X12Parser();
const interchange = parser.parse(edi);
const validator = new core_1.X12ValidationEngine();
let rule = new X12ValidationEngine_1.X12InterchangeRule(ruleJson);
let report = validator.assert(interchange, rule);
assert.strictEqual(report, true);
rule = new X12ValidationEngine_1.X12GroupRule(ruleJson.group);
report = validator.assert(interchange.functionalGroups[0], rule);
assert.strictEqual(report, true);
rule = new X12ValidationEngine_1.X12TransactionRule(ruleJson.group.transaction);
report = validator.assert(
  interchange.functionalGroups[0].transactions[0],
  rule,
);
assert.strictEqual(report, true);
rule = new X12ValidationEngine_1.X12SegmentRule(
  ruleJson.group.transaction.segments[0],
);
report = validator.assert(
  interchange.functionalGroups[0].transactions[0].segments[0],
  rule,
);
assert.strictEqual(report, true);
rule = new X12ValidationEngine_1.X12ElementRule(
  ruleJson.group.transaction.segments[0].elements[0],
);
report = validator.assert(
  interchange.functionalGroups[0].transactions[0].segments[0].elements[0],
  rule,
);
assert.strictEqual(report, true);
```

should invalidate X12 document.

```js
const ruleJson = JSON.parse(validationRuleSimple850);
const parser = new core_1.X12Parser();
const interchange = parser.parse(edi2);
const rule = new X12ValidationEngine_1.X12InterchangeRule(ruleJson);
const validator = new core_1.X12ValidationEngine({
  throwError: true,
  acknowledgement: {
    isa: new core_1.X12Segment("ISA").setElements([
      "00",
      "",
      "00",
      "",
      "ZZ",
      "TEST1",
      "ZZ",
      "TEST2",
      "200731",
      "0430",
      "U",
      "00401",
      "1",
      "1",
      "P",
      ">",
    ]),
    gs: new core_1.X12Segment("GS").setElements([
      "FA",
      "TEST1",
      "TEST2",
      "20200731",
      "0430",
      "1",
      "X",
      "004010",
    ]),
  },
});
try {
  validator.assert(interchange, rule);
} catch (error) {
  const { report } = error;
  assert.strictEqual(typeof report, "object");
}
const acknowledgement = validator.acknowledge();
assert.strictEqual(acknowledgement instanceof core_1.X12Interchange, true);
```

should resolve error codes.

```js
const errorTypes = ["element", "segment", "transaction", "group"];
const ackCodes = "AMPRWXE";
for (const errorType of errorTypes) {
  for (let i = 1, j = 1; i <= j; i += 1) {
    const result = core_1.errorLookup(errorType, j.toString());
    assert.strictEqual(typeof result, "object");
    if (parseFloat(result.code) > i - 1) {
      j += 1;
    }
  }
}
for (const char of ackCodes) {
  const result = core_1.X12ValidationErrorCode.acknowledgement("group", char);
  assert.strictEqual(typeof result, "object");
}
```
