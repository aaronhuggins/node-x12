'use strict'

import 'mocha'
import { X12Parser, X12Interchange } from '../core'

import fs = require('fs')

const edi = fs.readFileSync('test/test-data/850.edi', 'utf8')

describe('X12ObjectModel', () => {
  it('should create X12Interchange with string delimiters', () => {
    const interchange = new X12Interchange('~', '*')

    if (interchange.elementDelimiter !== '*') {
      throw new Error('Instance of X12Interchange not successfully created.')
    }
  })

  it('should cast functional group to JSON', () => {
    const parser = new X12Parser()
    const interchange = parser.parse(edi) as X12Interchange
    const functionalGroup = interchange.functionalGroups[0]

    if (typeof functionalGroup.toJSON() !== 'object') {
      throw new Error('Instance of X12FunctionalGroup not cast to JSON.')
    }
  })

  it('should cast transaction set to JSON', () => {
    const parser = new X12Parser()
    const interchange = parser.parse(edi) as X12Interchange
    const functionalGroup = interchange.functionalGroups[0]
    const transaction = functionalGroup.transactions[0]

    if (typeof transaction.toJSON() !== 'object') {
      throw new Error('Instance of X12FunctionalGroup not cast to JSON.')
    }
  })

  it('should cast segment to JSON', () => {
    const parser = new X12Parser()
    const interchange = parser.parse(edi) as X12Interchange
    const functionalGroup = interchange.functionalGroups[0]
    const transaction = functionalGroup.transactions[0]
    const segment = transaction.segments[0]

    if (typeof segment.toJSON() !== 'object') {
      throw new Error('Instance of X12FunctionalGroup not cast to JSON.')
    }
  })
})
