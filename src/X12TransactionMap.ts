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
  constructor (map: any, transaction?: X12Transaction, helper?: Function) {
    this._map = map
    this._transaction = transaction
    this.helper = helper === undefined ? this._helper : helper
  }

  protected _map: any;
  protected _transaction: X12Transaction;
  protected _object: any
  helper: Function;

  /**
   * @description Set the transaction set to map and optionally a helper function.
   * @param {X12Transaction} transaction - A transaction set to map.
   * @param {Function} helper - A helper function which will be executed on every resolved query value.
   */
  setTransaction (transaction: X12Transaction, helper?: Function): void {
    this._transaction = transaction
    this.helper = helper === undefined ? this._helper : helper
  }

  /**
   * @description Set the transaction set to map and optionally a helper function.
   * @returns {X12Transaction} The transaction from this instance.
   */
  getTransaction (): X12Transaction {
    return this._transaction
  }

  /**
   * @description Map data from the transaction set to a javascript object.
   * @param {object} map - The javascript object containing keys and querys to resolve.
   * @param {Function} [callback] - A callback function which will be passed to the helper function.
   * @returns {object|object[]} The transaction set mapped to an object or an array of objects.
   */
  toObject (map?: any, callback?: Function): any {
    map = map === undefined ? this._map : map

    const clone = JSON.parse(JSON.stringify(map))
    let clones: object[] = null
    const engine = new X12QueryEngine(false)
    const interchange = new X12Interchange()
    interchange.setHeader(['00', '', '00', '', 'ZZ', '00000000', '01', '00000000', '000000', '0000', '|', '00000', '00000000', '0', 'P', '>'])
    interchange.addFunctionalGroup().transactions = [this._transaction]

    Object.keys(map).forEach((key) => {
      if (Object.prototype.hasOwnProperty.call(map, key) as boolean) {
        if (Array.isArray(map[key]) && typeof map[key][0] === 'string') {
          const newArray = new Array<string | string[]>();

          (map[key] as string[]).forEach((query) => {
            try {
              const result = engine.querySingle(interchange, query, '')

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
            const result = engine.querySingle(interchange, map[key], '')

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
   * @description Map data from a javascript object to the transaction set.
   * @param {object} input - The input object to create the transaction from.
   * @param {object} [map] - The map to associate values from the input to the transaction, or a macro object.
   * @param {object} [macroObj={}] - A macro object to add or override methods for the macro directive; properties 'header' and 'segments' are reserved words.
   * @returns {X12Transaction} The transaction created from the object values.
   */
  fromObject (input: any, map?: any, macroObj: any = {}): X12Transaction {
    const macro: any = {
      counter: {},
      currentDate: `${new Date().getFullYear()}${(new Date().getMonth() + 1).toString().padStart(2, '0')}${new Date().getDate().toString().padStart(2, '0')}`,
      sequence: function sequence (value: string) {
        if (macro.counter[value] === undefined) {
          macro.counter[value] = 1
        } else {
          macro.counter[value] += 1
        }

        return {
          val: macro.counter[value]
        }
      },
      json: function json (value: string) {
        return {
          val: JSON.parse(value)
        }
      },
      length: function length (value: any[]) {
        return {
          val: value.length
        }
      },
      map: function map (value: any[], property: string) {
        return {
          val: value.map((item) => item[property])
        }
      },
      sum: function sum (value: any[], property: string, dec: number) {
        let sum = 0

        value.forEach((item) => { sum += item[property] })

        return {
          val: sum.toFixed(dec === undefined ? 0 : dec)
        }
      },
      random: function random () {
        return {
          val: Math.floor(Math.random() * 10000)
        }
      },
      truncate: function truncate (value: string, maxChars: number) {
        return {
          val: `${value}`.substring(0, maxChars)
        }
      }
    }

    const resolveKey = function resolveKey (key: string): any {
      const clean = /(^(`\${)*(input|macro)\[.*(}`)*$)/g

      if (clean.test(key)) {
        // eslint-disable-next-line no-eval
        const result: any = eval(key)

        return result === undefined ? '' : result
      } else {
        return key
      }
    }

    const resolveLoop = function resolveLoop (loop: any[], transaction: X12Transaction): void {
      const start = loop[0]
      const length = resolveKey(start.loopLength)

      for (let i = 0; i < length; i += 1) {
        loop.forEach((segment) => {
          const elements = []

          for (let j = 0; j < segment.elements.length; j += 1) {
            const resolved = resolveKey(segment.elements[j])

            if (Array.isArray(resolved)) {
              elements.push(resolved[i])
            } else {
              elements.push(resolved)
            }
          }

          transaction.addSegment(segment.tag, elements)
        })
      }
    }

    if (map !== undefined) {
      if (map.header === undefined || map.segments === undefined) {
        Object.assign(macro, map)
        map = undefined
      }
    }

    map = map === undefined ? this._map : map

    Object.assign(macro, macroObj)

    const transaction = this._transaction === undefined ? new X12Transaction() : this._transaction
    const header = []
    let looper: any[] = []
    let loop = false

    for (let i = 0; i < map.header.length; i += 1) {
      header.push(resolveKey(map.header[i]))
    }

    transaction.setHeader(header)

    for (let i = 0; i < map.segments.length; i += 1) {
      const segment = map.segments[i]
      const elements = []

      if (segment.loopStart as boolean) {
        looper.push(segment)
        loop = true
      } else if (loop) {
        looper.push(segment)
      }

      if (!loop) {
        for (let j = 0; j < segment.elements.length; j += 1) {
          elements.push(resolveKey(segment.elements[j]))
        }

        transaction.addSegment(segment.tag, elements)
      }

      if (segment.loopEnd as boolean) {
        resolveLoop(looper, transaction)
        looper = []
        loop = false
      }
    }

    this._transaction = transaction

    return transaction
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
