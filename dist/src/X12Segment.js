'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const Positioning_1 = require("./Positioning");
const X12Element_1 = require("./X12Element");
const X12Enumerables_1 = require("./X12Enumerables");
const X12SerializationOptions_1 = require("./X12SerializationOptions");
const Errors_1 = require("./Errors");
class X12Segment {
    constructor(tag = '', options) {
        this.tag = tag;
        this.elements = new Array();
        this.range = new Positioning_1.Range();
        this.options = X12SerializationOptions_1.defaultSerializationOptions(options);
    }
    setElements(values) {
        if (this._checkSupportedSegment()) {
            const enumerable = this._getX12Enumerable();
            if (values.length === enumerable.COUNT) {
                for (let i = 0; i < values.length; i++) {
                    const name = `${this.tag}${String.prototype.padStart.call(i + 1, 2, '0')}`;
                    const max = enumerable[name];
                    const min = enumerable[`${name}_MIN`] || max;
                    if (values[i].length > max && values[i].length !== 0) {
                        throw new Errors_1.GeneratorError(`Segment element "${name}" with value of "${values[i]}" exceeds maximum of ${max} characters.`);
                    }
                    if (values[i].length < min && values[i].length !== 0) {
                        throw new Errors_1.GeneratorError(`Segment element "${name}" with value of "${values[i]}" does not meet minimum of ${min} characters.`);
                    }
                    if (values[i].length < max && values[i].length > min || values[i].length === 0) {
                        values[i] = String.prototype.padEnd.call(values[i], max, ' ');
                    }
                }
            }
            else {
                throw new Errors_1.GeneratorError(`Segment "${this.tag}" with ${values.length} elements does meet the required count of ${enumerable.COUNT}.`);
            }
        }
        this.elements = new Array();
        values.forEach((value) => {
            this.elements.push(new X12Element_1.X12Element(value));
        });
    }
    addElement(value = '') {
        const element = new X12Element_1.X12Element(value);
        this.elements.push(element);
        return element;
    }
    replaceElement(value, segmentPosition) {
        let index = segmentPosition - 1;
        if (this.elements.length <= index) {
            return null;
        }
        else {
            this.elements[index] = new X12Element_1.X12Element(value);
        }
        return this.elements[index];
    }
    insertElement(value = '', segmentPosition = 1) {
        let index = segmentPosition - 1;
        if (this.elements.length <= index) {
            return null;
        }
        return this.elements.splice(index, 0, new X12Element_1.X12Element(value)).length === 1;
    }
    removeElement(segmentPosition) {
        let index = segmentPosition - 1;
        if (this.elements.length <= index) {
            return null;
        }
        return this.elements.splice(index, 1).length === 1;
    }
    valueOf(segmentPosition, defaultValue) {
        let index = segmentPosition - 1;
        if (this.elements.length <= index) {
            return defaultValue || null;
        }
        return this.elements[index].value || defaultValue || null;
    }
    toString(options) {
        options = options
            ? X12SerializationOptions_1.defaultSerializationOptions(options)
            : this.options;
        let edi = this.tag;
        for (let i = 0; i < this.elements.length; i++) {
            edi += options.elementDelimiter;
            edi += this.elements[i].value;
        }
        edi += options.segmentTerminator;
        return edi;
    }
    _checkSupportedSegment() {
        let supported = false;
        switch (this.tag) {
            case X12Enumerables_1.X12SupportedSegments.ISA:
                supported = true;
                break;
        }
        return supported;
    }
    _getX12Enumerable() {
        let enumerable = X12Enumerables_1.X12InterchangeControlHeader;
        switch (this.tag) {
            case X12Enumerables_1.X12SupportedSegments.ISA:
                enumerable = X12Enumerables_1.X12InterchangeControlHeader;
                break;
        }
        return enumerable;
    }
}
exports.X12Segment = X12Segment;
