'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const JSEDINotation_1 = require("./JSEDINotation");
const X12Segment_1 = require("./X12Segment");
const X12Enumerables_1 = require("./X12Enumerables");
const X12SerializationOptions_1 = require("./X12SerializationOptions");
class X12Transaction {
    constructor(options) {
        this.segments = new Array();
        this.options = X12SerializationOptions_1.defaultSerializationOptions(options);
    }
    setHeader(elements, options) {
        options = options
            ? X12SerializationOptions_1.defaultSerializationOptions(options)
            : this.options;
        this.header = new X12Segment_1.X12Segment(X12Enumerables_1.X12SupportedSegments.ST, options);
        this.header.setElements(elements);
        this._setTrailer(options);
    }
    addSegment(tag, elements, options) {
        options = options
            ? X12SerializationOptions_1.defaultSerializationOptions(options)
            : this.options;
        const segment = new X12Segment_1.X12Segment(tag, options);
        segment.setElements(elements);
        this.segments.push(segment);
        this.trailer.replaceElement(`${this.segments.length + 2}`, 1);
        return segment;
    }
    toString(options) {
        options = options
            ? X12SerializationOptions_1.defaultSerializationOptions(options)
            : this.options;
        let edi = this.header.toString(options);
        if (options.format) {
            edi += options.endOfLine;
        }
        for (let i = 0; i < this.segments.length; i++) {
            edi += this.segments[i].toString(options);
            if (options.format) {
                edi += options.endOfLine;
            }
        }
        edi += this.trailer.toString(options);
        return edi;
    }
    toJSON() {
        const jsen = new JSEDINotation_1.JSEDITransaction(this.header.elements.map(x => x.value));
        this.segments.forEach((segment) => {
            jsen.addSegment(segment.tag, segment.elements.map(x => x.value));
        });
        return jsen;
    }
    _setTrailer(options) {
        options = options
            ? X12SerializationOptions_1.defaultSerializationOptions(options)
            : this.options;
        this.trailer = new X12Segment_1.X12Segment(X12Enumerables_1.X12SupportedSegments.SE, options);
        this.trailer.setElements([`${this.segments.length + 2}`, this.header.valueOf(2)]);
    }
}
exports.X12Transaction = X12Transaction;
