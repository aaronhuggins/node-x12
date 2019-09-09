'use strict';

import { JSEDINotation } from './JSEDINotation';
import { X12FunctionalGroup } from './X12FunctionalGroup';
import { X12Segment } from './X12Segment';
import { X12SupportedSegments } from './X12Enumerables';
import { defaultSerializationOptions, X12SerializationOptions } from './X12SerializationOptions';

export class X12Interchange {
    constructor(segmentTerminator: string | X12SerializationOptions, elementDelimiter?: string, options?: X12SerializationOptions) {
        this.functionalGroups = new Array<X12FunctionalGroup>();

        if (typeof segmentTerminator === 'string') {
            this.segmentTerminator = segmentTerminator;
            if (typeof elementDelimiter === 'string') {
                this.elementDelimiter = elementDelimiter;
            } else {
                throw new TypeError('Parameter "elementDelimiter" must be type of string.')
            }
        } else {
            this.options = defaultSerializationOptions(segmentTerminator);
            this.segmentTerminator = this.options.segmentTerminator;
            this.elementDelimiter = this.options.elementDelimiter;
        }

        if (this.options === undefined) {
            this.options = defaultSerializationOptions(options);
        }
    }
    
    header: X12Segment;
    trailer: X12Segment;
    
    functionalGroups: X12FunctionalGroup[];
    
    segmentTerminator: string;
    elementDelimiter: string;
    options: X12SerializationOptions;

    setHeader(elements: string[], options?: X12SerializationOptions) {
        options = options
            ? defaultSerializationOptions(options)
            : this.options;

        this.header = new X12Segment(X12SupportedSegments.ISA, options);

        this.header.setElements(elements);

        this._setTrailer(options);
    }

    addFunctionalGroup(options?: X12SerializationOptions) {
        options = options
            ? defaultSerializationOptions(options)
            : this.options;

        const functionalGroup = new X12FunctionalGroup(options);

        this.functionalGroups.push(functionalGroup);

        this.trailer.replaceElement(`${this.functionalGroups.length}`, 1);

        return functionalGroup;
    }
    
    toString(options?: X12SerializationOptions): string {
        options = options
            ? defaultSerializationOptions(options)
            : this.options;
        
        let edi = this.header.toString(options);
        
        if (options.format) {
            edi += options.endOfLine;
        }
        
        for (let i = 0; i < this.functionalGroups.length; i++) {
            edi += this.functionalGroups[i].toString(options);
            
            if (options.format) {
                edi += options.endOfLine;
            }
        }
        
        edi += this.trailer.toString(options);
        
        return edi;
    }

    toJSON() {
        const jsen = new JSEDINotation(this.header.elements.map(x => x.value), this.options);

        this.functionalGroups.forEach((functionalGroup) => {
            const jsenFunctionalGroup = jsen.addFunctionalGroup(functionalGroup.header.elements.map(x => x.value));

            functionalGroup.transactions.forEach((transaction) => {
                const jsenTransaction = jsenFunctionalGroup.addTransaction(transaction.header.elements.map(x => x.value));

                transaction.segments.forEach((segment) => {
                    jsenTransaction.addSegment(segment.tag, segment.elements.map(x => x.value));
                });
            });
        });

        return jsen;
    }

    private _setTrailer(options?: X12SerializationOptions) {
        options = options
            ? defaultSerializationOptions(options)
            : this.options;

        this.trailer = new X12Segment(X12SupportedSegments.IEA, options);

        this.trailer.setElements([`${this.functionalGroups.length}`, this.header.valueOf(13)]);
    }
    
    private _padRight(input: string, width: number): string {
        while (input.length < width) {
            input += ' ';
        }
        
        return input.substr(0, width);
    }
}