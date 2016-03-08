'use strict';

import { Range } from './Positioning';

export class X12Element {
    constructor() {
        this.range = new Range();
        this.value = '';
    }
    
    range: Range;
    value: string;
}