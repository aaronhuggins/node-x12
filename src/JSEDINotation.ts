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

    addFunctionalGroup(header: Array<string>) {
        const functionalGroup = new JSEDIFunctionalGroup(header);

        this.functionalGroups.push(functionalGroup);

        return functionalGroup;
    }
}

export class JSEDIFunctionalGroup {
    constructor(header?: Array<string>) {
        this.header = header || new Array<string>();
        this.transactions = new Array<JSEDITransaction>();
    }

    header: Array<string>;
    transactions: Array<JSEDITransaction>;

    addTransaction(header: Array<string>) {
        const transaction = new JSEDITransaction(header);

        this.transactions.push(transaction);

        return transaction;
    }
}

export class JSEDITransaction {
    constructor(header?: Array<string>) {
        this.header = header || new Array<string>();
        this.segments = new Array<JSEDISegment>();
    }

    header: Array<string>;
    segments: Array<JSEDISegment>;

    addSegment(tag: string, elements: Array<string>) {
        const segment = new JSEDISegment(tag, elements);

        this.segments.push(segment);

        return segment;
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