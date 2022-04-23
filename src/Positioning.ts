'use strict'

export class Position {
  constructor (line?: number, character?: number) {
    if (typeof line === 'number' && typeof character === 'number') {
      this.line = line
      this.character = character
    } else {
      this.line = NaN
      this.character = NaN
    }
  }

  line: number
  character: number
}

export class Range {
  constructor (startLine?: number, startChar?: number, endLine?: number, endChar?: number) {
    if (
      typeof startLine === 'number' &&
      typeof startChar === 'number' &&
      typeof endLine === 'number' &&
      typeof endChar === 'number'
    ) {
      this.start = new Position(startLine, startChar)
      this.end = new Position(endLine, endChar)
    } else {
      this.start = new Position()
      this.end = new Position()
    }
  }

  start: Position
  end: Position
}
