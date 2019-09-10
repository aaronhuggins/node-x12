'use strict'

import { ArgumentNullError, ParserError } from './Errors'
import { Range, Position } from './Positioning'
import { X12Diagnostic, X12DiagnosticLevel } from './X12Diagnostic'
import { X12FatInterchange } from './X12FatInterchange'
import { X12Interchange } from './X12Interchange'
import { X12FunctionalGroup } from './X12FunctionalGroup'
import { X12Transaction } from './X12Transaction'
import { X12Segment } from './X12Segment'
import { X12Element } from './X12Element'
import { defaultSerializationOptions, X12SerializationOptions } from './X12SerializationOptions'

const DOCUMENT_MIN_LENGTH: number = 113 // ISA = 106, IEA > 7
const SEGMENT_TERMINATOR_POS: number = 105
const ELEMENT_DELIMITER_POS: number = 3
// Legacy note: const INTERCHANGE_CACHE_SIZE: number = 10

export class X12Parser {
  /**
     * @description Factory for parsing EDI into interchange object.
     * @param {boolean} [strict] Set true to strictly follow the EDI spec.
     */
  constructor (strict?: boolean) {
    this.diagnostics = new Array<X12Diagnostic>()
    this._strict = strict
  }

  private readonly _strict: boolean;
  diagnostics: X12Diagnostic[];

  /**
     * @description Parse an EDI document.
     * @param {string} edi An ASCII or UTF8 string of EDI to parse.
     * @param {X12SerializationOptions} [options] Options for serializing from EDI.
     * @returns {X12Interchange|X12FatInterchange} An interchange or a fat interchange.
     */
  parse (edi: string, options?: X12SerializationOptions): X12Interchange | X12FatInterchange {
    if (edi === undefined) {
      throw new ArgumentNullError('edi')
    }

    this.diagnostics.splice(0)

    if (edi.length < DOCUMENT_MIN_LENGTH) {
      const errorMessage = `X12 Standard: Document is too short. Document must be at least ${DOCUMENT_MIN_LENGTH} characters long to be well-formed X12.`

      if (this._strict) {
        throw new ParserError(errorMessage)
      }

      this.diagnostics.push(new X12Diagnostic(X12DiagnosticLevel.Error, errorMessage, new Range(0, 0, 0, edi.length - 1)))
    }

    let segmentTerminator = edi.charAt(SEGMENT_TERMINATOR_POS)
    let elementDelimiter = edi.charAt(ELEMENT_DELIMITER_POS)

    if (options === undefined) {
      options = defaultSerializationOptions({
        segmentTerminator,
        elementDelimiter
      })
    } else {
      options = defaultSerializationOptions(options)
      segmentTerminator = options.segmentTerminator
      elementDelimiter = options.elementDelimiter
    }

    if (edi.charAt(103) !== elementDelimiter) {
      const errorMessage = 'X12 Standard: The ISA segment is not the correct length (106 characters, including segment terminator).'

      if (this._strict) {
        throw new ParserError(errorMessage)
      }

      this.diagnostics.push(new X12Diagnostic(X12DiagnosticLevel.Error, errorMessage, new Range(0, 0, 0, 2)))
    }

    let fatInterchange: X12FatInterchange
    let interchange: X12Interchange
    let group: X12FunctionalGroup
    let transaction: X12Transaction

    const segments = this._parseSegments(edi, segmentTerminator, elementDelimiter)

    segments.forEach((seg) => {
      if (seg.tag === 'ISA') {
        if (this._strict && interchange !== undefined && interchange.header !== undefined) {
          if (fatInterchange === undefined) {
            fatInterchange = new X12FatInterchange(options)
            fatInterchange.interchanges.push(interchange)
          }

          interchange = new X12Interchange(options)
        }

        if (interchange === undefined) {
          interchange = new X12Interchange(options)
        }

        this._processISA(interchange, seg)
      } else if (seg.tag === 'IEA') {
        this._processIEA(interchange, seg)

        if (fatInterchange !== undefined) {
          fatInterchange.interchanges.push(interchange)
        }
      } else if (seg.tag === 'GS') {
        group = new X12FunctionalGroup()

        this._processGS(group, seg)
        interchange.functionalGroups.push(group)
      } else if (seg.tag === 'GE') {
        if (group === undefined) {
          const errorMessage = 'X12 Standard: Missing GS segment!'

          if (this._strict) {
            throw new ParserError(errorMessage)
          }

          this.diagnostics.push(new X12Diagnostic(X12DiagnosticLevel.Error, errorMessage, seg.range))
        }

        this._processGE(group, seg)
        group = undefined
      } else if (seg.tag === 'ST') {
        if (group === undefined) {
          const errorMessage = `X12 Standard: ${seg.tag} segment cannot appear outside of a functional group.`

          if (this._strict) {
            throw new ParserError(errorMessage)
          }

          this.diagnostics.push(new X12Diagnostic(X12DiagnosticLevel.Error, errorMessage, seg.range))
        }

        transaction = new X12Transaction()

        this._processST(transaction, seg)
        group.transactions.push(transaction)
      } else if (seg.tag === 'SE') {
        if (group === undefined) {
          const errorMessage = `X12 Standard: ${seg.tag} segment cannot appear outside of a functional group.`

          if (this._strict) {
            throw new ParserError(errorMessage)
          }

          this.diagnostics.push(new X12Diagnostic(X12DiagnosticLevel.Error, errorMessage, seg.range))
        }

        if (transaction === undefined) {
          const errorMessage = 'X12 Standard: Missing ST segment!'

          if (this._strict) {
            throw new ParserError(errorMessage)
          }

          this.diagnostics.push(new X12Diagnostic(X12DiagnosticLevel.Error, errorMessage, seg.range))
        }

        this._processSE(transaction, seg)
        transaction = undefined
      } else {
        if (group === undefined) {
          const errorMessage = `X12 Standard: ${seg.tag} segment cannot appear outside of a functional group.`

          if (this._strict) {
            throw new ParserError(errorMessage)
          }

          this.diagnostics.push(new X12Diagnostic(X12DiagnosticLevel.Error, errorMessage, seg.range))
        }

        if (transaction === undefined) {
          const errorMessage = `X12 Standard: ${seg.tag} segment cannot appear outside of a transaction.`

          if (this._strict) {
            throw new ParserError(errorMessage)
          }

          this.diagnostics.push(new X12Diagnostic(X12DiagnosticLevel.Error, errorMessage, seg.range))
        } else {
          transaction.segments.push(seg)
        }
      }
    })

    return fatInterchange === undefined
      ? interchange
      : fatInterchange
  }

