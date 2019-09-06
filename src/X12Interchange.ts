'use strict';

import { Range } from './Positioning';
import { X12FunctionalGroup } from './X12FunctionalGroup';
import { X12Segment } from './X12Segment';
import { defaultSerializationOptions, X12SerializationOptions } from './X12SerializationOptions';

export class X12Interchange {
    constructor(segmentTerminator: string, elementDelimiter: string, options?: X12SerializationOptions) {
        this.functionalGroups = new Array<X12FunctionalGroup>();
        this.segmentTerminator = segmentTerminator;
        this.elementDelimiter = elementDelimiter;
        this.options = defaultSerializationOptions(options);
    }
    
    header: X12Segment;
    trailer: X12Segment;
    
    functionalGroups: X12FunctionalGroup[];
    
    segmentTerminator: string;
    elementDelimiter: string;
    options: X12SerializationOptions;
    
    toString(options?: X12SerializationOptions): string {
        options = options
            ? defaultSerializationOptions(options)
            : this.options;
        
        let edi = this.header.toString();
        
        if (options.format) {
            edi += options.endOfLine;
        }
        
        for (let i = 0; i < this.functionalGroups.length; i++) {
            edi += this.functionalGroups[i].toString();
            
            if (options.format) {
                edi += options.endOfLine;
            }
        }
        
        edi += this.trailer.toString();
        
        return edi;
    }
    
    private _padRight(input: string, width: number): string {
        while (input.length < width) {
            input += ' ';
        }
        
        return input.substr(0, width);
    }
}