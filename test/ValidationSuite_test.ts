// deno-lint-ignore-file no-explicit-any
"use strict";

import { describe, it } from "https://deno.land/std@0.136.0/testing/bdd.ts";
import * as assert from "https://deno.land/std@0.133.0/node/assert.ts";
import {
  errorLookup,
  X12Interchange,
  X12Parser,
  X12Segment,
  X12ValidationEngine,
  X12ValidationErrorCode,
} from "../mod.ts";
import {
  X12ElementRule,
  X12GroupRule,
  X12InterchangeRule,
  X12SegmentRule,
  X12TransactionRule,
  X12ValidationRule,
} from "../src/X12ValidationEngine/index.ts";

const edi = Deno.readTextFileSync("test/test-data/850.edi");
const edi2 = Deno.readTextFileSync("test/test-data/856.edi");
const validationRule850 = Deno.readTextFileSync(
  "test/test-data/850_validation.rule.json",
);
const validationRuleSimple850 = Deno.readTextFileSync(
  "test/test-data/850_validation_simple.rule.json",
);
const validationRuleNoHeader850 = Deno.readTextFileSync(
  "test/test-data/850_validation_no_headers.rule.json",
);

describe("X12ValidationEngine", () => {
  it("should create validation rule", () => {
    const rule = new X12ValidationRule({ engine: /ab+c/gu });

    assert.deepStrictEqual(rule instanceof X12ValidationRule, true);
  });

  it("should create validation rule from JSON", () => {
    const ruleJson = JSON.parse(validationRule850);
    const rule = new X12InterchangeRule(ruleJson);
    const stringJson = JSON.stringify(rule);

    assert.deepStrictEqual(JSON.parse(stringJson), ruleJson);
    // fs.writeFileSync('test/test-data/850_validation.rule.json', JSON.stringify(rule, null, 2))
  });

  it("should create validation rule regardless of header or trailer", () => {
    const ruleJson = JSON.parse(validationRuleNoHeader850);
    const rule = new X12InterchangeRule(ruleJson);

    assert.deepStrictEqual(rule instanceof X12InterchangeRule, true);
    // fs.writeFileSync('test/test-data/850_validation.rule.json', JSON.stringify(rule, null, 2))
  });

  it("should validate X12 document", () => {
    const ruleJson = JSON.parse(validationRuleSimple850);
    const parser = new X12Parser();
    const interchange = parser.parse(edi) as X12Interchange;
    const validator = new X12ValidationEngine();
    let rule: any = new X12InterchangeRule(ruleJson);
    let report = validator.assert(interchange, rule);

    assert.strictEqual(report, true);

    rule = new X12GroupRule(ruleJson.group);
    report = validator.assert(interchange.functionalGroups[0], rule);

    assert.strictEqual(report, true);

    rule = new X12TransactionRule(ruleJson.group.transaction);
    report = validator.assert(
      interchange.functionalGroups[0].transactions[0],
      rule,
    );

    assert.strictEqual(report, true);

    rule = new X12SegmentRule(ruleJson.group.transaction.segments[0]);
    report = validator.assert(
      interchange.functionalGroups[0].transactions[0].segments[0],
      rule,
    );

    assert.strictEqual(report, true);

    rule = new X12ElementRule(
      ruleJson.group.transaction.segments[0].elements[0],
    );
    report = validator.assert(
      interchange.functionalGroups[0].transactions[0].segments[0].elements[0],
      rule,
    );

    assert.strictEqual(report, true);
  });

  it("should invalidate X12 document", () => {
    const ruleJson = JSON.parse(validationRuleSimple850);
    const parser = new X12Parser();
    const interchange = parser.parse(edi2) as X12Interchange;
    const rule = new X12InterchangeRule(ruleJson);
    const validator = new X12ValidationEngine({
      throwError: true,
      acknowledgement: {
        isa: new X12Segment("ISA").setElements([
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
        gs: new X12Segment("GS").setElements([
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

    assert.strictEqual(acknowledgement instanceof X12Interchange, true);
  });

  it("should resolve error codes", () => {
    const errorTypes = ["element", "segment", "transaction", "group"];
    const ackCodes = "AMPRWXE";

    for (const errorType of errorTypes) {
      for (let i = 1, j = 1; i <= j; i += 1) {
        const result = errorLookup(errorType as any, j.toString());

        assert.strictEqual(typeof result, "object");

        if (parseFloat(result.code) > i - 1) {
          j += 1;
        }
      }
    }

    for (const char of ackCodes) {
      const result = X12ValidationErrorCode.acknowledgement("group", char);

      assert.strictEqual(typeof result, "object");
    }
  });
});
