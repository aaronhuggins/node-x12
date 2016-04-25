'use strict';

import { Range } from './Positioning';
import { X12FunctionalGroup } from './X12FunctionalGroup';
import { X12Segment } from './X12Segment';
import { defaultSerializationOptions, X12SerializationOptions } from './X12SerializationOptions';

export class X12Transaction {
    constructor() {
        this.segments = new Array<X12Segment>();
    }
    
    header: X12Segment;
    trailer: X12Segment;
    
    segments: X12Segment[];
    
    toString(options?: X12SerializationOptions): string {
        options = defaultSerializationOptions(options);
        
        let edi = this.header.toString(options);
        
        if (options.format) {
            edi += options.endOfLine;
        }
        
        for (let i = 0; i < this.segments.length; i++) {
            edi += this.segments[i].toString(options);
            
            if (options.format) {
                edi += options.endOfLine;
            }
        }
        
        edi += this.trailer.toString(options);
        
        return edi;
    }
}