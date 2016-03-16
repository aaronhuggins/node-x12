'use strict';

import { Range } from './Positioning';
import { X12FunctionalGroup } from './X12FunctionalGroup';

export class X12Interchange {
    constructor(segmentTerminator: string, elementDelimiter: string) {
        this.functionalGroups = new Array<X12FunctionalGroup>();
        this.segmentTerminator = segmentTerminator;
        this.elementDelimiter = elementDelimiter;
        this.headerRange = new Range();
        this.trailerRange = new Range();
    }
    
    senderQualifier: string;
	senderId: string;
	receiverQualifier: string;
	receiverId: string;
	controlVersionNumber: string;
	controlNumber: string;
    
    functionalGroups: X12FunctionalGroup[];
    
    segmentTerminator: string;
    elementDelimiter: string;
    
    headerRange: Range;
    trailerRange: Range;
}