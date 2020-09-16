import { ParsedOptions, Frequency } from './types'
import { pymod, divmod, empty, includes } from './helpers'
import { dateutil } from './dateutil'

export class Time {
  public hour: number
  public minute: number
  public second: number
  public millisecond: number

  constructor (
      hour: number,
      minute: number,
      second: number,
      millisecond: number
    ) {
    this.hour = hour
    this.minute = minute
    this.second = second
    this.millisecond = millisecond || 0
  }

  getHours () {
    return this.hour
  }

  getMinutes () {
    return this.minute
  }

  getSeconds () {
    return this.second
  }

  getMilliseconds () {
    return this.millisecond
  }

  getTime () {
    return (
        (this.hour * 60 * 60 + this.minute * 60 + this.second) * 1000 +
        this.millisecond
    )
  }
}

export class DateTime extends Time {
  public day: number
  public month: number
  public year: number

  static fromDate (date: Date) {
    return new this(
        date.getUTCFullYear(),
        date.getUTCMonth() + 1,
        date.getUTCDate(),
        date.getUTCHours(),
        date.getUTCMinutes(),
        date.getUTCSeconds(),
        date.valueOf() % 1000
      )
  }

  constructor (
      year: number,
      month: number,
      day: number,
      hour: number,
      minute: number,
      second: number,
      millisecond: number
    ) {
    super(hour, minute, second, millisecond)
    this.year = year
    this.month = month
    this.day = day
  }

  getWeekday () {
    return dateutil.getWeekday(new Date(this.getTime()))
  }

  getTime () {
    return new Date(
        Date.UTC(
          this.year, this.month - 1, this.day, this.hour, this.minute, this.second, this.millisecond
        )
      ).getTime()
  }

  getDay () {
    return this.day
  }

  getMonth () {
    return this.month
  }

  getYear () {
    return this.year
  }

  public addYears (years: number) {
    this.year += years
  }

  public addMonths (months: number) {
    this.month += months
    if (this.month > 12) {
      const yearDiv = Math.floor(this.month / 12)
      const monthMod = pymod(this.month, 12)
      this.month = monthMod
      this.year += yearDiv
      if (this.month === 0) {
        this.month = 12
        --this.year
      }
    }
  }

  public addWeekly (days: number, wkst: number) {
    if (wkst > this.getWeekday()) {
      this.day += -(this.getWeekday() + 1 + (6 - wkst)) + days * 7
    } else {
      this.day += -(this.getWeekday() - wkst) + days * 7
    }

    this.fixDay()
  }

  public addDaily (days: number) {
    this.day += days
    this.fixDay()
  }

  public addHours (hours: number, filtered: boolean, aByHour: number[]) {
    if (filtered) {
        // Jump to one iteration before next day
      this.hour += Math.floor((23 - this.hour) / hours) * hours
    }

    while (true) {
      this.hour += hours
      const { div: dayDiv, mod: hourMod } = divmod(this.hour, 24)
      if (dayDiv) {
        this.hour = hourMod
        this.addDaily(dayDiv)
      }

      if (empty(aByHour) || includes(aByHour, this.hour)) break
    }
  }

  public addMinutes (minutes: number, filtered: boolean, aByHour: number[], aByMinute: number[]) {
    if (filtered) {
        // Jump to one iteration before next day
      this.minute +=
              Math.floor((1439 - (this.hour * 60 + this.minute)) / minutes) * minutes
    }

    while (true) {
      this.minute += minutes
      const { div: hourDiv, mod: minuteMod } = divmod(this.minute, 60)
      if (hourDiv) {
        this.minute = minuteMod
        this.addHours(hourDiv, false, aByHour)
      }

      if (
          (empty(aByHour) || includes(aByHour, this.hour)) &&
          (empty(aByMinute) || includes(aByMinute, this.minute))
        ) {
        break
      }
    }
  }

  public addSeconds (seconds: number, filtered: boolean, aByHour: number[], aByMinute: number[], bysecond: number[]) {
    if (filtered) {
        // Jump to one iteration before next day
      this.second +=
          Math.floor(
            (86399 - (this.hour * 3600 + this.minute * 60 + this.second)) / seconds
          ) * seconds
    }

    while (true) {
      this.second += seconds
      const { div: minuteDiv, mod: secondMod } = divmod(this.second, 60)
      if (minuteDiv) {
        this.second = secondMod
        this.addMinutes(minuteDiv, false, aByHour, aByMinute)
      }

      if (
          (empty(aByHour) || includes(aByHour, this.hour)) &&
          (empty(aByMinute) || includes(aByMinute, this.minute)) &&
          (empty(bysecond) || includes(bysecond, this.second))
        ) {
        break
      }
    }
  }

  public fixDay () {
    if (this.day <= 28) {
      return
    }

    let daysinmonth = dateutil.monthRange(this.year, this.month - 1)[1]
    if (this.day <= daysinmonth) {
      return
    }

    while (this.day > daysinmonth) {
      this.day -= daysinmonth
      ++this.month
      if (this.month === 13) {
        this.month = 1
        ++this.year
        if (this.year > dateutil.MAXYEAR) {
          return
        }
      }

      daysinmonth = dateutil.monthRange(this.year, this.month - 1)[1]
    }
  }

  public add (options: ParsedOptions, filtered: boolean) {
    const {
      eFreq,
      dwInterval,
      aByHour,
      aByMinute
    } = options

    switch (eFreq) {
      case Frequency.YEARLY: return this.addYears(dwInterval)
      case Frequency.MONTHLY: return this.addMonths(dwInterval)
      case Frequency.WEEKLY: return this.addWeekly(dwInterval, 0)
      case Frequency.DAILY: return this.addDaily(dwInterval)
      case Frequency.HOURLY: return this.addHours(dwInterval, filtered, aByHour)
      case Frequency.MINUTELY: return this.addMinutes(dwInterval, filtered, aByHour, aByMinute)
      case Frequency.SECONDLY: return this.addSeconds(dwInterval, filtered, aByHour, aByMinute, [0])
    }
  }
}
