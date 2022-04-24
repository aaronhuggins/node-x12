import { X12Segment } from '../X12Segment.ts'
import { X12SerializationOptions } from '../X12SerializationOptions.ts'

export type GroupResponseCode = 'A' | 'E' | 'P' | 'R' | 'M' | 'W' | 'X'

export type ValidationType = 'element' | 'segment' | 'transaction' | 'group' | 'interchange'

export interface ValidationEngineOptions {
  acknowledgement?: {
    isa: X12Segment
    gs: X12Segment
    options?: X12SerializationOptions
    handling?: 'reject' | 'note_errors' | 'allow_partial'
  }
  throwError?: boolean
  // deno-lint-ignore no-explicit-any
  ackMap?: any
}

export interface ValidationReport {
  interchange?: {
    header?: ValidationReport
    trailer?: ValidationReport
  }
  group?: {
    groupId: string
    groupNumber: number
    groupResponse?: GroupResponseCode
    transactionCount: number
    responseLevel?: 'reject' | 'note_errors' | 'allow_partial'
    errors: ValidationError[]
  }
  transaction?: {
    transactionId: string
    transactionNumber: number
    errors: ValidationError[]
  }
  segment?: {
    tag: string
    position: number
    errors: ValidationError[]
  }
  groups?: ValidationReport[]
  transactions?: ValidationReport[]
  segments?: ValidationReport[]
  elements?: ValidationError[]
}

export interface ValidationError {
  description: string
  codeType: ValidationType
  code: string
  position?: number
  dataSample?: string
}
