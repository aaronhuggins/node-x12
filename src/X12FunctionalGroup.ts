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
    
    senderCode: string;
	receiverCode: string;
	controlNumber: string;
    
    transactions: X12Transaction[];
    
    headerRange: Range;
    trailerRange: Range;
}