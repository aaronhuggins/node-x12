'use strict';

import { QuerySyntaxError } from './Errors';
import { X12Parser } from './X12Parser';
import { X12Interchange } from './X12Interchange';
import { X12FunctionalGroup } from './X12FunctionalGroup';
import { X12Transaction } from './X12Transaction';
import { X12Segment } from './X12Segment';
import { X12Element } from './X12Element';

export class X12QueryEngine {
    constructor(parser: X12Parser | boolean = true) {
        this._parser = typeof parser === 'boolean'
            ? new X12Parser(parser)
            : parser;
    }

    private _parser: X12Parser

    private _forEachPattern: RegExp = /FOREACH\([A-Z0-9]{2,3}\)=>.+/g;
    
    query(rawEdi: string | X12Interchange, reference: string): X12QueryResult[] {
        let interchange = typeof rawEdi === 'string'
            ? this._parser.parse(rawEdi)
            : rawEdi;
        
        let forEachMatch = reference.match(this._forEachPattern); // ex. FOREACH(LX)=>MAN02

        if(forEachMatch) {
            reference = this._evaluateForEachQueryPart(forEachMatch[0]);
        }

        let hlPathMatch = reference.match(/HL\+(\w\+?)+[\+-]/g); // ex. HL+O+P+I
        let segPathMatch = reference.match(/([A-Z0-9]{2,3}-)+/g); // ex. PO1-N9-
        let elmRefMatch = reference.match(/[A-Z0-9]{2,3}[0-9]{2}[^\[]?/g); // ex. REF02; need to remove trailing ":" if exists
        let qualMatch = reference.match(/:[A-Z0-9]{2,3}[0-9]{2,}\[[\"\'][^\[\]\"\"\'\']+[\"\']\]/g); // ex. :REF01["PO"]
        
        let results = new Array<X12QueryResult>();
        
        for (let i = 0; i < interchange.functionalGroups.length; i++) {
            let group = interchange.functionalGroups[i];
            
            for (let j = 0; j < group.transactions.length; j++) {
                let txn = group.transactions[j];
                let segments = txn.segments;

                if (hlPathMatch) {
                    segments = this._evaluateHLQueryPart(txn, hlPathMatch[0]);
                }
                
                if (segPathMatch) {
                    segments = this._evaluateSegmentPathQueryPart(segments, segPathMatch[0]);
                }
                
                if (!elmRefMatch) {
                    throw new QuerySyntaxError('Element reference queries must contain an element reference!');
                }
                
                let txnResults = this._evaluateElementReferenceQueryPart(interchange, group, txn, [].concat(segments, [interchange.header, group.header, txn.header, txn.trailer, group.trailer, interchange.trailer]), elmRefMatch[0], qualMatch);
                
                txnResults.forEach((res) => {
                    results.push(res);
                });
            }
        }
        
        return results;
    }
    
    querySingle(rawEdi: string | X12Interchange, reference: string): X12QueryResult {
        let results = this.query(rawEdi, reference);

        if (reference.match(this._forEachPattern)) {
            const values = results.map((result) => result.value);

            if (values.length !== 0) {
                results[0].value = null;
                results[0].values = values;
            }
        }

        return (results.length == 0) ? null : results[0];
    }

    private _evaluateForEachQueryPart(forEachSegment: string): string {
        const forEachPart = forEachSegment.substr(0, forEachSegment.indexOf('=>'));
        const queryPart = forEachSegment.substr(forEachSegment.indexOf('=>') + 2);
        const selectedPath = forEachPart.substr(forEachPart.indexOf('(') + 1, forEachPart.length - forEachPart.indexOf('(') - 2);
        
        return `${selectedPath}-${queryPart}`;
    }
    
    private _evaluateHLQueryPart(transaction: X12Transaction, hlPath: string): X12Segment[] {
        let qualified = false;
        let pathParts = hlPath.replace('-', '').split('+').filter((value, index, array) => { return (value !== 'HL' && value !== '' && value !== null); })
        let matches = new Array<X12Segment>();

        let lastParentIndex = -1;

        for (let i = 0, j = 0; i < transaction.segments.length; i++) {
            let segment = transaction.segments[i];

            if (qualified && segment.tag === 'HL') {
                let parentIndex = parseInt(segment.valueOf(2, '-1'));
                
                if (parentIndex !== lastParentIndex) {
                    j = 0;
                    qualified = false;
                }
            }
            
            if (!qualified && transaction.segments[i].tag === 'HL' && transaction.segments[i].valueOf(3) == pathParts[j]) {
                lastParentIndex = parseInt(segment.valueOf(2, '-1'));
                j++;
                
                if (j == pathParts.length) {
                    qualified = true;
                }
            }
            
            if (qualified) {
                matches.push(transaction.segments[i]);
            }
        }
        
        return matches;
    }
    
    private _evaluateSegmentPathQueryPart(segments: X12Segment[], segmentPath: string): X12Segment[] {
        let qualified = false;
        let pathParts = segmentPath.split('-').filter((value, index, array) => { return !!value; });
        let matches = new Array<X12Segment>();

        for (let i = 0, j = 0; i < segments.length; i++) {
            if (qualified && (segments[i].tag == 'HL' || pathParts.indexOf(segments[i].tag) > -1)) {
                j = 0;
                qualified = false;
            }
            
            if (!qualified && segments[i].tag == pathParts[j]) {
                j++;
                
                if (j == pathParts.length) {
                    qualified = true;
                }
            }
            
            if (qualified) {
                matches.push(segments[i]);
            }
        }

        return matches;
    }
    
    private _evaluateElementReferenceQueryPart(interchange: X12Interchange, functionalGroup: X12FunctionalGroup, transaction: X12Transaction, segments: X12Segment[], elementReference: string, qualifiers: string[]): X12QueryResult[] {
        let reference = elementReference.replace(':', '');
        let tag = reference.substr(0, reference.length - 2);
        let pos = reference.substr(reference.length - 2, 2);
        let posint = parseInt(pos);
        
        let results = new Array<X12QueryResult>();
        
        for (let i = 0; i < segments.length; i++) {
            let segment = segments[i];
            
            if (!segment) {
                continue;
            }

            if (segment.tag !== tag) {
                continue;
            }
            
            let value = segment.valueOf(posint, null);
            
            if (value && this._testQualifiers(transaction, segment, qualifiers)) {
                results.push(new X12QueryResult(interchange, functionalGroup, transaction, segment, segment.elements[posint - 1]));
            }
        }
        
        return results;
    }
    
    private _testQualifiers(transaction: X12Transaction, segment: X12Segment, qualifiers: string[]): boolean {
        if (!qualifiers) {
            return true;
        }
        
        for (let i = 0 ; i < qualifiers.length; i++) {
            let qualifier = qualifiers[i].substr(1);
            let elementReference = qualifier.substring(0, qualifier.indexOf('['));
            let elementValue = qualifier.substring(qualifier.indexOf('[') + 2, qualifier.lastIndexOf(']') - 1);
            let tag = elementReference.substr(0, elementReference.length - 2);
            let pos = elementReference.substr(elementReference.length - 2, 2);
            let posint = parseInt(pos);

            for (let j = transaction.segments.indexOf(segment); j > -1; j--) {
                let seg = transaction.segments[j];
                let value = seg.valueOf(posint);
                
                if (seg.tag === tag && seg.tag === segment.tag && value !== elementValue) {
                    return false;
                }
                
                else if (seg.tag === tag && value === elementValue) {
                    break;
                }
                
                if (j == 0) {
                    return false;
                }
            }
        }

        return true;
    }
}

export class X12QueryResult {
    constructor(interchange?: X12Interchange, functionalGroup?: X12FunctionalGroup, transaction?: X12Transaction, segment?: X12Segment, element?: X12Element) {
        this.interchange = interchange;
        this.functionalGroup = functionalGroup;
        this.transaction = transaction;
        this.segment = segment;
        this.element = element;
        this.value = element.value;
        this.values = new Array<string | string[]>();
    }
    
    interchange: X12Interchange;
    functionalGroup: X12FunctionalGroup;
    transaction: X12Transaction;
    segment: X12Segment;
    element: X12Element;
    value: string;
    values: Array<string | string[]>;
}