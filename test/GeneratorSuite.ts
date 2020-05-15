'use strict'

import 'mocha'
import { JSEDINotation, X12Generator, X12Parser, ISASegmentHeader, GSSegmentHeader, X12Interchange } from '../core'
import fs = require('fs')

describe('X12Generator', () => {
  it('should replicate the source data unless changes are made', () => {
    const edi = fs.readFileSync('test/test-data/850.edi', 'utf8')
    const parser = new X12Parser(true)
    const notation: JSEDINotation = parser.parse(edi).toJSEDINotation() as JSEDINotation

    const generator = new X12Generator(notation)

    const edi2 = generator.toString()

    if (edi !== edi2) {
      throw new Error(`Formatted EDI does not match source. Found ${edi2}, expected ${edi}.`)
    }
  })

  it('should replicate the source data to and from JSON unless changes are made', () => {
    const edi = fs.readFileSync('test/test-data/850.edi', 'utf8')
    const parser = new X12Parser(true)
    const interchange = parser.parse(edi)

    const json = JSON.stringify(interchange)

    const generator = new X12Generator(JSON.parse(json))

    const edi2 = generator.toString()

    if (edi !== edi2) {
      throw new Error(`Formatted EDI does not match source. Found ${edi2}, expected ${edi}.`)
    }
  })

  it('should not generate 271 with 3 ST elements using default segment headers', () => {
    const fileEdi = fs.readFileSync('test/test-data/271.edi', 'utf8').split('~')

    const i = new X12Interchange()

    i.setHeader(fileEdi[0].split('*').slice(1))

    const fg = i.addFunctionalGroup()

    fg.setHeader(fileEdi[1].split('*').slice(1))

    const t = fg.addTransaction()

    let error
    try {
      t.setHeader(fileEdi[2].split('*').slice(1))
    } catch (err) {
      error = err.message
    }

    console.log(error)

    if (error !== 'Segment "ST" with 3 elements does meet the required count of 2.') {
      throw new Error('271 with 3 ST elements parsing succeed which should not happen')
    }
  })

  it('should generate 271 with 3 ST elements using custom segment headers', () => {
    const fileEdi = fs.readFileSync('test/test-data/271.edi', 'utf8').split('~')

    const i = new X12Interchange({
      segmentHeaders: [
        ISASegmentHeader,
        GSSegmentHeader,
        {
          tag: 'ST',
          layout: {
            ST01: 3,
            ST02: 9,
            ST02_MIN: 4,
            ST03: 35,
            ST03_MIN: 1,
            COUNT: 3,
            PADDING: false
          }
        }
      ]
    })

    i.setHeader(fileEdi[0].split('*').slice(1))

    const fg = i.addFunctionalGroup()

    fg.setHeader(fileEdi[1].split('*').slice(1))

    const t = fg.addTransaction()

    t.setHeader(fileEdi[2].split('*').slice(1))
  })

  it('should validate custom segment headers', () => {
    const edi = fs.readFileSync('test/test-data/271.edi', 'utf8')

    const options = {
      segmentHeaders: [
        ISASegmentHeader,
        GSSegmentHeader,
        {
          tag: 'ST',
          layout: {
            ST01: 3,
            ST02: 9,
            ST02_MIN: 4,
            ST03: 35,
            ST03_MIN: 1,
            COUNT: 3,
            PADDING: false
          }
        },
        {
          tag: 'HL',
          layout: {
            HL01: 3,
            HL02: 9,
            HL02_MIN: 4,
            HL03: 35,
            HL03_MIN: 1,
            COUNT: 3,
            PADDING: false
          }
        }
      ]
    }

    const parser = new X12Parser(true)
    const interchange = parser.parse(edi)

    const json = JSON.stringify(interchange)

    let error
    try {
      const generator = new X12Generator(JSON.parse(json), options)
      generator.toString()
    } catch (err) {
      error = err.message
    }

    if (error !== 'Segment "HL" with 4 elements does meet the required count of 3.') {
      throw new Error('271 with custom segment headers parsing succeed which should not happen')
    }
  })
})
