'use strict';

export class Position {
    constructor(line?: number, character?: number) {
        if (line && character) {
            this.line = line;
            this.character = character;
        }
    }
    
    line: number;
    character: number;
}

export class Range {
    constructor(startLine?: number, startChar?: number, endLine?: number, endChar?: number) {
        if (startLine && startChar && endLine && endChar) {
            this.start = new Position(startLine, startChar);
            this.end = new Position(endLine, endChar);
        }
    }
    
    start: Position;
    end: Position;
}