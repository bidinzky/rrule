import dateutil from './dateutil'

import IterResult from './iterresult'
import CallbackIterResult from './callbackiterresult'
import { ParsedOptions, Options, Frequency, QueryMethods, QueryMethodTypes, IterResultType, EventStartType, CalcSunParams } from './types'
import { parseOptions, initializeOptions } from './parseoptions'
import { Weekday } from './weekday'
import { iter } from './iter/index'

// =============================================================================
// RRule
// =============================================================================

export const Days = {
  MO: new Weekday(0),
  TU: new Weekday(1),
  WE: new Weekday(2),
  TH: new Weekday(3),
  FR: new Weekday(4),
  SA: new Weekday(5),
  SU: new Weekday(6)
}

export const DEFAULT_OPTIONS: Options = {
  eFreq: Frequency.YEARLY,
  dtStart: null,
  dwInterval: 1,
  eStartTimeType: EventStartType.NORMAL,
  diCount: null,
  dtUntil: null,
  tzid: null,
  bysetpos: null,
  aByMonth: null,
  aByMonthday: null,
  aByYearday: null,
  aByWeekno: null,
  aByWeekday: null,
  aByHour: null,
  aByMinute: null
}

export const defaultKeys = Object.keys(DEFAULT_OPTIONS) as (keyof Options)[]

/**
 *
 * @param {Options?} options - see <http://labix.org/python-dateutil/#head-cf004ee9a75592797e076752b2a889c10f445418>
 *        The only required option is `freq`, one of RRule.YEARLY, RRule.MONTHLY, ...
 * @constructor
 */
export default class RRule implements QueryMethods {
  public _cache: Cache | null
  public origOptions: Partial<Options>
  public options: ParsedOptions
  public calcSunParams: CalcSunParams | null

  // RRule class 'constants'

  static readonly FREQUENCIES: (keyof typeof Frequency)[] = [
    'YEARLY',
    'MONTHLY',
    'WEEKLY',
    'DAILY',
    'HOURLY',
    'MINUTELY',
    'SECONDLY'
  ]

  static readonly YEARLY = Frequency.YEARLY
  static readonly MONTHLY = Frequency.MONTHLY
  static readonly WEEKLY = Frequency.WEEKLY
  static readonly DAILY = Frequency.DAILY
  static readonly HOURLY = Frequency.HOURLY
  static readonly MINUTELY = Frequency.MINUTELY
  static readonly SECONDLY = Frequency.SECONDLY

  static readonly MO = Days.MO
  static readonly TU = Days.TU
  static readonly WE = Days.WE
  static readonly TH = Days.TH
  static readonly FR = Days.FR
  static readonly SA = Days.SA
  static readonly SU = Days.SU

  constructor (options: Partial<Options> = {}, calcSunParams: CalcSunParams | null = null) {

    // used by toString()
    this.origOptions = initializeOptions(options)
    const { parsedOptions } = parseOptions(options)
    this.options = parsedOptions
    this.calcSunParams = calcSunParams
  }

  protected _iter <M extends QueryMethodTypes> (iterResult: IterResult<M>): IterResultType<M> {
    return iter(iterResult, this.options, this.calcSunParams)
  }

  /**
   * @param {Function} iterator - optional function that will be called
   *                   on each date that is added. It can return false
   *                   to stop the iteration.
   * @return Array containing all recurrences.
   */
  all (iterator?: (d: Date, len: number) => boolean): Date[] {
    if (iterator) {
      return this._iter(new CallbackIterResult('all', {}, iterator))
    }

    return this._iter(new IterResult('all', {}))
  }

  /**
   * Returns all the occurrences of the rrule between after and before.
   * The inc keyword defines what happens if after and/or before are
   * themselves occurrences. With inc == True, they will be included in the
   * list, if they are found in the recurrence set.
   * @return Array
   */
  between (
    after: Date,
    before: Date,
    inc: boolean = false,
    iterator?: (d: Date, len: number) => boolean
  ): Date[] {
    if (!dateutil.isValidDate(after) || !dateutil.isValidDate(before)) throw new Error('Invalid date passed in to RRule.between')
    const args = {
      before,
      after,
      inc
    }

    if (iterator) {
      return this._iter(
        new CallbackIterResult('between', args, iterator)
      )
    }

    return this._iter(new IterResult('between', args))
  }

  /**
   * Returns the last recurrence before the given datetime instance.
   * The inc keyword defines what happens if dt is an occurrence.
   * With inc == True, if dt itself is an occurrence, it will be returned.
   * @return Date or null
   */
  before (dt: Date, inc = false): Date {
    if (!dateutil.isValidDate(dt)) throw new Error('Invalid date passed in to RRule.before')
    const args = { dt: dt, inc: inc }
    return this._iter(new IterResult('before', args)) as Date
  }

  /**
   * Returns the first recurrence after the given datetime instance.
   * The inc keyword defines what happens if dt is an occurrence.
   * With inc == True, if dt itself is an occurrence, it will be returned.
   * @return Date or null
   */
  after (dt: Date, inc = false): Date {
    if (!dateutil.isValidDate(dt)) throw new Error('Invalid date passed in to RRule.after')
    const args = { dt: dt, inc: inc }
    return this._iter(new IterResult('after', args)) as Date
  }

  /**
   * Returns the number of recurrences in this set. It will have go trough
   * the whole recurrence, if this hasn't been done before.
   */
  count (): number {
    return this.all().length
  }

  /**
   * @return a RRule instance with the same freq and options
   *          as this one (cache is not cloned)
   */
  clone (): RRule {
    return new RRule(this.origOptions)
  }
}
