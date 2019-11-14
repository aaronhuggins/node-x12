'use strict'

import { X12Date } from './X12DataTypes/X12Date'
import { X12Time } from './X12DataTypes/X12Time'

/**
 * @description Options for serializing to and from EDI.
 * @typedef {object} X12SerializationOptions
 * @property {string} [elementDelimiter=*] The separator for elements within an EDI segment.
 * @property {string} [endOfLine=\n] The end of line charactor for formatting.
 * @property {boolean} [format=false] A flag to set formatting when serializing back to EDI.
 * @property {string} [segmentTerminator=~] The terminator for each EDI segment.
 * @property {string} [subElementDelimiter=>] A sub-element separator; typically found at element 16 of the ISA header segment.
 */
export interface X12SerializationOptions {
  segmentTerminator?: string
  elementDelimiter?: string
  subElementDelimiter?: string
  repetitionDelimiter?: string
  endOfLine?: string
  format?: boolean
  discoverTypes?: boolean
}

/**
 * @description Set default values for any missing X12SerializationOptions in an options object.
 * @param {X12SerializationOptions} [options] - Options for serializing to and from EDI.
 * @returns {X12SerializationOptions} Serialization options with defaults filled in.
 */
export function defaultSerializationOptions (options?: X12SerializationOptions): X12SerializationOptions {
  options = options === undefined ? {} : options

  options.segmentTerminator = options.segmentTerminator === undefined ? '~' : options.segmentTerminator
  options.elementDelimiter = options.elementDelimiter === undefined ? '*' : options.elementDelimiter
  options.subElementDelimiter = options.subElementDelimiter === undefined ? '>' : options.subElementDelimiter
  options.repetitionDelimiter = options.repetitionDelimiter === undefined ? '^' : options.repetitionDelimiter
  options.endOfLine = options.endOfLine === undefined ? '\n' : options.endOfLine
  options.format = options.format === undefined ? false : options.format
  options.discoverTypes = options.discoverTypes === undefined ? false : options.discoverTypes

  if (options.segmentTerminator === '\n') {
    options.endOfLine = ''
  }

  return options
}

/**
 * @description Function which attempts to determine if the value is that of number or Date and returns the result.
 * @param {string} value - The value to coerce to a number or date.
 * @returns {string|number|X12Date} - The coerced value.
 * @todo Implement in version 2.x.
 */
export function discoverValueType (value: string): string | number | X12Date | X12Time {
  let result

  try {
    const int = parseFloat(value)
    result = isNaN(int) ? undefined : int
  } catch (err) {}

  try {
    if (typeof result === 'number') {
      const date = new X12Date(value)

      if (date.valid) {
        result = date
      } else {
        const time = new X12Time(value)

        if (time.valid) {
          result = time
        }
      }
    }
  } catch (err) {}

  return result === undefined
    ? value
    : result
}

/**
 * @description Function which attempts to determine if the value is that of number or Date and returns the result.
 * @param {string|number|X12Date} value - The value to coerce to a number or date.
 * @returns {string} - The coerced value.
 * @todo Implement in version 2.x.
 */
export function renderValueToString (value: string | number | X12Date | X12Time): string {
  let result

  if (value instanceof X12Date || value instanceof X12Time) {
    result = value.toString()
  } else if (typeof value === 'number') {
    result = `${value}`
  } else {
    result = value
  }

  return result
}
