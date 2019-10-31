export class X12Date extends Date {
  constructor (year?: string | number, month?: string | number, day?: string | number) {
    const originalInput = { year, month, day }
    let length = 8
    let valid = true

    if (month === undefined && day === undefined) {
      if (typeof year === 'number') {
        year = `${year}`
      }

      if (year.length === 6 || year.length === 8) {
        month = parseFloat(year.substring(year.length - 4, year.length - 2))
        day = parseFloat(year.substring(year.length - 2, year.length))
        year = parseFloat(year.substring(year.length - 4, 0))
      } else {
        year = 0
        month = 0
        day = 0
        valid = false
        length = 0
      }
    }

    if (`${year}`.length === 2) {
      length = 6
      year = parseFloat(`20${year}`)
    }

    if (typeof year === 'string') {
      year = parseFloat(year)
    }

    if (typeof month === 'string') {
      month = parseFloat(month) - 1
    } else if (typeof month === 'number') {
      month = month - 1
    }

    if (typeof day === 'string') {
      day = parseFloat(day)
    }

    super(year, month, day)

    this.length = length
    this.originalInput = originalInput
    valid = this.validate()
    this.valid = valid
  }

  length: number
  valid: boolean
  originalInput: {
    year?: any
    month?: any
    day?: any
  }

  /**
   * @private
   * @description Pad a string with zeros to two characters when only 1 character.
   * @param {string|number} value - The value to pad.
   * @returns {string} The value, padded if 1 character.
   */
  private _pad (value: any): any {
    return String.prototype.padStart.call(value, 2, '0')
  }

  /**
   * @private
   * @description Override method to always get the month as a 1-based number.
   * @returns {number} The month as a 1-based number.
   */
  getMonth (): number {
    return super.getMonth() + 1
  }

  /**
   * @description Compares the original input to the internal date calculation.
   * @returns {boolean} Returns true if the internal date matches the original input.
   */
  validate (): boolean {
    const compare: any = {
      year: undefined,
      month: undefined,
      day: undefined
    }
    const month: any = this.getMonth()
    const day: any = this.getDate()
    let year: any = this.getFullYear()

    if (this.length === 6) {
      year = parseFloat(`${year}`.substring(2, 4))
    }

    if (`${this.originalInput.year}`.length >= 6) {
      compare.year = `${this._pad(year)}${this._pad(month)}${this._pad(day)}`
    } else {
      compare.year = year
    }

    if (this.originalInput.month !== undefined) {
      compare.month = month
    }

    if (this.originalInput.day !== undefined) {
      compare.day = day
    }

    return !isNaN(this.getTime()) &&
      parseFloat(this.originalInput.year) === parseFloat(compare.year) &&
      // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
      parseFloat(this.originalInput.month || 0) === parseFloat(compare.month || 0) &&
      // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
      parseFloat(this.originalInput.day || 0) === parseFloat(compare.day || 0)
  }

  /**
   * @description Convenience method for getting the date as a string.
   * @param {number} [length] - An optional override for the date length; accepts length 6 or 8.
   * @returns {string} The date asa valid X12 date string.
   */
  toString (length?: number): string {
    let year = this.getFullYear()
    length = length === undefined || (length !== 6 && length !== 8) ? this.length : length

    if (length === 6) {
      year = parseFloat(`${year}`.substring(2, 4))
    }

    return `${this._pad(year)}${this._pad(this.getMonth())}${this._pad(this.getDate())}`
  }

  /**
   * @description Convenience method for getting date as a number.
   * @returns {number} The date as a number primitive.
   */
  toNumber (): number {
    return parseFloat(this.toString())
  }

  /**
   * @description Returns the value as a string when date is valid or a number.
   * @returns {any} The date as a string or number primitive.
   */
  valueOf (): any {
    return this.valid === true ? this.toString() : this.toNumber()
  }
}
