'use strict';

import { Range } from './Positioning';
import { X12Transaction } from './X12Transaction';
import { X12Element } from './X12Element';
import { defaultSerializationOptions, X12SerializationOptions } from './X12SerializationOptions';

export class X12Segment {
    constructor(tag: string = '') {
        this.tag = tag;
        this.elements = new Array<X12Element>();
        this.range = new Range();
    }
    
    tag: string;
    elements: X12Element[];
    range: Range;

    arrayToElements(values: string[]) {
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
    
    toString(options?: X12SerializationOptions): string {
        options = defaultSerializationOptions(options);
        
        let edi = this.tag;
        
        for (let i = 0; i < this.elements.length; i++) {
            edi += options.elementDelimiter;
            edi += this.elements[i].value;
        }
        
        edi += options.segmentTerminator;
        
        return edi;
    }
    
    valueOf(segmentPosition: number, defaultValue?: string): string {
        let index = segmentPosition - 1;
        
        if (this.elements.length <= index) {
            return defaultValue || null;
        }
        
        return this.elements[index].value || defaultValue || null;
    }
}