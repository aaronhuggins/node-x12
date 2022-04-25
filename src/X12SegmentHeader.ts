// deno-lint-ignore-file no-explicit-any
"use strict";

export interface X12SegmentHeader {
  tag: string;
  trailer?: string;
  layout: any;
}

export const ISASegmentHeader: X12SegmentHeader = {
  tag: "ISA",
  trailer: "IEA",
  layout: {
    ISA01: 2,
    ISA02: 10,
    ISA03: 2,
    ISA04: 10,
    ISA05: 2,
    ISA06: 15,
    ISA07: 2,
    ISA08: 15,
    ISA09: 6,
    ISA10: 4,
    ISA11: 1,
    ISA12: 5,
    ISA13: 9,
    ISA14: 1,
    ISA15: 1,
    ISA16: 1,
    COUNT: 16,
    PADDING: true,
  },
};

export const GSSegmentHeader: X12SegmentHeader = {
  tag: "GS",
  trailer: "GE",
  layout: {
    GS01: 2,
    GS02: 15,
    GS02_MIN: 2,
    GS03: 15,
    GS03_MIN: 2,
    GS04: 8,
    GS05: 8,
    GS05_MIN: 4,
    GS06: 9,
    GS06_MIN: 1,
    GS07: 2,
    GS07_MIN: 1,
    GS08: 12,
    GS08_MIN: 1,
    COUNT: 8,
    PADDING: false,
  },
};

export const STSegmentHeader: X12SegmentHeader = {
  tag: "ST",
  trailer: "SE",
  layout: {
    ST01: 3,
    ST02: 9,
    ST02_MIN: 4,
    ST03: 35,
    ST03_MIN: 1,
    COUNT: 3,
    COUNT_MIN: 2,
    PADDING: false,
  },
};
