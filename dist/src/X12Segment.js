'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const Positioning_1 = require("./Positioning");
const X12Element_1 = require("./X12Element");
const X12SerializationOptions_1 = require("./X12SerializationOptions");
class X12Segment {
    constructor(tag = '', options) {
        this.tag = tag;
        this.elements = new Array();
        this.range = new Positioning_1.Range();
        this.options = X12SerializationOptions_1.defaultSerializationOptions(options);
    }
    setElements(values) {
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
}
exports.X12Segment = X12Segment;
