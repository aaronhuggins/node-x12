'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const Positioning_1 = require("./Positioning");
const X12SerializationOptions_1 = require("./X12SerializationOptions");
class X12Segment {
    constructor() {
        this.tag = '';
        this.elements = new Array();
        this.range = new Positioning_1.Range();
    }
    toString(options) {
        options = X12SerializationOptions_1.defaultSerializationOptions(options);
        let edi = this.tag;
        for (let i = 0; i < this.elements.length; i++) {
            edi += options.elementDelimiter;
            edi += this.elements[i].value;
        }
        edi += options.segmentTerminator;
        return edi;
    }
    valueOf(segmentPosition, defaultValue) {
        let index = segmentPosition - 1;
        if (this.elements.length <= index) {
            return defaultValue || null;
        }
        return this.elements[index].value || defaultValue || null;
    }
}
exports.X12Segment = X12Segment;
