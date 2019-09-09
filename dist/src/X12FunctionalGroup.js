'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const JSEDINotation_1 = require("./JSEDINotation");
const X12Segment_1 = require("./X12Segment");
const X12Enumerables_1 = require("./X12Enumerables");
const X12Transaction_1 = require("./X12Transaction");
const X12SerializationOptions_1 = require("./X12SerializationOptions");
class X12FunctionalGroup {
    constructor(options) {
        this.transactions = new Array();
        this.options = X12SerializationOptions_1.defaultSerializationOptions(options);
    }
    setHeader(elements, options) {
        options = options
            ? X12SerializationOptions_1.defaultSerializationOptions(options)
            : this.options;
        this.header = new X12Segment_1.X12Segment(X12Enumerables_1.X12SupportedSegments.GS, options);
        this.header.setElements(elements);
        this._setTrailer(options);
    }
    addTransaction(options) {
        options = options
            ? X12SerializationOptions_1.defaultSerializationOptions(options)
            : this.options;
        const transaction = new X12Transaction_1.X12Transaction(options);
        this.transactions.push(transaction);
        this.trailer.replaceElement(`${this.transactions.length}`, 1);
        return transaction;
    }
    toString(options) {
        options = options
            ? X12SerializationOptions_1.defaultSerializationOptions(options)
            : this.options;
        let edi = this.header.toString(options);
        if (options.format) {
            edi += options.endOfLine;
        }
        for (let i = 0; i < this.transactions.length; i++) {
            edi += this.transactions[i].toString(options);
            if (options.format) {
                edi += options.endOfLine;
            }
        }
        edi += this.trailer.toString(options);
        return edi;
    }
    toJSON() {
        const jsen = new JSEDINotation_1.JSEDIFunctionalGroup(this.header.elements.map(x => x.value));
        this.transactions.forEach((transaction) => {
            const jsenTransaction = jsen.addTransaction(transaction.header.elements.map(x => x.value));
            transaction.segments.forEach((segment) => {
                jsenTransaction.addSegment(segment.tag, segment.elements.map(x => x.value));
            });
        });
        return jsen;
    }
    _setTrailer(options) {
        options = options
            ? X12SerializationOptions_1.defaultSerializationOptions(options)
            : this.options;
        this.trailer = new X12Segment_1.X12Segment(X12Enumerables_1.X12SupportedSegments.GE, options);
        this.trailer.setElements([`${this.transactions.length}`, this.header.valueOf(6)]);
    }
}
exports.X12FunctionalGroup = X12FunctionalGroup;
