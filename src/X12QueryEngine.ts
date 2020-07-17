'use strict'

import { QuerySyntaxError } from './Errors'
import { X12Parser } from './X12Parser'
import { X12Interchange } from './X12Interchange'
import { X12FunctionalGroup } from './X12FunctionalGroup'
import { X12Transaction } from './X12Transaction'
import { X12Segment } from './X12Segment'
import { X12Element } from './X12Element'

export class X12QueryEngine {
  /**
   * @description Factory for querying EDI using the node-x12 object model.
   * @param {X12Parser|boolean} [parser] - Pass an external parser or set the strictness of the internal parser.
   */
  constructor (parser: X12Parser | boolean = true) {
    this._parser = typeof parser === 'boolean'
      ? new X12Parser(parser)
      : parser
  }

  private readonly _parser: X12Parser

  private readonly _forEachPattern: RegExp = /FOREACH\([A-Z0-9]{2,3}\)=>.+/g;
  private readonly _concatPattern: RegExp = /CONCAT\(.+,.+\)=>.+/g;

  /**
   * @description Query all references in an EDI document.
   * @param {string|X12Interchange} rawEdi - An ASCII or UTF8 string of EDI to parse, or an interchange.
   * @param {string} reference - The query string to resolve.
   * @param {string} [defaultValue=null] - A default value to return if result not found.
   * @returns {X12QueryResult[]} An array of results from the EDI document.
   */
  query (rawEdi: string | X12Interchange, reference: string, defaultValue: string = null): X12QueryResult[] {
    const interchange = typeof rawEdi === 'string'
      ? this._parser.parse(rawEdi) as X12Interchange
      : rawEdi

    const forEachMatch = reference.match(this._forEachPattern) // ex. FOREACH(LX)=>MAN02

    if (forEachMatch !== null) {
      reference = this._evaluateForEachQueryPart(forEachMatch[0])
    }

    const concathMatch = reference.match(this._concatPattern) // ex. CONCAT(MAN01,-)=>MAN02
    let concat: any

    if (concathMatch !== null) {
      concat = this._evaluateConcatQueryPart(interchange, concathMatch[0])
      reference = concat.query
    }

    const hlPathMatch = reference.match(/HL\+(\w\+?)+[+-]/g) // ex. HL+O+P+I
    const segPathMatch = reference.match(/((?<!\+)[A-Z0-9]{2,3}-)+/g) // ex. PO1-N9-
    const elmRefMatch = reference.match(/[A-Z0-9]{2,3}[0-9]{2}[^[]?/g) // ex. REF02; need to remove trailing ":" if exists
    const qualMatch = reference.match(/:[A-Z0-9]{2,3}[0-9]{2,}\[["'][^[\]"']+["']\]/g) // ex. :REF01["PO"]

    const results = new Array<X12QueryResult>()

    for (let i = 0; i < interchange.functionalGroups.length; i++) {
      const group = interchange.functionalGroups[i]

      for (let j = 0; j < group.transactions.length; j++) {
        const txn = group.transactions[j]
        let segments = txn.segments

        if (hlPathMatch !== null) {
          segments = this._evaluateHLQueryPart(txn, hlPathMatch[0])
        }

        if (segPathMatch !== null) {
          segments = this._evaluateSegmentPathQueryPart(segments, segPathMatch[0])
        }

        if (elmRefMatch === null) {
          throw new QuerySyntaxError('Element reference queries must contain an element reference!')
        }

        const txnResults = this._evaluateElementReferenceQueryPart(interchange, group, txn, [].concat(segments, [interchange.header, group.header, txn.header, txn.trailer, group.trailer, interchange.trailer]), elmRefMatch[0], qualMatch, defaultValue)

        txnResults.forEach((res) => {
          if (concat !== undefined) {
            res.value = `${concat.value}${concat.separator}${res.value}`
          }

          results.push(res)
        })
      }
    }

    return results
  }

  /**
   * @description Query all references in an EDI document and return the first result.
   * @param {string|X12Interchange} rawEdi - An ASCII or UTF8 string of EDI to parse, or an interchange.
   * @param {string} reference - The query string to resolve.
   * @param {string} [defaultValue=null] - A default value to return if result not found.
   * @returns {X12QueryResult} A result from the EDI document.
   */
  querySingle (rawEdi: string | X12Interchange, reference: string, defaultValue: string = null): X12QueryResult {
    const results = this.query(rawEdi, reference)

    if (reference.match(this._forEachPattern) !== null) {
      const values = results.map((result) => result.value)

      if (values.length !== 0) {
        results[0].value = null
        results[0].values = values
      }
    }

    return results.length === 0 ? null : results[0]
  }

  private _getMacroParts (macroQuery: string): any {
    const macroPart = macroQuery.substr(0, macroQuery.indexOf('=>'))
    const queryPart = macroQuery.substr(macroQuery.indexOf('=>') + 2)
    const parameters = macroPart.substr(macroPart.indexOf('(') + 1, macroPart.length - macroPart.indexOf('(') - 2)

    return {
      macroPart,
      queryPart,
      parameters
    }
  }

  private _evaluateForEachQueryPart (forEachSegment: string): string {
    const {
      queryPart,
      parameters
    } = this._getMacroParts(forEachSegment)

    return `${parameters}-${queryPart}`
  }

  private _evaluateConcatQueryPart (interchange: X12Interchange, concatSegment: string): any {
    const {
      queryPart,
      parameters
    } = this._getMacroParts(concatSegment)

    let value = ''

    const expandedParams = parameters.split(',')

    if (expandedParams.length === 3) {
      expandedParams[1] = ','
    }

    const result = this.querySingle(interchange, expandedParams[0])

    if (result !== null) {
      if (result.value !== null && result.value !== undefined) {
        value = result.value
      } else if (Array.isArray(result.values)) {
        value = result.values.join(expandedParams[1])
      }
    }

    return {
      value,
      separator: expandedParams[1],
      query: queryPart
    }
  }

  private _evaluateHLQueryPart (transaction: X12Transaction, hlPath: string): X12Segment[] {
    let qualified = false
    const pathParts = hlPath.replace('-', '').split('+').filter((value, index, array) => { return (value !== 'HL' && value !== '' && value !== null) })
    const matches = new Array<X12Segment>()

    let lastParentIndex = -1

    for (let i = 0, j = 0; i < transaction.segments.length; i++) {
      const segment = transaction.segments[i]

      if (qualified && segment.tag === 'HL') {
        const parentIndex = parseInt(segment.valueOf(2, '-1'))

        if (parentIndex !== lastParentIndex) {
          j = 0
          qualified = false
        }
      }

      if (!qualified && transaction.segments[i].tag === 'HL' && transaction.segments[i].valueOf(3) === pathParts[j]) {
        lastParentIndex = parseInt(segment.valueOf(2, '-1'))
        j++

        if (j === pathParts.length) {
          qualified = true
        }
      }

      if (qualified) {
        matches.push(transaction.segments[i])
      }
    }

    return matches
  }

  private _evaluateSegmentPathQueryPart (segments: X12Segment[], segmentPath: string): X12Segment[] {
    let qualified = false
    const pathParts = segmentPath.split('-').filter((value, index, array) => { return !!value }) // eslint-disable-line @typescript-eslint/strict-boolean-expressions
    const matches = new Array<X12Segment>()

    for (let i = 0, j = 0; i < segments.length; i++) {
      if (qualified && (segments[i].tag === 'HL' || pathParts.indexOf(segments[i].tag) > -1)) {
        j = 0
        qualified = false
      }

      if (!qualified && segments[i].tag === pathParts[j]) {
        j++

        if (j === pathParts.length) {
          qualified = true
        }
      }

      if (qualified) {
        matches.push(segments[i])
      }
    }

    return matches
  }

  private _evaluateElementReferenceQueryPart (interchange: X12Interchange, functionalGroup: X12FunctionalGroup, transaction: X12Transaction, segments: X12Segment[], elementReference: string, qualifiers: string[], defaultValue: string = null): X12QueryResult[] {
    const reference = elementReference.replace(':', '')
    const tag = reference.substr(0, reference.length - 2)
    const pos = reference.substr(reference.length - 2, 2)
    const posint = parseInt(pos)

    const results = new Array<X12QueryResult>()

    for (let i = 0; i < segments.length; i++) {
      const segment = segments[i]

      if (segment === null || segment === undefined) {
        continue
      }

      if (segment.tag !== tag) {
        continue
      }

      const value = segment.valueOf(posint, defaultValue)

      if (value !== null && this._testQualifiers(transaction, segment, qualifiers)) {
        results.push(new X12QueryResult(interchange, functionalGroup, transaction, segment, segment.elements[posint - 1], value))
      }
    }

    return results
  }

  private _testQualifiers (transaction: X12Transaction, segment: X12Segment, qualifiers: string[]): boolean {
    if (qualifiers === undefined || qualifiers === null) {
      return true
    }

    for (let i = 0; i < qualifiers.length; i++) {
      const qualifier = qualifiers[i].substr(1)
      const elementReference = qualifier.substring(0, qualifier.indexOf('['))
      const elementValue = qualifier.substring(qualifier.indexOf('[') + 2, qualifier.lastIndexOf(']') - 1)
      const tag = elementReference.substr(0, elementReference.length - 2)
      const pos = elementReference.substr(elementReference.length - 2, 2)
      const posint = parseInt(pos)

      for (let j = transaction.segments.indexOf(segment); j > -1; j--) {
        const seg = transaction.segments[j]
        const value = seg.valueOf(posint)

        if (seg.tag === tag && seg.tag === segment.tag && value !== elementValue) {
          return false
        } else if (seg.tag === tag && value === elementValue) {
          break
        }

        if (j === 0) {
          return false
        }
      }
    }

    return true
  }
}

/**
 * @description A result as resolved by the query engine.
 * @typedef {object} X12QueryResult
 * @property {X12Interchange} interchange
 * @property {X12FunctionalGroup} functionalGroup
 * @property {X12Transaction} transaction
 * @property {X12Segment} segment
 * @property {X12Element} element
 * @property {string} [value=null]
 * @property {Array<string | string[]>} [values=[]]
 */

export class X12QueryResult {
  constructor (interchange?: X12Interchange, functionalGroup?: X12FunctionalGroup, transaction?: X12Transaction, segment?: X12Segment, element?: X12Element, value?: string) {
    this.interchange = interchange
    this.functionalGroup = functionalGroup
    this.transaction = transaction
    this.segment = segment
    this.element = element
    this.value = value === null || value === undefined ? element.value : value
    this.values = new Array<string | string[]>()
  }

  interchange: X12Interchange;
  functionalGroup: X12FunctionalGroup;
  transaction: X12Transaction;
  segment: X12Segment;
  element: X12Element;
  value: string;
  values: Array<string | string[]>;
}
