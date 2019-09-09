'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const Errors_1 = require("./Errors");
const X12Interchange_1 = require("./X12Interchange");
const X12QueryEngine_1 = require("./X12QueryEngine");
class X12TransactionMap {
    constructor(map, transaction, helper) {
        this.map = map;
        this.transaction = transaction;
        this.helper = helper || this._helper;
    }
    setTransaction(transaction, helper) {
        this.transaction = transaction;
        this.helper = helper || this._helper;
    }
    toObject(map, callback) {
        map = map || this.map;
        const clone = JSON.parse(JSON.stringify(map));
        let clones = null;
        const engine = new X12QueryEngine_1.X12QueryEngine(false);
        const interchange = new X12Interchange_1.X12Interchange();
        interchange.setHeader(['00', '', '00', '', 'ZZ', '00000000', '01', '00000000', '000000', '0000', '|', '00000', '00000000', '0', 'P', '>']);
        interchange.addFunctionalGroup().transactions = [this.transaction];
        Object.keys(map).forEach((key) => {
            if (Object.prototype.hasOwnProperty.call(map, key)) {
                if (Array.isArray(map[key]) && typeof map[key][0] === 'string') {
                    const newArray = new Array();
                    map[key].forEach((query) => {
                        try {
                            const result = engine.querySingle(interchange, query);
                            if (result === null) {
                                newArray.push(null);
                            }
                            else if (result.value === null || Array.isArray(clone[key][0])) {
                                if (result.value) {
                                    clone[key].forEach((array) => {
                                        array.push(this.helper(result.value, query, callback));
                                    });
                                }
                                else {
                                    let superArray = new Array();
                                    if (Array.isArray(clone[key][0])) {
                                        superArray = clone[key];
                                    }
                                    result.values.forEach((value, index) => {
                                        if (!Array.isArray(superArray[index])) {
                                            superArray[index] = new Array();
                                        }
                                        superArray[index].push(this.helper(value, query, callback));
                                    });
                                    newArray.push(...superArray);
                                }
                            }
                            else {
                                newArray.push(this.helper(result.value, query, callback));
                            }
                        }
                        catch (err) {
                            throw new Errors_1.QuerySyntaxError(`${err.message}; bad query in ${map[key]}`);
                        }
                    });
                    clone[key] = newArray;
                }
                else if (typeof map[key] === 'string') {
                    try {
                        const result = engine.querySingle(interchange, map[key]);
                        if (result === null) {
                            clone[key] = null;
                        }
                        else if (result.value === null || Array.isArray(clones)) {
                            if (result.value) {
                                clones.forEach((cloned) => {
                                    cloned[key] = this.helper(result.value, map[key], callback);
                                });
                            }
                            else {
                                if (!Array.isArray(clones)) {
                                    clones = new Array();
                                }
                                result.values.forEach((value, index) => {
                                    if (clones[index] === undefined) {
                                        clones[index] = JSON.parse(JSON.stringify(clone));
                                    }
                                    clones[index][key] = this.helper(value, map[key], callback);
                                });
                            }
                        }
                        else {
                            clone[key] = this.helper(result.value, map[key], callback);
                        }
                    }
                    catch (err) {
                        throw new Errors_1.QuerySyntaxError(`${err.message}; bad query in ${map[key]}`);
                    }
                }
                else {
                    clone[key] = this.toObject(map[key]);
                }
            }
        });
        return Array.isArray(clones)
            ? clones
            : clone;
    }
    _helper(value, query, callback) {
        if (callback) {
            callback(value, query);
        }
        return value;
    }
}
exports.X12TransactionMap = X12TransactionMap;
