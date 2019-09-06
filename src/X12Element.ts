'use strict';

import { Range } from './Positioning';
import { X12Segment } from './X12Segment';

export class X12Element {
    constructor(value: string = '') {
        this.range = new Range();
        this.value = value;
    }
    
    range: Range;
    value: string;
}