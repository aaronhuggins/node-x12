'use strict';

import { Range } from './Positioning';
import { X12Transaction } from './X12Transaction';
import { X12Element } from './X12Element';
import { defaultSerializationOptions, X12SerializationOptions } from './X12SerializationOptions';

export class X12Segment {
    constructor() {
        this.tag = '';
        this.elements = new Array<X12Element>();
        this.range = new Range();
    }
    
    tag: string;
    elements: X12Element[];
    range: Range;
    
    toString(options?: X12SerializationOptions): string {
        options = defaultSerializationOptions(options);
        
        let edi = this.tag;
        
        for (let i = 0; i < this.elements.length; i++) {
            edi += options.elementDelimiter;
            edi += this.elements[i].value;
        }
        
        edi += options.segmentTerminator;
        
        return edi;
    }
    
    valueOf(segmentPosition: number, defaultValue?: string): string {
        let index = segmentPosition - 1;
        
        if (this.elements.length <= index) {
            return defaultValue || null;
        }
        
        return this.elements[index].value || defaultValue || null;
    }
}