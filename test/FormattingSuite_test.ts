"use strict";

import { describe, it } from "https://deno.land/x/deno_mocha@0.3.0/mod.ts"
import { X12FatInterchange } from "../src/X12FatInterchange.ts";
import { X12Interchange, X12Parser, X12SerializationOptions } from "../mod.ts";

describe("X12Formatting", () => {
  it("should replicate the source data unless changes are made", () => {
    const edi = Deno.readTextFileSync("test/test-data/850.edi");
    const parser = new X12Parser(true);
    const interchange = parser.parse(edi) as X12Interchange;

    const edi2 = interchange.toString();

    if (edi !== edi2) {
      throw new Error(
        `Formatted EDI does not match source. Found ${edi2}, expected ${edi}.`,
      );
    }
  });

  it("should replicate the source data for a fat interchange unless changes are made", () => {
    const edi = Deno.readTextFileSync("test/test-data/850_fat.edi");
    const parser = new X12Parser(true);
    const interchange = parser.parse(edi) as X12FatInterchange;

    const options: X12SerializationOptions = {
      format: true,
      endOfLine: "\n",
    };

    const edi2 = interchange.toString(options);

    if (edi !== edi2) {
      throw new Error(
        `Formatted EDI does not match source. Found ${edi2}, expected ${edi}.`,
      );
    }
  });
});
