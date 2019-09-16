'use strict'

import 'mocha'
import { ArgumentNullError, GeneratorError, ParserError, QuerySyntaxError } from '../src/Errors'
import * as core from '../core'

describe('X12Core', () => {
  it('should export members', () => {
    if (!Object.keys(core).includes('X12Parser')) {
      throw new Error('X12 core is missing X12Parser.')
    }
  })

  it('should create ArgumentNullError', () => {
    const error = new ArgumentNullError('test')

    if (error.message !== 'The argument, \'test\', cannot be null.') {
      throw new Error('ArgumentNullError did not return the correct message.')
    }
  })

  it('should create GeneratorError', () => {
    const error = new GeneratorError('test')

    if (error.message !== 'test') {
      throw new Error('GeneratorError did not return the correct message.')
    }
  })

  it('should create ParserError', () => {
    const error = new ParserError('test')

    if (error.message !== 'test') {
      throw new Error('ParserError did not return the correct message.')
    }
  })

  it('should create QuerySyntaxError', () => {
    const error = new QuerySyntaxError('test')

    if (error.message !== 'test') {
      throw new Error('QuerySyntaxError did not return the correct message.')
    }
  })
})
