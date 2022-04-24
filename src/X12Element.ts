"use strict";

import { Range } from "./Positioning.ts";

export class X12Element {
  /**
   * @description Create an element.
   * @param {string} value - A value for this element.
   */
  constructor(value: string = "") {
    this.range = new Range();
    this.value = value;
  }

  range: Range;
  value: string;
}
