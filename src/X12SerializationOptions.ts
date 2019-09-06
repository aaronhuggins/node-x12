'use strict';

export interface X12SerializationOptions {
    elementDelimiter?: string;
    endOfLine?: string;
    format?: boolean;
    segmentTerminator?: string;
    subElementDelimiter?: string;
}

export function defaultSerializationOptions(options?: X12SerializationOptions): X12SerializationOptions {
    options = options || {};
    
    options.elementDelimiter = options.elementDelimiter || '*';
    options.endOfLine = options.endOfLine || '\n';
    options.format = options.format || false;
    options.segmentTerminator = options.segmentTerminator || '~';
    options.subElementDelimiter = options.subElementDelimiter || '';
    
    if (options.segmentTerminator === '\n') {
        options.endOfLine = '';
    }
    
    return options;
}