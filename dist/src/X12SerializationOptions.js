'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
function defaultSerializationOptions(options) {
    options = options || {};
    options.elementDelimiter = options.elementDelimiter || '*';
    options.endOfLine = options.endOfLine || '\n';
    options.format = options.format || false;
    options.segmentTerminator = options.segmentTerminator || '~';
    if (options.segmentTerminator === '\n') {
        options.endOfLine = '';
    }
    return options;
}
exports.defaultSerializationOptions = defaultSerializationOptions;
