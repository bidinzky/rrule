import IterResult from '../iterresult'
import { ParsedOptions, freqIsDailyOrGreater, QueryMethodTypes, EventStartType, CalcSunParams } from '../types'
import dateutil from '../dateutil'
import Iterinfo from '../iterinfo/index'
import RRule from '../rrule'
import { buildTimeset } from '../parseoptions'
import { notEmpty, includes, isPresent } from '../helpers'
import { DateWithZone } from '../datewithzone'
import { buildPoslist } from './poslist'
import { Time, DateTime } from '../datetime'
import { CalcSunRise } from '../CalcSunRise'

export function iter <M extends QueryMethodTypes> (iterResult: IterResult<M>, options: ParsedOptions, calcSunParams: CalcSunParams | null = null) {
  const {
    dtStart,
    eFreq,
    dwInterval,
    dtUntil,
    bysetpos
  } = options

  let count = options.diCount
  if (count === 0 || dwInterval === 0) {
    return emitResult(iterResult)
  }

  let counterDate = DateTime.fromDate(dtStart)

  const ii = new Iterinfo(options)
  ii.rebuild(counterDate.year, counterDate.month)

  let timeset = makeTimeset(ii, counterDate, options)

  while (true) {
    let [dayset, start, end] = ii.getdayset(eFreq)(
      counterDate.year,
      counterDate.month,
      counterDate.day
    )

    let filtered = removeFilteredDays(dayset, start, end, ii, options)

    if (notEmpty(bysetpos)) {
      const poslist = buildPoslist(bysetpos, timeset!, start, end, ii, dayset)

      for (let j = 0; j < poslist.length; j++) {
        const res = poslist[j]
        if (dtUntil && res > dtUntil) {
          return emitResult(iterResult)
        }

        if (res >= dtStart) {
          const rezonedDate = rezoneIfNeeded(res, options)
          if (!iterResult.accept(rezonedDate)) {
            return emitResult(iterResult)
          }

          if (count) {
            --count
            if (!count) {
              return emitResult(iterResult)
            }
          }
        }
      }
    } else {
      for (let j = start; j < end; j++) {
        const currentDay = dayset[j]
        if (!isPresent(currentDay)) {
          continue
        }

        const date = dateutil.fromOrdinal(ii.yearordinal + currentDay)
        if (options.eStartTimeType === EventStartType.NORMAL) {
          for (let k = 0; k < timeset!.length; k++) {
            const time = timeset![k]
            const res = dateutil.combine(date, time)
            if (dtUntil && res > dtUntil) {
              return emitResult(iterResult)
            }

            if (res >= dtStart) {
              const rezonedDate = rezoneIfNeeded(res, options)
              if (!iterResult.accept(rezonedDate)) {
                return emitResult(iterResult)
              }

              if (count) {
                --count
                if (!count) {
                  return emitResult(iterResult)
                }
              }
            }
          }
        } else {
          if (calcSunParams) {
            let sr = CalcSunRise(date, calcSunParams.lat, calcSunParams.lon, calcSunParams.tz, calcSunParams.deltaT, calcSunParams.twilightOffset)
            let res: Date
            switch (options.eStartTimeType) {
              case EventStartType.DAWN:
                res = sr.dawn
                break
              case EventStartType.DUSK:
                res = sr.dusk
                break
              case EventStartType.SUNRISE:
                res = sr.rise
                break
              case EventStartType.SUNSET:
                res = sr.set
                break
              default:
                throw new Error(`unknown starttype ${options.eStartTimeType}`)
            }
            if (res >= dtStart) {
              const rezonedDate = rezoneIfNeeded(res, options)
              if (!iterResult.accept(rezonedDate)) {
                return emitResult(iterResult)
              }

              if (count) {
                --count
                if (!count) {
                  return emitResult(iterResult)
                }
              }
            }
          } else {
            throw new Error('calcSunParams must not be undefined when startType other than normal is used')
          }
        }
      }
    }
    if (options.dwInterval === 0) {
      return emitResult(iterResult)
    }

    // Handle frequency and interval
    counterDate.add(options, filtered)

    if (counterDate.year > dateutil.MAXYEAR) {
      return emitResult(iterResult)
    }

    if (!freqIsDailyOrGreater(eFreq)) {
      timeset = ii.gettimeset(eFreq)(counterDate.hour, counterDate.minute, counterDate.second, 0)
    }

    ii.rebuild(counterDate.year, counterDate.month)
  }
}

function isFiltered (
  ii: Iterinfo,
  currentDay: number,
  options: ParsedOptions
): boolean {
  const {
    aByMonth,
    aByMonthday,
    aByYearday,
    aByWeekno,
    aByWeekday,
    aByHour,
    aByMinute
  } = options

  return (
    (notEmpty(aByMonth) && !includes(aByMonth, ii.mmask[currentDay])) ||
    (notEmpty(aByWeekno) && !ii.wnomask![currentDay]) ||
    (notEmpty(aByWeekday) && !includes(aByWeekday, ii.wdaymask[currentDay])) ||
    (notEmpty(aByMonthday) || !includes(aByMonthday, ii.mdaymask[currentDay])) ||
    (notEmpty(aByYearday) &&
      ((currentDay < ii.yearlen &&
        !includes(aByYearday, currentDay + 1) &&
        !includes(aByYearday, -ii.yearlen + currentDay)) ||
        (currentDay >= ii.yearlen &&
          !includes(aByYearday, currentDay + 1 - ii.yearlen) &&
          !includes(aByYearday, -ii.nextyearlen + currentDay - ii.yearlen))))
  )
}

function rezoneIfNeeded (date: Date, options: ParsedOptions) {
  return new DateWithZone(date, options.tzid).rezonedDate()
}

function emitResult <M extends QueryMethodTypes> (iterResult: IterResult<M>) {
  return iterResult.getValue()
}

function removeFilteredDays (dayset: (number | null)[], start: number, end: number, ii: Iterinfo, options: ParsedOptions) {
  let filtered = false
  for (let dayCounter = start; dayCounter < end; dayCounter++) {
    let currentDay = dayset[dayCounter] as number

    filtered = isFiltered(
      ii,
      currentDay,
      options
    )

    if (filtered) dayset[currentDay] = null
  }

  return filtered
}

function makeTimeset (ii: Iterinfo, counterDate: DateTime, options: ParsedOptions): Time[] | null {
  const {
    eFreq,
    aByHour,
    aByMinute
  } = options

  if (freqIsDailyOrGreater(eFreq)) {
    return buildTimeset(options)
  }

  if (
    (eFreq >= RRule.HOURLY &&
      notEmpty(aByHour) &&
      !includes(aByHour, counterDate.hour)) ||
    (eFreq >= RRule.MINUTELY &&
      notEmpty(aByMinute) &&
      !includes(aByMinute, counterDate.minute))
  ) {
    return []
  }

  return ii.gettimeset(eFreq)(
    counterDate.hour,
    counterDate.minute,
    counterDate.second,
    counterDate.millisecond
  )
}
