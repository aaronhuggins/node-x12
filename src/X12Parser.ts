// deno-lint-ignore-file no-inferrable-types no-explicit-any ban-types
'use strict'

import { Transform, StringDecoder } from '../deps.ts'
import { ArgumentNullError, ParserError } from './Errors.ts'
import { Range, Position } from './Positioning.ts'
import { X12Diagnostic, X12DiagnosticLevel } from './X12Diagnostic.ts'
import { X12FatInterchange } from './X12FatInterchange.ts'
import { X12Interchange } from './X12Interchange.ts'
import { X12FunctionalGroup } from './X12FunctionalGroup.ts'
import { X12Transaction } from './X12Transaction.ts'
import { X12Segment } from './X12Segment.ts'
import { X12Element } from './X12Element.ts'
import { defaultSerializationOptions, X12SerializationOptions } from './X12SerializationOptions.ts'

const DOCUMENT_MIN_LENGTH: number = 113 // ISA = 106, IEA > 7
const SEGMENT_TERMINATOR_POS: number = 105
const END_OF_LINE_POS: number = 106
const ELEMENT_DELIMITER_POS: number = 3
const SUBELEMENT_DELIMITER_POS: number = 104
const REPETITION_DELIMITER_POS: number = 82
// Legacy note: const INTERCHANGE_CACHE_SIZE: number = 10

export class X12Parser extends Transform {
  /**
   * @description Factory for parsing EDI into interchange object.
   * @param {boolean|X12SerializationOptions} [strict] - Set true to strictly follow the EDI spec; defaults to false.
   * @param {string|X12SerializationOptions} [encoding] - The encoding to use for this instance when parsing a stream; defaults to UTF-8.
   * @param {X12SerializationOptions} [options] - The options to use when parsing a stream.
   */
  constructor (
    strict?: boolean | X12SerializationOptions,
    encoding?: 'ascii' | 'utf8' | X12SerializationOptions,
    options?: X12SerializationOptions
  ) {
    if (strict === undefined) {
      strict = false
    } else if (typeof strict !== 'boolean') {
      options = strict
      strict = false
    }
    if (encoding === undefined) {
      encoding = 'utf8'
    } else if (typeof encoding !== 'string') {
      options = encoding
      encoding = 'utf8'
    }
    super({
      readableObjectMode: true,
      writableObjectMode: true,
      objectMode: true,
      defaultEncoding: encoding
    })
    this.diagnostics = new Array<X12Diagnostic>()
    this._strict = strict
    this._options = options as any
    this._decoder = new StringDecoder(encoding)
    this._parsedISA = false
    this._flushing = false
    this._dataCache = ''
    this._segmentCounter = 0
  }

  private readonly _strict: boolean
  private readonly _decoder: StringDecoder
  private _options: Required<X12SerializationOptions>
  private _dataCache: string
  private _parsedISA: boolean
  private _flushing: boolean
  private _fatInterchange!: X12FatInterchange
  private _interchange!: X12Interchange
  private _group!: X12FunctionalGroup
  private _transaction!: X12Transaction
  private _segmentCounter: number
  diagnostics: X12Diagnostic[]

  /**
   * @description Parse an EDI document.
   * @param {string} edi - An ASCII or UTF8 string of EDI to parse.
   * @param {X12SerializationOptions} [options] - Options for serializing from EDI.
   * @returns {X12Interchange|X12FatInterchange} An interchange or fat interchange.
   */
  parse (edi: string, options?: X12SerializationOptions): X12Interchange | X12FatInterchange {
    if (edi === undefined) {
      throw new ArgumentNullError('edi')
    }

    this.diagnostics.splice(0)

    this._validateEdiLength(edi)

    this._detectOptions(edi, options)

    this._validateIsaLength(edi, this._options.elementDelimiter)

    const segments = this._parseSegments(edi, this._options.segmentTerminator, this._options.elementDelimiter)

    if (segments.length > 2) {
      segments.forEach(segment => {
        this._processSegment(segment)
      })
    } else {
      this._validateEdiSegmentCount()
    }

    return this._fatInterchange === undefined ? this._interchange : this._fatInterchange
  }

