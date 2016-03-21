'use strict';

import { ArgumentNullError, ParserError } from './Errors';
import { Range, Position } from './Positioning';
import { X12Diagnostic, X12DiagnosticLevel } from './X12Diagnostic';
import { X12Interchange } from './X12Interchange';
import { X12FunctionalGroup } from './X12FunctionalGroup';
import { X12Transaction } from './X12Transaction';
import { X12Segment } from './X12Segment';
import { X12Element } from './X12Element';

const DOCUMENT_MIN_LENGTH: number = 113; // ISA = 106, IEA > 7
const SEGMENT_TERMINATOR_POS: number = 105;
const ELEMENT_DELIMITER_POS: number = 3;
const INTERCHANGE_CACHE_SIZE: number = 10;

export class X12Parser {
    constructor(private _strict: boolean) {
        this.diagnostics = new Array<X12Diagnostic>();
    }
    
    diagnostics: X12Diagnostic[];
    
    parseX12(edi: string): X12Interchange {
        if (!edi) {
            throw new ArgumentNullError('edi');
        }
        
        this.diagnostics.splice(0);
        edi = edi.trim();
        
        if (edi.length < DOCUMENT_MIN_LENGTH) {
            let errorMessage = `X12 Standard: Document is too short. Document must be at least ${DOCUMENT_MIN_LENGTH} characters long to be well-formed X12.`;
            
            if (this._strict) {
                throw new ParserError(errorMessage);
            }
            
            this.diagnostics.push(new X12Diagnostic(X12DiagnosticLevel.Error, errorMessage, new Range(0, 0, 0, edi.length - 1)));
        }
        
        let segmentTerminator = edi.charAt(SEGMENT_TERMINATOR_POS);
        let elementDelimiter = edi.charAt(ELEMENT_DELIMITER_POS);
        
        if (edi.charAt(103) !== elementDelimiter) {
            let errorMessage = 'X12 Standard: The ISA segment is not the correct length (106 characters, including segment terminator).';
            
            if (this._strict) {
                throw new ParserError(errorMessage);
            }
            
            this.diagnostics.push(new X12Diagnostic(X12DiagnosticLevel.Error, errorMessage, new Range(0, 0, 0, 2)));
        }
        
        let interchange = new X12Interchange(segmentTerminator, elementDelimiter);
        let group: X12FunctionalGroup;
        let transaction: X12Transaction;
        
        let segments = this._parseSegments(edi, segmentTerminator, elementDelimiter);
        
        segments.forEach((seg) => {
            if (seg.tag == 'ISA') {
                this._processISA(interchange, seg);
            }
            
            else if (seg.tag == 'IEA') {
                this._processIEA(interchange, seg);
            }
            
            else if (seg.tag == 'GS') {
                group = new X12FunctionalGroup();
                
                this._processGS(group, seg);
                interchange.functionalGroups.push(group);
            }
            
            else if (seg.tag == 'GE') {
                if (!group) {
                    let errorMessage = 'X12 Standard: Missing GS segment!';
                    
                    if (this._strict) {
                        throw new ParserError(errorMessage);
                    }
                    
                    this.diagnostics.push(new X12Diagnostic(X12DiagnosticLevel.Error, errorMessage, seg.range));
                }
                
                this._processGE(group, seg);
                group = null;
            }
            
            else if (seg.tag == 'ST') {
                if (!group) {
                    let errorMessage = `X12 Standard: ${seg.tag} segment cannot appear outside of a functional group.`;
                    
                    if (this._strict) {
                        throw new ParserError(errorMessage);
                    }
                    
                    this.diagnostics.push(new X12Diagnostic(X12DiagnosticLevel.Error, errorMessage, seg.range));
                }
                
                transaction = new X12Transaction();
                
                this._processST(transaction, seg);
                group.transactions.push(transaction);
            }
            
            else if (seg.tag == 'SE') {
                if (!group) {
                    let errorMessage = `X12 Standard: ${seg.tag} segment cannot appear outside of a functional group.`;
                    
                    if (this._strict) {
                        throw new ParserError(errorMessage);
                    }
                    
                    this.diagnostics.push(new X12Diagnostic(X12DiagnosticLevel.Error, errorMessage, seg.range));
                }
                
                if (!transaction) {
                    let errorMessage = 'X12 Standard: Missing ST segment!';
                    
                    if (this._strict) {
                        throw new ParserError(errorMessage);
                    }
                    
                    this.diagnostics.push(new X12Diagnostic(X12DiagnosticLevel.Error, errorMessage, seg.range));
                }
                
                this._processSE(transaction, seg);
                transaction = null;
            }
            
            else {
                if (!group) {
                    let errorMessage = `X12 Standard: ${seg.tag} segment cannot appear outside of a functional group.`;
                    
                    if (this._strict) {
                        throw new ParserError(errorMessage);
                    }
                    
                    this.diagnostics.push(new X12Diagnostic(X12DiagnosticLevel.Error, errorMessage, seg.range));
                }
                
                if (!transaction) {
                    let errorMessage = `X12 Standard: ${seg.tag} segment cannot appear outside of a transaction.`;
                    
                    if (this._strict) {
                        throw new ParserError(errorMessage);
                    }
                    
                    this.diagnostics.push(new X12Diagnostic(X12DiagnosticLevel.Error, errorMessage, seg.range));
                }
                
                else {
                    transaction.segments.push(seg);
                }
            }
        });
        
        return interchange;
    }
    
