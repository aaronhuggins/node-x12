'use strict';

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
    elementDelimiter?: string;
    endOfLine?: string;
    format?: boolean;
    segmentTerminator?: string;
    subElementDelimiter?: string;
}

/**
 * @description Set default values for any missing X12SerializationOptions in an options object.
 * @param {X12SerializationOptions} [options] Options for serializing to and from EDI.
 * @returns {X12SerializationOptions}
 */
export function defaultSerializationOptions(options?: X12SerializationOptions): X12SerializationOptions {
    options = options || {};
    
    options.elementDelimiter = options.elementDelimiter || '*';
    options.endOfLine = options.endOfLine || '\n';
    options.format = options.format || false;
    options.segmentTerminator = options.segmentTerminator || '~';
    options.subElementDelimiter = options.subElementDelimiter || '>';
    
    if (options.segmentTerminator === '\n') {
        options.endOfLine = '';
    }
    
    return options;
}