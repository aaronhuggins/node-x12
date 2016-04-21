'use strict';

import { Range } from './Positioning';
import { X12Interchange } from './X12Interchange';
import { X12Transaction } from './X12Transaction';

export class X12FunctionalGroup {
    constructor() {
        this.transactions = new Array<X12Transaction>();
        this.headerRange = new Range();
        this.trailerRange = new Range();
    }
    
    functionalIdentifierCode: string;
    senderCode: string;
	receiverCode: string;
	controlNumber: string;
    date: string;
    time: string;
    agencyCode: string;
    version: string;
    
    transactions: X12Transaction[];
    
    headerRange: Range;
    trailerRange: Range;
}