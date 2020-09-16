import { ParsedOptions } from '../types'
import RRule from '../rrule'
import { empty, repeat, pymod } from '../helpers'

export interface MonthInfo {
  lastyear: number
  lastmonth: number
}

export function rebuildMonth (
  year: number,
  month: number,
  yearlen: number,
  mrange: number[],
  wdaymask: number[],
  options: ParsedOptions
) {
  const result: MonthInfo = {
    lastyear: year,
    lastmonth: month
  }

  let ranges: number[][] = []
  if (options.eFreq === RRule.YEARLY) {
    if (empty(options.aByMonth)) {
      ranges = [[0, yearlen]]
    } else {
      for (let j = 0; j < options.aByMonth.length; j++) {
        month = options.aByMonth[j]
        ranges.push(mrange.slice(month - 1, month + 1))
      }
    }
  } else if (options.eFreq === RRule.MONTHLY) {
    ranges = [mrange.slice(month - 1, month + 1)]
  }

  if (empty(ranges)) {
    return result
  }
  return result
}
