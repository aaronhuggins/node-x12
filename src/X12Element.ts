'use strict'

import { Range } from './Positioning'
import { X12Date } from './X12DataTypes/X12Date'
import { X12Time } from './X12DataTypes/X12Time'

export class X12Element {
  /**
   * @description Create an element.
   * @param {string} value - A value for this element.
   */
  constructor (value: string | number | X12Date | X12Time = '') {
    this.range = new Range()
    this.value = value
  }

  range: Range;
  value: string | number | X12Date | X12Time;
}
