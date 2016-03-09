'use strict';

import { Range } from './Positioning';

export class X12Diagnostic {
    constructor(level?: X12DiagnosticLevel, message?: string, range?: Range) {
        this.level = level || X12DiagnosticLevel.Error;
        this.message = message || '';
        this.range = range;
    }
    
    level: X12DiagnosticLevel;
    message: string;
    range: Range;
}

export enum X12DiagnosticLevel {
    Info = 0,
    Warning = 1,
    Error = 2
}