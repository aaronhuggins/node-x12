'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const X12SerializationOptions_1 = require("./X12SerializationOptions");
class X12FunctionalGroup {
    constructor() {
        this.transactions = new Array();
    }
    toString(options) {
        options = X12SerializationOptions_1.defaultSerializationOptions(options);
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
}
exports.X12FunctionalGroup = X12FunctionalGroup;
