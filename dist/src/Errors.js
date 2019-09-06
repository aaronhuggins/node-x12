'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
class ArgumentNullError {
    constructor(argumentName) {
        this.name = 'ArgumentNullError';
        this.message = `The argument, '${argumentName}', cannot be null.`;
    }
}
exports.ArgumentNullError = ArgumentNullError;
class ParserError {
    constructor(message) {
        this.name = 'ParserError';
        this.message = message;
    }
}
exports.ParserError = ParserError;
class QuerySyntaxError {
    constructor(message) {
        this.name = 'QuerySyntaxError';
        this.message = message;
    }
}
exports.QuerySyntaxError = QuerySyntaxError;
