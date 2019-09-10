'use strict'

import 'mocha'
import { X12Parser, X12Interchange, X12Segment } from '../core'

import fs = require('fs')

describe('X12Parser', () => {
  it('should parse a valid X12 document without throwing an error', () => {
    const edi = fs.readFileSync('tests/test-data/850.edi', 'utf8')
    const parser = new X12Parser(true)
    parser.parse(edi)
  })

  it('should produce accurate line numbers for files with line breaks', () => {
    const edi = fs.readFileSync('tests/test-data/850_3.edi', 'utf8')
    const parser = new X12Parser(true)
    const interchange = parser.parse(edi) as X12Interchange

    const segments = [].concat(
      [interchange.header, interchange.functionalGroups[0].header, interchange.functionalGroups[0].transactions[0].header],
      interchange.functionalGroups[0].transactions[0].segments,
      [interchange.functionalGroups[0].transactions[0].trailer, interchange.functionalGroups[0].trailer, interchange.trailer]
    )

    for (let i = 0; i < segments.length; i++) {
      const segment: X12Segment = segments[i]

      if (i !== segment.range.start.line) {
        throw new Error(`Segment line number incorrect. Expected ${i}, found ${segment.range.start.line}.`)
      }
    }
  })
})
