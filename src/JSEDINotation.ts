'use strict'

import { X12SerializationOptions } from './X12SerializationOptions'
import { X12Date } from './X12DataTypes/X12Date'
import { X12Time } from './X12DataTypes/X12Time'

export class JSEDINotation {
  constructor (header?: Array<string | number | X12Date | X12Time>, options?: X12SerializationOptions) {
    this.header = header === undefined ? new Array<string>() : header
    this.options = options === undefined ? {} : options
    this.functionalGroups = new Array<JSEDIFunctionalGroup>()
  }

  options?: X12SerializationOptions;
  header: Array<string | number | X12Date | X12Time>;
  functionalGroups: JSEDIFunctionalGroup[];

  addFunctionalGroup (header: Array<string | number | X12Date | X12Time>): JSEDIFunctionalGroup {
    const functionalGroup = new JSEDIFunctionalGroup(header)

    this.functionalGroups.push(functionalGroup)

    return functionalGroup
  }
}

export class JSEDIFunctionalGroup {
  constructor (header?: Array<string | number | X12Date | X12Time>) {
    this.header = header === undefined ? new Array<string>() : header
    this.transactions = new Array<JSEDITransaction>()
  }

  header: Array<string | number | X12Date | X12Time>;
  transactions: JSEDITransaction[];

  addTransaction (header: Array<string | number | X12Date | X12Time>): JSEDITransaction {
    const transaction = new JSEDITransaction(header)

    this.transactions.push(transaction)

    return transaction
  }
}

export class JSEDITransaction {
  constructor (header?: Array<string | number | X12Date | X12Time>) {
    this.header = header === undefined ? new Array<string>() : header
    this.segments = new Array<JSEDISegment>()
  }

  header: Array<string | number | X12Date | X12Time>;
  segments: JSEDISegment[];

  addSegment (tag: string, elements: Array<string | number | X12Date | X12Time>): JSEDISegment {
    const segment = new JSEDISegment(tag, elements)

    this.segments.push(segment)

    return segment
  }
}

export class JSEDISegment {
  constructor (tag: string, elements: Array<string | number | X12Date | X12Time>) {
    this.tag = tag
    this.elements = elements
  }

  tag: string;
  elements: Array<string | number | X12Date | X12Time>;
}
