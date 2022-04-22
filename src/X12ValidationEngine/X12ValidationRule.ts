// deno-lint-ignore-file no-explicit-any
import { X12Segment } from '../X12Segment.ts'
import { X12Element } from '../X12Element.ts'
import { X12Transaction } from '../X12Transaction.ts'
import { X12FunctionalGroup } from '../X12FunctionalGroup.ts'
import { X12Interchange } from '../X12Interchange.ts'
import { ValidationError, ValidationType, ValidationReport } from './Interfaces.ts'
import { errorLookup } from './X12ValidationErrorCode.ts'

export class X12ValidationRule {
  constructor (options: X12ValidationRule) {
    this.ruleType = options.ruleType
    this.engine = options.engine

    if (typeof options.engine === 'string' && options.engine.toLowerCase() !== 'rule') {
      this.engine = new RegExp(options.engine, 'gu')
    } else if (options.engine instanceof RegExp) {
      this.engine = options.engine
    } else {
      this.engine = 'rule'
    }
  }

  engine?: RegExp | 'rule' | string
  ruleType?: ValidationType
  failureCode?: string

  assert? (value: any, position?: number): true | ValidationReport {
    const errors: ValidationError[] = []

    if (this.engine instanceof RegExp) {
      if (!this.engine.test(`${value}`)) {
        errors.push(errorLookup(this.ruleType as any, this.failureCode, position, value))
      }
    }

    return errors.length === 0 || { elements: errors }
  }

  toJSON? (): this {
    if (this.engine instanceof RegExp) {
      return {
        ...this,
        engine: this.engine.source
      }
    }

    return { ...this }
  }
}

export class X12InterchangeRule extends X12ValidationRule {
  constructor (options: X12InterchangeRule) {
    super({ ...options, engine: 'rule', ruleType: 'interchange' })

    if (options.header instanceof X12SegmentRule || typeof options.header === 'object') {
      this.header = new X12SegmentRule(options.header)
    } else {
      this.header = new X12SegmentRule({
        tag: 'ISA',
        mandatory: true,
        elements: [
          { mandatory: true, minMax: [2, 2], checkType: 'id' },
          { mandatory: true, allowBlank: true, minMax: [10, 10], checkType: 'alphanumeric' },
          { mandatory: true, minMax: [2, 2], checkType: 'id' },
          { mandatory: true, allowBlank: true, minMax: [10, 10], checkType: 'alphanumeric' },
          { mandatory: true, minMax: [2, 2], checkType: 'id' },
          { mandatory: true, minMax: [15, 15], checkType: 'alphanumeric' },
          { mandatory: true, minMax: [2, 2], checkType: 'id' },
          { mandatory: true, minMax: [15, 15], checkType: 'alphanumeric' },
          { mandatory: true, checkType: 'dateshort' },
          { mandatory: true, checkType: 'timeshort' },
          { mandatory: true, minMax: [1, 1], checkType: 'id' },
          { mandatory: true, minMax: [5, 5], checkType: 'id' },
          { mandatory: true, minMax: [9, 9], padLength: true, checkType: 'number' },
          { mandatory: true, minMax: [1, 1], checkType: 'id' },
          { mandatory: true, minMax: [1, 1], checkType: 'id' },
          { mandatory: true, minMax: [1, 1], checkType: 'alphanumeric' }
        ]
      })
    }

    this.group = new X12GroupRule(options.group)

    if (options.trailer instanceof X12SegmentRule || typeof options.trailer === 'object') {
      this.trailer = new X12SegmentRule(options.trailer)
    } else {
      this.trailer = new X12SegmentRule({
        tag: 'IEA',
        elements: [
          { mandatory: true, maxLength: 5, checkType: 'number' },
          { mandatory: true, minMax: [9, 9], padLength: true, checkType: 'number' }
        ]
      })
    }
  }

  declare engine?: 'rule'
  declare ruleType?: 'interchange'
  group: X12GroupRule
  header: X12SegmentRule
  trailer: X12SegmentRule

