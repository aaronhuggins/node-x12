'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
class ArgumentNullError {
    constructor(argumentName) {
        this.name = 'ArgumentNullError';
        this.message = `The argument, '${argumentName}', cannot be null.`;
        this.stack = (new Error()).stack;
    }
}
exports.ArgumentNullError = ArgumentNullError;
class GeneratorError {
    constructor(message) {
        this.name = 'GeneratorError';
        this.message = message;
        this.stack = (new Error()).stack;
    }
}
exports.GeneratorError = GeneratorError;
class ParserError {
    constructor(message) {
        this.name = 'ParserError';
        this.message = message;
        this.stack = (new Error()).stack;
    }
}
exports.ParserError = ParserError;
class QuerySyntaxError {
    constructor(message) {
        this.name = 'QuerySyntaxError';
        this.message = message;
        this.stack = (new Error()).stack;
    }
}
exports.QuerySyntaxError = QuerySyntaxError;
