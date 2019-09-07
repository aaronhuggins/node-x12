'use strict';

import { ArrayEDINotation } from './ArrayEDINotation';
import { JSEDINotation } from './JSEDINotation';
import { Range } from './Positioning';
import { X12Interchange } from './X12Interchange';

export class X12Generator {
    constructor(jsen?: JSEDINotation | ArrayEDINotation) {
        this.jsen = jsen;
    }
    
    jsen: JSEDINotation | ArrayEDINotation;
}