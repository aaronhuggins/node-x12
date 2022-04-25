"use strict";

export class ArgumentNullError extends Error {
  constructor(argumentName: string) {
    super(`The argument, '${argumentName}', cannot be null.`);
    this.name = "ArgumentNullError";
  }

  name: string;
}

export class GeneratorError extends Error {
  constructor(message?: string) {
    super(message);
    this.name = "GeneratorError";
  }

  name: string;
}

export class ParserError extends Error {
  constructor(message?: string) {
    super(message);
    this.name = "ParserError";
  }

  name: string;
}

export class QuerySyntaxError extends Error {
  constructor(message?: string) {
    super(message);
    this.name = "QuerySyntaxError";
  }

  name: string;
}
