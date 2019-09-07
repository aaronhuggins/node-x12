"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.X12SupportedSegments = {
    ISA: 'ISA',
    IEA: 'IEA',
    GS: 'GS',
    GE: 'GE',
    ST: 'ST',
    SE: 'SE'
};
exports.X12InterchangeControlHeader = {
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
    PADDING: true
};
exports.X12FunctionalGroupHeader = {
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
    PADDING: false
};
exports.X12TransactionSetHeader = {
    ST01: 3,
    ST02: 9,
    ST02_MIN: 4,
    COUNT: 2,
    PADDING: false
};
