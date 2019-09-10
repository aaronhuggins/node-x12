'use strict'

import { JSEDITransaction } from './JSEDINotation'
import { X12Segment } from './X12Segment'
import { X12SupportedSegments } from './X12Enumerables'
import { X12TransactionMap } from './X12TransactionMap'
import { defaultSerializationOptions, X12SerializationOptions } from './X12SerializationOptions'

export class X12Transaction {
  /**
     * @description Create a transaction set.
     * @param {X12SerializationOptions} [options] Options for serializing back to EDI.
     */
  constructor (options?: X12SerializationOptions) {
    this.segments = new Array<X12Segment>()
    this.options = defaultSerializationOptions(options)
  }

  header: X12Segment;
  trailer: X12Segment;

  segments: X12Segment[];

  options: X12SerializationOptions

  /**
     * @description Set a ST header on this transaction set.
     * @param elements An array of elements for a ST header.
     * @param {X12SerializationOptions} [options] Options for serializing back to EDI.
     */
  setHeader (elements: string[], options?: X12SerializationOptions): void {
    options = options !== undefined
      ? defaultSerializationOptions(options)
      : this.options

    this.header = new X12Segment(X12SupportedSegments.ST, options)

    this.header.setElements(elements)

    this._setTrailer(options)
  }

  /**
     * @description Add a segment to this transaction set.
     * @param {string} tag The tag for this segment.
     * @param {string[]} elements An array of elements for this segment.
     * @param {X12SerializationOptions} [options] Options for serializing back to EDI.
     * @returns {X12Segment}
     */
  addSegment (tag: string, elements: string[], options?: X12SerializationOptions): X12Segment {
    options = options !== undefined
      ? defaultSerializationOptions(options)
      : this.options

    const segment = new X12Segment(tag, options)

    segment.setElements(elements)

    this.segments.push(segment)

    this.trailer.replaceElement(`${this.segments.length + 2}`, 1)

    return segment
  }

  /**
     * @description Map data from a transaction set to a javascript object.
     * @param {object} map The javascript object containing keys and querys to resolve.
     * @param {Function} helper A helper function which will be executed on every resolved query value.
     * @returns {object} An object containing resolved values mapped to object keys.
     */
  toObject (map: object, helper?: Function): object {
    const mapper = new X12TransactionMap(map, this, helper)

    return mapper.toObject()
  }

  /**
     * @description Serialize transaction set to EDI string.
     * @param {X12SerializationOptions} [options] Options for serializing back to EDI.
     * @returns {string}
     */
  toString (options?: X12SerializationOptions): string {
    options = options !== undefined
      ? defaultSerializationOptions(options)
      : this.options

    let edi = this.header.toString(options)

    if (options.format) {
      edi += options.endOfLine
    }

    for (let i = 0; i < this.segments.length; i++) {
      edi += this.segments[i].toString(options)

      if (options.format) {
        edi += options.endOfLine
      }
    }

    edi += this.trailer.toString(options)

    return edi
  }

  /**
     * @description Serialize transaction set to JSON object.
     * @returns {object}
     */
  toJSON (): object {
    const jsen = new JSEDITransaction(this.header.elements.map(x => x.value))

    this.segments.forEach((segment) => {
      jsen.addSegment(segment.tag, segment.elements.map(x => x.value))
    })

    return jsen as object
  }

  /**
     * @description Set a SE trailer on this transaction set.
     * @param {X12SerializationOptions} [options] Options for serializing back to EDI.
     */
  private _setTrailer (options?: X12SerializationOptions): void {
    options = options !== undefined
      ? defaultSerializationOptions(options)
      : this.options

    this.trailer = new X12Segment(X12SupportedSegments.SE, options)

    this.trailer.setElements([`${this.segments.length + 2}`, this.header.valueOf(2)])
  }
}
