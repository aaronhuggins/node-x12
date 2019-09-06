'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
class Position {
    constructor(line, character) {
        if (typeof line === 'number' && typeof character === 'number') {
            this.line = line;
            this.character = character;
        }
    }
}
exports.Position = Position;
class Range {
    constructor(startLine, startChar, endLine, endChar) {
        if (typeof startLine === 'number' && typeof startChar === 'number' && typeof endLine === 'number' && typeof endChar === 'number') {
            this.start = new Position(startLine, startChar);
            this.end = new Position(endLine, endChar);
        }
    }
}
exports.Range = Range;