  private _parseSegments (edi: string, segmentTerminator: string, elementDelimiter: string): X12Segment[] {
    const segments = new Array<X12Segment>()

    let tagged = false
    let currentSegment: X12Segment
    let currentElement: X12Element

    currentSegment = new X12Segment()

    for (let i = 0, l = 0, c = 0; i < edi.length; i++) {
      // segment not yet named and not whitespace or delimiter - begin naming segment
      if (!tagged && (edi[i].search(/\s/) === -1) && (edi[i] !== elementDelimiter) && (edi[i] !== segmentTerminator)) {
        currentSegment.tag += edi[i]

        if (currentSegment.range.start === undefined) {
          currentSegment.range.start = new Position(l, c)
        }

      // trailing line breaks - consume them and increment line number
      } else if (!tagged && (edi[i].search(/\s/) > -1)) {
        if (edi[i] === '\n') {
          l++
          c = -1
        }

      // segment tag/name is completed - mark as tagged
      } else if (!tagged && (edi[i] === elementDelimiter)) {
        tagged = true

        currentElement = new X12Element()
        currentElement.range.start = new Position(l, c)

      // segment terminator
      } else if (edi[i] === segmentTerminator) {
        currentElement.range.end = new Position(l, (c - 1))
        currentSegment.elements.push(currentElement)
        currentSegment.range.end = new Position(l, c)

        segments.push(currentSegment)

        currentSegment = new X12Segment()
        tagged = false

        if (segmentTerminator === '\n') {
          l++
          c = -1
        }

      // element delimiter
      } else if (tagged && (edi[i] === elementDelimiter)) {
        currentElement.range.end = new Position(l, (c - 1))
        currentSegment.elements.push(currentElement)

        currentElement = new X12Element()
        currentElement.range.start = new Position(l, c + 1)

      // element data
      } else {
        currentElement.value += edi[i]
      }

      c++
    }

    return segments
  }

