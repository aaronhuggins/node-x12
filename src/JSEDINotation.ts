"use strict";

import { X12SerializationOptions } from "./X12SerializationOptions.ts";

export class JSEDINotation {
  constructor(header?: string[], options?: X12SerializationOptions) {
    this.header = header === undefined ? new Array<string>() : header;
    this.options = options === undefined ? {} : options;
    this.functionalGroups = new Array<JSEDIFunctionalGroup>();
  }

  options?: X12SerializationOptions;
  header: string[];
  functionalGroups: JSEDIFunctionalGroup[];

  addFunctionalGroup(header: string[]): JSEDIFunctionalGroup {
    const functionalGroup = new JSEDIFunctionalGroup(header);

    this.functionalGroups.push(functionalGroup);

    return functionalGroup;
  }
}

export class JSEDIFunctionalGroup {
  constructor(header?: string[]) {
    this.header = header === undefined ? new Array<string>() : header;
    this.transactions = new Array<JSEDITransaction>();
  }

  header: string[];
  transactions: JSEDITransaction[];

  addTransaction(header: string[]): JSEDITransaction {
    const transaction = new JSEDITransaction(header);

    this.transactions.push(transaction);

    return transaction;
  }
}

export class JSEDITransaction {
  constructor(header?: string[]) {
    this.header = header === undefined ? new Array<string>() : header;
    this.segments = new Array<JSEDISegment>();
  }

  header: string[];
  segments: JSEDISegment[];

  addSegment(tag: string, elements: string[]): JSEDISegment {
    const segment = new JSEDISegment(tag, elements);

    this.segments.push(segment);

    return segment;
  }
}

export class JSEDISegment {
  constructor(tag: string, elements: string[]) {
    this.tag = tag;
    this.elements = elements;
  }

  tag: string;
  elements: string[];
}
