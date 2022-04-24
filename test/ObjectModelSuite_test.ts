"use strict";

import "https://raw.githubusercontent.com/aaronhuggins/deno_mocha/e6c179156821c626354a8c792518958625078a82/global_mocha.ts";
import {
  JSEDINotation,
  X12FatInterchange,
  X12Interchange,
  X12Parser,
  X12Segment,
} from "../mod.ts";
import {
  JSEDIFunctionalGroup,
  JSEDITransaction,
} from "../src/JSEDINotation.ts";

const edi = Deno.readTextFileSync("test/test-data/850.edi");

describe("X12ObjectModel", () => {
  it("should create X12Interchange with string delimiters", () => {
    const interchange = new X12Interchange("~", "*");

    if (interchange.elementDelimiter !== "*") {
      throw new Error("Instance of X12Interchange not successfully created.");
    }
  });

  it("should create X12FatInterchange", () => {
    const parser = new X12Parser();
    const interchange = parser.parse(edi) as X12Interchange;
    const fatInterchange = new X12FatInterchange([interchange]);
    const str = fatInterchange.toString();
    const json = fatInterchange.toJSON();

    if (!Array.isArray(json) || typeof str !== "string") {
      throw new Error(
        "Instance of X12FatInterchange not successfully created.",
      );
    }
  });

  it("should create X12Segment", () => {
    const segment = new X12Segment();
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
      noInsert !== false ||
      typeof noneToRemove !== "boolean" ||
      defaultVal !== "2" ||
      segment.elements.length !== 1 ||
      segment.elements[0].value !== "2"
    ) {
      throw new Error(
        "Instance of segment or methods did not execute as expected.",
      );
    }
  });

  it("should cast functional group to JSON", () => {
    const parser = new X12Parser();
    const interchange = parser.parse(edi) as X12Interchange;
    const functionalGroup = interchange.functionalGroups[0];

    if (typeof functionalGroup.toJSON() !== "object") {
      throw new Error("Instance of X12FunctionalGroup not cast to JSON.");
    }
  });

  it("should cast transaction set to JSON", () => {
    const parser = new X12Parser();
    const interchange = parser.parse(edi) as X12Interchange;
    const functionalGroup = interchange.functionalGroups[0];
    const transaction = functionalGroup.transactions[0];

    if (typeof transaction.toJSON() !== "object") {
      throw new Error("Instance of X12FunctionalGroup not cast to JSON.");
    }
  });

  it("should cast segment to JSON", () => {
    const parser = new X12Parser();
    const interchange = parser.parse(edi) as X12Interchange;
    const functionalGroup = interchange.functionalGroups[0];
    const transaction = functionalGroup.transactions[0];
    const segment = transaction.segments[0];

    if (typeof segment.toJSON() !== "object") {
      throw new Error("Instance of X12FunctionalGroup not cast to JSON.");
    }
  });

  it("should construct JSEDINotation objects", () => {
    const notation = new JSEDINotation();
    const group = new JSEDIFunctionalGroup();
    const transaction = new JSEDITransaction();

    if (
      !(notation instanceof JSEDINotation) ||
      !(group instanceof JSEDIFunctionalGroup) ||
      !(transaction instanceof JSEDITransaction)
    ) {
      throw new Error(
        "One or more JS EDI Notation objects could not be constructed.",
      );
    }
  });
});
