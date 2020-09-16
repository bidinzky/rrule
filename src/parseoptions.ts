import { Options, ParsedOptions, freqIsDailyOrGreater } from './types'
import { includes, notEmpty, isPresent, isNumber, isArray, isWeekdayStr } from './helpers'
import RRule, { defaultKeys, DEFAULT_OPTIONS } from './rrule'
import dateutil from './dateutil'
import { Weekday } from './weekday'
import { Time } from './datetime'

export function initializeOptions (options: Partial<Options>) {
  const invalid: string[] = []
  const keys = Object.keys(options) as (keyof Options)[]

  // Shallow copy for options and origOptions and check for invalid
  for (const key of keys) {
    if (!includes(defaultKeys, key)) invalid.push(key)
    if (dateutil.isDate(options[key]) && !dateutil.isValidDate(options[key])) invalid.push(key)
  }

  return { ...options }
}

export function parseOptions (options: Partial<Options>) {
  const opts = { ...DEFAULT_OPTIONS, ...initializeOptions(options) }

  if (!(isPresent(opts.eFreq) && RRule.FREQUENCIES[opts.eFreq])) {
    throw new Error(`Invalid frequency: ${opts.eFreq} ${options.eFreq}`)
  }

  if (!opts.dtStart) opts.dtStart = new Date(new Date().setMilliseconds(0))

  if (isPresent(opts.bysetpos)) {
    if (isNumber(opts.bysetpos)) opts.bysetpos = [opts.bysetpos]

    for (let i = 0; i < opts.bysetpos.length; i++) {
      const v = opts.bysetpos[i]
      if (v === 0 || !(v >= -366 && v <= 366)) {
        throw new Error(
          'bysetpos must be between 1 and 366,' + ' or between -366 and -1'
        )
      }
    }
  }

  if (
    !(
      Boolean(opts.aByWeekno as number) ||
      notEmpty(opts.aByWeekno as number[]) ||
      notEmpty(opts.aByYearday as number[]) ||
      Boolean(opts.aByMonthday) ||
      notEmpty(opts.aByMonthday as number[]) ||
      isPresent(opts.aByWeekday)
    )
  ) {
    switch (opts.eFreq) {
      case RRule.YEARLY:
        if (!opts.aByMonth) opts.aByMonth = opts.dtStart.getUTCMonth() + 1
        opts.aByMonthday = opts.dtStart.getUTCDate()
        break
      case RRule.MONTHLY:
        opts.aByMonthday = opts.dtStart.getUTCDate()
        break
      case RRule.WEEKLY:
        opts.aByWeekday = [dateutil.getWeekday(opts.dtStart)]
        break
    }
  }

  // aByMonth
  if (isPresent(opts.aByMonth) && !isArray(opts.aByMonth)) {
    opts.aByMonth = [opts.aByMonth]
  }

  // aByYearday
  if (
    isPresent(opts.aByYearday) &&
    !isArray(opts.aByYearday) &&
    isNumber(opts.aByYearday)
  ) {
    opts.aByYearday = [opts.aByYearday]
  }

  // aByMonthday
  if (!isPresent(opts.aByMonthday)) {
    opts.aByMonthday = []
  } else if (isArray(opts.aByMonthday)) {
    const aByMonthday = []

    for (let i = 0; i < opts.aByMonthday.length; i++) {
      const v = opts.aByMonthday[i]
      if (v > 0) {
        aByMonthday.push(v)
      }
    }
    opts.aByMonthday = aByMonthday
  } else if (opts.aByMonthday < 0) {
    opts.aByMonthday = []
  } else {
    opts.aByMonthday = [opts.aByMonthday]
  }

  // abyweekn.aByWeekno
  if (isPresent(opts.aByWeekno) && !isArray(opts.aByWeekno)) {
    opts.aByWeekno = [opts.aByWeekno]
  }

  // aByWeekday / bynweekday
  if (!isPresent(opts.aByWeekday)) {
    opts.aByWeekday = null
  } else if (isNumber(opts.aByWeekday)) {
    opts.aByWeekday = [opts.aByWeekday]
  } else if (isWeekdayStr(opts.aByWeekday)) {
    opts.aByWeekday = [Weekday.fromStr(opts.aByWeekday).weekday]
  } else if (opts.aByWeekday instanceof Weekday) {
    if (!opts.aByWeekday.n || opts.eFreq > RRule.MONTHLY) {
      opts.aByWeekday = [opts.aByWeekday.weekday]
    } else {
      opts.aByWeekday = null
    }
  } else {
    const aByWeekday: number[] = []
    const bynweekday = []

    for (let i = 0; i < opts.aByWeekday.length; i++) {
      const wday = opts.aByWeekday[i]

      if (isNumber(wday)) {
        aByWeekday.push(wday)
        continue
      } else if (isWeekdayStr(wday)) {
        aByWeekday.push(Weekday.fromStr(wday).weekday)
        continue
      }

      if (!wday.n || opts.eFreq > RRule.MONTHLY) {
        aByWeekday.push(wday.weekday)
      } else {
        bynweekday.push([wday.weekday, wday.n])
      }
    }
    opts.aByWeekday = notEmpty(aByWeekday) ? aByWeekday : null
  }

  // aByHour
  if (!isPresent(opts.aByHour)) {
    opts.aByHour =
      opts.eFreq < RRule.HOURLY ? [opts.dtStart.getUTCHours()] : null
  } else if (isNumber(opts.aByHour)) {
    opts.aByHour = [opts.aByHour]
  }

  // aByMinute
  if (!isPresent(opts.aByMinute)) {
    opts.aByMinute =
      opts.eFreq < RRule.MINUTELY ? [opts.dtStart.getUTCMinutes()] : null
  } else if (isNumber(opts.aByMinute)) {
    opts.aByMinute = [opts.aByMinute]
  }

  return { parsedOptions: opts as ParsedOptions }
}

export function buildTimeset (opts: ParsedOptions) {
  const millisecondModulo = opts.dtStart.getTime() % 1000
  if (!freqIsDailyOrGreater(opts.eFreq)) {
    return []
  }

  const timeset: Time[] = []
  opts.aByHour.forEach(hour => {
    opts.aByMinute.forEach(minute => {
      timeset.push(new Time(hour, minute, 0, millisecondModulo))
    })
  })

  return timeset
}
