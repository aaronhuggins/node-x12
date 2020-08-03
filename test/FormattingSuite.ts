'use strict'

import 'mocha'
import { X12FatInterchange } from '../src/X12FatInterchange'
import { X12Interchange, X12Parser, X12SerializationOptions } from '../core'

import fs = require('fs')

describe('X12Formatting', () => {
  it('should replicate the source data unless changes are made', () => {
    const edi = fs.readFileSync('test/test-data/850.edi', 'utf8')
    const parser = new X12Parser(true)
    const interchange = parser.parse(edi) as X12Interchange

    const edi2 = interchange.toString()

    if (edi !== edi2) {
      throw new Error(`Formatted EDI does not match source. Found ${edi2}, expected ${edi}.`)
    }
  })

  it('should replicate the source data for a fat interchange unless changes are made', () => {
    const edi = fs.readFileSync('test/test-data/850_fat.edi', 'utf8')
    const parser = new X12Parser(true)
    const interchange = parser.parse(edi) as X12FatInterchange

    const options: X12SerializationOptions = {
      format: true,
      endOfLine: '\n'
    }

    const edi2 = interchange.toString(options)

    if (edi !== edi2) {
      throw new Error(`Formatted EDI does not match source. Found ${edi2}, expected ${edi}.`)
    }
  })
})
