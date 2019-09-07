'use strict';

import { Range } from './Positioning';
import { X12Interchange } from './X12Interchange';
import { X12Segment } from './X12Segment';
import { X12SupportedSegments } from './X12Enumerables';
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

    setHeader(elements: string[], options?: X12SerializationOptions) {
        options = options
            ? defaultSerializationOptions(options)
            : this.options;

        this.header = new X12Segment(X12SupportedSegments.GS, options);

        this.header.setElements(elements);

        this._setTrailer(options);
    }

    addTransaction(options?: X12SerializationOptions) {
        options = options
            ? defaultSerializationOptions(options)
            : this.options;

        const transaction = new X12Transaction(options);

        this.transactions.push(transaction);

        this.trailer.replaceElement(`${this.transactions.length}`, 1);

        return transaction;
    }
    
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

    private _setTrailer(options?: X12SerializationOptions) {
        options = options
            ? defaultSerializationOptions(options)
            : this.options;

        this.trailer = new X12Segment(X12SupportedSegments.GE, options);

        this.trailer.setElements([`${this.transactions.length}`, this.header.valueOf(6)]);
    }
}