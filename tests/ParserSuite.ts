'use strict';

import * as mocha from 'mocha';
import { X12Parser, X12Interchange } from '../core';

let fs = require('fs');

describe('X12Parser', () => {
    
    it('should parse a valid X12 document without throwing an error', () => {
        let edi = fs.readFileSync('tests/test-data/850.edi', 'utf8');
        let parser = new X12Parser(true);
        parser.parseX12(edi);
    });
    
});