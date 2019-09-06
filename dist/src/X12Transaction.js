'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const X12Segment_1 = require("./X12Segment");
const X12SerializationOptions_1 = require("./X12SerializationOptions");
class X12Transaction {
    constructor(options) {
        this.segments = new Array();
        this.options = X12SerializationOptions_1.defaultSerializationOptions(options);
    }
    setHeader(tag, elements, options) {
        this.header = new X12Segment_1.X12Segment(tag, options);
        this.header.setElements(elements);
    }
    setTrailer(tag, elements, options) {
        this.trailer = new X12Segment_1.X12Segment(tag, options);
        this.trailer.setElements(elements);
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
}
exports.X12Transaction = X12Transaction;
