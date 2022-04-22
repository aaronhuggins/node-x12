'use strict'

import { JSEDINotation } from './JSEDINotation.ts'
import { X12Interchange } from './X12Interchange.ts'
import { X12Parser } from './X12Parser.ts'
import { defaultSerializationOptions, X12SerializationOptions } from './X12SerializationOptions.ts'

export class X12Generator {
  /**
   * @description Factory for generating EDI from JS EDI Notation.
   * @param {JSEDINotation} [jsen] - Javascript EDI Notation object to serialize.
   * @param {X12SerializationOptions} [options] - Options for serializing back to EDI.
   */
  constructor (jsen?: JSEDINotation, options?: X12SerializationOptions) {
    this.jsen = jsen === undefined ? new JSEDINotation() : jsen

    if (typeof jsen === 'object' && jsen.options !== undefined) {
      this.options = defaultSerializationOptions(jsen.options)
    }

    if (options !== undefined || this.options === undefined) {
      this.options = defaultSerializationOptions(options)
    }

    this.interchange = new X12Interchange(this.options)
  }

  private jsen: JSEDINotation
  private interchange: X12Interchange
  private options: X12SerializationOptions

  /**
   * @description Set the JS EDI Notation for this instance.
   * @param {JSEDINotation} [jsen] - Javascript EDI Notation object to serialize.
   */
  setJSEDINotation (jsen: JSEDINotation): void {
    this.jsen = jsen
  }

  /**
   * @description Get the JS EDI Notation for this instance.
   * @returns {JSEDINotation} The JS EDI Notation for this instance.
   */
  getJSEDINotation (): JSEDINotation {
    return this.jsen
  }

  /**
   * @description Set the serialization options for this instance.
   * @param {X12SerializationOptions} [options] - Options for serializing back to EDI.
   */
  setOptions (options: X12SerializationOptions): void {
    this.options = defaultSerializationOptions(options)
  }

  /**
   * @description Get the serialization options for this instance.
   * @returns {X12SerializationOptions} The serialization options for this instance.
   */
  getOptions (): X12SerializationOptions {
    return this.options
  }

  /**
   * @description Validate the EDI in this instance.
   * @returns {X12Interchange} This instance converted to an interchange.
   */
  validate (): X12Interchange {
    this._generate()

    return new X12Parser(true).parse(this.interchange.toString(this.options)) as X12Interchange
  }

  /**
   * @description Serialize the EDI in this instance.
   * @returns {string} This instance converted to an EDI string.
   */
  toString (): string {
    return this.validate().toString(this.options)
  }

  /**
   * @private
   * @description Generate an interchange from the JS EDI Notation in this instance.
   */
  private _generate (): void {
    const genInterchange = new X12Interchange(this.options)

    genInterchange.setHeader(this.jsen.header)

    this.jsen.functionalGroups.forEach(functionalGroup => {
      const genFunctionalGroup = genInterchange.addFunctionalGroup()

      genFunctionalGroup.setHeader(functionalGroup.header)

      functionalGroup.transactions.forEach(transaction => {
        const genTransaction = genFunctionalGroup.addTransaction()

        genTransaction.setHeader(transaction.header)

        transaction.segments.forEach(segment => {
          genTransaction.addSegment(segment.tag, segment.elements)
        })
      })
    })

    this.interchange = genInterchange
  }
}
