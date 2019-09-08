'use strict';

import { JSEDINotation } from './JSEDINotation';
import { X12Interchange } from './X12Interchange';
import { X12Parser } from './X12Parser';
import { defaultSerializationOptions, X12SerializationOptions } from './X12SerializationOptions';

export class X12Generator {
    constructor(jsen?: JSEDINotation, options?: X12SerializationOptions) {
        this.jsen = jsen || {} as JSEDINotation;

        if (jsen.options) {
            this.options = defaultSerializationOptions(jsen.options);
        }

        if (options) {
            this.options = defaultSerializationOptions(options);
        }

        this.interchange = new X12Interchange(this.options);
    }
    
    private jsen: JSEDINotation;
    private interchange: X12Interchange;
    private options: X12SerializationOptions;

    setJSEDINotation(jsen: JSEDINotation) {
        this.jsen = jsen;
    }

    getJSEDINotation() {
        return this.jsen;
    }

    setOptions(options: X12SerializationOptions) {
        this.options = options;
    }

    getOptions() {
        return this.options;
    }

    validate() {
        this._generate();

        return (new X12Parser(true)).parseX12(this.interchange.toString(this.options))
    }

    toString() {
        return this.validate().toString(this.options);
    }

    private _generate() {
        const genInterchange = new X12Interchange(this.options);

        genInterchange.setHeader(this.jsen.header);

        this.jsen.functionalGroups.forEach((functionalGroup) => {
            const genFunctionalGroup = genInterchange.addFunctionalGroup();

            genFunctionalGroup.setHeader(functionalGroup.header);

            functionalGroup.transactions.forEach((transaction) => {
                const genTransaction = genFunctionalGroup.addTransaction();

                genTransaction.setHeader(transaction.header);

                transaction.segments.forEach((segment) => {
                    genTransaction.addSegment(segment.tag, segment.elements);
                })
            })
        })

        this.interchange = genInterchange;
    }
}