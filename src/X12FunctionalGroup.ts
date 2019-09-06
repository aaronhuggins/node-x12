'use strict';

import { Range } from './Positioning';
import { X12Interchange } from './X12Interchange';
import { X12Segment } from './X12Segment';
import { X12Transaction } from './X12Transaction';
import { defaultSerializationOptions, X12SerializationOptions } from './X12SerializationOptions';

export class X12FunctionalGroup {
    constructor(options?: X12SerializationOptions) {
        this.transactions = new Array<X12Transaction>();
        this.options = defaultSerializationOptions(options);
    }
    
    header: X12Segment;
    trailer: X12Segment;
    
    transactions: X12Transaction[];

    options: X12SerializationOptions
    
    toString(options?: X12SerializationOptions): string {
        options = options
            ? defaultSerializationOptions(options)
            : this.options;
        
        let edi = this.header.toString(options);
        
        if (options.format) {
            edi += options.endOfLine;
        }
        
        for (let i = 0; i < this.transactions.length; i++) {
            edi += this.transactions[i].toString(options);
            
            if (options.format) {
                edi += options.endOfLine;
            }
        }
        
        edi += this.trailer.toString(options);
        
        return  edi;
    }
}