'use strict'

import { JSEDIFunctionalGroup } from './JSEDINotation'
import { X12Segment } from './X12Segment'
import { GSSegmentHeader } from './X12SegmentHeader'
import { X12Transaction } from './X12Transaction'
import { defaultSerializationOptions, X12SerializationOptions } from './X12SerializationOptions'

export class X12FunctionalGroup {
  /**
   * @description Create a functional group.
   * @param {X12SerializationOptions} [options] - Options for serializing back to EDI.
   */
  constructor (options?: X12SerializationOptions) {
    this.transactions = new Array<X12Transaction>()
    this.options = defaultSerializationOptions(options)
  }

  header: X12Segment
  trailer: X12Segment

  transactions: X12Transaction[]

  options: X12SerializationOptions

  /**
   * @description Set a GS header on this functional group.
   * @param {string[]} elements - An array of elements for a GS header.
   */
  setHeader (elements: string[]): void {
    this.header = new X12Segment(GSSegmentHeader.tag, this.options)

    this.header.setElements(elements)

    this._setTrailer()
  }

  /**
   * @description Add a transaction set to this functional group.
   * @returns {X12Transaction} The transaction which was added to this functional group.
   */
  addTransaction (): X12Transaction {
    const transaction = new X12Transaction(this.options)

    this.transactions.push(transaction)

    this.trailer.replaceElement(`${this.transactions.length}`, 1)

    return transaction
  }

  /**
   * @description Serialize functional group to EDI string.
   * @param {X12SerializationOptions} [options] - Options for serializing back to EDI.
   * @returns {string} This functional group converted to EDI string.
   */
  toString (options?: X12SerializationOptions): string {
    options = options !== undefined ? defaultSerializationOptions(options) : this.options

    let edi = this.header.toString(options)

    if (options.format) {
      edi += options.endOfLine
    }

    for (let i = 0; i < this.transactions.length; i++) {
      edi += this.transactions[i].toString(options)

      if (options.format) {
        edi += options.endOfLine
      }
    }

    edi += this.trailer.toString(options)

    return edi
  }

  /**
   * @description Serialize functional group to JSON object.
   * @returns {object} This functional group converted to an object.
   */
  toJSON (): object {
    const jsen = new JSEDIFunctionalGroup(this.header.elements.map(x => x.value))

    this.transactions.forEach(transaction => {
      const jsenTransaction = jsen.addTransaction(transaction.header.elements.map(x => x.value))

      transaction.segments.forEach(segment => {
        jsenTransaction.addSegment(
          segment.tag,
          segment.elements.map(x => x.value)
        )
      })
    })

    return jsen as object
  }

  /**
   * @private
   * @description Set a GE trailer on this functional group.
   */
  private _setTrailer (): void {
    this.trailer = new X12Segment(GSSegmentHeader.trailer, this.options)

    this.trailer.setElements([`${this.transactions.length}`, this.header.valueOf(6)])
  }
}