  assert? (interchange: X12Interchange): true | ValidationReport {
    const report: ValidationReport = {}
    const headerResult = this.header.assert?.(interchange.header)
    let pass = true

    if (headerResult !== true) {
      pass = false
      report.interchange = { header: headerResult }
    }

    const groupNumber = parseFloat(interchange.functionalGroups[0].header.valueOf(6, '0'))
    const groupReport = this.group.assert?.(interchange.functionalGroups[0], groupNumber) ?? {}

    if (groupReport !== true) {
      pass = false
      report.groups = [groupReport]
    }

    const trailerResult = this.trailer.assert?.(interchange.trailer)

    if (trailerResult !== true) {
      pass = false
      report.interchange = {
        ...report.interchange,
        trailer: trailerResult
      }
    }

    return pass || report
  }
}

export class X12GroupRule extends X12ValidationRule {
  constructor (options: X12GroupRule) {
    super({ ...options, engine: 'rule', ruleType: 'group' })

    if (options.header instanceof X12SegmentRule || typeof options.header === 'object') {
      this.header = new X12SegmentRule(options.header)
    } else {
      this.header = new X12SegmentRule({
        tag: 'GS',
        mandatory: true,
        elements: [
          { checkType: 'gs01' },
          { minMax: [2, 15], checkType: 'alphanumeric' },
          { minMax: [2, 15], checkType: 'alphanumeric' },
          { checkType: 'date' },
          { checkType: 'time' },
          { minMax: [1, 9], checkType: 'number' },
          { minMax: [1, 2], checkType: 'alphanumeric' },
          { minMax: [1, 12], checkType: 'alphanumeric' }
        ]
      })
    }

    this.transaction = new X12TransactionRule(options.transaction)

    if (options.trailer instanceof X12SegmentRule || typeof options.trailer === 'object') {
      this.trailer = new X12SegmentRule(options.trailer)
    } else {
      this.trailer = new X12SegmentRule({
        tag: 'GE',
        mandatory: true,
        elements: [
          { minMax: [1, 6], checkType: 'number' },
          { minMax: [1, 9], checkType: 'number' }
        ]
      })
    }
  }

  declare engine?: 'rule'
  declare ruleType?: 'group'
  transaction: X12TransactionRule
  header: X12SegmentRule
  trailer: X12SegmentRule

  assert? (group: X12FunctionalGroup, controlNumber: number): true | ValidationReport {
    const errors: ValidationError[] = []
    const transactionReports: ValidationReport[] = []
    const headerResult = this.header.assert?.(group.header)

    if (headerResult !== true) {
      const groupIdResult = headerResult?.elements?.find(error => error.position === 1)
      const groupNumberResult = headerResult?.elements?.find(error => error.position === 6)

      if (typeof groupIdResult === 'object') {
        errors.push(errorLookup(this.ruleType, '1', controlNumber))
      }

      if (typeof groupNumberResult === 'object') {
        errors.push(errorLookup(this.ruleType, '6', controlNumber))
      }
    }

    for (const transaction of group.transactions) {
      const transactionNumber = parseFloat(transaction.header.valueOf(2, '0'))
      const report = this.transaction.assert?.(transaction, transactionNumber)

      if (report !== true) transactionReports.push(report ?? {})
    }

    const trailerResult = this.trailer.assert?.(group.trailer)

    if (trailerResult === true) {
      const transactionCount = parseFloat(group.trailer.valueOf(1, '0'))
      const trailerControlNumber = parseFloat(group.trailer.valueOf(2, '0'))

      if (trailerControlNumber !== controlNumber) {
        errors.push(errorLookup(this.ruleType, '4', controlNumber))
      }

      if (transactionCount !== group.transactions.length) {
        errors.push(errorLookup(this.ruleType, '5', controlNumber))
      }
    }

    if (transactionReports.length > 0 || errors.length > 0) {
      return {
        group: {
          groupId: group.header.valueOf(1),
          groupNumber: controlNumber,
          transactionCount: group.transactions.length,
          errors
        },
        transactions: transactionReports
      }
    }

    return true
  }
}

