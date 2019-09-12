'use strict'

import 'mocha'
import { JSEDINotation, X12Generator, X12Parser, X12SerializationOptions } from '../core'

import fs = require('fs')

describe('X12Generator', () => {
  it('should replicate the source data unless changes are made', () => {
    const edi = fs.readFileSync('test/test-data/850.edi', 'utf8')
    const parser = new X12Parser(true)
    const notation: JSEDINotation = parser.parse(edi).toJSEDINotation() as JSEDINotation

    const options: X12SerializationOptions = {
      format: true,
      endOfLine: '\n'
    }

    const generator = new X12Generator(notation, options)

    const edi2 = generator.toString()

    if (edi !== edi2) {
      throw new Error(`Formatted EDI does not match source. Found ${edi2}, expected ${edi}.`)
    }
  })

  it('should replicate the source data to and from JSON unless changes are made', () => {
    const edi = fs.readFileSync('test/test-data/850.edi', 'utf8')
    const parser = new X12Parser(true)
    const interchange = parser.parse(edi)

    const options: X12SerializationOptions = {
      format: true,
      endOfLine: '\n'
    }

    const json = JSON.stringify(interchange)

    const generator = new X12Generator(JSON.parse(json), options)

    const edi2 = generator.toString()

    if (edi !== edi2) {
      throw new Error(`Formatted EDI does not match source. Found ${edi2}, expected ${edi}.`)
    }
  })
})