  /**
   * @description Method for processing an array of segments into the node-x12 object model; typically used with the finished output of a stream.
   * @param {X12Segment[]} segments - An array of X12Segment objects.
   * @param {X12SerializationOptions} [options] - Options for serializing from EDI.
   * @returns {X12Interchange|X12FatInterchange} An interchange or fat interchange.
   */
  getInterchangeFromSegments (
    segments: X12Segment[],
    options?: X12SerializationOptions
  ): X12Interchange | X12FatInterchange {
    this._options = options === undefined ? this._options : defaultSerializationOptions(options) as any

    segments.forEach(segment => {
      this._processSegment(segment)
    })

    return this._fatInterchange === undefined ? this._interchange : this._fatInterchange
  }

  private _validateEdiSegmentCount (): void {
    const errorMessage =
      'X12 Standard: An EDI document must contain at least one functional group; verify the document contains valid control characters.'

    if (this._strict) {
      throw new ParserError(errorMessage)
    }

    this.diagnostics.push(new X12Diagnostic(X12DiagnosticLevel.Error, errorMessage, new Range(0, 0, 0, 1)))
  }

  private _validateEdiLength (edi: string): void {
    if (edi.length < DOCUMENT_MIN_LENGTH) {
      const errorMessage = `X12 Standard: Document is too short. Document must be at least ${DOCUMENT_MIN_LENGTH} characters long to be well-formed X12.`

      if (this._strict) {
        throw new ParserError(errorMessage)
      }

      this.diagnostics.push(
        new X12Diagnostic(X12DiagnosticLevel.Error, errorMessage, new Range(0, 0, 0, edi.length - 1))
      )
    }
  }

  private _validateIsaLength (edi: string, elementDelimiter: string): void {
    if (edi.charAt(103) !== elementDelimiter) {
      const errorMessage =
        'X12 Standard: The ISA segment is not the correct length (106 characters, including segment terminator).'

      if (this._strict) {
        throw new ParserError(errorMessage)
      }

      this.diagnostics.push(new X12Diagnostic(X12DiagnosticLevel.Error, errorMessage, new Range(0, 0, 0, 2)))
    }
  }

  private _detectOptions (edi: string, options?: X12SerializationOptions): void {
    const segmentTerminator = edi.charAt(SEGMENT_TERMINATOR_POS)
    const elementDelimiter = edi.charAt(ELEMENT_DELIMITER_POS)
    const subElementDelimiter = edi.charAt(SUBELEMENT_DELIMITER_POS)
    const repetitionDelimiter = edi.charAt(REPETITION_DELIMITER_POS)
    let endOfLine: string | undefined = edi.charAt(END_OF_LINE_POS)
    let format = false

    if (options === undefined) {
      if (endOfLine !== '\r' && endOfLine !== '\n') {
        endOfLine = undefined
      } else {
        format = true
      }

      if (endOfLine === '\r' && edi.charAt(END_OF_LINE_POS + 1) === '\n') {
        endOfLine = '\r\n'
      }

      this._options = defaultSerializationOptions({
        segmentTerminator,
        elementDelimiter,
        subElementDelimiter,
        repetitionDelimiter,
        endOfLine,
        format
      }) as any
    } else {
      this._options = defaultSerializationOptions(options) as any
    }
  }

