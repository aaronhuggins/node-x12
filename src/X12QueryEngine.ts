'use strict';

import { QuerySyntaxError } from './Errors';
import { X12Parser } from './X12Parser';
import { X12Interchange } from './X12Interchange';
import { X12FunctionalGroup } from './X12FunctionalGroup';
import { X12Transaction } from './X12Transaction';
import { X12Segment } from './X12Segment';
import { X12Element } from './X12Element';

export class X12QueryEngine {
    constructor(private _parser: X12Parser) { }
    
    query(rawEdi: string, reference: string): X12Element[] {
        let interchange = this._parser.parseX12(rawEdi);
        
        let hlPathMatch = reference.match(/HL\+(\w\+?)+/g); // ex. HL+O+P+I
        let segPathMatch = reference.match(/([A-Z0-9]{2,3}-)+/g); // ex. PO1-N9-
        let elmRefMatch = reference.match(/[A-Z0-9]{2,3}[0-9]{2}[^\[]/g); // ex. REF02; need to remove trailing ":" if exists
        let qualMatch = reference.match(/(:[A-Z0-9]{2,3}[0-9]{2}\[".*"\])+/g); // ex. :REF01["PO"]
        
        let segments = this._getSegmentsForInterchange(interchange);
        
        if (hlPathMatch !== null) {
            segments = this._filterSegmentsbyHL(segments, hlPathMatch[0]);
        }
        
        if (segPathMatch !== null) {
            segments = this._filterSegmentsByPath(segments, segPathMatch[0]);
        }
        
        if (elmRefMatch == null) {
            throw new QuerySyntaxError('Element reference queries must contain an element reference!');
        }
        
        let elements = this._getReferencedElements(segments, elmRefMatch[0]);
        
        if (qualMatch !== null) {
            elements = this._filterElementsByQualifiers(elements, qualMatch[0]);
        }
        
        return elements;
    }
    
    querySingle(rawEdi: string, reference: string): X12Element {
        let results = this.query(rawEdi, reference);
        return (results.length == 0) ? null : results[0];
    }
    
    private _getSegmentsForInterchange(interchange: X12Interchange): X12Segment[] {
        let segments = new Array<X12Segment>();
        
        for (let iGrp = 0; iGrp < interchange.functionalGroups.length; iGrp++) {
            let group = interchange.functionalGroups[iGrp];
            
            for (let iTxn = 0; iTxn < group.transactions.length; iTxn++) {
                let transaction = group.transactions[iTxn];
                
                for (let iSeg = 0; iSeg < transaction.segments.length; iSeg++) {
                    segments.push(transaction.segments[iSeg]);
                }
            }
        }
        
        return segments;
    }
    
    private _filterSegmentsbyHL(segments: X12Segment[], path: string): X12Segment[] {
        let filteredSegments = new Array<X12Segment>();
        
        for (let i = 0; i < segments.length; i++) {
            if (this._testAncestorsForHL(segments[i], path)) {
                filteredSegments.push(segments[i]);
            }
        }
        
        return filteredSegments;
    }
    
    private _testAncestorsForHL(segment: X12Segment, path: string): boolean {
        if (!segment.transaction) {
            return false;
        }
        
        let flag = false;
        let pathParts = path.split('+');
        pathParts.splice(0, 1);
        pathParts.reverse();
        
        for (let i = (segment.transaction.segments.indexOf(segment) - 1), j = 0; i > -1; i--) {
            let seg = segment.transaction.segments[i];
            
            if (seg.tag == 'HL' && seg.valueOf(1) == pathParts[j]) {
                j++;
                
                if (j == pathParts.length) {
                    flag = true;
                    break;
                }
            }
        }
        
        return flag;
    }
    
    private _filterSegmentsByPath(segments: X12Segment[], path: string): X12Segment[] {
        let filteredSegments = new Array<X12Segment>();
        
        for (let i = 0; i < segments.length; i++) {
            if (this._testAncestorsForPath(segments[i], path)) {
                filteredSegments.push(segments[i]);
            }
        }
        
        return filteredSegments;
    }
    
    private _testAncestorsForPath(segment: X12Segment, path: string): boolean {
        if (!segment.transaction) {
            return false;
        }
        
        let flag = false;
        let pathParts = path.split('-');
        pathParts.reverse();
        pathParts = pathParts.filter((value, index, array) => {
           return (value !== ''); 
        });
        
        for (let i = (segment.transaction.segments.indexOf(segment) - 1), j = 0; i > -1; i--) {
            let seg = segment.transaction.segments[i];
            
            if (seg.tag == pathParts[j]) {
                j++;
                
                if (j == pathParts.length) {
                    flag = true;
                    break;
                }
            }
            
            else {
                break;
            }
        }
        
        return flag;
    }
    
    private _getReferencedElements(segments: X12Segment[], elementReference: string): X12Element[] {
        let elements = new Array<X12Element>();
        
        if (elementReference.indexOf(':') > -1) {
            elementReference = elementReference.replace(':', '');
        }
        
        for (let i = 0; i < segments.length; i++) {
            let segment = segments[i];
            
            let tagMatch = elementReference.match(/[A-Z0-9]{2,3}(?=\d{2})/g);
            let elmPosition = parseInt(elementReference.substr(elementReference.length - 2, 2));
            
            if (segment.tag !== tagMatch[0]) {
                continue;
            }
            
            if (segment.elements.length >= elmPosition) {
                elements.push(segment.elements[elmPosition - 1]);
            }
        }
        
        return elements;
    }
    
    private _filterElementsByQualifiers(elements: X12Element[], qualifiers: string): X12Element[] {
        let filteredElements = new Array<X12Element>();
        
        let qualParts = qualifiers.split(':');
        qualParts = qualParts.filter((value, index, array) => {
            return (value !== '');
        });
        
        for (let i = 0; i < elements.length; i++) {
            let flag = false;
            
            for (let j = 0; j < qualParts.length; j++) {
                let tagMatch = qualParts[j].match(/[A-Z0-9]{2,3}(?=\d{2})/g);
                let elmPosition = parseInt(qualParts[j].substr(qualParts[j].indexOf('[') - 2, 2));
                let qualValue = qualParts[j].match(/".*"/g)[0];
                qualValue = qualValue.replace('"', '');
                
                let element: X12Element = null;
            
                for (let s = elements[i].segment.transaction.segments.indexOf(elements[i].segment); s >= 0; s--) {
                    if (elements[i].segment.transaction.segments[s].tag == tagMatch[0]) {
                        if (elmPosition <= elements[i].segment.transaction.segments[s].elements.length) {
                            if (elements[i].segment.transaction.segments[s].valueOf(elmPosition) == '') {
                                element = elements[i].segment.transaction.segments[s].elements[elmPosition - 1];
                            }
                        }
                    }
                }
                
                if (element) {
                    flag = true;
                }
                
                else {
                    flag = false;
                    break;
                }
            }
            
            if (flag) {
                filteredElements.push(elements[i]);
            }
        }
        
        return filteredElements;
    }
}