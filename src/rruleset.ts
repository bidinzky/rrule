import RRule from './rrule'
import dateutil from './dateutil'
import { includes } from './helpers'
import IterResult from './iterresult'
import { iterSet } from './iterset'
import { QueryMethodTypes, IterResultType } from './types'

function createGetterSetter <T> (fieldName: string) {
  return (field?: T) => {
    if (field !== undefined) {
      this[`_${fieldName}`] = field
    }

    if (this[`_${fieldName}`] !== undefined) {
      return this[`_${fieldName}`]
    }

    for (let i = 0; i < this._rrule.length; i++) {
      const field: T = this._rrule[i].origOptions[fieldName]
      if (field) {
        return field
      }
    }
  }
}

export default class RRuleSet extends RRule {
  public readonly _rrule: RRule[]
  public readonly _rdate: Date[]
  public readonly _exrule: RRule[]
  public readonly _exdate: Date[]

  private _dtstart?: Date | null | undefined
  private _tzid?: string

  /**
   *
   * @param {Boolean?} noCache
   *  The same stratagy as RRule on cache, default to false
   * @constructor
   */
  constructor () {
    super({})

    this._rrule = []
    this._rdate = []
    this._exrule = []
    this._exdate = []
  }

  dtstart = createGetterSetter.apply(this, ['dtstart'])
  tzid = createGetterSetter.apply(this, ['tzid'])

  _iter <M extends QueryMethodTypes> (iterResult: IterResult<M>): IterResultType<M> {
    return iterSet(
      iterResult,
      this._rrule,
      this._exrule,
      this._rdate,
      this._exdate,
      this.tzid()
    )
  }

  /**
   * Adds an RRule to the set
   *
   * @param {RRule}
   */
  rrule (rrule: RRule) {
    _addRule(rrule, this._rrule)
  }

  /**
   * Adds an EXRULE to the set
   *
   * @param {RRule}
   */
  exrule (rrule: RRule) {
    _addRule(rrule, this._exrule)
  }

  /**
   * Adds an RDate to the set
   *
   * @param {Date}
   */
  rdate (date: Date) {
    _addDate(date, this._rdate)
  }

  /**
   * Adds an EXDATE to the set
   *
   * @param {Date}
   */
  exdate (date: Date) {
    _addDate(date, this._exdate)
  }

  /**
   * Get list of included rrules in this recurrence set.
   *
   * @return List of rrules
   */
  rrules () {
    return this._rrule.map(e => e.clone())
  }

  /**
   * Get list of excluded rrules in this recurrence set.
   *
   * @return List of exrules
   */
  exrules () {
    return this._exrule.map(e => e.clone())
  }

  /**
   * Get list of included datetimes in this recurrence set.
   *
   * @return List of rdates
   */
  rdates () {
    return this._rdate.map(e => new Date(e.getTime()))
  }

  /**
   * Get list of included datetimes in this recurrence set.
   *
   * @return List of exdates
   */
  exdates () {
    return this._exdate.map(e => new Date(e.getTime()))
  }

  /**
   * Create a new RRuleSet Object completely base on current instance
   */
  clone (): RRuleSet {
    const rrs = new RRuleSet()

    this._rrule.forEach(rule => rrs.rrule(rule.clone()))
    this._exrule.forEach(rule => rrs.exrule(rule.clone()))
    this._rdate.forEach(date => rrs.rdate(new Date(date.getTime())))
    this._exdate.forEach(date => rrs.exdate(new Date(date.getTime())))

    return rrs
  }
}

function _addRule (rrule: RRule, collection: RRule[]) {
  if (!(rrule instanceof RRule)) {
    throw new TypeError(String(rrule) + ' is not RRule instance')
  }

  if (!includes(collection.map(String), String(rrule))) {
    collection.push(rrule)
  }
}

function _addDate (date: Date, collection: Date[]) {
  if (!(date instanceof Date)) {
    throw new TypeError(String(date) + ' is not Date instance')
  }
  if (!includes(collection.map(Number), Number(date))) {
    collection.push(date)
    dateutil.sort(collection)
  }
}

function rdatesToString (param: string, rdates: Date[], tzid: string | undefined) {
  const isUTC = !tzid || tzid.toUpperCase() === 'UTC'
  const header = isUTC ? `${param}:` : `${param};TZID=${tzid}:`

  const dateString = rdates
      .map(rdate => dateutil.timeToUntilString(rdate.valueOf(), isUTC))
      .join(',')

  return `${header}${dateString}`
}
