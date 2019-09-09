'use strict';

import { JSEDISegment } from './JSEDINotation';
import { Range } from './Positioning';
import { X12Element } from './X12Element';
import {
    X12SupportedSegments,
    X12InterchangeControlHeader,
    X12FunctionalGroupHeader,
    X12TransactionSetHeader
} from './X12Enumerables';
import {
    defaultSerializationOptions,
    X12SerializationOptions
} from './X12SerializationOptions';
import { GeneratorError } from './Errors';

export class X12Segment {
    constructor(tag: string = '', options?: X12SerializationOptions) {
        this.tag = tag;
        this.elements = new Array<X12Element>();
        this.range = new Range();
        this.options = defaultSerializationOptions(options);
    }
    
    tag: string;
    elements: X12Element[];
    range: Range;
    options: X12SerializationOptions;

    setElements(values: string[]) {
        this._formatValues(values)
        this.elements = new Array<X12Element>();
        values.forEach((value) => {
            this.elements.push(new X12Element(value))
        })
    }

    addElement(value: string = ''): X12Element {
        const element = new X12Element(value);

        this.elements.push(element);

        return element;
    }

    replaceElement(value: string, segmentPosition: number): X12Element {
        let index = segmentPosition - 1;

        if (this.elements.length <= index) {
            return null;
        } else {
            this.elements[index] = new X12Element(value);
        }
        
        return this.elements[index];
    }

    insertElement(value: string = '', segmentPosition: number = 1): boolean {
        let index = segmentPosition - 1;

        if (this.elements.length <= index) {
            return null;
        }
        
        return this.elements.splice(index, 0, new X12Element(value)).length === 1;
    }

    removeElement(segmentPosition: number): boolean {
        let index = segmentPosition - 1;

        if (this.elements.length <= index) {
            return null;
        }
        
        return this.elements.splice(index, 1).length === 1;
    }
    
    valueOf(segmentPosition: number, defaultValue?: string): string {
        let index = segmentPosition - 1;
        
        if (this.elements.length <= index) {
            return defaultValue || null;
        }
        
        return this.elements[index].value || defaultValue || null;
    }

    toString(options?: X12SerializationOptions): string {
        options = options
            ? defaultSerializationOptions(options)
            : this.options;
        
        let edi = this.tag;
        
        for (let i = 0; i < this.elements.length; i++) {
            edi += options.elementDelimiter;
            edi += this.elements[i].value;
        }
        
        edi += options.segmentTerminator;
        
        return edi;
    }

    toJSON() {
        return new JSEDISegment(this.tag, this.elements.map(x => x.value));
    }

    private _checkSupportedSegment() {
        let supported = false;

        switch(this.tag) {
            case X12SupportedSegments.ISA:
                supported = true;
                break;
            case X12SupportedSegments.GS:
                supported = true;
                break;
            case X12SupportedSegments.ST:
                supported = true;
                break;
        }

        return supported;
    }

    private _getX12Enumerable() {
        let enumerable = X12InterchangeControlHeader;

        switch(this.tag) {
            case X12SupportedSegments.ISA:
                enumerable = X12InterchangeControlHeader;
                break;
            case X12SupportedSegments.GS:
                enumerable = X12FunctionalGroupHeader;
                break;
            case X12SupportedSegments.ST:
                enumerable = X12TransactionSetHeader;
                break;
        }

        return enumerable;
    }

    private _formatValues(values: string[]) {
        if (this._checkSupportedSegment()) {
            const enumerable = this._getX12Enumerable();

            if (this.tag === X12SupportedSegments.ISA && this.options.subElementDelimiter.length === 1) {
                values[15] = this.options.subElementDelimiter;
            }

            if (values.length === enumerable.COUNT) {
                for (let i = 0; i < values.length; i++) {
                    const name = `${this.tag}${String.prototype.padStart.call(i + 1, 2, '0')}`;
                    const max = enumerable[name];
                    const min = enumerable[`${name}_MIN`] || 0;

                    if (values[i].length > max && values[i].length !== 0) {
                        throw new GeneratorError(`Segment element "${name}" with value of "${values[i]}" exceeds maximum of ${max} characters.`);
                    }

                    if (values[i].length < min && values[i].length !== 0) {
                        throw new GeneratorError(`Segment element "${name}" with value of "${values[i]}" does not meet minimum of ${min} characters.`);
                    }

                    if (enumerable.PADDING && ((values[i].length < max && values[i].length > min) || values[i].length === 0)) {
                        values[i] = String.prototype.padEnd.call(values[i], max, ' ');
                    }
                }
            } else {
                throw new GeneratorError(`Segment "${this.tag}" with ${values.length} elements does meet the required count of ${enumerable.COUNT}.`);
            }
        }
    }
}