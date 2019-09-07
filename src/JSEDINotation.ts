'use strict';

import { X12SerializationOptions } from './X12SerializationOptions';

export interface JSEDINotation {
    options?: X12SerializationOptions;
    header: Array<string>;
    functionalGroups: Array<JSEDIFunctionalGroup>;
}

interface JSEDIFunctionalGroup {
    header: Array<string>;
    transactions: Array<JSEDITransaction>;
}

interface JSEDITransaction {
    header: Array<string>;
    segments: Array<JSEDISegment>;
}

interface JSEDISegment {
    tag: string;
    elements: Array<string>;
}