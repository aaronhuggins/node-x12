"use strict";

export class Position {
  constructor(line?: number, character?: number) {
    if (typeof line === "number" && typeof character === "number") {
      this.line = line;
      this.character = character;
    }
  }

  line!: number;
  character!: number;
}

export class Range {
  constructor(
    startLine?: number,
    startChar?: number,
    endLine?: number,
    endChar?: number,
  ) {
    if (
      typeof startLine === "number" &&
      typeof startChar === "number" &&
      typeof endLine === "number" &&
      typeof endChar === "number"
    ) {
      this.start = new Position(startLine, startChar);
      this.end = new Position(endLine, endChar);
    }
  }

  start!: Position;
  end!: Position;
}
