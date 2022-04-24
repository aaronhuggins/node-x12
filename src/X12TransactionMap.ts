// deno-lint-ignore-file no-explicit-any ban-types
"use strict";

import { QuerySyntaxError } from "./Errors.ts";
import { X12Interchange } from "./X12Interchange.ts";
import { X12QueryEngine, X12QueryMode } from "./X12QueryEngine.ts";
import { X12Transaction } from "./X12Transaction.ts";
import { TxEngine } from "./X12SerializationOptions.ts";
import { crypto, Liquid } from "../deps.ts";

/**
 * @private
 * @description Check if a value is empty.
 * @param {any} val - A value to check.
 * @returns {boolean} Whether the value is empty.
 */
function isEmpty(val: any): boolean {
  if (val === undefined || val === null) return true;
  if (typeof val === "string" && val.trim() === "") return true;

  return false;
}

/**
 * @private
 * @description Check if a string is query mode.
 * @param {any} str - The string to check.
 * @returns {boolean} Whether the string is a query mode.
 */
function isX12QueryMode(str: any): str is X12QueryMode {
  return str === "loose" || str === "strict";
}

/**
 * @private
 * @description Check if a string is query mode.
 * @param {any} str - The string to check.
 * @returns {boolean} Whether the string is a query mode.
 */
function isTxEngine(str: any): str is TxEngine {
  return str === "internal" || str === "liquidjs";
}

export class X12TransactionMap {
  /**
   * @description Factory for mapping transaction set data to javascript object map.
   * @param {object} map - The javascript object containing keys and querys to resolve.
   * @param {X12Transaction} [transaction] - A transaction set to map.
   * @param {Function|'liquidjs'|'internal'|'strict'|'loose'} [helper] - A helper function which will be executed on every resolved query value, a macro engine, or mode.
   * @param {'liquidjs'|'internal'|'strict'|'loose'} [txEngine] - A macro engine to use; either 'internal' or 'liquidjs'; defaults to internal for backwords compatibility, or the mode.
   * @param {'strict'|'loose'} [mode='strict'] - The mode for transforming, passed to the query engine, and defaults to 'strict'; may be set to 'loose' for new behavior with missing elements in the dom.
   */
  constructor(map: any, transaction?: X12Transaction, mode?: X12QueryMode);
  constructor(map: any, transaction?: X12Transaction, txEngine?: TxEngine);
  constructor(
    map: any,
    transaction?: X12Transaction,
    txEngine?: TxEngine,
    mode?: X12QueryMode,
  );
  constructor(
    map: any,
    transaction?: X12Transaction,
    helper?: Function,
    mode?: X12QueryMode,
  );
  constructor(
    map: any,
    transaction?: X12Transaction,
    helper?: Function,
    txEngine?: TxEngine,
  );
  constructor(
    map: any,
    transaction?: X12Transaction,
    helper?: Function,
    txEngine?: TxEngine,
    mode?: X12QueryMode,
  );
  constructor(
    map: any,
    transaction?: X12Transaction,
    helper?: Function | TxEngine | X12QueryMode,
    txEngine?: TxEngine | X12QueryMode,
    mode?: X12QueryMode,
  ) {
    this._map = map;
    if (transaction) this._transaction = transaction;
    this.helper = typeof helper === "function" ? helper : this._helper;

    if (
      typeof helper === "string" &&
      (typeof txEngine === "undefined" || typeof mode === "undefined")
    ) {
      if (isTxEngine(helper)) {
        if (isX12QueryMode(txEngine)) {
          mode = txEngine;
        }

        txEngine = helper;
      } else if (isX12QueryMode(helper)) {
        mode = helper;
      }
    }

    if (
      typeof txEngine === "string" && typeof mode === "undefined" &&
      isX12QueryMode(txEngine)
    ) {
      mode = txEngine;
    }

    this.txEngine = isTxEngine(txEngine) ? txEngine : "internal";
    this._mode = isX12QueryMode(mode) ? mode : "strict";
  }

