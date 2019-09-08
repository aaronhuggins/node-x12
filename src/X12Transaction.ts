'use strict';

import { X12Segment } from './X12Segment';
import { X12SupportedSegments } from './X12Enumerables';
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

    setHeader(elements: string[], options?: X12SerializationOptions) {
        options = options
            ? defaultSerializationOptions(options)
            : this.options;

        this.header = new X12Segment(X12SupportedSegments.ST, options);

        this.header.setElements(elements);

        this._setTrailer(options);
    }

    addSegment(tag: string, elements: string[], options?: X12SerializationOptions) {
        options = options
            ? defaultSerializationOptions(options)
            : this.options;

        const segment = new X12Segment(tag, options);

        segment.setElements(elements);

        this.segments.push(segment);

        this.trailer.replaceElement(`${this.segments.length + 2}`, 1);

        return segment;
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

    private _setTrailer(options?: X12SerializationOptions) {
        options = options
            ? defaultSerializationOptions(options)
            : this.options;

        this.trailer = new X12Segment(X12SupportedSegments.SE, options);

        this.trailer.setElements([`${this.segments.length + 2}`, this.header.valueOf(2)]);
    }
}