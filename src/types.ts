import { Weekday, WeekdayStr } from './weekday'

export interface QueryMethods {
  all (): Date[]
  between (after: Date, before: Date, inc: boolean): Date[]
  before (date: Date, inc: boolean): Date
  after (date: Date, inc: boolean): Date
}

export type QueryMethodTypes = keyof QueryMethods
export type IterResultType<M extends QueryMethodTypes> = M extends 'all' | 'between' ? Date[] : (Date | null)

export enum Frequency {
  YEARLY = 0,
  MONTHLY = 1,
  WEEKLY = 2,
  DAILY = 3,
  HOURLY = 4,
  MINUTELY = 5,
  SECONDLY = 6
}

export enum EventStartType {
  NORMAL = 0,
	SUNRISE = 1,
	DAWN = 2,
	DUSK = 3,
	SUNSET = 4
}

export function freqIsDailyOrGreater (freq: Frequency): freq is Frequency.YEARLY | Frequency.MONTHLY | Frequency.WEEKLY | Frequency.DAILY {
  return freq < Frequency.HOURLY
}

export interface CalcSunParams {
  lat: number
  lon: number
  tz: number
  deltaT: number
  twilightOffset: number
}

export interface Options {
  eFreq: Frequency
  eStartTimeType: EventStartType | null
  dtStart: Date | null
  dwInterval: number
  diCount: number | null
  dtUntil: Date | null
  tzid: string | null
  bysetpos: number | number[] | null
  aByMonth: number | number[] | null
  aByMonthday: number | number[] | null
  aByYearday: number | number[] | null
  aByWeekno: number | number[] | null
  aByWeekday: ByWeekday | ByWeekday[] | null
  aByHour: number | number[] | null
  aByMinute: number | number[] | null
}

export interface ParsedOptions extends Options {
  dtStart: Date
  bysetpos: number[]
  aByMonth: number[]
  aByMonthday: number[]
  aByYearday: number[]
  aByWeekno: number[]
  aByWeekday: number[]
  aByHour: number[]
  aByMinute: number[]
}

export type ByWeekday = WeekdayStr | number | Weekday
