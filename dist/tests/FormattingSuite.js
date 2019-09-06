'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("../core");
let fs = require('fs');
describe('X12Formatting', () => {
    it('should replicate the source data unless changes are made', () => {
        let edi = fs.readFileSync('tests/test-data/850.edi', 'utf8');
        let parser = new core_1.X12Parser(true);
        let interchange = parser.parseX12(edi);
        let options = {
            format: true,
            endOfLine: '\r\n'
        };
        let edi2 = interchange.toString(options);
        if (edi !== edi2) {
            throw new Error(`Formatted EDI does not match source. Found ${edi2}, expected ${edi}.`);
        }
    });
});
