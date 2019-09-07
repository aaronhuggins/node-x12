'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const X12FunctionalGroup_1 = require("./X12FunctionalGroup");
const X12Segment_1 = require("./X12Segment");
const X12Enumerables_1 = require("./X12Enumerables");
const X12SerializationOptions_1 = require("./X12SerializationOptions");
class X12Interchange {
    constructor(segmentTerminator, elementDelimiter, options) {
        this.functionalGroups = new Array();
        if (typeof segmentTerminator === 'string') {
            this.segmentTerminator = segmentTerminator;
            if (typeof elementDelimiter === 'string') {
                this.elementDelimiter = elementDelimiter;
            }
            else {
                throw new TypeError('Parameter "elementDelimiter" must be type of string.');
            }
        }
        else {
            this.options = X12SerializationOptions_1.defaultSerializationOptions(segmentTerminator);
            this.segmentTerminator = this.options.segmentTerminator;
            this.elementDelimiter = this.options.elementDelimiter;
        }
        if (this.options === undefined) {
            this.options = X12SerializationOptions_1.defaultSerializationOptions(options);
        }
    }
    setHeader(elements, options) {
        options = options
            ? X12SerializationOptions_1.defaultSerializationOptions(options)
            : this.options;
        this.header = new X12Segment_1.X12Segment(X12Enumerables_1.X12SupportedSegments.ISA, options);
        this.header.setElements(elements);
        this._setTrailer(options);
    }
    addFunctionalGroup(options) {
        options = options
            ? X12SerializationOptions_1.defaultSerializationOptions(options)
            : this.options;
        const functionalGroup = new X12FunctionalGroup_1.X12FunctionalGroup(options);
        this.functionalGroups.push(functionalGroup);
        this.trailer.replaceElement(`${this.functionalGroups.length}`, 1);
        return functionalGroup;
    }
    toString(options) {
        options = options
            ? X12SerializationOptions_1.defaultSerializationOptions(options)
            : this.options;
        let edi = this.header.toString(options);
        if (options.format) {
            edi += options.endOfLine;
        }
        for (let i = 0; i < this.functionalGroups.length; i++) {
            edi += this.functionalGroups[i].toString(options);
            if (options.format) {
                edi += options.endOfLine;
            }
        }
        edi += this.trailer.toString(options);
        return edi;
    }
    _setTrailer(options) {
        options = options
            ? X12SerializationOptions_1.defaultSerializationOptions(options)
            : this.options;
        this.trailer = new X12Segment_1.X12Segment(X12Enumerables_1.X12SupportedSegments.IEA, options);
        this.trailer.setElements([`${this.functionalGroups.length}`, this.header.valueOf(13)]);
    }
    _padRight(input, width) {
        while (input.length < width) {
            input += ' ';
        }
        return input.substr(0, width);
    }
}
exports.X12Interchange = X12Interchange;
