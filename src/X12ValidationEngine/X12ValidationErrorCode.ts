import { ValidationType, ValidationError } from './Interfaces'

function codeResult (description?: string, codeType?: ValidationType, code?: string, position?: number, dataSample?: string): ValidationError {
  return {
    description,
    codeType,
    code,
    position,
    dataSample
  }
}

// Error codes taken from publicly available documentation
// at https://docs.microsoft.com/en-us/biztalk/core/x12-997-acknowledgment-error-codes
// and at https://support.edifabric.com/hc/en-us/articles/360000380131-X12-997-Acknowledgment-Error-Codes
export class X12ValidationErrorCode {
  static element (code: string, position?: number, dataSample?: string): ValidationError {
    switch (code) {
      case '1':
        return codeResult(
          'Mandatory data element missing',
          'element',
          code,
          position,
          dataSample
        )
      case '2':
        return codeResult(
          'Conditional and required data element missing',
          'element',
          code,
          position,
          dataSample
        )
      case '3': // Return this for any elements outside the validation range.
        return codeResult(
          'Too many data elements',
          'element',
          code,
          position,
          dataSample
        )
      case '4':
        return codeResult(
          'The data element is too short',
          'element',
          code,
          position,
          dataSample
        )
      case '5':
        return codeResult(
          'The data element is too long',
          'element',
          code,
          position,
          dataSample
        )
      case '6':
        return codeResult(
          'Invalid character in data element',
          'element',
          code,
          position,
          dataSample
        )
      case '8':
        return codeResult(
          'Invalid date',
          'element',
          code,
          position,
          dataSample
        )
      case '9':
        return codeResult(
          'Invalid time',
          'element',
          code,
          position,
          dataSample
        )
      case '10':
        return codeResult(
          'Exclusion condition violated',
          'element',
          code,
          position,
          dataSample
        )
      case '11':
        return codeResult(
          'Too many repetitions',
          'element',
          code,
          position,
          dataSample
        )
      case '12':
        return codeResult(
          'Too many components',
          'element',
          code,
          position,
          dataSample
        )
      case '7':
      default:
        return codeResult(
          'Invalid code value',
          'element',
          '7',
          position,
          dataSample
        )
    }
  }

  static segment (code: string, position?: number): ValidationError {
    switch (code) {
      case '1':
        return codeResult(
          'Unrecognized segment ID',
          'segment',
          code,
          position
        )
      case '2':
        return codeResult(
          'Unexpected segment',
          'segment',
          code,
          position
        )
      case '3':
        return codeResult(
          'Mandatory segment missing',
          'segment',
          code,
          position
        )
      case '4':
        return codeResult(
          'A loop occurs over maximum times',
          'segment',
          code,
          position
        )
      case '5':
        return codeResult(
          'Segment exceeds maximum use',
          'segment',
          code,
          position
        )
      case '6':
        return codeResult(
          'Segment not in a defined transaction set',
          'segment',
          code,
          position
        )
      case '7':
        return codeResult(
          'Segment not in proper sequence',
          'segment',
          code,
          position
        )
      case '8':
      default:
        return codeResult(
          'The segment has data element errors',
          'segment',
          '8',
          position
        )
    }
  }

  static transaction (code: string, position?: number): ValidationError {
    switch (code) {
      case '1':
        return codeResult(
          'The transaction set not supported',
          'transaction',
          code,
          position
        )
      case '2':
        return codeResult(
          'Transaction set trailer missing',
          'transaction',
          code,
          position
        )
      case '3':
        return codeResult(
          'The transaction set control number in header and trailer do not match',
          'transaction',
          code,
          position
        )
      case '4':
        return codeResult(
          'Number of included segments does not match actual count',
          'transaction',
          code,
          position
        )
      case '5':
        return codeResult(
          'One or more segments in error',
          'transaction',
          code,
          position
        )
      case '6':
        return codeResult(
          'Missing or invalid transaction set identifier',
          'transaction',
          code,
          position
        )
      case '7':
      default:
        return codeResult(
          'Missing or invalid transaction set control number (a duplicate transaction number may have occurred)',
          'transaction',
          '7',
          position
        )
    }
  }

  static group (code: string, position?: number): ValidationError {
    switch (code) {
      case '1':
        return codeResult(
          'The functional group not supported',
          'group',
          code,
          position
        )
      case '2':
        return codeResult(
          'Functional group version not supported',
          'group',
          code,
          position
        )
      case '3':
        return codeResult(
          'Functional group trailer missing',
          'group',
          code,
          position
        )
      case '4':
        return codeResult(
          'Group control number in the functional group header and trailer do not agree',
          'group',
          code,
          position
        )
      case '5':
        return codeResult(
          'Number of included transaction sets does not match actual count',
          'group',
          code,
          position
        )
      case '6':
      default:
        return codeResult(
          'Group control number violates syntax (a duplicate group control number may have occurred)',
          'group',
          '6',
          position
        )
    }
  }

  static acknowledgement (codeType: ValidationType, code: string, position?: number) {
    switch (code) {
      case 'A':
        return codeResult(
          'Accepted',
          codeType,
          code,
          position
        )
      case 'M':
        return codeResult(
          'Rejected, message authentication code (MAC) failed',
          codeType,
          code,
          position
        )
      case 'P':
        return codeResult(
          'Partially accepted, at least one transaction set was rejected',
          codeType,
          code,
          position
        )
      case 'R':
        return codeResult(
          'Rejected',
          codeType,
          code,
          position
        )
      case 'W':
        return codeResult(
          'Rejected, assurance failed validity tests',
          codeType,
          code,
          position
        )
      case 'X':
        return codeResult(
          'Rejected, content after decryption could not be analyzed',
          codeType,
          code,
          position
        )
      case 'E':
      default:
        return codeResult(
          'Accepted but errors were noted',
          codeType,
          'E',
          position
        )
    }
  }
}

export function errorLookup (codeType: 'group', code: string, position?: number): ValidationError
export function errorLookup (codeType: 'transaction', code: string, position?: number): ValidationError
export function errorLookup (codeType: 'segment', code: string, position?: number): ValidationError
export function errorLookup (codeType: 'element', code: string, position?: number, dataSample?: string): ValidationError
export function errorLookup (
  codeType: ValidationType,
  code: string,
  position?: number,
  dataSample?: string
): ValidationError {
  return X12ValidationErrorCode[codeType](code, position, dataSample)
}
