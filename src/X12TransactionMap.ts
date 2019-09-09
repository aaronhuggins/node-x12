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
        const engine = new X12QueryEngine(false);
        const interchange = new X12Interchange();
        interchange.setHeader(['00','','00','','ZZ','00000000','01','00000000','000000','0000','|','00000','00000000','0','P','>']);
        interchange.addFunctionalGroup().transactions = [this.transaction];

        Object.keys(clone).forEach((key) => {

            if (Object.prototype.hasOwnProperty.call(map, key)) {
                try {
                    if (Array.isArray(clone[key]) && typeof clone[key][0] === 'string') {
                        const newArray = new Array<string>();
    
                        (clone[key] as Array<string>).forEach((query) => {
                            newArray.push(engine.querySingle(interchange, query).value);
                        })
    
                        clone[key] = newArray;
                    } else if (typeof clone[key] === 'string') {
                        clone[key] = engine.querySingle(interchange, clone[key]).value;
                    } else {
                        clone[key] = this.toObject(clone[key]);
                    }
                } catch (err) {
                    throw new QuerySyntaxError(`${err.message}; bad query in ${clone[key]}`);
                }
            }
        })

        return clone;
    }
}