import { X12Segment } from '../X12Segment'
import { X12Element } from '../X12Element'
import { X12Transaction } from '../X12Transaction'
import { X12FunctionalGroup } from '../X12FunctionalGroup'
import { X12Interchange } from '../X12Interchange'
import { X12SerializationOptions } from '../X12SerializationOptions'
import { ValidationEngineOptions, ValidationReport, GroupResponseCode } from './Interfaces'
import {
  X12ElementRule,
  X12SegmentRule,
  X12TransactionRule,
  X12GroupRule,
  X12InterchangeRule,
  X12ValidationRule
} from './X12ValidationRule'

const simpleAckMap = {
  header: ['997', '{{ macro | random }}'],
  segments: [
    { tag: 'AK1', elements: ['{{ input.group.groupId }}', '{{ input.group.groupNumber }}'] },
    {
      tag: 'AK2',
      elements: [
        '{{ input.transactions | map: "transactionId" | in_loop }}',
        '{{ input.transactions | map: "transactionNumber" | in_loop }}'
      ],
      loopStart: true,
      loopLength: '{{ input.transactions | size }}'
    },
    {
      tag: 'AK5',
      elements: [
        '{% assign len = input.transactions | size %}{% if len > 0 %}{% if input.group.responseLevel == "note_errors" %}E{% else %}R{% endif %}{% endif %}',
        '{{ input.transactions | map: "transaction.errors.0.code" }}'
      ],
      loopEnd: true
    },
    {
      tag: 'AK9',
      elements: [
        '{{ input.group.groupResponse }}',
        '{{ input.group.transactionCount }}',
        '{{ input.group.transactionCount }}',
        '{% assign errors = input.transactions | size %}{{ input.group.transactionCount | minus: errors }}'
      ]
    }
  ]
}

export class ValidationEngineError extends Error {
  constructor (message: string, report: ValidationReport) {
    super(message)

    Object.setPrototypeOf(this, ValidationEngineError.prototype)

    this.report = report
  }

  report: ValidationReport
}

export class X12ValidationEngine {
  constructor (options: ValidationEngineOptions = {}) {
    const { acknowledgement, throwError, ackMap } = options
    this.pass = true
    this.throwError = false
    this.ackMap = ackMap || simpleAckMap

    if (typeof acknowledgement === 'object') {
      const { isa, gs, options } = acknowledgement

      this.setAcknowledgement(isa, gs, { ...options, txEngine: 'liquidjs' })
    }

    if (throwError) this.throwError = true
  }

  pass: boolean
  report?: ValidationReport
  acknowledgement?: X12Interchange
  hardErrors?: Error[]
  throwError: boolean
  private ackMap: any

  private setAcknowledgement (isa?: X12Segment, gs?: X12Segment, options?: X12SerializationOptions) {
    if (isa instanceof X12Segment && gs instanceof X12Segment) {
      this.acknowledgement = new X12Interchange(options)

      this.acknowledgement.setHeader(isa.elements.map(element => element.value))
      this.acknowledgement.addFunctionalGroup().setHeader(gs.elements.map(element => element.value))
    }
  }

  assert (actual: X12Element, expected: X12ElementRule): true | ValidationReport
  assert (actual: X12Segment, expected: X12SegmentRule): true | ValidationReport
  assert (actual: X12Transaction, expected: X12TransactionRule): true | ValidationReport
  assert (
    actual: X12FunctionalGroup,
    expected: X12GroupRule,
    groupResponse?: GroupResponseCode
  ): true | ValidationReport
  assert (
    actual: X12Interchange,
    expected: X12InterchangeRule,
    groupResponse?: GroupResponseCode
  ): true | ValidationReport
  assert (actual: any, expected: X12ValidationRule, groupResponse?: GroupResponseCode): true | ValidationReport {
    const _this = this
    const setReport = function setReport (results: true | ValidationReport) {
      if (results !== true) {
        _this.pass = false
        _this.report = results
      }
    }
    const passingReport = function (groupId: string, groupNumber: number, transactionCount: number): ValidationReport {
      return {
        group: { groupId, groupNumber, transactionCount, groupResponse: 'A', errors: [] },
        transactions: []
      }
    }

    if (actual instanceof X12Interchange && expected instanceof X12InterchangeRule) {
      const groupId = actual.functionalGroups[0].header.valueOf(1)
      const groupNumber = parseFloat(actual.functionalGroups[0].header.valueOf(6, '0'))
      const transactionCount = actual.functionalGroups[0].transactions.length

      setReport(expected.assert(actual))

      if (this.pass)
        this.report = {
          groups: [passingReport(groupId, groupNumber, transactionCount)]
        }
    }

    if (actual instanceof X12FunctionalGroup && expected instanceof X12GroupRule) {
      const groupId = actual.header.valueOf(1)
      const groupNumber = parseFloat(actual.header.valueOf(6, '0'))
      const transactionCount = actual.transactions.length

      setReport(expected.assert(actual, groupNumber))

      if (this.pass) this.report = passingReport(groupId, groupNumber, transactionCount)
    }

    if (actual instanceof X12Transaction && expected instanceof X12TransactionRule) {
      const transactionNumber = parseFloat(actual.header.valueOf(2, '0'))

      setReport(expected.assert(actual, transactionNumber))
    }

    if (actual instanceof X12Segment && expected instanceof X12SegmentRule) {
      setReport(expected.assert(actual))
    }

    if (actual instanceof X12Element && expected instanceof X12ElementRule) {
      setReport(expected.assert(actual))
    }

    if (this.throwError && !this.pass) {
      throw new ValidationEngineError('The actual X12 document did not meet the expected validation.', this.report)
    }

    return this.pass || this.report
  }

  acknowledge (isa?: X12Segment, gs?: X12Segment, options?: X12SerializationOptions): X12Interchange {
    this.setAcknowledgement(isa, gs, options)

    if (
      this.acknowledgement instanceof X12Interchange &&
      typeof this.report === 'object' &&
      (Array.isArray(this.report.groups) || typeof this.report.group === 'object')
    ) {
      this.acknowledgement.functionalGroups[0].addTransaction().fromObject(
        {
          group: this.report.groups ? this.report.groups[0].group : this.report.group
        },
        this.ackMap
      )

      return this.acknowledgement
    }
  }
}
