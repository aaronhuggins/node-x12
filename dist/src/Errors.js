'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
class ArgumentNullError extends Error {
    constructor(argumentName) {
        super(`The argument, '${argumentName}', cannot be null.`);
        this.name = 'ArgumentNullError';
    }
}
exports.ArgumentNullError = ArgumentNullError;
class GeneratorError extends Error {
    constructor(message) {
        super(message);
        this.name = 'GeneratorError';
    }
}
exports.GeneratorError = GeneratorError;
class ParserError extends Error {
    constructor(message) {
        super(message);
        this.name = 'ParserError';
    }
}
exports.ParserError = ParserError;
class QuerySyntaxError extends Error {
    constructor(message) {
        super(message);
        this.name = 'QuerySyntaxError';
    }
}
exports.QuerySyntaxError = QuerySyntaxError;
