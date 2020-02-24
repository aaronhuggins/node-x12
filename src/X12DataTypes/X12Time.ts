export class X12Time extends Date {
  constructor (hour?: string | number, minute?: string | number, second?: string | number, millisecond?: string | number) {
    super(0)
    const originalInput = {
      hour,
      minute,
      second,
      millisecond
    }
    let valid = true
    let length = 4

    if (second !== undefined) {
      length += 2
    }

    if (millisecond !== undefined) {
      length += `${parseFloat(millisecond as string)}`.length
    }

    if (minute === undefined && second === undefined && millisecond === undefined) {
      if (typeof hour === 'number') {
        hour = `${hour}`
      }

      if (hour.length === 4) {
        minute = parseFloat(hour.substring(2, 4))
        hour = parseFloat(hour.substring(0, 2))
        second = 0
        millisecond = 0
      } else if (hour.length === 6) {
        second = parseFloat(hour.substring(4, 6))
        minute = parseFloat(hour.substring(2, 4))
        hour = parseFloat(hour.substring(0, 2))
        millisecond = 0
        length = 6
      } else if (hour.length > 6 && hour.length <= 9) {
        length = hour.length
        millisecond = parseFloat(hour.substring(6, hour.length))
        second = parseFloat(hour.substring(4, 6))
        minute = parseFloat(hour.substring(2, 4))
        hour = parseFloat(hour.substring(0, 2))
      } else {
        hour = 0
        minute = 0
        second = 0
        millisecond = 0
        length = 0
        valid = false
      }
    }

    if (typeof hour === 'string') {
      hour = parseFloat(hour)
    }

    if (typeof minute === 'string') {
      minute = parseFloat(minute)
    }

    if (typeof second === 'string') {
      second = parseFloat(second)
    }

    if (typeof millisecond === 'string') {
      millisecond = parseFloat(millisecond)
    }

    this.setUTCHours(hour, minute, second, millisecond)
    this.length = length
    this.originalInput = originalInput
    valid = this.validate()
    this.valid = valid
  }

  length: number
  valid: boolean
  originalInput: {
    hour?: any
    minute?: any
    second?: any
    millisecond?: any
  }

  /**
   * @private
   * @description Pad a string with zeros when only 1 character.
   * @param {string|number} value - The value to pad.
   * @returns {string} The value, padded if 1 character.
   */
  private _pad (value: any): any {
    return String.prototype.padStart.call(value, 2, '0')
  }

  /**
   * @description Compares the original input to the internal time calculation.
   * @returns {boolean} Returns true if the internal time matches the original input.
   */
  validate (): boolean {
    const compare: any = {
      hour: undefined,
      minute: undefined,
      second: undefined,
      millisecond: undefined
    }
    const minute: any = this.getUTCMinutes()
    const second: any = this.getUTCSeconds()
    const millisecond: any = this.getUTCMilliseconds()
    const hour: any = this.getUTCHours()

    if (`${this.originalInput.hour}`.length === 4) {
      compare.hour = `${this._pad(hour)}${this._pad(minute)}`
    } else if (`${this.originalInput.hour}`.length === 6) {
      compare.hour = `${this._pad(hour)}${this._pad(minute)}${this._pad(second)}`
    } else if (`${this.originalInput.hour}`.length > 6) {
      compare.hour = `${this._pad(hour)}${this._pad(minute)}${this._pad(second)}${millisecond}`
    } else {
      compare.hour = hour
    }

    if (this.originalInput.minute !== undefined) {
      compare.minute = minute
    }

    if (this.originalInput.second !== undefined) {
      compare.second = second
    }

    if (this.originalInput.millisecond !== undefined) {
      compare.millisecond = millisecond
    }

    return !isNaN(this.getTime()) &&
      parseFloat(this.originalInput.hour) === parseFloat(compare.hour) &&
      // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
      parseFloat(this.originalInput.minute || 0) === parseFloat(compare.minute || 0) &&
      // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
      parseFloat(this.originalInput.second || 0) === parseFloat(compare.second || 0) &&
      // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
      parseFloat(this.originalInput.millisecond || 0) === parseFloat(compare.millisecond || 0)
  }

  /**
   * @description Convenience method for getting the time as a string.
   * @param {number} [length] - An optional override for the time length; accepts lengths 4 or 6 through 9.
   * @returns {string} The time as a valid X12 time string.
   */
  toString (length?: number): string {
    let time
    length = length === undefined || (length !== 4 && (length < 6 || length > 9)) ? this.length : length

    if (length === 4) {
      time = `${this._pad(this.getUTCHours())}${this._pad(this.getUTCMinutes())}`
    }

    if (length === 6) {
      time = `${this._pad(this.getUTCHours())}${this._pad(this.getUTCMinutes())}${this._pad(this.getUTCSeconds())}`
    }

    if (length > 6) {
      time = `${this._pad(this.getUTCHours())}${this._pad(this.getUTCMinutes())}${this._pad(this.getUTCSeconds())}${this.getUTCMilliseconds()}`
    }

    return time
  }

  /**
   * @description Convenience method for getting time as a number.
   * @returns {number} The time as a number primitive.
   */
  toNumber (): number {
    return parseFloat(this.toString())
  }

  /**
   * @description Returns the value as a string when time is valid or a number.
   * @returns {any} The time as a string or number primitive.
   */
  valueOf (): any {
    return this.valid === true ? this.toString() : this.toNumber()
  }
}
