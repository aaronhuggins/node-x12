import { ValidationType, ValidationError } from './Interfaces'

// Error codes taken from publicly available documentation
// at https://docs.microsoft.com/en-us/biztalk/core/x12-997-acknowledgment-error-codes
// and at https://support.edifabric.com/hc/en-us/articles/360000380131-X12-997-Acknowledgment-Error-Codes
export const X12ValidationErrorCode: Record<string, (...args: any[]) => ValidationError> = {
  element (code: string, position?: number, dataSample?: string): ValidationError {
    const codeType = 'element'
    let description

    switch (code) {
      case '1':
        description = 'Mandatory data element missing'
        break
      case '2':
        description = 'Conditional and required data element missing'
        break
      case '3': // Return this for any elements outside the validation range.
        description = 'Too many data elements'
        break
      case '4':
        description = 'The data element is too short'
        break
      case '5':
        description = 'The data element is too long'
        break
      case '6':
        description = 'Invalid character in data element'
        break
      case '8':
        description = 'Invalid date'
        break
      case '9':
        description = 'Invalid time'
        break
      case '10':
        description = 'Exclusion condition violated'
        break
      case '11':
        description = 'Too many repetitions'
        break
      case '12':
        description = 'Too many components'
        break
      case '7':
      default:
        description = 'Invalid code value'
        code = '7'
        break
    }

    return {
      description,
      codeType,
      code,
      position,
      dataSample
    }
  },

  segment (code: string, position?: number): ValidationError {
    const codeType = 'segment'
    let description

    switch (code) {
      case '1':
        description = 'Unrecognized segment ID'
        break
      case '2':
        description = 'Unexpected segment'
        break
      case '3':
        description = 'Mandatory segment missing'
        break
      case '4':
        description = 'A loop occurs over maximum times'
        break
      case '5':
        description = 'Segment exceeds maximum use'
        break
      case '6':
        description = 'Segment not in a defined transaction set'
        break
      case '7':
        description = 'Segment not in proper sequence'
        break
      case '8':
      default:
        description = 'The segment has data element errors'
        code = '8'
        break
    }

    return {
      description,
      codeType,
      code,
      position
    }
  },

  transaction (code: string, position?: number): ValidationError {
    const codeType = 'transaction'
    let description

    switch (code) {
      case '1':
        description = 'The transaction set not supported'
        break
      case '2':
        description = 'Transaction set trailer missing'
        break
      case '3':
        description = 'The transaction set control number in header and trailer do not match'
        break
      case '4':
        description = 'Number of included segments does not match actual count'
        break
      case '5':
        description = 'One or more segments in error'
        break
      case '6':
        description = 'Missing or invalid transaction set identifier'
        break
      case '7':
      default:
        description =
          'Missing or invalid transaction set control number (a duplicate transaction number may have occurred)'
        code = '7'
        break
    }

    return {
      description,
      codeType,
      code,
      position
    }
  },

  group (code: string, position?: number): ValidationError {
    const codeType = 'group'
    let description

    switch (code) {
      case '1':
        description = 'The functional group not supported'
        break
      case '2':
        description = 'Functional group version not supported'
        break
      case '3':
        description = 'Functional group trailer missing'
        break
      case '4':
        description = 'Group control number in the functional group header and trailer do not agree'
        break
      case '5':
        description = 'Number of included transaction sets does not match actual count'
        break
      case '6':
      default:
        description = 'Group control number violates syntax (a duplicate group control number may have occurred)'
        code = '6'
        break
    }

    return {
      description,
      codeType,
      code,
      position
    }
  },

  acknowledgement (codeType: ValidationType, code: string, position?: number): ValidationError {
    let description

    switch (code) {
      case 'A':
        description = 'Accepted'
        break
      case 'M':
        description = 'Rejected, message authentication code (MAC) failed'
        break
      case 'P':
        description = 'Partially accepted, at least one transaction set was rejected'
        break
      case 'R':
        description = 'Rejected'
        break
      case 'W':
        description = 'Rejected, assurance failed validity tests'
        break
      case 'X':
        description = 'Rejected, content after decryption could not be analyzed'
        break
      case 'E':
      default:
        description = 'Accepted but errors were noted'
        code = 'E'
        break
    }

    return {
      description,
      codeType,
      code,
      position
    }
  }
}

export function errorLookup (codeType: 'group', code: string, position?: number): ValidationError
export function errorLookup (codeType: 'transaction', code: string, position?: number): ValidationError
export function errorLookup (codeType: 'segment', code: string, position?: number): ValidationError
export function errorLookup (codeType: 'element', code: string, position?: number, dataSample?: string): ValidationError
/**
 * @description Look up a validation error by type and code.
 * @param {ValidationType} codeType - The type of validation being performed.
 * @param {string} code - The actual code to look up.
 * @param {number} [position] - The position at which the error occured.
 * @param {string} [dataSample] - A sample of data assciated with the error.
 * @returns {ValidationError} The validation error for the lookup.
 */
export function errorLookup (
  codeType: ValidationType,
  code: string,
  position?: number,
  dataSample?: string
): ValidationError {
  return X12ValidationErrorCode[codeType](code, position, dataSample)
}
