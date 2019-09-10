'use strict';

import * as mocha from 'mocha';
import { X12Parser, X12Interchange, X12SerializationOptions } from '../core';

let fs = require('fs');

describe('X12Formatting', () => {
    
    it('should replicate the source data unless changes are made', () => {
        let edi = fs.readFileSync('tests/test-data/850.edi', 'utf8');
        let parser = new X12Parser(true);
        let interchange = parser.parse(edi);
        
        let options: X12SerializationOptions = {
            format: true,
            endOfLine: '\n'
        };
        
        let edi2 = interchange.toString(options);
        
        if (edi !== edi2) {
            throw new Error(`Formatted EDI does not match source. Found ${edi2}, expected ${edi}.`);
        }
    });
    
});