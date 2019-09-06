'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
class X12Diagnostic {
    constructor(level, message, range) {
        this.level = level || X12DiagnosticLevel.Error;
        this.message = message || '';
        this.range = range;
    }
}
exports.X12Diagnostic = X12Diagnostic;
var X12DiagnosticLevel;
(function (X12DiagnosticLevel) {
    X12DiagnosticLevel[X12DiagnosticLevel["Info"] = 0] = "Info";
    X12DiagnosticLevel[X12DiagnosticLevel["Warning"] = 1] = "Warning";
    X12DiagnosticLevel[X12DiagnosticLevel["Error"] = 2] = "Error";
})(X12DiagnosticLevel = exports.X12DiagnosticLevel || (exports.X12DiagnosticLevel = {}));
