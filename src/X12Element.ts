'use strict'

import { Range } from './Positioning'
import { X12Date } from './X12DataTypes/X12Date'

export class X12Element {
  /**
   * @description Create an element.
   * @param {string} value - A value for this element.
   */
  constructor (value: string | number | X12Date = '') {
    this.range = new Range()
    this.value = value
  }

  range: Range;
  value: string | number | X12Date;
}
