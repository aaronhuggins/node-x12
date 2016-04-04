'use strict';

import * as mocha from 'mocha';
import { X12Parser, X12QueryEngine, X12Interchange } from '../core';

let fs = require('fs');

describe('X12QueryEngine', () => {
    
    it('should handle basic element references', () => {
        let edi = fs.readFileSync('tests/test-data/850.edi', 'utf8');
        let parser = new X12Parser(true);
        let engine = new X12QueryEngine(parser);
        let results = engine.query(edi, 'REF02');
        
        if (results.length !== 2) {
            throw new Error('Expected two matching elements for REF02.');
        }
    });
    
    it('should handle qualified element references', () => {
        let edi = fs.readFileSync('tests/test-data/850.edi', 'utf8');
        let parser = new X12Parser(true);
        let engine = new X12QueryEngine(parser);
        let results = engine.query(edi, 'REF02:REF01["DP"]');
        
        if (results.length !== 1) {
            throw new Error('Expected one matching element for REF02:REF01["DP"].');
        }
        
        else if (results[0].element.value !== '038') {
            throw new Error('Expected REF02 to be "038".')
        }
    });
    
    
    it('should handle segment path element references', () => {
        let edi = fs.readFileSync('tests/test-data/850.edi', 'utf8');
        let parser = new X12Parser(true);
        let engine = new X12QueryEngine(parser);
        let results = engine.query(edi, 'PO1-PID05:PID01["F"]');
        
        if (results.length !== 6) {
            throw new Error('Expected six matching elements for PO1-PID05:PID01["F"].');
        }
    });
    
    it('should handle HL path element references', () => {
        let edi = fs.readFileSync('tests/test-data/856.edi', 'utf8');
        let parser = new X12Parser(true);
        let engine = new X12QueryEngine(parser);
        let results = engine.query(edi, 'HL+S+O+I-LIN03');
        
        if (results.length !== 2) {
            throw new Error('Expected two matching elements for HL+S+O+I-LIN03.');
        }
    });
    
    it('should return valid range information for segments and elements', () => {
        let edi = fs.readFileSync('tests/test-data/850.edi', 'utf8');
        let parser = new X12Parser(true);
        let engine = new X12QueryEngine(parser);
        let result = engine.querySingle(edi, 'BEG03');
        
        if (result.segment.range.start.line !== 3) {
            throw new Error(`Start line for segment is incorrect; found ${result.segment.range.start.line}, expected 3.`);
        }
        
        if (result.segment.range.start.character !== 0) {
            throw new Error(`Start char for segment is incorrect; found ${result.segment.range.start.character}, expected 0.`);
        }
        
        if (result.element.range.start.line !== 3) {
            throw new Error(`Start line for element is incorrect; found ${result.element.range.start.line}, expected 3.`);
        }
        
        if (result.element.range.start.character !== 10) {
            throw new Error(`Start char for element is incorrect; found ${result.element.range.start.character}, expected 10.`);
        }
        
        if (result.segment.range.end.line !== 3) {
            throw new Error(`End line for segment is incorrect; found ${result.segment.range.start.line}, expected 3.`);
        }
        
        if (result.segment.range.end.character !== 41) {
            throw new Error(`End char for segment is incorrect; found ${result.segment.range.start.character}, expected 41.`);
        }
        
        if (result.element.range.end.line !== 3) {
            throw new Error(`End line for element is incorrect; found ${result.element.range.start.line}, expected 3.`);
        }
        
        if (result.element.range.end.character !== 20) {
            throw new Error(`End char for element is incorrect; found ${result.element.range.start.character}, expected 20.`);
        }
    });
});