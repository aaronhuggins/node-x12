'use strict'

import 'mocha'
import { X12Parser, X12QueryEngine } from '../core'

import fs = require('fs')

describe('X12QueryEngine', () => {
  it('should handle basic element references', () => {
    const edi = fs.readFileSync('test/test-data/850.edi', 'utf8')
    const parser = new X12Parser(true)
    const engine = new X12QueryEngine(parser)
    const results = engine.query(edi, 'REF02')

    if (results.length !== 2) {
      throw new Error('Expected two matching elements for REF02.')
    }
  })

  it('should handle qualified element references', () => {
    const edi = fs.readFileSync('test/test-data/850.edi', 'utf8')
    const parser = new X12Parser(true)
    const engine = new X12QueryEngine(parser)
    const results = engine.query(edi, 'REF02:REF01["DP"]')

    if (results.length !== 1) {
      throw new Error('Expected one matching element for REF02:REF01["DP"].')
    } else if (results[0].value !== '038') {
      throw new Error('Expected REF02 to be "038".')
    }
  })

  it('should handle segment path element references', () => {
    const edi = fs.readFileSync('test/test-data/850.edi', 'utf8')
    const parser = new X12Parser(true)
    const engine = new X12QueryEngine(parser)
    const results = engine.query(edi, 'PO1-PID05:PID01["F"]')

    if (results.length !== 6) {
      throw new Error(`Expected six matching elements for PO1-PID05:PID01["F"]; received ${results.length}.`)
    }
  })

  it('should handle HL path element references', () => {
    const edi = fs.readFileSync('test/test-data/856.edi', 'utf8')
    const parser = new X12Parser(true)
    const engine = new X12QueryEngine(parser)
    const results = engine.query(edi, 'HL+S+O+I-LIN03')

    if (results[0].value !== '87787D' || results[1].value !== '99887D') {
      throw new Error('Expected two matching elements for HL+S+O+I-LIN03.')
    }
  })

  it('should handle HL paths where HL03 is a number', () => {
    const edi = fs.readFileSync('test/test-data/271.edi', 'utf8')
    const parser = new X12Parser(true)
    const engine = new X12QueryEngine(parser)
    const results = engine.query(edi, 'HL+20+21+22-NM101')

    if (results.length !== 2) {
      throw new Error('Expected two matching elements for HL+20+21+22-NM101.')
    }
  })

  it('should handle FOREACH macro references', () => {
    const edi = fs.readFileSync('test/test-data/850.edi', 'utf8')
    const parser = new X12Parser(true)
    const engine = new X12QueryEngine(parser)
    const result = engine.querySingle(edi, 'FOREACH(PO1)=>PID05:PID01["F"]')

    if (result.values.length !== 6) {
      throw new Error(`Expected six matching elements for FOREACH(PO1)=>PID05:PID01["F"]; received ${result.values.length}.`)
    }
  })

  it('should handle CONCAT macro references', () => {
    const edi = fs.readFileSync('test/test-data/850.edi', 'utf8')
    const parser = new X12Parser(true)
    const engine = new X12QueryEngine(parser)
    const result = engine.querySingle(edi, 'CONCAT(REF02:REF01["DP"], & )=>REF02:REF01["PS"]')

    if (result.value !== '038 & R') {
      throw new Error(`Expected '038 & R'; received '${result.value}'.`)
    }
  })

  it('should return valid range information for segments and elements', () => {
    const edi = fs.readFileSync('test/test-data/850.edi', 'utf8')
    const parser = new X12Parser(true)
    const engine = new X12QueryEngine(parser)
    const result = engine.querySingle(edi, 'BEG03')

    if (result.segment.range.start.line !== 3) {
      throw new Error(`Start line for segment is incorrect; found ${result.segment.range.start.line}, expected 3.`)
    }

    if (result.segment.range.start.character !== 0) {
      throw new Error(`Start char for segment is incorrect; found ${result.segment.range.start.character}, expected 0.`)
    }

    if (result.element.range.start.line !== 3) {
      throw new Error(`Start line for element is incorrect; found ${result.element.range.start.line}, expected 3.`)
    }

    if (result.element.range.start.character !== 10) {
      throw new Error(`Start char for element is incorrect; found ${result.element.range.start.character}, expected 10.`)
    }

    if (result.segment.range.end.line !== 3) {
      throw new Error(`End line for segment is incorrect; found ${result.segment.range.end.line}, expected 3.`)
    }

    if (result.segment.range.end.character !== 41) {
      throw new Error(`End char for segment is incorrect; found ${result.segment.range.end.character}, expected 41.`)
    }

    if (result.element.range.end.line !== 3) {
      throw new Error(`End line for element is incorrect; found ${result.element.range.end.line}, expected 3.`)
    }

    if (result.element.range.end.character !== 20) {
      throw new Error(`End char for element is incorrect; found ${result.element.range.end.character}, expected 20.`)
    }
  })

  it('should handle envelope queries', () => {
    const edi = fs.readFileSync('test/test-data/850.edi', 'utf8')
    const parser = new X12Parser(true)
    const engine = new X12QueryEngine(parser)
    const results = engine.query(edi, 'ISA06')

    if (results.length === 1) {
      if (results[0].value.trim() !== '4405197800') {
        throw new Error(`Expected 4405197800, found ${results[0].value}.`)
      }
    } else {
      throw new Error(`Expected exactly one result. Found ${results.length}.`)
    }
  })

  it('should handle queries for files with line feed segment terminators', () => {
    const edi = fs.readFileSync('test/test-data/850_2.edi', 'utf8')
    const parser = new X12Parser(true)
    const engine = new X12QueryEngine(parser)
    const result = engine.querySingle(edi, 'REF02:REF01["DP"]')

    if (result.value.trim() !== '038') {
      throw new Error(`Expected 038, found ${result.value}.`)
    }
  })

  it('should handle chained qualifiers', () => {
    const edi = fs.readFileSync('test/test-data/850.edi', 'utf8')
    const parser = new X12Parser(true)
    const engine = new X12QueryEngine(parser)
    const results = engine.query(edi, 'REF02:REF01["DP"]:BEG02["SA"]')

    if (results.length === 1) {
      if (results[0].value.trim() !== '038') {
        throw new Error(`Expected 038, found ${results[0].value}.`)
      }
    } else {
      throw new Error(`Expected exactly one result. Found ${results.length}.`)
    }
  })
})