    private _parseSegments(edi: string, segmentTerminator: string, elementDelimiter: string): X12Segment[] {
        let segments = new Array<X12Segment>();
        
        let tagged = false;
        let currentSegment: X12Segment;
        let currentElement: X12Element;
        
        currentSegment = new X12Segment();
        
        for (let i = 0, l = 0, c = 0; i < edi.length; i++) {
			// segment not yet named and not whitespace or delimiter - begin naming segment
			if (!tagged && (edi[i].search(/\s/) == -1) && (edi[i] !== elementDelimiter) && (edi[i] !== segmentTerminator)) {
				currentSegment.tag += edi[i];
				
                if (!currentSegment.range.start) {
                    currentSegment.range.start = new Position(l, c);
                }
			}
			
			// trailing line breaks - consume them and increment line number
			else if (!tagged && (edi[i].search(/\s/) > -1)) {
				if (edi[i] == '\n') {
					l++;
					c = -1;
				}
			}
			
			// segment tag/name is completed - mark as tagged
			else if (!tagged && (edi[i] == elementDelimiter)) {
				tagged = true;
				
				currentElement = new X12Element();
                currentElement.range.start = new Position(l, c);
			}
			
			// segment terminator
			else if (edi[i] == segmentTerminator) {
                currentElement.range.end = new Position(l, (c - 1));
                currentSegment.elements.push(currentElement);
                currentSegment.range.end = new Position(l, (c - 1));
                
				segments.push(currentSegment);
				
				currentSegment = new X12Segment();
				tagged = false;
			}
			
			// element delimiter
			else if (tagged && (edi[i] == elementDelimiter)) {
                currentElement.range.end = new Position(l, (c - 1));
				currentSegment.elements.push(currentElement);
				
				currentElement = new X12Element();
                currentElement.range.start = new Position(l, c + 1);
			}
			
			// element data
			else {
				currentElement.value += edi[i];
			}
			
			c++;
		}
        
        return segments;
    }
    
    private _processISA(interchange: X12Interchange, segment: X12Segment): void {
        interchange.headerRange.start = segment.range.start;
		interchange.headerRange.end = segment.range.end;
				
		interchange.senderQualifier = segment.valueOf(5).trim();
		interchange.senderId = segment.valueOf(6).trim();
		interchange.receiverQualifier = segment.valueOf(7).trim();
		interchange.receiverId = segment.valueOf(8).trim();
		interchange.controlVersionNumber = segment.valueOf(12).trim();
		interchange.controlNumber = segment.valueOf(13).trim();
    }
    
