'use strict';

import { Range } from './Positioning';
import { X12Transaction } from './X12Transaction';
import { X12Element } from './X12Element';

export class X12Segment {
    constructor() {
        this.tag = '';
        this.elements = new Array<X12Element>();
        this.range = new Range();
    }
    
    tag: string;
    elements: X12Element[];
    range: Range;
    
    valueOf(segmentPosition: number, defaultValue?: string): string {
        let index = segmentPosition - 1;
        
        if (this.elements.length <= index) {
            return defaultValue || null;
        }
        
        return this.elements[index].value || defaultValue || null;
    }
}