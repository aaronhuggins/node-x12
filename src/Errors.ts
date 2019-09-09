'use strict';

export class ArgumentNullError implements Error {
    constructor(argumentName: string) {
        this.name = 'ArgumentNullError';
        this.message = `The argument, '${argumentName}', cannot be null.`;
        this.stack = (new Error()).stack;
    }
    
    name: string;
    message: string;
    stack: string;
}

export class GeneratorError implements Error {
    constructor(message?: string) {
        this.name = 'GeneratorError';
        this.message = message;
        this.stack = (new Error()).stack;
    }
    
    name: string;
    message: string;
    stack: string;
}

export class ParserError implements Error {
    constructor(message?: string) {
        this.name = 'ParserError';
        this.message = message;
        this.stack = (new Error()).stack;
    }
    
    name: string;
    message: string;
    stack: string;
}

export class QuerySyntaxError implements Error {
    constructor(message?: string) {
        this.name = 'QuerySyntaxError';
        this.message = message;
        this.stack = (new Error()).stack;
    }
    
    name: string;
    message: string;
    stack: string;
}