  protected _map: any;
  protected _transaction!: X12Transaction;
  protected _object: any;
  protected _mode: X12QueryMode;
  helper: Function;
  txEngine: TxEngine;

  /**
   * @description Set the transaction set to map and optionally a helper function.
   * @param {X12Transaction} transaction - A transaction set to map.
   * @param {Function} helper - A helper function which will be executed on every resolved query value.
   */
  setTransaction(transaction: X12Transaction, helper?: Function): void {
    this._transaction = transaction;
    this.helper = helper === undefined ? this._helper : helper;
  }

  /**
   * @description Set the transaction set to map and optionally a helper function.
   * @returns {X12Transaction} The transaction from this instance.
   */
  getTransaction(): X12Transaction {
    return this._transaction;
  }

  /**
   * @description Map data from the transaction set to a javascript object.
   * @param {object} [map] - The javascript object containing keys and querys to resolve.
   * @param {Function} [callback] - A callback function which will be passed to the helper function.
   * @returns {object|object[]} The transaction set mapped to an object or an array of objects.
   */
  toObject(map?: any, callback?: Function): any {
    map = map === undefined ? this._map : map;

    const clone = JSON.parse(JSON.stringify(map));
    let clones: any = null;
    const engine = new X12QueryEngine(false, this._mode);
    const interchange = new X12Interchange();
    interchange.setHeader([
      "00",
      "",
      "00",
      "",
      "ZZ",
      "00000000",
      "01",
      "00000000",
      "000000",
      "0000",
      "|",
      "00000",
      "00000000",
      "0",
      "P",
      ">",
    ]);
    interchange.addFunctionalGroup().transactions = [this._transaction];

    Object.keys(map).forEach((key) => {
      if (Object.prototype.hasOwnProperty.call(map, key) as boolean) {
        if (Array.isArray(map[key]) && typeof map[key][0] === "string") {
          const typedArray: string[] = map[key] as string[];
          const newArray = new Array<string | null | string[]>();

          typedArray.forEach((query) => {
            try {
              const result = engine.querySingle(interchange, query, "");

              if (result === null) {
                newArray.push(null);
              } else if (
                result.value === null || Array.isArray(clone[key][0])
              ) {
                if (result.value !== null) {
                  clone[key].forEach((array: string[]) => {
                    array.push(this.helper(key, result.value, query, callback));
                  });
                } else {
                  let superArray = new Array<string[]>();

                  if (Array.isArray(clone[key][0])) {
                    superArray = clone[key];
                  }

                  result.values.forEach((value, index) => {
                    if (!Array.isArray(superArray[index])) {
                      superArray[index] = new Array<string>();
                    }

                    superArray[index].push(
                      this.helper(key, value, query, callback),
                    );
                  });

                  newArray.push(...superArray);
                }
              } else {
                newArray.push(this.helper(key, result.value, query, callback));
              }
            } catch (err) {
              throw new QuerySyntaxError(
                `${err.message}; bad query in ${map[key]}`,
              );
            }
          });

          clone[key] = newArray;
        } else if (typeof map[key] === "string") {
          try {
            const result = engine.querySingle(interchange, map[key], "");

            if (result === null) {
              clone[key] = null;
            } else if (result.value === null || Array.isArray(clones)) {
              if (result.value !== null) {
                clones.forEach((cloned: any) => {
                  cloned[key as unknown as number] = this.helper(
                    key,
                    result.value,
                    map[key],
                    callback,
                  );
                });
              } else {
                if (!Array.isArray(clones)) {
                  clones = [];
                }

                result.values.forEach((value, index) => {
                  if (clones[index] === undefined) {
                    clones[index] = JSON.parse(JSON.stringify(clone));
                  }

                  (clones as any)[index][key] = this.helper(
                    key,
                    value,
                    map[key],
                    callback,
                  );
                });
              }
            } else {
              clone[key] = this.helper(key, result.value, map[key], callback);
            }
          } catch (err) {
            throw new QuerySyntaxError(
              `${err.message}; bad query in ${map[key]}`,
            );
          }
        } else {
          clone[key] = this.toObject(map[key]);
        }
      }
    });

    return Array.isArray(clones) ? clones : clone;
  }