    private _processIEA(interchange: X12Interchange, segment: X12Segment): void {
        interchange.trailerRange.start = segment.range.start;
		interchange.trailerRange.end = segment.range.end;

		if (parseInt(segment.valueOf(1)) !== interchange.functionalGroups.length) {
			let errorMessage = `X12 Standard: The value in IEA01 (${segment.valueOf(1)}) does not match the number of GS segments in the interchange (${interchange.functionalGroups.length}).`;
			
            if (this._strict) {
                throw new ParserError(errorMessage);
            }
            
            this.diagnostics.push(new X12Diagnostic(X12DiagnosticLevel.Error, errorMessage, segment.elements[0].range));
		}
				
		if (segment.valueOf(2) !== interchange.controlNumber) {
			let errorMessage = `X12 Standard: The value in IEA02 (${segment.valueOf(2)}) does not match the value in ISA13 (${interchange.controlNumber}).`;
			
            if (this._strict) {
                throw new ParserError(errorMessage);
            }
            
            this.diagnostics.push(new X12Diagnostic(X12DiagnosticLevel.Error, errorMessage, segment.elements[1].range));
		}
    }
    
    private _processGS(group: X12FunctionalGroup, segment: X12Segment): void {
        group.headerRange.start = segment.range.start;
		group.headerRange.end = segment.range.end;
				
		group.senderCode = segment.valueOf(2);
		group.receiverCode = segment.valueOf(3);
		group.controlNumber = segment.valueOf(6);
    }
    
    private _processGE(group: X12FunctionalGroup, segment: X12Segment): void {
        group.trailerRange.start = segment.range.start;
		group.trailerRange.end = segment.range.end;
				
		if (parseInt(segment.valueOf(1)) !== group.transactions.length) {
			let errorMessage = `X12 Standard: The value in GE01 (${segment.valueOf(1)}) does not match the number of ST segments in the functional group (${group.transactions.length}).`;
			
            if (this._strict) {
                throw new ParserError(errorMessage);
            }
            
            this.diagnostics.push(new X12Diagnostic(X12DiagnosticLevel.Error, errorMessage, segment.elements[0].range));
		}
				
		if (segment.valueOf(2) !== group.controlNumber) {
			let errorMessage = `X12 Standard: The value in GE02 (${segment.valueOf(2)}) does not match the value in GS06 (${group.controlNumber}).`;
			
            if (this._strict) {
                throw new ParserError(errorMessage);
            }
            
            this.diagnostics.push(new X12Diagnostic(X12DiagnosticLevel.Error, errorMessage, segment.elements[1].range));
		}
    }
    
    private _processST(transaction: X12Transaction, segment: X12Segment): void {
        transaction.headerRange.start = segment.range.start;
		transaction.headerRange.end = segment.range.end;
				
		transaction.transactionSet = segment.valueOf(1);
		transaction.controlNumber = segment.valueOf(2);
    }
    
    private _processSE(transaction: X12Transaction, segment: X12Segment): void {
        transaction.trailerRange.start = segment.range.start;
		transaction.trailerRange.end = segment.range.end;
				
		let expectedNumberOfSegments = (transaction.segments.length + 2);
				
		if (parseInt(segment.valueOf(1)) !== expectedNumberOfSegments) {
			let errorMessage = `X12 Standard: The value in SE01 (${segment.valueOf(1)}) does not match the number of segments in the transaction (${expectedNumberOfSegments}).`;
			
            if (this._strict) {
                throw new ParserError(errorMessage);
            }
            
            this.diagnostics.push(new X12Diagnostic(X12DiagnosticLevel.Error, errorMessage, segment.elements[0].range));
		}
				
		if (segment.valueOf(2) !== transaction.controlNumber) {
			let errorMessage = `X12 Standard: The value in SE02 (${segment.valueOf(2)}) does not match the value in ST02 (${transaction.controlNumber}).`;
			
            if (this._strict) {
                throw new ParserError(errorMessage);
            }
            
            this.diagnostics.push(new X12Diagnostic(X12DiagnosticLevel.Error, errorMessage, segment.elements[1].range));
		}
    }
}