export class X12TransactionRule extends X12ValidationRule {
  constructor (options: X12TransactionRule) {
    super({ ...options, engine: 'rule', ruleType: 'transaction' })

    if (options.header instanceof X12SegmentRule || typeof options.header === 'object') {
      this.header = new X12SegmentRule(options.header)
    } else {
      this.header = new X12SegmentRule({
        tag: 'ST',
        mandatory: true,
        elements: [{ checkType: 'st01' }, { minMax: [4, 9], checkType: 'number' }]
      })
    }

    this.segments = options.segments.map(segmentRule => new X12SegmentRule(segmentRule))

    if (options.trailer instanceof X12SegmentRule || typeof options.trailer === 'object') {
      this.trailer = new X12SegmentRule(options.trailer)
    } else {
      this.trailer = new X12SegmentRule({
        tag: 'SE',
        mandatory: true,
        elements: [
          { mandatory: true, maxLength: 10, checkType: 'number' },
          { minMax: [4, 9], checkType: 'number' }
        ]
      })
    }
  }

  declare engine?: 'rule'
  declare ruleType?: 'transaction'
  segments: X12SegmentRule[]
  header: X12SegmentRule
  trailer: X12SegmentRule

  assert? (transaction: X12Transaction, controlNumber: number): true | ValidationReport {
    const errors: ValidationError[] = []
    const segmentReports: ValidationReport[] = []
    // deno-lint-ignore no-this-alias
    const _this = this
    const handleLoop = function handleLoop (
      index: number,
      ruleIndex: number
    ): {
      index: number
      ruleIndex: number
    } {
      const segmentLoop: X12SegmentRule[] = []

      // Gather segment rules for loop.
      for (let ri = ruleIndex; ri < _this.segments.length; ri += 1) {
        const loopRule = _this.segments[ri]

        segmentLoop.push(loopRule)

        if (loopRule.loopEnd) {
          ruleIndex = ri + 1
          break
        }
      }

      // Iterate over segments by segment loop
      for (let i = index, loopPosition = 0; i < transaction.segments.length; i += 1) {
        const loopSegment = transaction.segments[i]
        const segmentRule = segmentLoop[loopPosition]
        const segmentPosition = i + 2 // This is because the transaction header is segment position 1.
        if (loopSegment.tag === segmentRule.tag) {
          const report = segmentRule.assert?.(loopSegment, segmentPosition)

          if (report !== true) segmentReports.push(report ?? {})

          if (segmentLoop.length === loopPosition + 1) {
            loopPosition = 0
          } else {
            loopPosition += 1
          }
        } else {
          index = i // Set i to equal j to present new position in evaluating segments.
          break // Break out of loop, as we should be done comparing segments.
        }
      }

      return _this.segments[ruleIndex].loopStart ? handleLoop(index, ruleIndex) : { index, ruleIndex }
    }
    const headerResult = this.header.assert?.(transaction.header, 1)

    if (headerResult !== true) {
      const transactionIdResult = headerResult?.elements?.find(error => error.position === 1)
      const transactionNumberResult = headerResult?.elements?.find(error => error.position === 2)

      segmentReports.push(headerResult ?? {})

      if (typeof transactionIdResult === 'object') {
        errors.push(errorLookup(this.ruleType, '6', controlNumber))
      }

      if (typeof transactionNumberResult === 'object') {
        errors.push(errorLookup(this.ruleType, '7', controlNumber))
      }
    }

    for (let i = 0, ri = 0; i < transaction.segments.length; i += 1, ri += 1) {
      // Handle segment loops, including if followed by additional segment loops
      // Currently can only handle loop depth of 0; loops within segment loops are not currently handled.
      if (typeof this.segments[ri] === 'undefined') {
        segmentReports.push({
          segment: {
            tag: transaction.segments[i].tag,
            position: i,
            errors: [errorLookup('segment', '2', i)]
          }
        })
        continue
      }
      if (this.segments[ri].loopStart) {
        const { index, ruleIndex } = handleLoop(i, ri)
        i = index
        ri = ruleIndex
      }

      const segment = transaction.segments[i]
      const segmentRule = this.segments[ri]
      const segmentPosition = i + 2 // This is because the transaction header is segment position 1.
      const report = segmentRule.assert?.(segment, segmentPosition)

      if (report !== true) segmentReports.push(report ?? {})
    }

    const trailerResult = this.trailer.assert?.(transaction.trailer, transaction.segments.length + 2)

    if (trailerResult === true) {
      const segmentCount = parseFloat(transaction.trailer.valueOf(1, '0'))
      const trailerControlNumber = parseFloat(transaction.trailer.valueOf(2, '0'))

      if (trailerControlNumber !== controlNumber) {
        errors.push(errorLookup(this.ruleType, '3', controlNumber))
      }

      if (segmentCount !== transaction.segments.length + 2) {
        errors.push(errorLookup(this.ruleType, '4', controlNumber))
      }
    } else {
      segmentReports.push(trailerResult ?? {})
    }

    if (segmentReports.length > 0) {
      errors.push(errorLookup(this.ruleType, '5', controlNumber))
    }

    return (
      errors.length === 0 || {
        transaction: {
          transactionId: transaction.header.valueOf(1),
          transactionNumber: controlNumber,
          errors
        },
        segments: segmentReports
      }
    )
  }
}

