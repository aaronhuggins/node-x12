'use strict';

import { Range } from './Positioning';
import { X12FunctionalGroup } from './X12FunctionalGroup';
import { X12Segment } from './X12Segment';

export class X12Transaction {
    constructor() {
        this.headerRange = new Range();
        this.trailerRange = new Range();
        this.segments = new Array<X12Segment>();
    }
    
    functionalGroup: X12FunctionalGroup;
    
    transactionSet: string;
	controlNumber: string;
    segments: X12Segment[];
    
    headerRange: Range;
    trailerRange: Range;
}