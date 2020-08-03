import { ValidationType, ValidationError } from './Interfaces'

// Error codes taken from publicly available documentation
// at https://docs.microsoft.com/en-us/biztalk/core/x12-997-acknowledgment-error-codes
// and at https://support.edifabric.com/hc/en-us/articles/360000380131-X12-997-Acknowledgment-Error-Codes
export class X12ValidationErrorCode {
  static element (code: string, position?: number, dataSample?: string): ValidationError {
    switch (code) {
      case '1':
        return {
          description: 'Mandatory data element missing',
          codeType: 'element',
          code,
          position,
          dataSample
        }
      case '2':
        return {
          description: 'Conditional and required data element missing',
          codeType: 'element',
          code,
          position,
          dataSample
        }
      case '3':
        return {
          description: 'Too many data elements', // Return this for any elements outside the validation range.
          codeType: 'element',
          code,
          position,
          dataSample
        }
      case '4':
        return {
          description: 'The data element is too short',
          codeType: 'element',
          code,
          position,
          dataSample
        }
      case '5':
        return {
          description: 'The data element is too long',
          codeType: 'element',
          code,
          position,
          dataSample
        }
      case '6':
        return {
          description: 'Invalid character in data element',
          codeType: 'element',
          code,
          position,
          dataSample
        }
      case '8':
        return {
          description: 'Invalid date',
          codeType: 'element',
          code,
          position,
          dataSample
        }
      case '9':
        return {
          description: 'Invalid time',
          codeType: 'element',
          code,
          position,
          dataSample
        }
      case '10':
        return {
          description: 'Exclusion condition violated',
          codeType: 'element',
          code,
          position,
          dataSample
        }
      case '11':
        return {
          description: 'Too many repetitions',
          codeType: 'element',
          code,
          position,
          dataSample
        }
      case '12':
        return {
          description: 'Too many components',
          codeType: 'element',
          code,
          position,
          dataSample
        }
      case '7':
      default:
        return {
          description: 'Invalid code value',
          codeType: 'element',
          code: '7',
          position,
          dataSample
        }
    }
  }

  static segment (code: string, position?: number): ValidationError {
    switch (code) {
      case '1':
        return {
          description: 'Unrecognized segment ID',
          codeType: 'segment',
          code,
          position
        }
      case '2':
        return {
          description: 'Unexpected segment',
          codeType: 'segment',
          code,
          position
        }
      case '3':
        return {
          description: 'Mandatory segment missing',
          codeType: 'segment',
          code,
          position
        }
      case '4':
        return {
          description: 'A loop occurs over maximum times',
          codeType: 'segment',
          code,
          position
        }
      case '5':
        return {
          description: 'Segment exceeds maximum use',
          codeType: 'segment',
          code,
          position
        }
      case '6':
        return {
          description: 'Segment not in a defined transaction set',
          codeType: 'segment',
          code,
          position
        }
      case '7':
        return {
          description: 'Segment not in proper sequence',
          codeType: 'segment',
          code,
          position
        }
      case '8':
      default:
        return {
          description: 'The segment has data element errors',
          codeType: 'segment',
          code: '8',
          position
        }
    }
  }

  static transaction (code: string, position?: number): ValidationError {
    switch (code) {
      case '1':
        return {
          description: 'The transaction set not supported',
          codeType: 'transaction',
          code,
          position
        }
      case '2':
        return {
          description: 'Transaction set trailer missing',
          codeType: 'transaction',
          code,
          position
        }
      case '3':
        return {
          description: 'The transaction set control number in header and trailer do not match',
          codeType: 'transaction',
          code,
          position
        }
      case '4':
        return {
          description: 'Number of included segments does not match actual count',
          codeType: 'transaction',
          code,
          position
        }
      case '5':
        return {
          description: 'One or more segments in error',
          codeType: 'transaction',
          code,
          position
        }
      case '6':
        return {
          description: 'Missing or invalid transaction set identifier',
          codeType: 'transaction',
          code,
          position
        }
      case '7':
      default:
        return {
          description:
            'Missing or invalid transaction set control number (a duplicate transaction number may have occurred)',
          codeType: 'transaction',
          code: '7',
          position
        }
    }
  }

  static group (code: string, position?: number): ValidationError {
    switch (code) {
      case '1':
        return {
          description: 'The functional group not supported',
          codeType: 'group',
          code,
          position
        }
      case '2':
        return {
          description: 'Functional group version not supported',
          codeType: 'group',
          code,
          position
        }
      case '3':
        return {
          description: 'Functional group trailer missing',
          codeType: 'group',
          code,
          position
        }
      case '4':
        return {
          description: 'Group control number in the functional group header and trailer do not agree',
          codeType: 'group',
          code,
          position
        }
      case '5':
        return {
          description: 'Number of included transaction sets does not match actual count',
          codeType: 'group',
          code,
          position
        }
      case '6':
      default:
        return {
          description: 'Group control number violates syntax (a duplicate group control number may have occurred)',
          codeType: 'group',
          code: '6',
          position
        }
    }
  }

  static acknowledgement (codeType: ValidationType, code: string, position?: number) {
    switch (code) {
      case 'A':
        return {
          description: 'Accepted',
          codeType,
          code,
          position
        }
      case 'M':
        return {
          description: 'Rejected, message authentication code (MAC) failed',
          codeType,
          code,
          position
        }
      case 'P':
        return {
          description: 'Partially accepted, at least one transaction set was rejected',
          codeType,
          code,
          position
        }
      case 'R':
        return {
          description: 'Rejected',
          codeType,
          code,
          position
        }
      case 'W':
        return {
          description: 'Rejected, assurance failed validity tests',
          codeType,
          code,
          position
        }
      case 'X':
        return {
          description: 'Rejected, content after decryption could not be analyzed',
          codeType,
          code,
          position
        }
      case 'E':
      default:
        return {
          description: 'Accepted but errors were noted',
          codeType,
          code: 'E',
          position
        }
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
