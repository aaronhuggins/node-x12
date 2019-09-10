'use strict'

/**
 * @description Options for serializing to and from EDI.
 * @typedef {object} X12SerializationOptions
 * @property {string} [elementDelimiter]
 * @property {string} [endOfLine]
 * @property {boolean} [format]
 * @property {string} [segmentTerminator]
 * @property {string} [subElementDelimiter]
 */
export interface X12SerializationOptions {
  elementDelimiter?: string
  endOfLine?: string
  format?: boolean
  segmentTerminator?: string
  subElementDelimiter?: string
}

/**
 * @description Set default values for any missing X12SerializationOptions in an options object.
 * @param {X12SerializationOptions} [options] Options for serializing to and from EDI.
 * @returns {X12SerializationOptions}
 */
export function defaultSerializationOptions (options?: X12SerializationOptions): X12SerializationOptions {
  options = options === undefined ? {} : options

  options.elementDelimiter = options.elementDelimiter === undefined ? '*' : options.elementDelimiter
  options.endOfLine = options.endOfLine === undefined ? '\n' : options.endOfLine
  options.format = options.format === undefined ? false : options.format
  options.segmentTerminator = options.segmentTerminator === undefined ? '~' : options.segmentTerminator
  options.subElementDelimiter = options.subElementDelimiter === undefined ? '>' : options.subElementDelimiter

  if (options.segmentTerminator === '\n') {
    options.endOfLine = ''
  }

  return options
}