export class X12SegmentRule extends X12ValidationRule {
  constructor (options: X12SegmentRule) {
    super({ ...options, engine: 'rule', ruleType: 'segment' })

    this.tag = options.tag
    this.elements =
      typeof options.elements === 'string'
        ? options.elements
        : options.elements.map(elementRule => new X12ElementRule(elementRule))
    this.loopStart = options.loopStart
    this.loopEnd = options.loopEnd
    this.mandatory = options.mandatory
  }

  declare engine?: 'rule'
  declare ruleType?: 'segment'
  tag: string
  elements: X12ElementRule[] | 'skip'
  loopStart?: boolean
  loopEnd?: boolean
  mandatory?: boolean

  assert? (segment: X12Segment, position = 1): true | ValidationReport {
    const errors: ValidationError[] = []
    const elements: ValidationError[] = []

    if (segment.tag !== this.tag) {
      errors.push(errorLookup(this.ruleType, '2', position))

      if (this.mandatory) errors.push(errorLookup(this.ruleType, '3', position))
    }

    if (typeof this.elements !== 'string' && Array.isArray(this.elements)) {
      for (let i = 0; i < this.elements.length; i += 1) {
        const element = segment.elements[i]
        const elementRule = this.elements[i]
        const elementPosition = i + 1
        const report = elementRule.assert?.(element, elementPosition)

        if (report !== true) elements.push(...(report?.elements ?? []))
      }

      if (segment.elements.length > this.elements.length) {
        elements.push(errorLookup('element', '3', position))
      }

      if (elements.length > 0) {
        errors.push(errorLookup(this.ruleType, '8', position))
      }
    }

    return (
      errors.length === 0 || {
        segment: {
          tag: segment.tag,
          position,
          errors
        },
        elements
      }
    )
  }
}

export class X12ElementRule extends X12ValidationRule {
  constructor (options: X12ElementRule) {
    super({ ...options, ruleType: 'element' })

    this.expect = options.expect
    this.allowBlank = options.allowBlank
    this.minLength = options.minLength
    this.maxLength = options.maxLength
    this.minMax = options.minMax
    this.padLength = options.padLength
    this.mandatory = options.mandatory
    this.skip = options.skip
    this.checkType = options.checkType
  }

  declare engine?: RegExp | 'rule'
  declare ruleType?: 'element'
  expect?: string
  allowBlank?: boolean
  minLength?: number
  maxLength?: number
  minMax?: [number, number]
  padLength?: boolean
  mandatory?: boolean
  skip?: boolean
  checkType?:
    | 'date'
    | 'datelong'
    | 'dateshort'
    | 'time'
    | 'timelong'
    | 'timeshort'
    | 'number'
    | 'decimal'
    | 'alphanumeric'
    | 'id'
    | 'gs01'
    | 'st01'

