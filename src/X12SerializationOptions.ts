'use strict'
import { X12SegmentHeader, GSSegmentHeader, ISASegmentHeader, STSegmentHeader } from './X12SegmentHeader'

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
  elementDelimiter?: string
  endOfLine?: string
  format?: boolean
  segmentTerminator?: string
  subElementDelimiter?: string
  repetitionDelimiter?: string
  segmentHeaders?: X12SegmentHeader[]
}

/**
 * @description Set default values for any missing X12SerializationOptions in an options object.
 * @param {X12SerializationOptions} [options] - Options for serializing to and from EDI.
 * @returns {X12SerializationOptions} Serialization options with defaults filled in.
 */
export function defaultSerializationOptions (options?: X12SerializationOptions): X12SerializationOptions {
  options = options === undefined ? {} : options

  options.elementDelimiter = options.elementDelimiter === undefined ? '*' : options.elementDelimiter
  options.endOfLine = options.endOfLine === undefined ? '\n' : options.endOfLine
  options.format = options.format === undefined ? false : options.format
  options.segmentTerminator = options.segmentTerminator === undefined ? '~' : options.segmentTerminator
  options.subElementDelimiter = options.subElementDelimiter === undefined ? '>' : options.subElementDelimiter
  options.repetitionDelimiter = options.repetitionDelimiter === undefined ? '^' : options.repetitionDelimiter
  options.segmentHeaders = options.segmentHeaders === undefined ? [GSSegmentHeader, ISASegmentHeader, STSegmentHeader] : options.segmentHeaders

  if (options.segmentTerminator === '\n') {
    options.endOfLine = ''
  }

  return options
}
