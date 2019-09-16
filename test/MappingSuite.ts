'use strict'

import 'mocha'
import { X12Parser, X12TransactionMap, X12Interchange } from '../core'

import fs = require('fs')

const edi = fs.readFileSync('test/test-data/850.edi', 'utf8')
const mapJson = fs.readFileSync('test/test-data/850_map.json', 'utf8')
const resultJson = fs.readFileSync('test/test-data/850_map_result.json', 'utf8')

describe('X12Mapping', () => {
  it('should map transaction', () => {
    const parser = new X12Parser()
    const interchange = parser.parse(edi) as X12Interchange
    const transaction = interchange.functionalGroups[0].transactions[0]
    const mapper = new X12TransactionMap(JSON.parse(mapJson), transaction)
    const result = JSON.stringify(mapper.toObject())

    if (result !== resultJson) {
      throw new Error(`Formatted JSON does not match source. Found ${result}, expected ${resultJson}.`)
    }
  })
})
