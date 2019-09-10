'use strict';

import { JSEDINotation } from './JSEDINotation';
import { X12Interchange } from './X12Interchange';
import { X12Parser } from './X12Parser';
import { defaultSerializationOptions, X12SerializationOptions } from './X12SerializationOptions';

export class X12Generator {
    /**
     * @description Factory for generating EDI from JS EDI Notation.
     * @param {JSEDINotation} [jsen] Javascript EDI Notation object to serialize.
     * @param {X12SerializationOptions} [options] Options for serializing back to EDI.
     */
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

    /**
     * @description Set the JS EDI Notation for this instance.
     * @param {JSEDINotation} [jsen] Javascript EDI Notation object to serialize.
     */
    setJSEDINotation(jsen: JSEDINotation) {
        this.jsen = jsen;
    }

    /**
     * @description Get the JS EDI Notation for this instance.
     * @returns {JSEDINotation}
     */
    getJSEDINotation() {
        return this.jsen;
    }

    /**
     * @description Set the serialization options for this instance.
     * @param {X12SerializationOptions} [options] Options for serializing back to EDI.
     */
    setOptions(options: X12SerializationOptions) {
        this.options = options;
    }

    /**
     * @description Get the serialization options for this instance.
     * @returns {X12SerializationOptions}
     */
    getOptions() {
        return this.options;
    }

    /**
     * @description Validate the EDI in this instance.
     */
    validate() {
        this._generate();

        return (new X12Parser(true)).parse(this.interchange.toString(this.options))
    }

    /**
     * @description Serialize the EDI in this instance.
     * @returns {string}
     */
    toString() {
        return this.validate().toString(this.options);
    }

    /**
     * @description Generate an interchange from the JS EDI Notation in this instance.
     * @returns {X12Interchange}
     */
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