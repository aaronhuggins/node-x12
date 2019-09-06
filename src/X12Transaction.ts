'use strict';

import { Range } from './Positioning';
import { X12FunctionalGroup } from './X12FunctionalGroup';
import { X12Segment } from './X12Segment';
import { defaultSerializationOptions, X12SerializationOptions } from './X12SerializationOptions';

export class X12Transaction {
    constructor(options?: X12SerializationOptions) {
        this.segments = new Array<X12Segment>();
        this.options = defaultSerializationOptions(options);
    }
    
    header: X12Segment;
    trailer: X12Segment;
    
    segments: X12Segment[];

    options: X12SerializationOptions

    setHeader(tag: string, elements: string[], options?: X12SerializationOptions) {
        this.header = new X12Segment(tag, options)
        this.header.setElements(elements)
    }

    setTrailer(tag: string, elements: string[], options?: X12SerializationOptions) {
        this.trailer = new X12Segment(tag, options)
        this.trailer.setElements(elements)
    }
    
    toString(options?: X12SerializationOptions): string {
        options = options
            ? defaultSerializationOptions(options)
            : this.options;
        
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