  /**
   * @description Map data from a javascript object to the transaction set.
   * @param {object} input - The input object to create the transaction from.
   * @param {object} [map] - The map to associate values from the input to the transaction, or a macro object.
   * @param {object} [macroObj={}] - A macro object to add or override methods for the macro directive; properties 'header' and 'segments' are reserved words.
   * @returns {X12Transaction} The transaction created from the object values.
   */
  fromObject(input: any, map?: any, macroObj: any = {}): X12Transaction {
    const counter: { [key: string]: number } = {};
    const levels: { [key: string]: number[] } = {};
    let liquidjs: any;
    const macro: {
      counter: { [key: string]: number };
      [key: string]: any;
    } = {
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      counter: {},
      currentDate: `${new Date().getFullYear()}${
        (new Date().getMonth() + 1).toString().padStart(2, "0")
      }${
        new Date()
          .getDate()
          .toString()
          .padStart(2, "0")
      }`,
      sequence: function sequence(value: string) {
        if (macro.counter[value] === undefined) {
          macro.counter[value] = 1;
        } else {
          macro.counter[value] += 1;
        }

        return {
          val: macro.counter[value],
        };
      },
      json: function json(value: string) {
        return {
          val: JSON.parse(value),
        };
      },
      length: function length(value: any[]) {
        return {
          val: value.length,
        };
      },
      map: function (value: any[], property: string) {
        return {
          val: value.map((item) => item[property]),
        };
      },
      sum: function (value: any[], property: string, dec: number) {
        let sum = 0;

        value.forEach((item: { [key: string]: number }) => {
          sum += item[property];
        });

        return {
          val: sum.toFixed(dec === undefined ? 0 : dec),
        };
      },
      random: function random() {
        return {
          val: Math.floor(1000 + Math.random() * 10000),
        };
      },
      truncate: function truncate(value: string | string[], maxChars: number) {
        if (Array.isArray(value)) {
          value = value.map((str) => str.substring(0, maxChars));
        } else {
          value = `${value}`.substring(0, maxChars);
        }

        return {
          val: value,
        };
      },
    };

    const LIQUID_FILTERS: {
      [name: string]: (...args: any[]) => any;
    } = {
      hl_root: (value: string, depth = 0) => {
        if (counter[value] === undefined) {
          counter[value] = 0;
        }

        counter[value] += 1;
        levels[value][depth] = counter[value];

        return counter[value];
      },
      hl_parent: (value: string, depth: number) => {
        if (levels[value][depth] === undefined) {
          return 1;
        }

        return levels[value][depth];
      },
      sequence: (value: string) => {
        if (counter[value] === undefined) {
          counter[value] = 1;
        } else {
          counter[value] += 1;
        }

        return counter[value];
      },
      sum_array: (value: any[]) => {
        if (typeof value === "undefined") return 0;
        let sum = 0;

        value.forEach((item: number) => {
          sum += item;
        });

        return sum;
      },
      in_loop: (value: any) => {
        return LIQUID_FILTERS.json_stringify(value);
      },
      json_stringify: (value: any) => {
        return JSON.stringify(value);
      },
      json_parse: (value: string) => {
        if (typeof value === "undefined") return "";

        return JSON.parse(value);
      },
      truncate: (value: string | string[], maxChars: number) => {
        if (typeof value === "undefined") return "";
        if (Array.isArray(value)) {
          return value.map((str) => {
            if (typeof str === "undefined") return "";

            return str.substring(0, maxChars);
          });
        }

        return `${value}`.substring(0, maxChars);
      },
      random: (_val: string, maxLength = 4) => {
        const bytes = Math.ceil(maxLength / 2);
        const buffer = crypto.randomBytes(bytes);
        const hex = buffer.toString("hex");

        return parseInt(hex, 16)
          .toString()
          .substring(0, maxLength);
      },
      edi_date: (val: string, length = "long") => {
        const date = !isEmpty(val) ? new Date(val) : new Date();
        const ediDate = `${date.getUTCFullYear()}${
          (date.getUTCMonth() + 1).toString().padStart(2, "0")
        }${
          date
            .getUTCDate()
            .toString()
            .padStart(2, "0")
        }`;

        if (length !== "long") {
          return ediDate.substring(2, ediDate.length);
        }

        return ediDate;
      },
      edi_time: (val: string) => {
        const date = !isEmpty(val) ? new Date(val) : new Date();

        return `${
          date
            .getUTCHours()
            .toString()
            .padStart(2, "0")
        }${
          date
            .getUTCMinutes()
            .toString()
            .padStart(2, "0")
        }`;
      },
    };

    const resolveKey = function resolveKey(key: string): any {
      if (typeof liquidjs !== "undefined") {
        const result: any = liquidjs.parseAndRenderSync(key, { input });

        return key.indexOf("in_loop }}") > -1 ? JSON.parse(result) : result;
      } else {
        const clean = /(^(`\${)*(input|macro)\[.*(}`)*$)/g;

        if (clean.test(key)) {
          // eslint-disable-next-line no-eval
          const result: any = eval(key);

          return result === undefined ? "" : result;
        } else {
          return key;
        }
      }
    };

    const resolveLoop = function resolveLoop(
      lp: any[],
      tx: X12Transaction,
    ): void {
      const start = lp[0];
      const length = parseFloat(resolveKey(start.loopLength));

      for (let i = 0; i < length; i += 1) {
        lp.forEach((segment) => {
          const elements = [];

          for (const segElement of segment.elements) {
            const resolved = resolveKey(segElement);

            if (Array.isArray(resolved)) {
              elements.push(resolved[i]);
            } else {
              elements.push(resolved);
            }
          }

          tx.addSegment(segment.tag, elements);
        });
      }
    };

    if (map !== undefined) {
      if (map.header === undefined || map.segments === undefined) {
        macroObj = map;
        map = undefined;
      }
    }

    map = map === undefined ? this._map : map;

    if (this.txEngine === "liquidjs") {
      const engine = new Liquid({ strictFilters: true });

      for (const [name, func] of Object.entries(LIQUID_FILTERS)) {
        engine.registerFilter(name, func);
      }

      if (typeof macroObj === "object") {
        for (const [name, func] of Object.entries(macroObj)) {
          if (typeof name === "string" && typeof func === "function") {
            engine.registerFilter(name, func as any);
          }
        }
      }

      liquidjs = engine;
    } else {
      Object.assign(macro, macroObj);
    }

    const transaction = this._transaction === undefined
      ? new X12Transaction()
      : this._transaction;
    const header = [];
    let looper: any[] = [];
    let loop = false;

    for (const headerElement of map.header) {
      header.push(resolveKey(headerElement));
    }

    transaction.setHeader(header);

    for (const segment of map.segments) {
      const elements = [];

      if (segment.loopStart as boolean) {
        looper.push(segment);
        loop = true;
      } else if (loop) {
        looper.push(segment);
      }

      if (!loop) {
        for (const segElement of segment.elements) {
          elements.push(resolveKey(segElement));
        }

        transaction.addSegment(segment.tag, elements);
      }

      if (segment.loopEnd as boolean) {
        resolveLoop(looper, transaction);
        looper = [];
        loop = false;
      }
    }

    this._transaction = transaction;

    return transaction;
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
  private _helper(
    key: string,
    value: string,
    query?: string,
    callback?: Function,
  ): string {
    if (callback !== undefined) {
      callback(key, value, query);
    }

    return value;
  }
}
