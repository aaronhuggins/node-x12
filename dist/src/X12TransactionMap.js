'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const Errors_1 = require("./Errors");
const X12Interchange_1 = require("./X12Interchange");
const X12QueryEngine_1 = require("./X12QueryEngine");
class X12TransactionMap {
    constructor(map, transaction) {
        this.map = map;
        this.transaction = transaction;
    }
    setTransaction(transaction) {
        this.transaction = transaction;
    }
    toObject(map) {
        map = map || this.map;
        const clone = JSON.parse(JSON.stringify(map));
        const engine = new X12QueryEngine_1.X12QueryEngine(false);
        const interchange = new X12Interchange_1.X12Interchange();
        interchange.setHeader(['00', '', '00', '', 'ZZ', '00000000', '01', '00000000', '000000', '0000', '|', '00000', '00000000', '0', 'P', '>']);
        interchange.addFunctionalGroup().transactions = [this.transaction];
        Object.keys(clone).forEach((key) => {
            if (Object.prototype.hasOwnProperty.call(map, key)) {
                if (Array.isArray(clone[key]) && typeof clone[key][0] === 'string') {
                    const newArray = new Array();
                    clone[key].forEach((query) => {
                        try {
                            newArray.push(engine.querySingle(interchange, query).value);
                        }
                        catch (err) {
                            throw new Errors_1.QuerySyntaxError(`${err.message}; bad query in ${clone[key]}`);
                        }
                    });
                    clone[key] = newArray;
                }
                else if (typeof clone[key] === 'string') {
                    try {
                        clone[key] = engine.querySingle(interchange, clone[key]).value;
                    }
                    catch (err) {
                        throw new Errors_1.QuerySyntaxError(`${err.message}; bad query in ${clone[key]}`);
                    }
                }
                else {
                    clone[key] = this.toObject(clone[key]);
                }
            }
        });
        return clone;
    }
}
exports.X12TransactionMap = X12TransactionMap;
