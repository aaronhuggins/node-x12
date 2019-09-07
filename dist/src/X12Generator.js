'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const X12Interchange_1 = require("./X12Interchange");
const X12Parser_1 = require("./X12Parser");
const X12SerializationOptions_1 = require("./X12SerializationOptions");
class X12Generator {
    constructor(jsen, options) {
        this.jsen = jsen || {};
        if (jsen.options) {
            this.options = X12SerializationOptions_1.defaultSerializationOptions(jsen.options);
        }
        if (options) {
            this.options = X12SerializationOptions_1.defaultSerializationOptions(options);
        }
        this.interchange = new X12Interchange_1.X12Interchange(this.options);
    }
    _generate() {
        const genInterchange = new X12Interchange_1.X12Interchange(this.options);
        genInterchange.setHeader(this.jsen.header);
        this.jsen.functionalGroups.forEach((functionalGroup) => {
            const genFunctionalGroup = genInterchange.addFunctionalGroup();
            genFunctionalGroup.setHeader(functionalGroup.header);
            functionalGroup.transactions.forEach((transaction) => {
                const genTransaction = genFunctionalGroup.addTransaction();
                genTransaction.setHeader(transaction.header);
                transaction.segments.forEach((segment) => {
                    genTransaction.addSegment(segment.tag, segment.elements);
                });
            });
        });
        this.interchange = genInterchange;
    }
    validate() {
        this._generate();
        return (new X12Parser_1.X12Parser(true)).parseX12(this.interchange.toString(this.options));
    }
    toString() {
        return this.validate().toString(this.options);
    }
}
exports.X12Generator = X12Generator;
