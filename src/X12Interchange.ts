'use strict';

import { Range } from './Positioning';
import { X12FunctionalGroup } from './X12FunctionalGroup';

export class X12Interchange {
    constructor(segmentTerminator: string, elementDelimiter: string) {
        this.functionalGroups = new Array<X12FunctionalGroup>();
        this.segmentTerminator = segmentTerminator;
        this.elementDelimiter = elementDelimiter;
        this.headerRange = new Range();
        this.trailerRange = new Range();
    }
    
    authorizationInfoQualifier: string;
    authorizationInfo: string;
    securityInfoQualifier: string;
    securityInfo: string;
    senderQualifier: string;
	senderId: string;
	receiverQualifier: string;
	receiverId: string;
	controlVersionNumber: string;
	controlNumber: string;
    interchangeDate: string;
    interchangeTime: string;
    repetitionSeparator: string;
    acknowledgementRequested: boolean;
    usageIndicator: string;
    componentElementSeparator: string;
    
    functionalGroups: X12FunctionalGroup[];
    
    segmentTerminator: string;
    elementDelimiter: string;
    
    headerRange: Range;
    trailerRange: Range;
    
    toString(format?: boolean, endOfLine?: string): string {
        endOfLine = endOfLine || '\n';
        
        if (this.segmentTerminator === '\n') {
            endOfLine = '';
        }
        
        let edi = 'ISA';
        edi += this.elementDelimiter;
        edi += this._padRight(this.authorizationInfoQualifier, 2);
        edi += this.elementDelimiter;
        edi += this._padRight(this.authorizationInfo, 10);
        edi += this.elementDelimiter;
        edi += this._padRight(this.securityInfoQualifier, 2);
        edi += this.elementDelimiter;
        edi += this._padRight(this.securityInfo, 10);
        edi += this.elementDelimiter;
        edi += this._padRight(this.senderQualifier, 2);
        edi += this.elementDelimiter;
        edi += this._padRight(this.senderId, 15);
        edi += this.elementDelimiter;
        edi += this._padRight(this.receiverQualifier, 2);
        edi += this.elementDelimiter;
        edi += this._padRight(this.receiverId, 15);
        edi += this.elementDelimiter;
        edi += this._padRight(this.interchangeDate, 6);
        edi += this.elementDelimiter;
        edi += this._padRight(this.interchangeTime, 4);
        edi += this.elementDelimiter;
        edi += this._padRight(this.repetitionSeparator, 1);
        edi += this.elementDelimiter;
        edi += this._padRight(this.controlVersionNumber, 5);
        edi += this.elementDelimiter;
        edi += this._padRight(this.controlNumber, 9);
        edi += this.elementDelimiter;
        edi += this._padRight(this.acknowledgementRequested ? '1' : '0', 1);
        edi += this.elementDelimiter;
        edi += this._padRight(this.usageIndicator, 1);
        edi += this.elementDelimiter;
        edi += this._padRight(this.componentElementSeparator, 1);
        edi += this.segmentTerminator;
        
        if (format) {
            edi += endOfLine;
        }
        
        for (let i = 0; i < this.functionalGroups.length; i++) {
            let group = this.functionalGroups[i];
            
            edi += 'GS';
            edi += this.elementDelimiter;
            edi += group.functionalIdentifierCode;
            edi += this.elementDelimiter;
            edi += group.senderCode;
            edi += this.elementDelimiter;
            edi += group.receiverCode;
            edi += this.elementDelimiter;
            edi += group.date;
            edi += this.elementDelimiter;
            edi += group.time;
            edi += this.elementDelimiter;
            edi += group.controlNumber;
            edi += this.elementDelimiter;
            edi += group.agencyCode;
            edi += this.elementDelimiter;
            edi += group.version;
            edi += this.segmentTerminator;
            
            if (format) {
                edi += endOfLine;
            }
            
            for (let j = 0; j < group.transactions.length; j++) {
                let transaction = group.transactions[i];
                
                edi += 'ST';
                edi += this.elementDelimiter;
                edi += transaction.transactionSet;
                edi += this.elementDelimiter;
                edi += transaction.controlNumber;
                
                if (transaction.conventionReference) {
                    edi += this.elementDelimiter;
                    edi += transaction.conventionReference;
                }
                
                edi += this.segmentTerminator;
                
                if (format) {
                    edi += endOfLine;
                }
                
                for (let k = 0; k < transaction.segments.length; k++) {
                    let segment = transaction.segments[k];
                    
                    edi += segment.tag;
                    
                    for (let l = 0; l < segment.elements.length; l++) {
                        let element = segment.elements[l];
                        
                        edi += this.elementDelimiter;
                        edi += element.value;
                    }
                    
                    edi += this.segmentTerminator;
                    
                    if (format) {
                        edi += endOfLine;
                    }
                }
                
                edi += 'SE';
                edi += this.elementDelimiter;
                edi += transaction.segments.length + 2;
                edi += this.elementDelimiter;
                edi += transaction.controlNumber;
                edi += this.segmentTerminator;
                
                if (format) {
                    edi += endOfLine;
                }
            }
            
            edi += 'GE';
            edi += this.elementDelimiter;
            edi += group.transactions.length;
            edi += this.elementDelimiter;
            edi += group.controlNumber;
            edi += this.segmentTerminator;
            
            if (format) {
                edi += endOfLine;
            }
        }
        
        edi += 'IEA';
        edi += this.elementDelimiter;
        edi += this.functionalGroups.length;
        edi += this.elementDelimiter;
        edi += this.controlNumber;
        edi += this.segmentTerminator;
        
        return edi;
    }
    
    private _padRight(input: string, width: number): string {
        while (input.length < width) {
            input += ' ';
        }
        
        return input.substr(0, width);
    }
}