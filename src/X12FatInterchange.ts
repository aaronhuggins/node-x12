'use strict';

import { X12Interchange } from './X12Interchange';
import { defaultSerializationOptions, X12SerializationOptions } from './X12SerializationOptions';

export class X12FatInterchange {
    /**
     * @description Create a fat interchange.
     * @param {X12SerializationOptions} [options] Options for serializing back to EDI.
     */
    constructor(options?: X12SerializationOptions) {
        this.interchanges = new Array<X12Interchange>();
        this.options = defaultSerializationOptions(options);
    }

    interchanges: Array<X12Interchange>;
    options: X12SerializationOptions;

    /**
     * @description Serialize fat interchange to EDI string.
     * @param {X12SerializationOptions} [options] Options to override serializing back to EDI.
     */
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