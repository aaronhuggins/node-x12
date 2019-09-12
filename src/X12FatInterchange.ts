'use strict'

import { JSEDINotation } from './JSEDINotation'
import { X12Interchange } from './X12Interchange'
import { defaultSerializationOptions, X12SerializationOptions } from './X12SerializationOptions'

export class X12FatInterchange {
  /**
   * @description Create a fat interchange.
   * @param {X12SerializationOptions} [options] Options for serializing back to EDI.
   */
  constructor (options?: X12SerializationOptions) {
    this.interchanges = new Array<X12Interchange>()
    this.options = defaultSerializationOptions(options)
  }

  interchanges: X12Interchange[];
  options: X12SerializationOptions;

  /**
   * @description Serialize fat interchange to EDI string.
   * @param {X12SerializationOptions} [options] Options to override serializing back to EDI.
   */
  toString (options?: X12SerializationOptions): string {
    options = options !== undefined
      ? defaultSerializationOptions(options)
      : this.options

    let edi = ''

    for (let i = 0; i < this.interchanges.length; i++) {
      edi += this.interchanges[i].toString(options)

      if (options.format) {
        edi += options.endOfLine
      }
    }

    return edi
  }

  /**
   * @description Serialize interchange to JS EDI Notation object.
   * @returns {JSEDINotation[]}
   */
  toJSEDINotation (): Array<JSEDINotation> {
    const jsen = new Array<JSEDINotation>()

    this.interchanges.forEach((interchange) => {
      jsen.push(interchange.toJSEDINotation())
    })

    return jsen
  }

  /**
   * @description Serialize interchange to JSON object.
   * @returns {object[]}
   */
  toJSON(): Array<object> {
    return this.toJSEDINotation()
  }
}