  private _parseSegments (edi: string, segmentTerminator: string, elementDelimiter: string): X12Segment[] {
    const segments = new Array<X12Segment>()

    let tagged = false
    let currentSegment: X12Segment = new X12Segment()
    let currentElement: X12Element = new X12Element()

    for (let i = 0, l = 0, c = 0; i < edi.length; i++) {
      // segment not yet named and not whitespace or delimiter - begin naming segment
      if (!tagged && edi[i].search(/\s/) === -1 && edi[i] !== elementDelimiter && edi[i] !== segmentTerminator) {
        currentSegment.tag += edi[i]

        if (currentSegment.range.start === undefined) {
          currentSegment.range.start = new Position(l, c)
        }

        // trailing line breaks - consume them and increment line number
      } else if (!tagged && edi[i].search(/\s/) > -1) {
        if (edi[i] === '\n') {
          l++
          c = -1
        }

        // segment tag/name is completed - mark as tagged
      } else if (!tagged && edi[i] === elementDelimiter) {
        tagged = true

        currentElement = new X12Element()
        currentElement.range.start = new Position(l, c)

        // segment terminator
      } else if (edi[i] === segmentTerminator) {
        currentElement.range.end = new Position(l, c - 1)
        currentSegment.elements.push(currentElement)

        if (currentSegment.tag === 'IEA' && currentSegment.elements.length === 2) {
          currentSegment.elements[1].value = `${parseInt(currentSegment.elements[1].value, 10)}`
        }

        currentSegment.range.end = new Position(l, c)

        segments.push(currentSegment)

        currentSegment = new X12Segment()
        tagged = false

        if (segmentTerminator === '\n') {
          l++
          c = -1
        }

        // element delimiter
      } else if (tagged && edi[i] === elementDelimiter) {
        currentElement.range.end = new Position(l, c - 1)
        currentSegment.elements.push(currentElement)

        if (currentSegment.tag === 'ISA' && currentSegment.elements.length === 13) {
          currentSegment.elements[12].value = `${parseInt(currentSegment.elements[12].value, 10)}`
        }

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

  private _processSegment (seg: X12Segment): void {
    if (seg.tag === 'ISA') {
      if (this._strict && this._interchange !== undefined && this._interchange.header !== undefined) {
        if (this._fatInterchange === undefined) {
          this._fatInterchange = new X12FatInterchange(this._options)
          this._fatInterchange.interchanges.push(this._interchange)
        }

        this._interchange = new X12Interchange(this._options)
      }

      if (this._interchange === undefined) {
        this._interchange = new X12Interchange(this._options)
      }

      this._processISA(this._interchange, seg)
      this._parsedISA = true
    } else if (seg.tag === 'IEA') {
      this._processIEA(this._interchange, seg)

      if (this._fatInterchange !== undefined) {
        this._fatInterchange.interchanges.push(this._interchange)
      }
    } else if (seg.tag === 'GS') {
      this._group = new X12FunctionalGroup(this._options)

      this._processGS(this._group, seg)
      this._interchange.functionalGroups.push(this._group)
    } else if (seg.tag === 'GE') {
      if (this._group === undefined) {
        const errorMessage = 'X12 Standard: Missing GS segment!'

        if (this._strict) {
          throw new ParserError(errorMessage)
        }

        this.diagnostics.push(new X12Diagnostic(X12DiagnosticLevel.Error, errorMessage, seg.range))
      }

      this._processGE(this._group, seg)
      this._group = undefined as any
    } else if (seg.tag === 'ST') {
      if (this._group === undefined) {
        const errorMessage = `X12 Standard: ${seg.tag} segment cannot appear outside of a functional group.`

        if (this._strict) {
          throw new ParserError(errorMessage)
        }

        this.diagnostics.push(new X12Diagnostic(X12DiagnosticLevel.Error, errorMessage, seg.range))
      }

      this._transaction = new X12Transaction(this._options)

      this._processST(this._transaction, seg)
      this._group.transactions.push(this._transaction)
    } else if (seg.tag === 'SE') {
      if (this._group === undefined) {
        const errorMessage = `X12 Standard: ${seg.tag} segment cannot appear outside of a functional group.`

        if (this._strict) {
          throw new ParserError(errorMessage)
        }

        this.diagnostics.push(new X12Diagnostic(X12DiagnosticLevel.Error, errorMessage, seg.range))
      }

      if (this._transaction === undefined) {
        const errorMessage = 'X12 Standard: Missing ST segment!'

        if (this._strict) {
          throw new ParserError(errorMessage)
        }

        this.diagnostics.push(new X12Diagnostic(X12DiagnosticLevel.Error, errorMessage, seg.range))
      }

      this._processSE(this._transaction, seg)
      this._transaction = undefined as any
    } else {
      if (this._group === undefined) {
        const errorMessage = `X12 Standard: ${seg.tag} segment cannot appear outside of a functional group.`

        if (this._strict) {
          throw new ParserError(errorMessage)
        }

        this.diagnostics.push(new X12Diagnostic(X12DiagnosticLevel.Error, errorMessage, seg.range))
      }

      if (this._transaction === undefined) {
        const errorMessage = `X12 Standard: ${seg.tag} segment cannot appear outside of a transaction.`

        if (this._strict) {
          throw new ParserError(errorMessage)
        }

        this.diagnostics.push(new X12Diagnostic(X12DiagnosticLevel.Error, errorMessage, seg.range))
      } else {
        this._transaction.segments.push(seg)
      }
    }
  }

  private _processISA (interchange: X12Interchange, segment: X12Segment): void {
    interchange.header = segment
  }

  private _processIEA (interchange: X12Interchange, segment: X12Segment): void {
    interchange.trailer = segment

    if (parseInt(segment.valueOf(1) ?? '') !== interchange.functionalGroups.length) {
      const errorMessage = `X12 Standard: The value in IEA01 (${segment.valueOf(
        1
      )}) does not match the number of GS segments in the interchange (${interchange.functionalGroups.length}).`

      if (this._strict) {
        throw new ParserError(errorMessage)
      }

      this.diagnostics.push(new X12Diagnostic(X12DiagnosticLevel.Error, errorMessage, segment.elements[0].range))
    }

    if (segment.valueOf(2) !== interchange.header.valueOf(13)) {
      const errorMessage = `X12 Standard: The value in IEA02 (${segment.valueOf(
        2
      )}) does not match the value in ISA13 (${interchange.header.valueOf(13)}).`

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

    if (parseInt(segment.valueOf(1) ?? '') !== group.transactions.length) {
      const errorMessage = `X12 Standard: The value in GE01 (${segment.valueOf(
        1
      )}) does not match the number of ST segments in the functional group (${group.transactions.length}).`

      if (this._strict) {
        throw new ParserError(errorMessage)
      }

      this.diagnostics.push(new X12Diagnostic(X12DiagnosticLevel.Error, errorMessage, segment.elements[0].range))
    }

    if (segment.valueOf(2) !== group.header.valueOf(6)) {
      const errorMessage = `X12 Standard: The value in GE02 (${segment.valueOf(
        2
      )}) does not match the value in GS06 (${group.header.valueOf(6)}).`

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

    const expectedNumberOfSegments = transaction.segments.length + 2

    if (parseInt(segment.valueOf(1) ?? '') !== expectedNumberOfSegments) {
      const errorMessage = `X12 Standard: The value in SE01 (${segment.valueOf(
        1
      )}) does not match the number of segments in the transaction (${expectedNumberOfSegments}).`

      if (this._strict) {
        throw new ParserError(errorMessage)
      }

      this.diagnostics.push(new X12Diagnostic(X12DiagnosticLevel.Error, errorMessage, segment.elements[0].range))
    }

    if (segment.valueOf(2) !== transaction.header.valueOf(2)) {
      const errorMessage = `X12 Standard: The value in SE02 (${segment.valueOf(
        2
      )}) does not match the value in ST02 (${transaction.header.valueOf(2)}).`

      if (this._strict) {
        throw new ParserError(errorMessage)
      }

      this.diagnostics.push(new X12Diagnostic(X12DiagnosticLevel.Error, errorMessage, segment.elements[1].range))
    }
  }

  private _consumeChunk (chunk: string): void {
    chunk = this._dataCache + chunk
    let rawSegments: string[] | undefined

    if (!this._parsedISA && chunk.length >= DOCUMENT_MIN_LENGTH) {
      this._detectOptions(chunk, this._options)

      this._validateIsaLength(chunk, this._options.elementDelimiter)

      rawSegments = chunk.split(this._options.segmentTerminator)

      if (chunk.charAt(chunk.length - 1) !== this._options.segmentTerminator) {
        this._dataCache = rawSegments[rawSegments.length - 1]
        rawSegments.splice(rawSegments.length - 1, 1)
      }
    }

    if (this._parsedISA) {
      rawSegments = chunk.split(this._options.segmentTerminator)

      if (chunk.charAt(chunk.length - 1) !== this._options.segmentTerminator && !this._flushing) {
        this._dataCache = rawSegments[rawSegments.length - 1]
        rawSegments.splice(rawSegments.length - 1, 1)
      }
    }

    if (Array.isArray(rawSegments)) {
      for (let i = 0; i < rawSegments.length; i += 1) {
        if (rawSegments[i].length > 0) {
          const segments = this._parseSegments(
            rawSegments[i] + this._options.segmentTerminator,
            this._options.segmentTerminator,
            this._options.elementDelimiter
          )

          segments.forEach(segment => {
            this.push(segment)
            this._segmentCounter += 1
          })
        }
      }
    }
  }

  /**
   * @description Flush method for Node API Transform stream.
   * @param {Function} callback - Callback to execute when finished.
   */
  public _flush (callback: Function): void {
    this._flushing = true
    this._consumeChunk(this._dataCache)
    this._flushing = false

    callback()

    this._validateEdiSegmentCount()
  }

  /**
   * @description Transform method for Node API Transform stream.
   * @param {object} chunk - A chunk of data from the read stream.
   * @param {string} encoding - Chunk enoding.
   * @param {Function} callback - Callback signalling chunk is processed and instance is ready for next chunk.
   */
  public _transform (chunk: any, _encoding: string, callback: Function): void {
    this._consumeChunk(this._decoder.write(chunk))

    callback()
  }
}
