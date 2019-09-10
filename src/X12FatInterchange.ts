'use strict';

import { X12Interchange } from './X12Interchange';
import { defaultSerializationOptions, X12SerializationOptions } from './X12SerializationOptions';

export class X12FatInterchange {
    constructor(options?: X12SerializationOptions) {
        this.interchanges = new Array<X12Interchange>();
        this.options = defaultSerializationOptions(options);
    }

    interchanges: Array<X12Interchange>;
    options: X12SerializationOptions;

    toString(options?: X12SerializationOptions) {
        options = options
            ? defaultSerializationOptions(options)
            : this.options;

        let edi = '';

        for (let i = 0; i < this.interchanges.length; i++) {
            edi += this.interchanges[i].toString(options);
            
            if (options.format) {
                edi += options.endOfLine;
            }
        }

        return edi;
    }
}