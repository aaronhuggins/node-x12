'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const Positioning_1 = require("./Positioning");
class X12Element {
    constructor(value = '') {
        this.range = new Positioning_1.Range();
        this.value = value;
    }
}
exports.X12Element = X12Element;
