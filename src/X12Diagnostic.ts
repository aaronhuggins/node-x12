'use strict'

import { Range } from './Positioning.ts'

export enum X12DiagnosticLevel {
  Info = 0,
  Warning = 1,
  Error = 2
}

export class X12Diagnostic {
  constructor (level?: X12DiagnosticLevel, message?: string, range?: Range) {
    this.level = level === undefined ? X12DiagnosticLevel.Error : level
    this.message = message === undefined ? '' : message
    this.range = range
  }

  level: X12DiagnosticLevel
  message: string
  range: Range
}
