/**
 * @author Ray Martone
 * @copyright Copyright (c) 2019 Ray Martone
 * @license MIT
 * @description log adapter that provides level based filtering and tagging
 */

/**
 * Useful for implementing a log event hadnelr
 */
export const enum LogLevel {
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
  OFF = 'OFF',
}

/**
 * union
 */
type LevelStr = 'INFO' | 'WARN' | 'ERROR' | 'OFF';

/**
 * Level where `ERROR > WARN > INFO`.
 */
enum Level {
  INFO = 1,
  WARN,
  ERROR,
  OFF,
}

type Callback = (level: LevelStr, tag: string, message: unknown, optionalParams: unknown[]) => void;

export const tag: Record<string, string> = {};

export class Log {
  /**
   * init assigns tags a level or they default to INFO
   * _tagToLevel hash that maps tags to their level
   */
  protected readonly _tagToLevel: Record<string, Level> = {};

  /**
   * callback that supports logging whatever way works best for you!
   */
  protected _callback?: Callback;

  /**
   * init
   * @param config? JSON that assigns tags levels. If uninitialized,
   *    a tag's level defaults to INFO where ERROR > WARN > INFO.
   * @param callback? supports logging whatever way works best for you
   *  - style terminal output with chalk
   *  - send JSON to a cloud logging service like Splunk
   *  - log strings and objects to the browser console
   *  - combine any of the above based on your app's env
   * @return {this} supports chaining
   */
  init(config?: Record<string, string>, callback?: Callback): this {
    for (const k in config) {
      this._tagToLevel[k] = Level[config[k] as LevelStr] || 1;
    }

    if (callback !== undefined) {
      this._callback = callback;
    }

    for (const key in this._tagToLevel) {
      tag[key] = key;
    }

    return this;
  }

  /**
   * Writes an error to the log
   * @param tag string categorizes a message
   * @param message object to log
   * @param optionalParams optional list of objects to log
   */
  error<T extends string>(tag: T, message: unknown, ...optionalParams: unknown[]): void {
    // avoid unnecessary arguments access in transpiled code
    if (Level.ERROR >= (this._tagToLevel[tag] || Level.INFO) && this._callback) {
      this._callback(Level[Level.ERROR] as LevelStr, tag, message, optionalParams);
    }
  }

  /**
   * Writes a warning to the log
   * @param tag string categorizes a message
   * @param message object to log
   * @param optionalParams optional list of objects to log
   */
  warn<T extends string>(tag: T, message: unknown, ...optionalParams: unknown[]): void {
    // avoid unnecessary arguments access...
    if (Level.WARN >= (this._tagToLevel[tag] || Level.INFO) && this._callback) {
      this._callback(Level[Level.WARN] as LevelStr, tag, message, optionalParams);
    }
  }

  /**
   * Writes info to the log
   * @param tag string categorizes a message
   * @param message object to log
   * @param optionalParams optional list of objects to log
   */
  info<T extends string>(tag: T, message: unknown, ...optionalParams: unknown[]): void {
    // avoid unnecessary arguments access...
    if (Level.INFO >= (this._tagToLevel[tag] || Level.INFO) && this._callback) {
      this._callback(Level[Level.INFO] as LevelStr, tag, message, optionalParams);
    }
  }
}

/** singleton Log instance */
export const log = new Log();