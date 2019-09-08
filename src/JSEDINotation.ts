'use strict';

import { X12SerializationOptions } from './X12SerializationOptions';

export class JSEDINotation {
    constructor(header?: Array<string>, options?: X12SerializationOptions) {
        this.header = header || new Array<string>();
        this.options = options || {} as X12SerializationOptions;
        this.functionalGroups = new Array<JSEDIFunctionalGroup>();
    }

    options?: X12SerializationOptions;
    header: Array<string>;
    functionalGroups: Array<JSEDIFunctionalGroup>;

    addFunctionalGroup(functionalGroup: JSEDIFunctionalGroup) {
        this.functionalGroups.push(functionalGroup);
    }
}

export class JSEDIFunctionalGroup {
    constructor(header?: Array<string>) {
        this.header = header || new Array<string>();
        this.transactions = new Array<JSEDITransaction>();
    }

    header: Array<string>;
    transactions: Array<JSEDITransaction>;

    addTransaction(transaction: JSEDITransaction) {
        this.transactions.push(transaction);
    }
}

export class JSEDITransaction {
    constructor(header?: Array<string>) {
        this.header = header || new Array<string>();
        this.segments = new Array<JSEDISegment>();
    }

    header: Array<string>;
    segments: Array<JSEDISegment>;

    addSegment(segment: JSEDISegment) {
        this.segments.push(segment);
    }
}

export class JSEDISegment {
    constructor(tag: string, elements: Array<string>) {
        this.tag = tag;
        this.elements = elements;
    }

    tag: string;
    elements: Array<string>;
}