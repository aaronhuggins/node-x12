'use strict'

import { QuerySyntaxError } from './Errors'
import { X12Interchange } from './X12Interchange'
import { X12QueryEngine } from './X12QueryEngine'
import { X12Transaction } from './X12Transaction'

export class X12TransactionMap {
  /**
   * @description Factory for mapping transaction set data to javascript object map.
   * @param {object} map - The javascript object containing keys and querys to resolve.
   * @param {X12Transaction} [transaction] - A transaction set to map.
   * @param {Function} helper - A helper function which will be executed on every resolved query value.
   */
  constructor (map: object, transaction?: X12Transaction, helper?: Function) {
    this.map = map
    this.transaction = transaction
    this.helper = helper === undefined ? this._helper : helper
  }

  map: object;
  transaction: X12Transaction;
  helper: Function;

  /**
   * @description Set the transaction set to map and optionally a helper function.
   * @param {X12Transaction} transaction - A transaction set to map.
   * @param {Function} helper - A helper function which will be executed on every resolved query value.
   */
  setTransaction (transaction: X12Transaction, helper?: Function): void {
    this.transaction = transaction
    this.helper = helper === undefined ? this._helper : helper
  }

  /**
   * @description Map data from the transaction set to a javascript object.
   * @param {object} map - The javascript object containing keys and querys to resolve.
   * @param {Function} [callback] - A callback function which will be passed to the helper function.
   * @returns {object|object[]} The transaction set mapped to an object or an array of objects.
   */
  toObject (map?: object, callback?: Function): any {
    map = map === undefined ? this.map : map

    const clone = JSON.parse(JSON.stringify(map))
    let clones: object[] = null
    const engine = new X12QueryEngine(false)
    const interchange = new X12Interchange()
    interchange.setHeader(['00', '', '00', '', 'ZZ', '00000000', '01', '00000000', '000000', '0000', '|', '00000', '00000000', '0', 'P', '>'])
    interchange.addFunctionalGroup().transactions = [this.transaction]

    Object.keys(map).forEach((key) => {
      if (Object.prototype.hasOwnProperty.call(map, key) as boolean) {
        if (Array.isArray(map[key]) && typeof map[key][0] === 'string') {
          const newArray = new Array<string | string[]>();

          (map[key] as string[]).forEach((query) => {
            try {
              const result = engine.querySingle(interchange, query)

              if (result === null) {
                newArray.push(null)
              } else if (result.value === null || Array.isArray(clone[key][0])) {
                if (result.value !== null) {
                  clone[key].forEach((array: string[]) => {
                    array.push(this.helper(key, result.value, query, callback))
                  })
                } else {
                  let superArray = new Array<string[]>()

                  if (Array.isArray(clone[key][0])) {
                    superArray = clone[key]
                  }

                  result.values.forEach((value: string, index: number) => {
                    if (!Array.isArray(superArray[index])) {
                      superArray[index] = new Array<string>()
                    }

                    superArray[index].push(this.helper(key, value, query, callback))
                  })

                  newArray.push(...superArray)
                }
              } else {
                newArray.push(this.helper(key, result.value, query, callback))
              }
            } catch (err) {
              throw new QuerySyntaxError(`${err.message}; bad query in ${map[key]}`)
            }
          })

          clone[key] = newArray
        } else if (typeof map[key] === 'string') {
          try {
            const result = engine.querySingle(interchange, map[key])

            if (result === null) {
              clone[key] = null
            } else if (result.value === null || Array.isArray(clones)) {
              if (result.value !== null) {
                clones.forEach((cloned: object[]) => {
                  cloned[key] = this.helper(key, result.value, map[key], callback)
                })
              } else {
                if (!Array.isArray(clones)) {
                  clones = new Array<object>()
                }

                result.values.forEach((value: string, index: number) => {
                  if (clones[index] === undefined) {
                    clones[index] = JSON.parse(JSON.stringify(clone))
                  }

                  clones[index][key] = this.helper(key, value, map[key], callback)
                })
              }
            } else {
              clone[key] = this.helper(key, result.value, map[key], callback)
            }
          } catch (err) {
            throw new QuerySyntaxError(`${err.message}; bad query in ${map[key]}`)
          }
        } else {
          clone[key] = this.toObject(map[key])
        }
      }
    })

    return Array.isArray(clones)
      ? clones
      : clone
  }

  /**
   * @private
   * @description Default helper function describing the parameters for other helpers.
   * @param {string} key - The current key being set by the mapper.
   * @param {string} value - The current value as resolved by the query engine.
   * @param {string} [query] - The current query as used by the query engine.
   * @param {Function} [callback] - A callback function for signalling back from the helper function.
   * @returns {string} The value as resolved by the query engine; custom helpers may modify this value further.
   */
  private _helper (key: string, value: string, query?: string, callback?: Function): string {
    if (callback !== undefined) {
      callback(key, value, query)
    }

    return value
  }
}
