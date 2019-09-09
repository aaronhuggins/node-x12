'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
class JSEDINotation {
    constructor(header, options) {
        this.header = header || new Array();
        this.options = options || {};
        this.functionalGroups = new Array();
    }
    addFunctionalGroup(header) {
        const functionalGroup = new JSEDIFunctionalGroup(header);
        this.functionalGroups.push(functionalGroup);
        return functionalGroup;
    }
}
exports.JSEDINotation = JSEDINotation;
class JSEDIFunctionalGroup {
    constructor(header) {
        this.header = header || new Array();
        this.transactions = new Array();
    }
    addTransaction(header) {
        const transaction = new JSEDITransaction(header);
        this.transactions.push(transaction);
        return transaction;
    }
}
exports.JSEDIFunctionalGroup = JSEDIFunctionalGroup;
class JSEDITransaction {
    constructor(header) {
        this.header = header || new Array();
        this.segments = new Array();
    }
    addSegment(tag, elements) {
        const segment = new JSEDISegment(tag, elements);
        this.segments.push(segment);
        return segment;
    }
}
exports.JSEDITransaction = JSEDITransaction;
class JSEDISegment {
    constructor(tag, elements) {
        this.tag = tag;
        this.elements = elements;
    }
}
exports.JSEDISegment = JSEDISegment;