  assert? (element: X12Element, position?: number): true | ValidationReport {
    if (this.skip) return true
    if (typeof element === 'undefined') {
      return { elements: [errorLookup(this.ruleType, '2', position, '')] }
    }
    const value = element.value
    const errors: ValidationError[] = []
    // deno-lint-ignore no-this-alias
    const _this = this
    const isLessThanMin = function isLessThanMin (val: string): boolean {
      if (_this.padLength) return false

      return (
        (typeof _this.minLength === 'number' && val.length < _this.minLength) ||
        (Array.isArray(_this.minMax) && val.length < _this.minMax[0])
      )
    }
    const isGreaterThanMax = function isGreaterThanMax (val: string): boolean {
      return (
        (typeof _this.maxLength === 'number' && val.length > _this.maxLength) ||
        (Array.isArray(_this.minMax) && val.length > _this.minMax[1])
      )
    }

    if (this.engine instanceof RegExp) {
      return super.assert?.(value) ?? {}
    } else {
      if (typeof this.expect === 'string') {
        if (value.toString().trim() === this.expect.trim()) {
          return true
        } else {
          errors.push(errorLookup(this.ruleType, '2', position, value))
        }
      }

      if (value.toString().trim() === '') {
        if (this.allowBlank) return true
        if (this.mandatory) {
          errors.push(errorLookup(this.ruleType, '1', position, value))
        } else {
          return true
        }
      }

      if (isLessThanMin(value)) {
        errors.push(errorLookup(this.ruleType, '4', position, value))
      }

      if (isGreaterThanMax(value)) {
        errors.push(errorLookup(this.ruleType, '5', position, value))
      }

      if (typeof this.checkType === 'string') {
        const AN = /^[a-zA-Z0-9!&()*+,-./:;?= '"%@[\]_{}|<>~#$]+$/gu
        const N0 = /^[0-9]+$/gu
        const R = /^[-]{0,1}[.0-9]+$/gu
        const DT = /^[0-9]{6,8}$/gu
        const TM = /^[0-2][0-9][0-5][0-9][0-5][0-9]$|^[0-2][0-9][0-5][0-9]$/gu
        const GS01 = /^[A-Z]{2}$/gu
        const ST01 = /^[0-9]{3}$/gu

        switch (this.checkType) {
          case 'number':
            if (!N0.test(value)) {
              errors.push(errorLookup(this.ruleType, '6', position, value))
            }
            break
          case 'decimal':
            if (!R.test(value)) {
              errors.push(errorLookup(this.ruleType, '6', position, value))
            }
            break
          case 'datelong':
            if (DT.test(value)) {
              if (value.length < 8) errors.push(errorLookup(this.ruleType, '4', position, value))
            } else {
              errors.push(errorLookup(this.ruleType, '6', position, value))
            }
            break
          case 'dateshort':
            if (DT.test(value)) {
              if (value.length > 6) errors.push(errorLookup(this.ruleType, '5', position, value))
            } else {
              errors.push(errorLookup(this.ruleType, '6', position, value))
            }
            break
          case 'date':
            if (!DT.test(value)) {
              errors.push(errorLookup(this.ruleType, '6', position, value))
            }
            break
          case 'timelong':
            if (TM.test(value)) {
              if (value.length < 6) errors.push(errorLookup(this.ruleType, '4', position, value))
            } else {
              errors.push(errorLookup(this.ruleType, '6', position, value))
            }
            break
          case 'timeshort':
            if (TM.test(value)) {
              if (value.length > 4) errors.push(errorLookup(this.ruleType, '5', position, value))
            } else {
              errors.push(errorLookup(this.ruleType, '6', position, value))
            }
            break
          case 'time':
            if (!TM.test(value)) {
              errors.push(errorLookup(this.ruleType, '6', position, value))
            }
            break
          case 'gs01':
            if (!GS01.test(value)) {
              errors.push(errorLookup(this.ruleType, '7', position, value))
            }
            break
          case 'st01':
            if (!ST01.test(value)) {
              errors.push(errorLookup(this.ruleType, '7', position, value))
            }
            break
          case 'alphanumeric':
          case 'id':
          default:
            if (!AN.test(value)) {
              errors.push(errorLookup(this.ruleType, '6', position, value))
            }
            break
        }
      }
    }

    return errors.length === 0 || { elements: errors }
  }
}