  private _processISA (interchange: X12Interchange, segment: X12Segment): void {
    interchange.header = segment
  }

  private _processIEA (interchange: X12Interchange, segment: X12Segment): void {
    interchange.trailer = segment

    if (parseInt(segment.valueOf(1)) !== interchange.functionalGroups.length) {
      const errorMessage = `X12 Standard: The value in IEA01 (${segment.valueOf(1)}) does not match the number of GS segments in the interchange (${interchange.functionalGroups.length}).`

      if (this._strict) {
        throw new ParserError(errorMessage)
      }

      this.diagnostics.push(new X12Diagnostic(X12DiagnosticLevel.Error, errorMessage, segment.elements[0].range))
    }

    if (segment.valueOf(2) !== interchange.header.valueOf(13)) {
      const errorMessage = `X12 Standard: The value in IEA02 (${segment.valueOf(2)}) does not match the value in ISA13 (${interchange.header.valueOf(13)}).`

      if (this._strict) {
        throw new ParserError(errorMessage)
      }

      this.diagnostics.push(new X12Diagnostic(X12DiagnosticLevel.Error, errorMessage, segment.elements[1].range))
    }
  }

  private _processGS (group: X12FunctionalGroup, segment: X12Segment): void {
    group.header = segment
  }

  private _processGE (group: X12FunctionalGroup, segment: X12Segment): void {
    group.trailer = segment

    if (parseInt(segment.valueOf(1)) !== group.transactions.length) {
      const errorMessage = `X12 Standard: The value in GE01 (${segment.valueOf(1)}) does not match the number of ST segments in the functional group (${group.transactions.length}).`

      if (this._strict) {
        throw new ParserError(errorMessage)
      }

      this.diagnostics.push(new X12Diagnostic(X12DiagnosticLevel.Error, errorMessage, segment.elements[0].range))
    }

    if (segment.valueOf(2) !== group.header.valueOf(6)) {
      const errorMessage = `X12 Standard: The value in GE02 (${segment.valueOf(2)}) does not match the value in GS06 (${group.header.valueOf(6)}).`

      if (this._strict) {
        throw new ParserError(errorMessage)
      }

      this.diagnostics.push(new X12Diagnostic(X12DiagnosticLevel.Error, errorMessage, segment.elements[1].range))
    }
  }

  private _processST (transaction: X12Transaction, segment: X12Segment): void {
    transaction.header = segment
  }

  private _processSE (transaction: X12Transaction, segment: X12Segment): void {
    transaction.trailer = segment

    const expectedNumberOfSegments = (transaction.segments.length + 2)

    if (parseInt(segment.valueOf(1)) !== expectedNumberOfSegments) {
      const errorMessage = `X12 Standard: The value in SE01 (${segment.valueOf(1)}) does not match the number of segments in the transaction (${expectedNumberOfSegments}).`

      if (this._strict) {
        throw new ParserError(errorMessage)
      }

      this.diagnostics.push(new X12Diagnostic(X12DiagnosticLevel.Error, errorMessage, segment.elements[0].range))
    }

    if (segment.valueOf(2) !== transaction.header.valueOf(2)) {
      const errorMessage = `X12 Standard: The value in SE02 (${segment.valueOf(2)}) does not match the value in ST02 (${transaction.header.valueOf(2)}).`

      if (this._strict) {
        throw new ParserError(errorMessage)
      }

      this.diagnostics.push(new X12Diagnostic(X12DiagnosticLevel.Error, errorMessage, segment.elements[1].range))
    }
  }
}
