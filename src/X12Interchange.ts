'use strict'

import { JSEDINotation } from './JSEDINotation'
import { X12FunctionalGroup } from './X12FunctionalGroup'
import { X12Segment } from './X12Segment'
import { ISASegmentHeader } from './X12SegmentHeader'
import { defaultSerializationOptions, X12SerializationOptions } from './X12SerializationOptions'

export class X12Interchange {
  /**
   * @description Create an interchange.
   * @param {string|X12SerializationOptions} [segmentTerminator] - A character to terminate segments when serializing; or an instance of X12SerializationOptions.
   * @param {string} [elementDelimiter] - A character to separate elements when serializing; only required when segmentTerminator is a character.
   * @param {X12SerializationOptions} [options] - Options for serializing back to EDI.
   */
  constructor (
    segmentTerminator?: string | X12SerializationOptions,
    elementDelimiter?: string,
    options?: X12SerializationOptions
  ) {
    this.functionalGroups = new Array<X12FunctionalGroup>()

    if (typeof segmentTerminator === 'string') {
      this.segmentTerminator = segmentTerminator
      if (typeof elementDelimiter === 'string') {
        this.elementDelimiter = elementDelimiter
      } else {
        throw new TypeError('Parameter "elementDelimiter" must be type of string.')
      }
    } else {
      this.options = defaultSerializationOptions(segmentTerminator)
      this.segmentTerminator = this.options.segmentTerminator
      this.elementDelimiter = this.options.elementDelimiter
    }

    if (this.options === undefined) {
      this.options = defaultSerializationOptions(options)
    }
  }

  header: X12Segment
  trailer: X12Segment

  functionalGroups: X12FunctionalGroup[]

  segmentTerminator: string
  elementDelimiter: string
  options: X12SerializationOptions

  /**
   * @description Set an ISA header on this interchange.
   * @param {string[]} elements - An array of elements for an ISA header.
   */
  setHeader (elements: string[]): void {
    this.header = new X12Segment(ISASegmentHeader.tag, this.options)

    this.header.setElements(elements)

    this._setTrailer()
  }

  /**
   * @description Add a functional group to this interchange.
   * @param {X12SerializationOptions} [options] - Options for serializing back to EDI.
   * @returns {X12FunctionalGroup} The functional group added to this interchange.
   */
  addFunctionalGroup (options?: X12SerializationOptions): X12FunctionalGroup {
    options = options !== undefined ? defaultSerializationOptions(options) : this.options

    const functionalGroup = new X12FunctionalGroup(options)

    this.functionalGroups.push(functionalGroup)

    this.trailer.replaceElement(`${this.functionalGroups.length}`, 1)

    return functionalGroup
  }

  /**
   * @description Serialize interchange to EDI string.
   * @param {X12SerializationOptions} [options] - Options for serializing back to EDI.
   * @returns {string} This interchange converted to an EDI string.
   */
  toString (options?: X12SerializationOptions): string {
    options = options !== undefined ? defaultSerializationOptions(options) : this.options

    let edi = this.header.toString(options)

    if (options.format) {
      edi += options.endOfLine
    }

    for (let i = 0; i < this.functionalGroups.length; i++) {
      edi += this.functionalGroups[i].toString(options)

      if (options.format) {
        edi += options.endOfLine
      }
    }

    edi += this.trailer.toString(options)

    return edi
  }

  /**
   * @description Serialize interchange to JS EDI Notation object.
   * @returns {JSEDINotation} This interchange converted to JS EDI Notation object.
   */
  toJSEDINotation (): JSEDINotation {
    const jsen = new JSEDINotation(
      this.header.elements.map(x => x.value.trim()),
      this.options
    )

    this.functionalGroups.forEach(functionalGroup => {
      const jsenFunctionalGroup = jsen.addFunctionalGroup(functionalGroup.header.elements.map(x => x.value))

      functionalGroup.transactions.forEach(transaction => {
        const jsenTransaction = jsenFunctionalGroup.addTransaction(transaction.header.elements.map(x => x.value))

        transaction.segments.forEach(segment => {
          jsenTransaction.addSegment(
            segment.tag,
            segment.elements.map(x => x.value)
          )
        })
      })
    })

    return jsen
  }

  /**
   * @description Serialize interchange to JSON object.
   * @returns {object} This interchange converted to an object.
   */
  toJSON (): object {
    return this.toJSEDINotation() as object
  }

  /**
   * @private
   * @description Set an ISA trailer on this interchange.
   */
  private _setTrailer (): void {
    this.trailer = new X12Segment(ISASegmentHeader.trailer, this.options)

    this.trailer.setElements([`${this.functionalGroups.length}`, this.header.valueOf(13)])
  }
}
