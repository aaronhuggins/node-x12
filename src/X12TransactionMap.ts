'use strict'

import { QuerySyntaxError } from './Errors';
import { X12Interchange } from './X12Interchange';
import { X12QueryEngine } from './X12QueryEngine';
import { X12Transaction } from './X12Transaction';

export class X12TransactionMap {
    constructor(map: object, transaction?: X12Transaction) {
        this.map = map;
        this.transaction = transaction;
    }

    map: object;
    transaction: X12Transaction;

    setTransaction(transaction: X12Transaction) {
        this.transaction = transaction;
    }

    toObject(map?: object) {
        map = map || this.map;

        const clone = JSON.parse(JSON.stringify(map));
        let clones = new Array<object>();
        const engine = new X12QueryEngine(false);
        const interchange = new X12Interchange();
        interchange.setHeader(['00','','00','','ZZ','00000000','01','00000000','000000','0000','|','00000','00000000','0','P','>']);
        interchange.addFunctionalGroup().transactions = [this.transaction];

        Object.keys(map).forEach((key) => {

            if (Object.prototype.hasOwnProperty.call(map, key)) {
                if (Array.isArray(map[key]) && typeof map[key][0] === 'string') {
                    const newArray = new Array<string | string[]>();

                    (map[key] as Array<string>).forEach((query) => {
                        try {
                            const result = engine.querySingle(interchange, query);

                            if (result === null) {
                                newArray.push(null);
                            } else if (result.value === null || Array.isArray(clone[key][0])) {
                                if (result.value) {
                                    clone[key].forEach((array: Array<string>) => {
                                        array.push(result.value)
                                    })
                                } else {
                                    let superArray = new Array<string[]>();

                                    if (Array.isArray(clone[key][0])) {
                                        superArray = clone[key]
                                    }

                                    result.values.forEach((value: string, index: number) => {
                                        if (!Array.isArray(superArray[index])) {
                                            superArray[index] = new Array<string>();
                                        }

                                        superArray[index].push(value)
                                    })

                                    newArray.push(...superArray);
                                }
                            } else {
                                newArray.push(result.value);
                            }
                        } catch (err) {
                            throw new QuerySyntaxError(`${err.message}; bad query in ${map[key]}`);
                        }
                    })

                    clone[key] = newArray;
                } else if (typeof map[key] === 'string') {
                    try {
                        clone[key] = engine.querySingle(interchange, map[key]).value;
                        const result = engine.querySingle(interchange, map[key]);

                        if (result === null) {
                            clone[key] = null;
                        } else if (result.value === null || Array.isArray(clones)) {
                            if (result.value) {
                                clones.forEach((cloned: Array<object>) => {
                                    cloned[key] = result.value;
                                })
                            } else {
                                if (!Array.isArray(clones)) {
                                    clones = new Array<object>();
                                }
                                result.values.forEach((value: string, index: number) => {
                                    if (clones[index] === undefined) {
                                        clones[index] = JSON.parse(JSON.stringify(clone));
                                    }

                                    clones[index][key] = result.value
                                })
                            }
                        } else {
                            clone[key] = result.value
                        }
                    } catch (err) {
                        throw new QuerySyntaxError(`${err.message}; bad query in ${map[key]}`);
                    }
                } else {
                    clone[key] = this.toObject(map[key]);
                }
            }
        })

        return Array.isArray(clones)
            ? clones
            : clone;
    }
}