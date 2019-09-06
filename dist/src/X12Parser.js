'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const Errors_1 = require("./Errors");
const Positioning_1 = require("./Positioning");
const X12Diagnostic_1 = require("./X12Diagnostic");
const X12Interchange_1 = require("./X12Interchange");
const X12FunctionalGroup_1 = require("./X12FunctionalGroup");
const X12Transaction_1 = require("./X12Transaction");
const X12Segment_1 = require("./X12Segment");
const X12Element_1 = require("./X12Element");
const DOCUMENT_MIN_LENGTH = 113;
const SEGMENT_TERMINATOR_POS = 105;
const ELEMENT_DELIMITER_POS = 3;
const INTERCHANGE_CACHE_SIZE = 10;
class X12Parser {
    constructor(_strict) {
        this._strict = _strict;
        this.diagnostics = new Array();
    }
    parseX12(edi) {
        if (!edi) {
            throw new Errors_1.ArgumentNullError('edi');
        }
        this.diagnostics.splice(0);
        if (edi.length < DOCUMENT_MIN_LENGTH) {
            let errorMessage = `X12 Standard: Document is too short. Document must be at least ${DOCUMENT_MIN_LENGTH} characters long to be well-formed X12.`;
            if (this._strict) {
                throw new Errors_1.ParserError(errorMessage);
            }
            this.diagnostics.push(new X12Diagnostic_1.X12Diagnostic(X12Diagnostic_1.X12DiagnosticLevel.Error, errorMessage, new Positioning_1.Range(0, 0, 0, edi.length - 1)));
        }
        let segmentTerminator = edi.charAt(SEGMENT_TERMINATOR_POS);
        let elementDelimiter = edi.charAt(ELEMENT_DELIMITER_POS);
        if (edi.charAt(103) !== elementDelimiter) {
            let errorMessage = 'X12 Standard: The ISA segment is not the correct length (106 characters, including segment terminator).';
            if (this._strict) {
                throw new Errors_1.ParserError(errorMessage);
            }
            this.diagnostics.push(new X12Diagnostic_1.X12Diagnostic(X12Diagnostic_1.X12DiagnosticLevel.Error, errorMessage, new Positioning_1.Range(0, 0, 0, 2)));
        }
        let interchange = new X12Interchange_1.X12Interchange(segmentTerminator, elementDelimiter);
        let group;
        let transaction;
        let segments = this._parseSegments(edi, segmentTerminator, elementDelimiter);
        segments.forEach((seg) => {
            if (seg.tag == 'ISA') {
                this._processISA(interchange, seg);
            }
            else if (seg.tag == 'IEA') {
                this._processIEA(interchange, seg);
            }
            else if (seg.tag == 'GS') {
                group = new X12FunctionalGroup_1.X12FunctionalGroup();
                this._processGS(group, seg);
                interchange.functionalGroups.push(group);
            }
            else if (seg.tag == 'GE') {
                if (!group) {
                    let errorMessage = 'X12 Standard: Missing GS segment!';
                    if (this._strict) {
                        throw new Errors_1.ParserError(errorMessage);
                    }
                    this.diagnostics.push(new X12Diagnostic_1.X12Diagnostic(X12Diagnostic_1.X12DiagnosticLevel.Error, errorMessage, seg.range));
                }
                this._processGE(group, seg);
                group = null;
            }
            else if (seg.tag == 'ST') {
                if (!group) {
                    let errorMessage = `X12 Standard: ${seg.tag} segment cannot appear outside of a functional group.`;
                    if (this._strict) {
                        throw new Errors_1.ParserError(errorMessage);
                    }
                    this.diagnostics.push(new X12Diagnostic_1.X12Diagnostic(X12Diagnostic_1.X12DiagnosticLevel.Error, errorMessage, seg.range));
                }
                transaction = new X12Transaction_1.X12Transaction();
                this._processST(transaction, seg);
                group.transactions.push(transaction);
            }
            else if (seg.tag == 'SE') {
                if (!group) {
                    let errorMessage = `X12 Standard: ${seg.tag} segment cannot appear outside of a functional group.`;
                    if (this._strict) {
                        throw new Errors_1.ParserError(errorMessage);
                    }
                    this.diagnostics.push(new X12Diagnostic_1.X12Diagnostic(X12Diagnostic_1.X12DiagnosticLevel.Error, errorMessage, seg.range));
                }
                if (!transaction) {
                    let errorMessage = 'X12 Standard: Missing ST segment!';
                    if (this._strict) {
                        throw new Errors_1.ParserError(errorMessage);
                    }
                    this.diagnostics.push(new X12Diagnostic_1.X12Diagnostic(X12Diagnostic_1.X12DiagnosticLevel.Error, errorMessage, seg.range));
                }
                this._processSE(transaction, seg);
                transaction = null;
            }
            else {
                if (!group) {
                    let errorMessage = `X12 Standard: ${seg.tag} segment cannot appear outside of a functional group.`;
                    if (this._strict) {
                        throw new Errors_1.ParserError(errorMessage);
                    }
                    this.diagnostics.push(new X12Diagnostic_1.X12Diagnostic(X12Diagnostic_1.X12DiagnosticLevel.Error, errorMessage, seg.range));
                }
                if (!transaction) {
                    let errorMessage = `X12 Standard: ${seg.tag} segment cannot appear outside of a transaction.`;
                    if (this._strict) {
                        throw new Errors_1.ParserError(errorMessage);
                    }
                    this.diagnostics.push(new X12Diagnostic_1.X12Diagnostic(X12Diagnostic_1.X12DiagnosticLevel.Error, errorMessage, seg.range));
                }
                else {
                    transaction.segments.push(seg);
                }
            }
        });
        return interchange;
    }
    _parseSegments(edi, segmentTerminator, elementDelimiter) {
        let segments = new Array();
        let tagged = false;
        let currentSegment;
        let currentElement;
        currentSegment = new X12Segment_1.X12Segment();
        for (let i = 0, l = 0, c = 0; i < edi.length; i++) {
            if (!tagged && (edi[i].search(/\s/) == -1) && (edi[i] !== elementDelimiter) && (edi[i] !== segmentTerminator)) {
                currentSegment.tag += edi[i];
                if (!currentSegment.range.start) {
                    currentSegment.range.start = new Positioning_1.Position(l, c);
                }
            }
            else if (!tagged && (edi[i].search(/\s/) > -1)) {
                if (edi[i] == '\n') {
                    l++;
                    c = -1;
                }
            }
            else if (!tagged && (edi[i] == elementDelimiter)) {
                tagged = true;
                currentElement = new X12Element_1.X12Element();
                currentElement.range.start = new Positioning_1.Position(l, c);
            }
            else if (edi[i] == segmentTerminator) {
                currentElement.range.end = new Positioning_1.Position(l, (c - 1));
                currentSegment.elements.push(currentElement);
                currentSegment.range.end = new Positioning_1.Position(l, c);
                segments.push(currentSegment);
                currentSegment = new X12Segment_1.X12Segment();
                tagged = false;
                if (segmentTerminator === '\n') {
                    l++;
                    c = -1;
                }
            }
            else if (tagged && (edi[i] == elementDelimiter)) {
                currentElement.range.end = new Positioning_1.Position(l, (c - 1));
                currentSegment.elements.push(currentElement);
                currentElement = new X12Element_1.X12Element();
                currentElement.range.start = new Positioning_1.Position(l, c + 1);
            }
            else {
                currentElement.value += edi[i];
            }
            c++;
        }
        return segments;
    }
    _processISA(interchange, segment) {
        interchange.header = segment;
    }
    _processIEA(interchange, segment) {
        interchange.trailer = segment;
        if (parseInt(segment.valueOf(1)) !== interchange.functionalGroups.length) {
            let errorMessage = `X12 Standard: The value in IEA01 (${segment.valueOf(1)}) does not match the number of GS segments in the interchange (${interchange.functionalGroups.length}).`;
            if (this._strict) {
                throw new Errors_1.ParserError(errorMessage);
            }
            this.diagnostics.push(new X12Diagnostic_1.X12Diagnostic(X12Diagnostic_1.X12DiagnosticLevel.Error, errorMessage, segment.elements[0].range));
        }
        if (segment.valueOf(2) !== interchange.header.valueOf(13)) {
            let errorMessage = `X12 Standard: The value in IEA02 (${segment.valueOf(2)}) does not match the value in ISA13 (${interchange.header.valueOf(13)}).`;
            if (this._strict) {
                throw new Errors_1.ParserError(errorMessage);
            }
            this.diagnostics.push(new X12Diagnostic_1.X12Diagnostic(X12Diagnostic_1.X12DiagnosticLevel.Error, errorMessage, segment.elements[1].range));
        }
    }
    _processGS(group, segment) {
        group.header = segment;
    }
    _processGE(group, segment) {
        group.trailer = segment;
        if (parseInt(segment.valueOf(1)) !== group.transactions.length) {
            let errorMessage = `X12 Standard: The value in GE01 (${segment.valueOf(1)}) does not match the number of ST segments in the functional group (${group.transactions.length}).`;
            if (this._strict) {
                throw new Errors_1.ParserError(errorMessage);
            }
            this.diagnostics.push(new X12Diagnostic_1.X12Diagnostic(X12Diagnostic_1.X12DiagnosticLevel.Error, errorMessage, segment.elements[0].range));
        }
        if (segment.valueOf(2) !== group.header.valueOf(6)) {
            let errorMessage = `X12 Standard: The value in GE02 (${segment.valueOf(2)}) does not match the value in GS06 (${group.header.valueOf(6)}).`;
            if (this._strict) {
                throw new Errors_1.ParserError(errorMessage);
            }
            this.diagnostics.push(new X12Diagnostic_1.X12Diagnostic(X12Diagnostic_1.X12DiagnosticLevel.Error, errorMessage, segment.elements[1].range));
        }
    }
    _processST(transaction, segment) {
        transaction.header = segment;
    }
    _processSE(transaction, segment) {
        transaction.trailer = segment;
        let expectedNumberOfSegments = (transaction.segments.length + 2);
        if (parseInt(segment.valueOf(1)) !== expectedNumberOfSegments) {
            let errorMessage = `X12 Standard: The value in SE01 (${segment.valueOf(1)}) does not match the number of segments in the transaction (${expectedNumberOfSegments}).`;
            if (this._strict) {
                throw new Errors_1.ParserError(errorMessage);
            }
            this.diagnostics.push(new X12Diagnostic_1.X12Diagnostic(X12Diagnostic_1.X12DiagnosticLevel.Error, errorMessage, segment.elements[0].range));
        }
        if (segment.valueOf(2) !== transaction.header.valueOf(2)) {
            let errorMessage = `X12 Standard: The value in SE02 (${segment.valueOf(2)}) does not match the value in ST02 (${transaction.header.valueOf(2)}).`;
            if (this._strict) {
                throw new Errors_1.ParserError(errorMessage);
            }
            this.diagnostics.push(new X12Diagnostic_1.X12Diagnostic(X12Diagnostic_1.X12DiagnosticLevel.Error, errorMessage, segment.elements[1].range));
        }
    }
}
exports.X12Parser = X12Parser;
