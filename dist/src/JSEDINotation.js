'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
class JSEDINotation {
    constructor(header, options) {
        this.header = header || new Array();
        this.options = options || {};
        this.functionalGroups = new Array();
    }
    addFunctionalGroup(functionalGroup) {
        this.functionalGroups.push(functionalGroup);
    }
}
exports.JSEDINotation = JSEDINotation;
class JSEDIFunctionalGroup {
    constructor(header) {
        this.header = header || new Array();
        this.transactions = new Array();
    }
    addTransaction(transaction) {
        this.transactions.push(transaction);
    }
}
exports.JSEDIFunctionalGroup = JSEDIFunctionalGroup;
class JSEDITransaction {
    constructor(header) {
        this.header = header || new Array();
        this.segments = new Array();
    }
    addSegment(segment) {
        this.segments.push(segment);
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
