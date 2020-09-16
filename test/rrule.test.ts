import { parse, datetime, testRecurring, expectedDate } from './lib/utils'
import { expect } from 'chai'
import { RRule, Frequency } from '../src/index'
import { DateTime } from 'luxon'
import { set as setMockDate, reset as resetMockDate } from 'mockdate'
debugger
describe('RRule', function () {
  // Thorough after()/before()/between() tests.
  // NOTE: can take a longer time.
  this.ctx.ALSO_TEST_BEFORE_AFTER_BETWEEN = false

  this.ctx.ALSO_TEST_SUBSECOND_PRECISION = false

  it('does not mutate the passed-in options object', function () {
    const options = {
      eFreq: RRule.MONTHLY,
      dtStart: new Date(2013, 0, 1),
      diCount: 3,
      aByMonthday: [28]
    }
    const rule = new RRule(options)

    expect(options).deep.equals({
      eFreq: RRule.MONTHLY,
      dtStart: new Date(2013, 0, 1),
      diCount: 3,
      aByMonthday: [28]
    })
    expect(rule.origOptions).deep.equals(options)
  })

  testRecurring('missing Feb 28 https://github.com/jakubroztocil/rrule/issues/21',
    new RRule({
      eFreq: RRule.MONTHLY,
      dtStart: new Date(Date.UTC(2013, 0, 1)),
      diCount: 3,
      aByMonthday: [28]
    }),
    [
      new Date(Date.UTC(2013, 0, 28)),
      new Date(Date.UTC(2013, 1, 28)),
      new Date(Date.UTC(2013, 2, 28))
    ]
  )

  // =============================================================================
    // The original `dateutil.rrule` test suite converted from Py to JS.
    // =============================================================================

  testRecurring('testBefore',
    {
      rrule: new RRule({
        eFreq: RRule.DAILY,
        dtStart: parse('19970902T090000')
      }),
      method: 'before',
      args: [parse('19970905T090000')]
    },
    datetime(1997, 9, 4, 9, 0)
  )

  testRecurring('testBeforeInc',
    {
      rrule: new RRule({
        eFreq: RRule.DAILY,
        dtStart: parse('19970902T090000')
      }),
      method: 'before',
      args: [parse('19970905T090000'), true]
    },
    datetime(1997, 9, 5, 9, 0)
  )

  testRecurring('testAfter',
    {
      rrule: new RRule({
        eFreq: RRule.DAILY,
        dtStart: parse('19970902T090000')
      }),
      method: 'after',
      args: [parse('19970904T090000')]
    },
    datetime(1997, 9, 5, 9, 0)
  )

  testRecurring('testAfterInc',
    {
      rrule: new RRule({
        eFreq: RRule.DAILY,
        dtStart: parse('19970902T090000')
      }),
      method: 'after',
      args: [parse('19970904T090000'), true]
    },
    datetime(1997, 9, 4, 9, 0)
  )

  testRecurring('testBetween',
    {
      rrule: new RRule({
        eFreq: RRule.DAILY,
        dtStart: parse('19970902T090000')
      }),
      method: 'between',
      args: [parse('19970902T090000'), parse('19970906T090000')]
    },
    [
      datetime(1997, 9, 3, 9, 0),
      datetime(1997, 9, 4, 9, 0),
      datetime(1997, 9, 5, 9, 0)
    ]
  )

  testRecurring('testBetweenInc',
    {
      rrule: new RRule({
        eFreq: RRule.DAILY,
        dtStart: parse('19970902T090000')
      }),
      method: 'between',
      args: [parse('19970902T090000'), parse('19970906T090000'), true]
    },
    [
      datetime(1997, 9, 2, 9, 0),
      datetime(1997, 9, 3, 9, 0),
      datetime(1997, 9, 4, 9, 0),
      datetime(1997, 9, 5, 9, 0),
      datetime(1997, 9, 6, 9, 0)
    ]
  )

  testRecurring('testYearly',
    new RRule({
      eFreq: RRule.YEARLY,
      diCount: 3,
      dtStart: parse('19970902T090000')
    }),
    [
      datetime(1997, 9, 2, 9, 0),
      datetime(1998, 9, 2, 9, 0),
      datetime(1999, 9, 2, 9, 0)
    ]
  )

  testRecurring('testYearlyInterval',
    new RRule({eFreq: RRule.YEARLY,
      diCount: 3,
      dwInterval: 2,
      dtStart: parse('19970902T090000')
    }),
    [
      datetime(1997, 9, 2, 9, 0),
      datetime(1999, 9, 2, 9, 0),
      datetime(2001, 9, 2, 9, 0)
    ]
  )

  testRecurring('testYearlyIntervalLarge',
    new RRule({eFreq: RRule.YEARLY,
      diCount: 3,
      dwInterval: 100,
      dtStart: parse('19970902T090000')
    }),
    [
      datetime(1997, 9, 2, 9, 0),
      datetime(2097, 9, 2, 9, 0),
      datetime(2197, 9, 2, 9, 0)
    ]
  )

  testRecurring('testYearlyByMonth',
    new RRule({eFreq: RRule.YEARLY,
      diCount: 3,
      aByMonth: [1, 3],
      dtStart: parse('19970902T090000')
    }),
    [
      datetime(1998, 1, 2, 9, 0),
      datetime(1998, 3, 2, 9, 0),
      datetime(1999, 1, 2, 9, 0)
    ]
  )

  testRecurring('testYearlyByMonthDay',
    new RRule({eFreq: RRule.YEARLY,
      diCount: 3,
      aByMonthday: [1, 3],
      dtStart: parse('19970902T090000')
    }),
    [
      datetime(1997, 9, 3, 9, 0),
      datetime(1997, 10, 1, 9, 0),
      datetime(1997, 10, 3, 9, 0)
    ]
  )

  testRecurring('testYearlyByMonthAndMonthDay',
    new RRule({eFreq: RRule.YEARLY,
      diCount: 3,
      aByMonth: [1, 3],
      aByMonthday: [5, 7],
      dtStart: parse('19970902T090000')
    }),
    [
      datetime(1998, 1, 5, 9, 0),
      datetime(1998, 1, 7, 9, 0),
      datetime(1998, 3, 5, 9, 0)
    ]
  )

  testRecurring('testYearlyByWeekDay',
    new RRule({eFreq: RRule.YEARLY,
      diCount: 3,
      aByWeekday: [RRule.TU, RRule.TH],
      dtStart: parse('19970902T090000')
    }),
    [
      datetime(1997, 9, 2, 9, 0),
      datetime(1997, 9, 4, 9, 0),
      datetime(1997, 9, 9, 9, 0)
    ]
  )

  testRecurring('testYearlyByNWeekDay',
    new RRule({eFreq: RRule.YEARLY,
      diCount: 3,
      aByWeekday: [RRule.TU.nth(1), RRule.TH.nth(-1)],
      dtStart: parse('19970902T090000')
    }),
    [
      datetime(1997, 12, 25, 9, 0),
      datetime(1998, 1, 6, 9, 0),
      datetime(1998, 12, 31, 9, 0)
    ]
  )

  testRecurring('testYearlyByNWeekDayLarge',
    new RRule({eFreq: RRule.YEARLY,
      diCount: 3,
      aByWeekday: [RRule.TU.nth(13), RRule.TH.nth(-13)],
      dtStart: parse('19970902T090000')
    }),
    [
      datetime(1997, 10, 2, 9, 0),
      datetime(1998, 3, 31, 9, 0),
      datetime(1998, 10, 8, 9, 0)
    ]
  )

  testRecurring('testYearlyByMonthAndWeekDay',
    new RRule({eFreq: RRule.YEARLY,
      diCount: 3,
      aByMonth: [1, 3],
      aByWeekday: [RRule.TU, RRule.TH],
      dtStart: parse('19970902T090000')
    }),
    [
      datetime(1998, 1, 1, 9, 0),
      datetime(1998, 1, 6, 9, 0),
      datetime(1998, 1, 8, 9, 0)
    ]
  )

  testRecurring('testYearlyByMonthAndNWeekDay',
    new RRule({eFreq: RRule.YEARLY,
      diCount: 3,
      aByMonth: [1, 3],
      aByWeekday: [RRule.TU.nth(1), RRule.TH.nth(-1)],
      dtStart: parse('19970902T090000')
    }),
    [
      datetime(1998, 1, 6, 9, 0),
      datetime(1998, 1, 29, 9, 0),
      datetime(1998, 3, 3, 9, 0)
    ]
  )

  testRecurring('testYearlyByMonthAndNWeekDayLarge',
    new RRule({eFreq: RRule.YEARLY,
      diCount: 3,
      aByMonth: [1, 3],
      aByWeekday: [RRule.TU.nth(3), RRule.TH.nth(-3)],
      dtStart: parse('19970902T090000')
    }),
    [
      datetime(1998, 1, 15, 9, 0),
      datetime(1998, 1, 20, 9, 0),
      datetime(1998, 3, 12, 9, 0)
    ]
  )

  testRecurring('testYearlyByMonthDayAndWeekDay',
    new RRule({eFreq: RRule.YEARLY,
      diCount: 3,
      aByMonthday: [1, 3],
      aByWeekday: [RRule.TU, RRule.TH],
      dtStart: parse('19970902T090000')
    }),
    [
      datetime(1998, 1, 1, 9, 0),
      datetime(1998, 2, 3, 9, 0),
      datetime(1998, 3, 3, 9, 0)
    ]
  )

  testRecurring('testYearlyByMonthAndMonthDayAndWeekDay',
    new RRule({eFreq: RRule.YEARLY,
      diCount: 3,
      aByMonth: [1, 3],
      aByMonthday: [1, 3],
      aByWeekday: [RRule.TU, RRule.TH],
      dtStart: parse('19970902T090000')
    }),
    [
      datetime(1998, 1, 1, 9, 0),
      datetime(1998, 3, 3, 9, 0),
      datetime(2001, 3, 1, 9, 0)
    ]
  )

  testRecurring('testYearlyByYearDay',
    new RRule({eFreq: RRule.YEARLY,
      diCount: 4,
      aByYearday: [1, 100, 200, 365],
      dtStart: parse('19970902T090000')
    }),
    [
      datetime(1997, 12, 31, 9, 0),
      datetime(1998, 1, 1, 9, 0),
      datetime(1998, 4, 10, 9, 0),
      datetime(1998, 7, 19, 9, 0)
    ]
  )

  testRecurring('testYearlyByYearDayNeg',
    new RRule({eFreq: RRule.YEARLY,
      diCount: 4,
      aByYearday: [-365, -266, -166, -1],
      dtStart: parse('19970902T090000')
    }),
    [
      datetime(1997, 12, 31, 9, 0),
      datetime(1998, 1, 1, 9, 0),
      datetime(1998, 4, 10, 9, 0),
      datetime(1998, 7, 19, 9, 0)
    ]
  )

  testRecurring('testYearlyByMonthAndYearDay',
    new RRule({eFreq: RRule.YEARLY,
      diCount: 4,
      aByMonth: [4, 7],
      aByYearday: [1, 100, 200, 365],
      dtStart: parse('19970902T090000')
    }),
    [
      datetime(1998, 4, 10, 9, 0),
      datetime(1998, 7, 19, 9, 0),
      datetime(1999, 4, 10, 9, 0),
      datetime(1999, 7, 19, 9, 0)
    ]
  )

  testRecurring('testYearlyByMonthAndYearDayNeg',
    new RRule({eFreq: RRule.YEARLY,
      diCount: 4,
      aByMonth: [4, 7],
      aByYearday: [-365, -266, -166, -1],
      dtStart: parse('19970902T090000')
    }),
    [
      datetime(1998, 4, 10, 9, 0),
      datetime(1998, 7, 19, 9, 0),
      datetime(1999, 4, 10, 9, 0),
      datetime(1999, 7, 19, 9, 0)
    ]
  )

  testRecurring('testYearlyaByWeekno',
    new RRule({eFreq: RRule.YEARLY,
      diCount: 3,
      aByWeekno: 20,
      dtStart: parse('19970902T090000')
    }),
    [
      datetime(1998, 5, 11, 9, 0),
      datetime(1998, 5, 12, 9, 0),
      datetime(1998, 5, 13, 9, 0)
    ]
  )

  testRecurring('testYearlyaByWeeknoAndWeekDay',
    // That's a nice one. The first days of week number one
    // may be in the last year.
    new RRule({eFreq: RRule.YEARLY,
      diCount: 3,
      aByWeekno: 1,
      aByWeekday: RRule.MO,
      dtStart: parse('19970902T090000')
    }),
    [
      datetime(1997, 12, 29, 9, 0),
      datetime(1999, 1, 4, 9, 0),
      datetime(2000, 1, 3, 9, 0)
    ]
  )

  testRecurring('testYearlyaByWeeknoAndWeekDayLarge',
    // Another nice test. The last days of week number 52/53
    // may be in the next year.
    new RRule({eFreq: RRule.YEARLY,
      diCount: 3,
      aByWeekno: 52,
      aByWeekday: RRule.SU,
      dtStart: parse('19970902T090000')
    }),
    [
      datetime(1997, 12, 28, 9, 0),
      datetime(1998, 12, 27, 9, 0),
      datetime(2000, 1, 2, 9, 0)
    ]
  )

  testRecurring('testYearlyaByWeeknoAndWeekDayLast',
    new RRule({eFreq: RRule.YEARLY,
      diCount: 3,
      aByWeekno: -1,
      aByWeekday: RRule.SU,
      dtStart: parse('19970902T090000')
    }),
    [
      datetime(1997, 12, 28, 9, 0),
      datetime(1999, 1, 3, 9, 0),
      datetime(2000, 1, 2, 9, 0)
    ]
  )

  testRecurring('testYearlyaByWeeknoAndWeekDay53',
    new RRule({eFreq: RRule.YEARLY,
      diCount: 3,
      aByWeekno: 53,
      aByWeekday: RRule.MO,
      dtStart: parse('19970902T090000')
    }),
    [
      datetime(1998, 12, 28, 9, 0),
      datetime(2004, 12, 27, 9, 0),
      datetime(2009, 12, 28, 9, 0)
    ]
  )

  testRecurring('testYearlyByHour',
    new RRule({eFreq: RRule.YEARLY,
      diCount: 3,
      aByHour: [6, 18],
      dtStart: parse('19970902T090000')
    }),
    [
      datetime(1997, 9, 2, 18, 0),
      datetime(1998, 9, 2, 6, 0),
      datetime(1998, 9, 2, 18, 0)
    ]
  )

  testRecurring('testYearlyByMinute',
    new RRule({eFreq: RRule.YEARLY,
      diCount: 3,
      aByMinute: [6, 18],
      dtStart: parse('19970902T090000')
    }),
    [
      datetime(1997, 9, 2, 9, 6),
      datetime(1997, 9, 2, 9, 18),
      datetime(1998, 9, 2, 9, 6)
    ]
  )

  testRecurring('testYearlyByHourAndMinute',
    new RRule({eFreq: RRule.YEARLY,
      diCount: 3,
      aByHour: [6, 18],
      aByMinute: [6, 18],
      dtStart: parse('19970902T090000')
    }),
    [
      datetime(1997, 9, 2, 18, 6),
      datetime(1997, 9, 2, 18, 18),
      datetime(1998, 9, 2, 6, 6)
    ]
  )

  testRecurring('testYearlyBySetPos',
    new RRule({eFreq: RRule.YEARLY,
      diCount: 3,
      aByMonthday: 15,
      aByHour: [6, 18],
      bysetpos: [3, -3],
      dtStart: parse('19970902T090000')
    }),
    [
      datetime(1997, 11, 15, 18, 0),
      datetime(1998, 2, 15, 6, 0),
      datetime(1998, 11, 15, 18, 0)
    ]
  )

  testRecurring('testYearlyBetweenInc',
    {
      rrule: new RRule({
        eFreq: RRule.YEARLY,
        dtStart: parse('20150101T000000')
      }),
      method: 'between',
      args: [parse('20160101T000000'), parse('20160101T000000'), true]
    },
    [
      datetime(2016, 1, 1)
    ]
  )

  testRecurring('testYearlyBetweenIncLargeSpan',
    {
      rrule: new RRule({
        eFreq: RRule.YEARLY,
        dtStart: parse('19200101T000000') // Error because date lower than dateutil.ORDINAL_BASE
      }),
      method: 'between',
      args: [parse('20160101T000000'), parse('20160101T000000'), true]
    },
    [
      datetime(2016, 1, 1)
    ]
  )

  testRecurring('testMonthly',
    new RRule({eFreq: RRule.MONTHLY,
      diCount: 3,
      dtStart: parse('19970902T090000')
    }),
    [
      datetime(1997, 9, 2, 9, 0),
      datetime(1997, 10, 2, 9, 0),
      datetime(1997, 11, 2, 9, 0)
    ]
  )

  testRecurring('testMonthlyInterval',
    new RRule({eFreq: RRule.MONTHLY,
      diCount: 3,
      dwInterval: 2,
      dtStart: parse('19970902T090000')
    }),
    [
      datetime(1997, 9, 2, 9, 0),
      datetime(1997, 11, 2, 9, 0),
      datetime(1998, 1, 2, 9, 0)
    ]
  )

  testRecurring('testMonthlyIntervalLarge',
    new RRule({eFreq: RRule.MONTHLY,
      diCount: 3,
      dwInterval: 18,
      dtStart: parse('19970902T090000')
    }),
    [
      datetime(1997, 9, 2, 9, 0),
      datetime(1999, 3, 2, 9, 0),
      datetime(2000, 9, 2, 9, 0)
    ]
  )

  testRecurring('testMonthlyByMonth',
    new RRule({eFreq: RRule.MONTHLY,
      diCount: 3,
      aByMonth: [1, 3],
      dtStart: parse('19970902T090000')
    }),
    [
      datetime(1998, 1, 2, 9, 0),
      datetime(1998, 3, 2, 9, 0),
      datetime(1999, 1, 2, 9, 0)
    ]
  )

  testRecurring('testMonthlyByMonthDay',
    new RRule({eFreq: RRule.MONTHLY,
      diCount: 3,
      aByMonthday: [1, 3],
      dtStart: parse('19970902T090000')
    }),
    [
      datetime(1997, 9, 3, 9, 0),
      datetime(1997, 10, 1, 9, 0),
      datetime(1997, 10, 3, 9, 0)
    ]
  )

  testRecurring('testMonthlyByMonthAndMonthDay',
    new RRule({eFreq: RRule.MONTHLY,
      diCount: 3,
      aByMonth: [1, 3],
      aByMonthday: [5, 7],
      dtStart: parse('19970902T090000')
    }),
    [
      datetime(1998, 1, 5, 9, 0),
      datetime(1998, 1, 7, 9, 0),
      datetime(1998, 3, 5, 9, 0)
    ]
  )

  testRecurring('testMonthlyByWeekDay',
    new RRule({eFreq: RRule.MONTHLY,
      diCount: 3,
      aByWeekday: [RRule.TU, RRule.TH],
      dtStart: parse('19970902T090000')
    }),
    [
      datetime(1997, 9, 2, 9, 0),
      datetime(1997, 9, 4, 9, 0),
      datetime(1997, 9, 9, 9, 0)
    ]
  )

  testRecurring('testMonthlyByNWeekDay',
    new RRule({eFreq: RRule.MONTHLY,
      diCount: 3,
      aByWeekday: [RRule.TU.nth(1), RRule.TH.nth(-1)],
      dtStart: parse('19970902T090000')
    }),
    [
      datetime(1997, 9, 2, 9, 0),
      datetime(1997, 9, 25, 9, 0),
      datetime(1997, 10, 7, 9, 0)
    ]
  )

  testRecurring('testMonthlyByNWeekDayLarge',
    new RRule({eFreq: RRule.MONTHLY,
      diCount: 3,
      aByWeekday: [RRule.TU.nth(3), RRule.TH.nth(-3)],
      dtStart: parse('19970902T090000')
    }),
    [
      datetime(1997, 9, 11, 9, 0),
      datetime(1997, 9, 16, 9, 0),
      datetime(1997, 10, 16, 9, 0)
    ]
  )

  testRecurring('testMonthlyByMonthAndWeekDay',
    new RRule({eFreq: RRule.MONTHLY,
      diCount: 3,
      aByMonth: [1, 3],
      aByWeekday: [RRule.TU, RRule.TH],
      dtStart: parse('19970902T090000')
    }),
    [
      datetime(1998, 1, 1, 9, 0),
      datetime(1998, 1, 6, 9, 0),
      datetime(1998, 1, 8, 9, 0)
    ]
  )

  testRecurring('testMonthlyByMonthAndNWeekDay',
    new RRule({eFreq: RRule.MONTHLY,
      diCount: 3,
      aByMonth: [1, 3],
      aByWeekday: [RRule.TU.nth(1), RRule.TH.nth(-1)],
      dtStart: parse('19970902T090000')
    }),
    [
      datetime(1998, 1, 6, 9, 0),
      datetime(1998, 1, 29, 9, 0),
      datetime(1998, 3, 3, 9, 0)
    ]
  )

  testRecurring('testMonthlyByMonthAndNWeekDayLarge',
    new RRule({eFreq: RRule.MONTHLY,
      diCount: 3,
      aByMonth: [1, 3],
      aByWeekday: [RRule.TU.nth(3), RRule.TH.nth(-3)],
      dtStart: parse('19970902T090000')
    }),
    [
      datetime(1998, 1, 15, 9, 0),
      datetime(1998, 1, 20, 9, 0),
      datetime(1998, 3, 12, 9, 0)
    ]
  )

  testRecurring('testMonthlyByMonthDayAndWeekDay',
    new RRule({eFreq: RRule.MONTHLY,
      diCount: 3,
      aByMonthday: [1, 3],
      aByWeekday: [RRule.TU, RRule.TH],
      dtStart: parse('19970902T090000')
    }),
    [
      datetime(1998, 1, 1, 9, 0),
      datetime(1998, 2, 3, 9, 0),
      datetime(1998, 3, 3, 9, 0)
    ]
  )

  testRecurring('testMonthlyByMonthAndMonthDayAndWeekDay',
    new RRule({eFreq: RRule.MONTHLY,
      diCount: 3,
      aByMonth: [1, 3],
      aByMonthday: [1, 3],
      aByWeekday: [RRule.TU, RRule.TH],
      dtStart: parse('19970902T090000')
    }),
    [
      datetime(1998, 1, 1, 9, 0),
      datetime(1998, 3, 3, 9, 0),
      datetime(2001, 3, 1, 9, 0)
    ]
  )

  testRecurring('testMonthlyByYearDay',
    new RRule({eFreq: RRule.MONTHLY,
      diCount: 4,
      aByYearday: [1, 100, 200, 365],
      dtStart: parse('19970902T090000')
    }),
    [
      datetime(1997, 12, 31, 9, 0),
      datetime(1998, 1, 1, 9, 0),
      datetime(1998, 4, 10, 9, 0),
      datetime(1998, 7, 19, 9, 0)
    ]
  )

  testRecurring('testMonthlyByYearDayNeg',
    new RRule({eFreq: RRule.MONTHLY,
      diCount: 4,
      aByYearday: [-365, -266, -166, -1],
      dtStart: parse('19970902T090000')
    }),
    [
      datetime(1997, 12, 31, 9, 0),
      datetime(1998, 1, 1, 9, 0),
      datetime(1998, 4, 10, 9, 0),
      datetime(1998, 7, 19, 9, 0)
    ]
  )

  testRecurring('testMonthlyByMonthAndYearDay',
    new RRule({eFreq: RRule.MONTHLY,
      diCount: 4,
      aByMonth: [4, 7],
      aByYearday: [1, 100, 200, 365],
      dtStart: parse('19970902T090000')
    }),
    [
      datetime(1998, 4, 10, 9, 0),
      datetime(1998, 7, 19, 9, 0),
      datetime(1999, 4, 10, 9, 0),
      datetime(1999, 7, 19, 9, 0)
    ]
  )

  testRecurring('testMonthlyByMonthAndYearDayNeg',
    new RRule({eFreq: RRule.MONTHLY,
      diCount: 4,
      aByMonth: [4, 7],
      aByYearday: [-365, -266, -166, -1],
      dtStart: parse('19970902T090000')
    }),
    [
      datetime(1998, 4, 10, 9, 0),
      datetime(1998, 7, 19, 9, 0),
      datetime(1999, 4, 10, 9, 0),
      datetime(1999, 7, 19, 9, 0)
    ]
  )

  testRecurring('testMonthlyaByWeekno',
    new RRule({eFreq: RRule.MONTHLY,
      diCount: 3,
      aByWeekno: 20,
      dtStart: parse('19970902T090000')
    }),
    [
      datetime(1998, 5, 11, 9, 0),
      datetime(1998, 5, 12, 9, 0),
      datetime(1998, 5, 13, 9, 0)
    ]
  )

  testRecurring('testMonthlyaByWeeknoAndWeekDay',
    // That's a nice one. The first days of week number one
    // may be in the last year.
    new RRule({eFreq: RRule.MONTHLY,
      diCount: 3,
      aByWeekno: 1,
      aByWeekday: RRule.MO,
      dtStart: parse('19970902T090000')
    }),
    [
      datetime(1997, 12, 29, 9, 0),
      datetime(1999, 1, 4, 9, 0),
      datetime(2000, 1, 3, 9, 0)
    ]
  )

  testRecurring('testMonthlyaByWeeknoAndWeekDayLarge',
    // Another nice test. The last days of week number 52/53
    // may be in the next year.
    new RRule({eFreq: RRule.MONTHLY,
      diCount: 3,
      aByWeekno: 52,
      aByWeekday: RRule.SU,
      dtStart: parse('19970902T090000')
    }),
    [
      datetime(1997, 12, 28, 9, 0),
      datetime(1998, 12, 27, 9, 0),
      datetime(2000, 1, 2, 9, 0)
    ]
  )

  testRecurring('testMonthlyaByWeeknoAndWeekDayLast',
    new RRule({eFreq: RRule.MONTHLY,
      diCount: 3,
      aByWeekno: -1,
      aByWeekday: RRule.SU,
      dtStart: parse('19970902T090000')
    }),
    [
      datetime(1997, 12, 28, 9, 0),
      datetime(1999, 1, 3, 9, 0),
      datetime(2000, 1, 2, 9, 0)
    ]
  )

  testRecurring('testMonthlyaByWeeknoAndWeekDay53',
    new RRule({eFreq: RRule.MONTHLY,
      diCount: 3,
      aByWeekno: 53,
      aByWeekday: RRule.MO,
      dtStart: parse('19970902T090000')
    }),
    [
      datetime(1998, 12, 28, 9, 0),
      datetime(2004, 12, 27, 9, 0),
      datetime(2009, 12, 28, 9, 0)
    ]
  )

  testRecurring('testMonthlyByHour',
    new RRule({eFreq: RRule.MONTHLY,
      diCount: 3,
      aByHour: [6, 18],
      dtStart: parse('19970902T090000')
    }),
    [
      datetime(1997, 9, 2, 18, 0),
      datetime(1997, 10, 2, 6, 0),
      datetime(1997, 10, 2, 18, 0)
    ]
  )

  testRecurring('testMonthlyByMinute',
    new RRule({eFreq: RRule.MONTHLY,
      diCount: 3,
      aByMinute: [6, 18],
      dtStart: parse('19970902T090000')
    }),
    [
      datetime(1997, 9, 2, 9, 6),
      datetime(1997, 9, 2, 9, 18),
      datetime(1997, 10, 2, 9, 6)
    ]
  )

  testRecurring('testMonthlyByHourAndMinute',
    new RRule({eFreq: RRule.MONTHLY,
      diCount: 3,
      aByHour: [6, 18],
      aByMinute: [6, 18],
      dtStart: parse('19970902T090000')
    }),
    [
      datetime(1997, 9, 2, 18, 6),
      datetime(1997, 9, 2, 18, 18),
      datetime(1997, 10, 2, 6, 6)
    ]
  )

  testRecurring('testMonthlyBySetPos',
    new RRule({eFreq: RRule.MONTHLY,
      diCount: 3,
      aByMonthday: [13, 17],
      aByHour: [6, 18],
      bysetpos: [3, -3],
      dtStart: parse('19970902T090000')
    }),
    [
      datetime(1997, 9, 13, 18, 0),
      datetime(1997, 9, 17, 6, 0),
      datetime(1997, 10, 13, 18, 0)
    ]
  )

  testRecurring('testMonthlyNegByMonthDayJanFebForNonLeapYear',
    new RRule({eFreq: RRule.MONTHLY,
      diCount: 4,
      aByMonthday: -1,
      dtStart: parse('20131201T0900000')
    }),
    [
      datetime(2013, 12, 31, 9, 0),
      datetime(2014, 1, 31, 9, 0),
      datetime(2014, 2, 28, 9, 0),
      datetime(2014, 3, 31, 9, 0)
    ]
  )

  testRecurring('testMonthlyNegByMonthDayJanFebForLeapYear',
    new RRule({eFreq: RRule.MONTHLY,
      diCount: 4,
      aByMonthday: -1,
      dtStart: parse('20151201T0900000')
    }),
    [
      datetime(2015, 12, 31, 9, 0),
      datetime(2016, 1, 31, 9, 0),
      datetime(2016, 2, 29, 9, 0),
      datetime(2016, 3, 31, 9, 0)
    ]
  )

  testRecurring('testWeekly',
    new RRule({eFreq: RRule.WEEKLY,
      diCount: 3,
      dtStart: parse('19970902T090000')
    }),
    [
      datetime(1997, 9, 2, 9, 0),
      datetime(1997, 9, 9, 9, 0),
      datetime(1997, 9, 16, 9, 0)
    ]
  )

  testRecurring('testWeeklyInterval',
    new RRule({eFreq: RRule.WEEKLY,
      diCount: 3,
      dwInterval: 2,
      dtStart: parse('19970902T090000')
    }),
    [
      datetime(1997, 9, 2, 9, 0),
      datetime(1997, 9, 16, 9, 0),
      datetime(1997, 9, 30, 9, 0)
    ]
  )

  testRecurring('testWeeklyIntervalLarge',
    new RRule({eFreq: RRule.WEEKLY,
      diCount: 3,
      dwInterval: 20,
      dtStart: parse('19970902T090000')
    }),
    [
      datetime(1997, 9, 2, 9, 0),
      datetime(1998, 1, 20, 9, 0),
      datetime(1998, 6, 9, 9, 0)
    ]
  )

  testRecurring('testWeeklyByMonth',
    new RRule({eFreq: RRule.WEEKLY,
      diCount: 3,
      aByMonth: [1, 3],
      dtStart: parse('19970902T090000')
    }),
    [
      datetime(1998, 1, 6, 9, 0),
      datetime(1998, 1, 13, 9, 0),
      datetime(1998, 1, 20, 9, 0)
    ]
  )

  testRecurring('testWeeklyByMonthDay',
    new RRule({eFreq: RRule.WEEKLY,
      diCount: 3,
      aByMonthday: [1, 3],
      dtStart: parse('19970902T090000')
    }),
    [
      datetime(1997, 9, 3, 9, 0),
      datetime(1997, 10, 1, 9, 0),
      datetime(1997, 10, 3, 9, 0)
    ]
  )

  testRecurring('testWeeklyByMonthAndMonthDay',
    new RRule({eFreq: RRule.WEEKLY,
      diCount: 3,
      aByMonth: [1, 3],
      aByMonthday: [5, 7],
      dtStart: parse('19970902T090000')
    }),
    [
      datetime(1998, 1, 5, 9, 0),
      datetime(1998, 1, 7, 9, 0),
      datetime(1998, 3, 5, 9, 0)
    ]
  )

  testRecurring('testWeeklyByWeekDay',
    new RRule({eFreq: RRule.WEEKLY,
      diCount: 3,
      aByWeekday: [RRule.TU, RRule.TH],
      dtStart: parse('19970902T090000')
    }),
    [
      datetime(1997, 9, 2, 9, 0),
      datetime(1997, 9, 4, 9, 0),
      datetime(1997, 9, 9, 9, 0)
    ]
  )

  testRecurring('testWeeklyByNWeekDay',
    new RRule({eFreq: RRule.WEEKLY,
      diCount: 3,
      aByWeekday: [RRule.TU.nth(1), RRule.TH.nth(-1)],
      dtStart: parse('19970902T090000')
    }),
    [
      datetime(1997, 9, 2, 9, 0),
      datetime(1997, 9, 4, 9, 0),
      datetime(1997, 9, 9, 9, 0)
    ]
  )

  testRecurring('testWeeklyByMonthAndWeekDay',
    // This test is interesting, because it crosses the year
    // boundary in a weekly period to find day '1' as a
    // valid recurrence.
    new RRule({eFreq: RRule.WEEKLY,
      diCount: 3,
      aByMonth: [1, 3],
      aByWeekday: [RRule.TU, RRule.TH],
      dtStart: parse('19970902T090000')
    }),
    [
      datetime(1998, 1, 1, 9, 0),
      datetime(1998, 1, 6, 9, 0),
      datetime(1998, 1, 8, 9, 0)
    ]
  )

  testRecurring('testWeeklyByMonthAndNWeekDay',
    new RRule({eFreq: RRule.WEEKLY,
      diCount: 3,
      aByMonth: [1, 3],
      aByWeekday: [RRule.TU.nth(1), RRule.TH.nth(-1)],
      dtStart: parse('19970902T090000')
    }),
    [
      datetime(1998, 1, 1, 9, 0),
      datetime(1998, 1, 6, 9, 0),
      datetime(1998, 1, 8, 9, 0)
    ]
  )

  testRecurring('testWeeklyByMonthDayAndWeekDay',
    new RRule({eFreq: RRule.WEEKLY,
      diCount: 3,
      aByMonthday: [1, 3],
      aByWeekday: [RRule.TU, RRule.TH],
      dtStart: parse('19970902T090000')
    }),
    [
      datetime(1998, 1, 1, 9, 0),
      datetime(1998, 2, 3, 9, 0),
      datetime(1998, 3, 3, 9, 0)
    ]
  )

  testRecurring('testWeeklyByMonthAndMonthDayAndWeekDay',
    new RRule({eFreq: RRule.WEEKLY,
      diCount: 3,
      aByMonth: [1, 3],
      aByMonthday: [1, 3],
      aByWeekday: [RRule.TU, RRule.TH],
      dtStart: parse('19970902T090000')
    }),
    [
      datetime(1998, 1, 1, 9, 0),
      datetime(1998, 3, 3, 9, 0),
      datetime(2001, 3, 1, 9, 0)
    ]
  )

  testRecurring('testWeeklyByYearDay',
    new RRule({eFreq: RRule.WEEKLY,
      diCount: 4,
      aByYearday: [1, 100, 200, 365],
      dtStart: parse('19970902T090000')
    }),
    [
      datetime(1997, 12, 31, 9, 0),
      datetime(1998, 1, 1, 9, 0),
      datetime(1998, 4, 10, 9, 0),
      datetime(1998, 7, 19, 9, 0)
    ]
  )

  testRecurring('testWeeklyByYearDayNeg',
    new RRule({eFreq: RRule.WEEKLY,
      diCount: 4,
      aByYearday: [-365, -266, -166, -1],
      dtStart: parse('19970902T090000')
    }),
    [
      datetime(1997, 12, 31, 9, 0),
      datetime(1998, 1, 1, 9, 0),
      datetime(1998, 4, 10, 9, 0),
      datetime(1998, 7, 19, 9, 0)
    ]
  )

  testRecurring('testWeeklyByMonthAndYearDay',
    new RRule({eFreq: RRule.WEEKLY,
      diCount: 4,
      aByMonth: [1, 7],
      aByYearday: [1, 100, 200, 365],
      dtStart: parse('19970902T090000')
    }),
    [
      datetime(1998, 1, 1, 9, 0),
      datetime(1998, 7, 19, 9, 0),
      datetime(1999, 1, 1, 9, 0),
      datetime(1999, 7, 19, 9, 0)
    ]
  )

  testRecurring('testWeeklyByMonthAndYearDayNeg',
    new RRule({eFreq: RRule.WEEKLY,
      diCount: 4,
      aByMonth: [1, 7],
      aByYearday: [-365, -266, -166, -1],
      dtStart: parse('19970902T090000')
    }),
    [
      datetime(1998, 1, 1, 9, 0),
      datetime(1998, 7, 19, 9, 0),
      datetime(1999, 1, 1, 9, 0),
      datetime(1999, 7, 19, 9, 0)
    ]
  )

  testRecurring('testWeeklyaByWeekno',
    new RRule({eFreq: RRule.WEEKLY,
      diCount: 3,
      aByWeekno: 20,
      dtStart: parse('19970902T090000')
    }),
    [
      datetime(1998, 5, 11, 9, 0),
      datetime(1998, 5, 12, 9, 0),
      datetime(1998, 5, 13, 9, 0)
    ]
  )

  testRecurring('testWeeklyaByWeeknoAndWeekDay',
    // That's a nice one. The first days of week number one
    // may be in the last year.
    new RRule({eFreq: RRule.WEEKLY,
      diCount: 3,
      aByWeekno: 1,
      aByWeekday: RRule.MO,
      dtStart: parse('19970902T090000')
    }),
    [
      datetime(1997, 12, 29, 9, 0),
      datetime(1999, 1, 4, 9, 0),
      datetime(2000, 1, 3, 9, 0)
    ]
  )

  testRecurring('testWeeklyaByWeeknoAndWeekDayLarge',
    // Another nice test. The last days of week number 52/53
    // may be in the next year.
    new RRule({eFreq: RRule.WEEKLY,
      diCount: 3,
      aByWeekno: 52,
      aByWeekday: RRule.SU,
      dtStart: parse('19970902T090000')
    }),
    [
      datetime(1997, 12, 28, 9, 0),
      datetime(1998, 12, 27, 9, 0),
      datetime(2000, 1, 2, 9, 0)
    ]
  )

  testRecurring('testWeeklyaByWeeknoAndWeekDayLast',
    new RRule({eFreq: RRule.WEEKLY,
      diCount: 3,
      aByWeekno: -1,
      aByWeekday: RRule.SU,
      dtStart: parse('19970902T090000')
    }),
    [
      datetime(1997, 12, 28, 9, 0),
      datetime(1999, 1, 3, 9, 0),
      datetime(2000, 1, 2, 9, 0)
    ]
  )

  testRecurring('testWeeklyaByWeeknoAndWeekDay53',
    new RRule({eFreq: RRule.WEEKLY,
      diCount: 3,
      aByWeekno: 53,
      aByWeekday: RRule.MO,
      dtStart: parse('19970902T090000')
    }),
    [
      datetime(1998, 12, 28, 9, 0),
      datetime(2004, 12, 27, 9, 0),
      datetime(2009, 12, 28, 9, 0)
    ]
  )

  testRecurring('testWeeklyByHour',
    new RRule({eFreq: RRule.WEEKLY,
      diCount: 3,
      aByHour: [6, 18],
      dtStart: parse('19970902T090000')
    }),
    [
      datetime(1997, 9, 2, 18, 0),
      datetime(1997, 9, 9, 6, 0),
      datetime(1997, 9, 9, 18, 0)
    ]
  )

  testRecurring('testWeeklyByMinute',
    new RRule({eFreq: RRule.WEEKLY,
      diCount: 3,
      aByMinute: [6, 18],
      dtStart: parse('19970902T090000')
    }),
    [
      datetime(1997, 9, 2, 9, 6),
      datetime(1997, 9, 2, 9, 18),
      datetime(1997, 9, 9, 9, 6)
    ]
  )

  testRecurring('testWeeklyByHourAndMinute',
    new RRule({eFreq: RRule.WEEKLY,
      diCount: 3,
      aByHour: [6, 18],
      aByMinute: [6, 18],
      dtStart: parse('19970902T090000')
    }),
    [
      datetime(1997, 9, 2, 18, 6),
      datetime(1997, 9, 2, 18, 18),
      datetime(1997, 9, 9, 6, 6)
    ]
  )

  testRecurring('testWeeklyBySetPos',
    new RRule({eFreq: RRule.WEEKLY,
      diCount: 3,
      aByWeekday: [RRule.TU, RRule.TH],
      aByHour: [6, 18],
      bysetpos: [3, -3],
      dtStart: parse('19970902T090000')
    }),
    [
      datetime(1997, 9, 2, 18, 0),
      datetime(1997, 9, 4, 6, 0),
      datetime(1997, 9, 9, 18, 0)
    ]
  )

  testRecurring('testDaily',
    new RRule({eFreq: RRule.DAILY,
      diCount: 3,
      dtStart: parse('19970902T090000')
    }),
    [
      datetime(1997, 9, 2, 9, 0),
      datetime(1997, 9, 3, 9, 0),
      datetime(1997, 9, 4, 9, 0)
    ]
  )

  testRecurring('testDailyInterval',
    new RRule({eFreq: RRule.DAILY,
      diCount: 3,
      dwInterval: 2,
      dtStart: parse('19970902T090000')
    }),
    [
      datetime(1997, 9, 2, 9, 0),
      datetime(1997, 9, 4, 9, 0),
      datetime(1997, 9, 6, 9, 0)
    ]
  )

  testRecurring('testDailyIntervalLarge',
    new RRule({eFreq: RRule.DAILY,
      diCount: 3,
      dwInterval: 92,
      dtStart: parse('19970902T090000')
    }),
    [
      datetime(1997, 9, 2, 9, 0),
      datetime(1997, 12, 3, 9, 0),
      datetime(1998, 3, 5, 9, 0)
    ]
  )

  testRecurring('testDailyByMonth',
    new RRule({eFreq: RRule.DAILY,
      diCount: 3,
      aByMonth: [1, 3],
      dtStart: parse('19970902T090000')
    }),
    [
      datetime(1998, 1, 1, 9, 0),
      datetime(1998, 1, 2, 9, 0),
      datetime(1998, 1, 3, 9, 0)
    ]
  )

  testRecurring('testDailyByMonthDay',
    new RRule({eFreq: RRule.DAILY,
      diCount: 3,
      aByMonthday: [1, 3],
      dtStart: parse('19970902T090000')
    }),
    [
      datetime(1997, 9, 3, 9, 0),
      datetime(1997, 10, 1, 9, 0),
      datetime(1997, 10, 3, 9, 0)
    ]
  )

  testRecurring('testDailyByMonthAndMonthDay',
    new RRule({eFreq: RRule.DAILY,
      diCount: 3,
      aByMonth: [1, 3],
      aByMonthday: [5, 7],
      dtStart: parse('19970902T090000')
    }),
    [
      datetime(1998, 1, 5, 9, 0),
      datetime(1998, 1, 7, 9, 0),
      datetime(1998, 3, 5, 9, 0)
    ]
  )

  testRecurring('testDailyByWeekDay',
    new RRule({eFreq: RRule.DAILY,
      diCount: 3,
      aByWeekday: [RRule.TU, RRule.TH],
      dtStart: parse('19970902T090000')
    }),
    [
      datetime(1997, 9, 2, 9, 0),
      datetime(1997, 9, 4, 9, 0),
      datetime(1997, 9, 9, 9, 0)
    ]
  )

  testRecurring('testDailyByNWeekDay',
    new RRule({eFreq: RRule.DAILY,
      diCount: 3,
      aByWeekday: [RRule.TU.nth(1), RRule.TH.nth(-1)],
      dtStart: parse('19970902T090000')
    }),
    [
      datetime(1997, 9, 2, 9, 0),
      datetime(1997, 9, 4, 9, 0),
      datetime(1997, 9, 9, 9, 0)
    ]
  )

  testRecurring('testDailyByMonthAndWeekDay',
    new RRule({eFreq: RRule.DAILY,
      diCount: 3,
      aByMonth: [1, 3],
      aByWeekday: [RRule.TU, RRule.TH],
      dtStart: parse('19970902T090000')
    }),
    [
      datetime(1998, 1, 1, 9, 0),
      datetime(1998, 1, 6, 9, 0),
      datetime(1998, 1, 8, 9, 0)
    ]
  )

  testRecurring('testDailyByMonthAndNWeekDay',
    new RRule({eFreq: RRule.DAILY,
      diCount: 3,
      aByMonth: [1, 3],
      aByWeekday: [RRule.TU.nth(1), RRule.TH.nth(-1)],
      dtStart: parse('19970902T090000')
    }),
    [
      datetime(1998, 1, 1, 9, 0),
      datetime(1998, 1, 6, 9, 0),
      datetime(1998, 1, 8, 9, 0)
    ]
  )

  testRecurring('testDailyByMonthDayAndWeekDay',
    new RRule({eFreq: RRule.DAILY,
      diCount: 3,
      aByMonthday: [1, 3],
      aByWeekday: [RRule.TU, RRule.TH],
      dtStart: parse('19970902T090000')
    }),
    [
      datetime(1998, 1, 1, 9, 0),
      datetime(1998, 2, 3, 9, 0),
      datetime(1998, 3, 3, 9, 0)
    ]
  )

  testRecurring('testDailyByMonthAndMonthDayAndWeekDay',
    new RRule({eFreq: RRule.DAILY,
      diCount: 3,
      aByMonth: [1, 3],
      aByMonthday: [1, 3],
      aByWeekday: [RRule.TU, RRule.TH],
      dtStart: parse('19970902T090000')
    }),
    [
      datetime(1998, 1, 1, 9, 0),
      datetime(1998, 3, 3, 9, 0),
      datetime(2001, 3, 1, 9, 0)
    ]
  )

  testRecurring('testDailyByYearDay',
    new RRule({eFreq: RRule.DAILY,
      diCount: 4,
      aByYearday: [1, 100, 200, 365],
      dtStart: parse('19970902T090000')
    }),
    [
      datetime(1997, 12, 31, 9, 0),
      datetime(1998, 1, 1, 9, 0),
      datetime(1998, 4, 10, 9, 0),
      datetime(1998, 7, 19, 9, 0)
    ]
  )

  testRecurring('testDailyByYearDayNeg',
    new RRule({eFreq: RRule.DAILY,
      diCount: 4,
      aByYearday: [-365, -266, -166, -1],
      dtStart: parse('19970902T090000')
    }),
    [
      datetime(1997, 12, 31, 9, 0),
      datetime(1998, 1, 1, 9, 0),
      datetime(1998, 4, 10, 9, 0),
      datetime(1998, 7, 19, 9, 0)
    ]
  )

  testRecurring('testDailyByMonthAndYearDay',
    new RRule({eFreq: RRule.DAILY,
      diCount: 4,
      aByMonth: [1, 7],
      aByYearday: [1, 100, 200, 365],
      dtStart: parse('19970902T090000')
    }),
    [
      datetime(1998, 1, 1, 9, 0),
      datetime(1998, 7, 19, 9, 0),
      datetime(1999, 1, 1, 9, 0),
      datetime(1999, 7, 19, 9, 0)
    ]
  )

  testRecurring('testDailyByMonthAndYearDayNeg',
    new RRule({eFreq: RRule.DAILY,
      diCount: 4,
      aByMonth: [1, 7],
      aByYearday: [-365, -266, -166, -1],
      dtStart: parse('19970902T090000')
    }),
    [
      datetime(1998, 1, 1, 9, 0),
      datetime(1998, 7, 19, 9, 0),
      datetime(1999, 1, 1, 9, 0),
      datetime(1999, 7, 19, 9, 0)
    ]
  )

  testRecurring('testDailyaByWeekno',
    new RRule({eFreq: RRule.DAILY,
      diCount: 3,
      aByWeekno: 20,
      dtStart: parse('19970902T090000')
    }),
    [
      datetime(1998, 5, 11, 9, 0),
      datetime(1998, 5, 12, 9, 0),
      datetime(1998, 5, 13, 9, 0)
    ]
  )

  testRecurring('testDailyaByWeeknoAndWeekDay',
    // That's a nice one. The first days of week number one
    // may be in the last year.
    new RRule({eFreq: RRule.DAILY,
      diCount: 3,
      aByWeekno: 1,
      aByWeekday: RRule.MO,
      dtStart: parse('19970902T090000')
    }),
    [
      datetime(1997, 12, 29, 9, 0),
      datetime(1999, 1, 4, 9, 0),
      datetime(2000, 1, 3, 9, 0)
    ]
  )

  testRecurring('testDailyaByWeeknoAndWeekDayLarge',
    // Another nice test. The last days of week number 52/53
    // may be in the next year.
    new RRule({eFreq: RRule.DAILY,
      diCount: 3,
      aByWeekno: 52,
      aByWeekday: RRule.SU,
      dtStart: parse('19970902T090000')
    }),
    [
      datetime(1997, 12, 28, 9, 0),
      datetime(1998, 12, 27, 9, 0),
      datetime(2000, 1, 2, 9, 0)
    ]
  )

  testRecurring('testDailyaByWeeknoAndWeekDayLast',
    new RRule({eFreq: RRule.DAILY,
      diCount: 3,
      aByWeekno: -1,
      aByWeekday: RRule.SU,
      dtStart: parse('19970902T090000')
    }),
    [
      datetime(1997, 12, 28, 9, 0),
      datetime(1999, 1, 3, 9, 0),
      datetime(2000, 1, 2, 9, 0)
    ]
  )

  testRecurring('testDailyaByWeeknoAndWeekDay53',
    new RRule({eFreq: RRule.DAILY,
      diCount: 3,
      aByWeekno: 53,
      aByWeekday: RRule.MO,
      dtStart: parse('19970902T090000')
    }),
    [
      datetime(1998, 12, 28, 9, 0),
      datetime(2004, 12, 27, 9, 0),
      datetime(2009, 12, 28, 9, 0)
    ]
  )

  testRecurring('testDailyByHour',
    new RRule({eFreq: RRule.DAILY,
      diCount: 3,
      aByHour: [6, 18],
      dtStart: parse('19970902T090000')
    }),
    [
      datetime(1997, 9, 2, 18, 0),
      datetime(1997, 9, 3, 6, 0),
      datetime(1997, 9, 3, 18, 0)
    ]
  )

  testRecurring('testDailyByMinute',
    new RRule({eFreq: RRule.DAILY,
      diCount: 3,
      aByMinute: [6, 18],
      dtStart: parse('19970902T090000')
    }),
    [
      datetime(1997, 9, 2, 9, 6),
      datetime(1997, 9, 2, 9, 18),
      datetime(1997, 9, 3, 9, 6)
    ]
  )

  testRecurring('testDailyByHourAndMinute',
    new RRule({eFreq: RRule.DAILY,
      diCount: 3,
      aByHour: [6, 18],
      aByMinute: [6, 18],
      dtStart: parse('19970902T090000')
    }),
    [
      datetime(1997, 9, 2, 18, 6),
      datetime(1997, 9, 2, 18, 18),
      datetime(1997, 9, 3, 6, 6)
    ]
  )

  testRecurring('testDailyBySetPos',
    new RRule({eFreq: RRule.DAILY,
      diCount: 3,
      aByHour: [6, 18],
      aByMinute: [15, 45],
      bysetpos: [3, -3],
      dtStart: parse('19970902T090000')
    }),
    [
      datetime(1997, 9, 2, 18, 15),
      datetime(1997, 9, 3, 6, 45),
      datetime(1997, 9, 3, 18, 15)
    ]
  )

  testRecurring('testHourly',
    new RRule({eFreq: RRule.HOURLY,
      diCount: 3,
      dtStart: parse('19970902T090000')
    }),
    [
      datetime(1997, 9, 2, 9, 0),
      datetime(1997, 9, 2, 10, 0),
      datetime(1997, 9, 2, 11, 0)
    ]
  )

  testRecurring('testHourlyInterval',
    new RRule({eFreq: RRule.HOURLY,
      diCount: 3,
      dwInterval: 2,
      dtStart: parse('19970902T090000')
    }),
    [
      datetime(1997, 9, 2, 9, 0),
      datetime(1997, 9, 2, 11, 0),
      datetime(1997, 9, 2, 13, 0)
    ]
  )

  testRecurring('testHourlyIntervalLarge',
    new RRule({eFreq: RRule.HOURLY,
      diCount: 3,
      dwInterval: 769,
      dtStart: parse('19970902T090000')
    }),
    [
      datetime(1997, 9, 2, 9, 0),
      datetime(1997, 10, 4, 10, 0),
      datetime(1997, 11, 5, 11, 0)
    ]
  )

  testRecurring('testHourlyByMonth',
    new RRule({eFreq: RRule.HOURLY,
      diCount: 3,
      aByMonth: [1, 3],
      dtStart: parse('19970902T090000')
    }),
    [
      datetime(1998, 1, 1, 0, 0),
      datetime(1998, 1, 1, 1, 0),
      datetime(1998, 1, 1, 2, 0)
    ]
  )

  testRecurring('testHourlyByMonthDay',
    new RRule({eFreq: RRule.HOURLY,
      diCount: 3,
      aByMonthday: [1, 3],
      dtStart: parse('19970902T090000')
    }),
    [
      datetime(1997, 9, 3, 0, 0),
      datetime(1997, 9, 3, 1, 0),
      datetime(1997, 9, 3, 2, 0)
    ]
  )

  testRecurring('testHourlyByMonthAndMonthDay',
    new RRule({eFreq: RRule.HOURLY,
      diCount: 3,
      aByMonth: [1, 3],
      aByMonthday: [5, 7],
      dtStart: parse('19970902T090000')
    }),
    [
      datetime(1998, 1, 5, 0, 0),
      datetime(1998, 1, 5, 1, 0),
      datetime(1998, 1, 5, 2, 0)
    ]
  )

  testRecurring('testHourlyByWeekDay',
    new RRule({eFreq: RRule.HOURLY,
      diCount: 3,
      aByWeekday: [RRule.TU, RRule.TH],
      dtStart: parse('19970902T090000')
    }),
    [
      datetime(1997, 9, 2, 9, 0),
      datetime(1997, 9, 2, 10, 0),
      datetime(1997, 9, 2, 11, 0)
    ]
  )

  testRecurring('testHourlyByNWeekDay',
    new RRule({eFreq: RRule.HOURLY,
      diCount: 3,
      aByWeekday: [RRule.TU.nth(1), RRule.TH.nth(-1)],
      dtStart: parse('19970902T090000')
    }),
    [
      datetime(1997, 9, 2, 9, 0),
      datetime(1997, 9, 2, 10, 0),
      datetime(1997, 9, 2, 11, 0)
    ]
  )

  testRecurring('testHourlyByMonthAndWeekDay',
    new RRule({eFreq: RRule.HOURLY,
      diCount: 3,
      aByMonth: [1, 3],
      aByWeekday: [RRule.TU, RRule.TH],
      dtStart: parse('19970902T090000')
    }),
    [
      datetime(1998, 1, 1, 0, 0),
      datetime(1998, 1, 1, 1, 0),
      datetime(1998, 1, 1, 2, 0)
    ]
  )

  testRecurring('testHourlyByMonthAndNWeekDay',
    new RRule({eFreq: RRule.HOURLY,
      diCount: 3,
      aByMonth: [1, 3],
      aByWeekday: [RRule.TU.nth(1), RRule.TH.nth(-1)],
      dtStart: parse('19970902T090000')
    }),
    [
      datetime(1998, 1, 1, 0, 0),
      datetime(1998, 1, 1, 1, 0),
      datetime(1998, 1, 1, 2, 0)
    ]
  )

  testRecurring('testHourlyByMonthDayAndWeekDay',
    new RRule({eFreq: RRule.HOURLY,
      diCount: 3,
      aByMonthday: [1, 3],
      aByWeekday: [RRule.TU, RRule.TH],
      dtStart: parse('19970902T090000')
    }),
    [
      datetime(1998, 1, 1, 0, 0),
      datetime(1998, 1, 1, 1, 0),
      datetime(1998, 1, 1, 2, 0)
    ]
  )

  testRecurring('testHourlyByMonthAndMonthDayAndWeekDay',
    new RRule({eFreq: RRule.HOURLY,
      diCount: 3,
      aByMonth: [1, 3],
      aByMonthday: [1, 3],
      aByWeekday: [RRule.TU, RRule.TH],
      dtStart: parse('19970902T090000')
    }),
    [
      datetime(1998, 1, 1, 0, 0),
      datetime(1998, 1, 1, 1, 0),
      datetime(1998, 1, 1, 2, 0)
    ]
  )

  testRecurring('testHourlyByYearDay',
    new RRule({eFreq: RRule.HOURLY,
      diCount: 4,
      aByYearday: [1, 100, 200, 365],
      dtStart: parse('19970902T090000')
    }),
    [
      datetime(1997, 12, 31, 0, 0),
      datetime(1997, 12, 31, 1, 0),
      datetime(1997, 12, 31, 2, 0),
      datetime(1997, 12, 31, 3, 0)
    ]
  )

  testRecurring('testHourlyByYearDayNeg',
    new RRule({eFreq: RRule.HOURLY,
      diCount: 4,
      aByYearday: [-365, -266, -166, -1],
      dtStart: parse('19970902T090000')
    }),
    [
      datetime(1997, 12, 31, 0, 0),
      datetime(1997, 12, 31, 1, 0),
      datetime(1997, 12, 31, 2, 0),
      datetime(1997, 12, 31, 3, 0)
    ]
  )

  testRecurring('testHourlyByMonthAndYearDay',
    new RRule({eFreq: RRule.HOURLY,
      diCount: 4,
      aByMonth: [4, 7],
      aByYearday: [1, 100, 200, 365],
      dtStart: parse('19970902T090000')
    }),
    [
      datetime(1998, 4, 10, 0, 0),
      datetime(1998, 4, 10, 1, 0),
      datetime(1998, 4, 10, 2, 0),
      datetime(1998, 4, 10, 3, 0)
    ]
  )

  testRecurring('testHourlyByMonthAndYearDayNeg',
    new RRule({eFreq: RRule.HOURLY,
      diCount: 4,
      aByMonth: [4, 7],
      aByYearday: [-365, -266, -166, -1],
      dtStart: parse('19970902T090000')
    }),
    [
      datetime(1998, 4, 10, 0, 0),
      datetime(1998, 4, 10, 1, 0),
      datetime(1998, 4, 10, 2, 0),
      datetime(1998, 4, 10, 3, 0)
    ]
  )

  testRecurring('testHourlyaByWeekno',
    new RRule({eFreq: RRule.HOURLY,
      diCount: 3,
      aByWeekno: 20,
      dtStart: parse('19970902T090000')
    }),
    [
      datetime(1998, 5, 11, 0, 0),
      datetime(1998, 5, 11, 1, 0),
      datetime(1998, 5, 11, 2, 0)
    ]
  )

  testRecurring('testHourlyaByWeeknoAndWeekDay',
    new RRule({eFreq: RRule.HOURLY,
      diCount: 3,
      aByWeekno: 1,
      aByWeekday: RRule.MO,
      dtStart: parse('19970902T090000')
    }),
    [
      datetime(1997, 12, 29, 0, 0),
      datetime(1997, 12, 29, 1, 0),
      datetime(1997, 12, 29, 2, 0)
    ]
  )

  testRecurring('testHourlyaByWeeknoAndWeekDayLarge',
    new RRule({eFreq: RRule.HOURLY,
      diCount: 3,
      aByWeekno: 52,
      aByWeekday: RRule.SU,
      dtStart: parse('19970902T090000')
    }),
    [
      datetime(1997, 12, 28, 0, 0),
      datetime(1997, 12, 28, 1, 0),
      datetime(1997, 12, 28, 2, 0)
    ]
  )

  testRecurring('testHourlyaByWeeknoAndWeekDayLast',
    new RRule({eFreq: RRule.HOURLY,
      diCount: 3,
      aByWeekno: -1,
      aByWeekday: RRule.SU,
      dtStart: parse('19970902T090000')
    }),
    [
      datetime(1997, 12, 28, 0, 0),
      datetime(1997, 12, 28, 1, 0),
      datetime(1997, 12, 28, 2, 0)
    ]
  )

  testRecurring('testHourlyaByWeeknoAndWeekDay53',
    new RRule({eFreq: RRule.HOURLY,
      diCount: 3,
      aByWeekno: 53,
      aByWeekday: RRule.MO,
      dtStart: parse('19970902T090000')
    }),
    [
      datetime(1998, 12, 28, 0, 0),
      datetime(1998, 12, 28, 1, 0),
      datetime(1998, 12, 28, 2, 0)
    ]
  )

  testRecurring('testHourlyByHour',
    new RRule({eFreq: RRule.HOURLY,
      diCount: 3,
      aByHour: [6, 18],
      dtStart: parse('19970902T090000')
    }),
    [
      datetime(1997, 9, 2, 18, 0),
      datetime(1997, 9, 3, 6, 0),
      datetime(1997, 9, 3, 18, 0)
    ]
  )

  testRecurring('testHourlyByMinute',
    new RRule({eFreq: RRule.HOURLY,
      diCount: 3,
      aByMinute: [6, 18],
      dtStart: parse('19970902T090000')
    }),
    [
      datetime(1997, 9, 2, 9, 6),
      datetime(1997, 9, 2, 9, 18),
      datetime(1997, 9, 2, 10, 6)
    ]
  )

  testRecurring('testHourlyByHourAndMinute',
    new RRule({eFreq: RRule.HOURLY,
      diCount: 3,
      aByHour: [6, 18],
      aByMinute: [6, 18],
      dtStart: parse('19970902T090000')
    }),
    [
      datetime(1997, 9, 2, 18, 6),
      datetime(1997, 9, 2, 18, 18),
      datetime(1997, 9, 3, 6, 6)
    ]
  )

  testRecurring('testMinutely',
    new RRule({eFreq: RRule.MINUTELY,
      diCount: 3,
      dtStart: parse('19970902T090000')
    }),
    [
      datetime(1997, 9, 2, 9, 0),
      datetime(1997, 9, 2, 9, 1),
      datetime(1997, 9, 2, 9, 2)
    ]
  )

  testRecurring('testMinutelyInterval',
    new RRule({eFreq: RRule.MINUTELY,
      diCount: 3,
      dwInterval: 2,
      dtStart: parse('19970902T090000')
    }),
    [
      datetime(1997, 9, 2, 9, 0),
      datetime(1997, 9, 2, 9, 2),
      datetime(1997, 9, 2, 9, 4)
    ]
  )

  testRecurring('testMinutelyIntervalLarge',
    new RRule({eFreq: RRule.MINUTELY,
      diCount: 3,
      dwInterval: 1501,
      dtStart: parse('19970902T090000')
    }),
    [
      datetime(1997, 9, 2, 9, 0),
      datetime(1997, 9, 3, 10, 1),
      datetime(1997, 9, 4, 11, 2)
    ]
  )

  testRecurring('testMinutelyByMonth',
    new RRule({eFreq: RRule.MINUTELY,
      diCount: 3,
      aByMonth: [1, 3],
      dtStart: parse('19970902T090000')
    }),
    [
      datetime(1998, 1, 1, 0, 0),
      datetime(1998, 1, 1, 0, 1),
      datetime(1998, 1, 1, 0, 2)
    ]
  )

  testRecurring('testMinutelyByMonthDay',
    new RRule({eFreq: RRule.MINUTELY,
      diCount: 3,
      aByMonthday: [1, 3],
      dtStart: parse('19970902T090000')
    }),
    [
      datetime(1997, 9, 3, 0, 0),
      datetime(1997, 9, 3, 0, 1),
      datetime(1997, 9, 3, 0, 2)
    ]
  )

  testRecurring('testMinutelyByMonthAndMonthDay',
    new RRule({eFreq: RRule.MINUTELY,
      diCount: 3,
      aByMonth: [1, 3],
      aByMonthday: [5, 7],
      dtStart: parse('19970902T090000')
    }),
    [
      datetime(1998, 1, 5, 0, 0),
      datetime(1998, 1, 5, 0, 1),
      datetime(1998, 1, 5, 0, 2)
    ]
  )

  testRecurring('testMinutelyByWeekDay',
    new RRule({eFreq: RRule.MINUTELY,
      diCount: 3,
      aByWeekday: [RRule.TU, RRule.TH],
      dtStart: parse('19970902T090000')
    }),
    [
      datetime(1997, 9, 2, 9, 0),
      datetime(1997, 9, 2, 9, 1),
      datetime(1997, 9, 2, 9, 2)
    ]
  )

  testRecurring('testMinutelyByNWeekDay',
    new RRule({eFreq: RRule.MINUTELY,
      diCount: 3,
      aByWeekday: [RRule.TU.nth(1), RRule.TH.nth(-1)],
      dtStart: parse('19970902T090000')
    }),
    [
      datetime(1997, 9, 2, 9, 0),
      datetime(1997, 9, 2, 9, 1),
      datetime(1997, 9, 2, 9, 2)
    ]
  )

  testRecurring('testMinutelyByMonthAndWeekDay',
    new RRule({eFreq: RRule.MINUTELY,
      diCount: 3,
      aByMonth: [1, 3],
      aByWeekday: [RRule.TU, RRule.TH],
      dtStart: parse('19970902T090000')
    }),
    [
      datetime(1998, 1, 1, 0, 0),
      datetime(1998, 1, 1, 0, 1),
      datetime(1998, 1, 1, 0, 2)
    ]
  )

  testRecurring('testMinutelyByMonthAndNWeekDay',
    new RRule({eFreq: RRule.MINUTELY,
      diCount: 3,
      aByMonth: [1, 3],
      aByWeekday: [RRule.TU.nth(1), RRule.TH.nth(-1)],
      dtStart: parse('19970902T090000')
    }),
    [
      datetime(1998, 1, 1, 0, 0),
      datetime(1998, 1, 1, 0, 1),
      datetime(1998, 1, 1, 0, 2)
    ]
  )

  testRecurring('testMinutelyByMonthDayAndWeekDay',
    new RRule({eFreq: RRule.MINUTELY,
      diCount: 3,
      aByMonthday: [1, 3],
      aByWeekday: [RRule.TU, RRule.TH],
      dtStart: parse('19970902T090000')
    }),
    [
      datetime(1998, 1, 1, 0, 0),
      datetime(1998, 1, 1, 0, 1),
      datetime(1998, 1, 1, 0, 2)
    ]
  )

  testRecurring('testMinutelyByMonthAndMonthDayAndWeekDay',
    new RRule({eFreq: RRule.MINUTELY,
      diCount: 3,
      aByMonth: [1, 3],
      aByMonthday: [1, 3],
      aByWeekday: [RRule.TU, RRule.TH],
      dtStart: parse('19970902T090000')
    }),
    [
      datetime(1998, 1, 1, 0, 0),
      datetime(1998, 1, 1, 0, 1),
      datetime(1998, 1, 1, 0, 2)
    ]
  )

  testRecurring('testMinutelyByYearDay',
    new RRule({eFreq: RRule.MINUTELY,
      diCount: 4,
      aByYearday: [1, 100, 200, 365],
      dtStart: parse('19970902T090000')
    }),
    [
      datetime(1997, 12, 31, 0, 0),
      datetime(1997, 12, 31, 0, 1),
      datetime(1997, 12, 31, 0, 2),
      datetime(1997, 12, 31, 0, 3)
    ]
  )

  testRecurring('testMinutelyByYearDayNeg',
    new RRule({eFreq: RRule.MINUTELY,
      diCount: 4,
      aByYearday: [-365, -266, -166, -1],
      dtStart: parse('19970902T090000')
    }),
    [
      datetime(1997, 12, 31, 0, 0),
      datetime(1997, 12, 31, 0, 1),
      datetime(1997, 12, 31, 0, 2),
      datetime(1997, 12, 31, 0, 3)
    ]
  )

  testRecurring('testMinutelyByMonthAndYearDay',
    new RRule({eFreq: RRule.MINUTELY,
      diCount: 4,
      aByMonth: [4, 7],
      aByYearday: [1, 100, 200, 365],
      dtStart: parse('19970902T090000')
    }),
    [
      datetime(1998, 4, 10, 0, 0),
      datetime(1998, 4, 10, 0, 1),
      datetime(1998, 4, 10, 0, 2),
      datetime(1998, 4, 10, 0, 3)
    ]
  )

  testRecurring('testMinutelyByMonthAndYearDayNeg',
    new RRule({eFreq: RRule.MINUTELY,
      diCount: 4,
      aByMonth: [4, 7],
      aByYearday: [-365, -266, -166, -1],
      dtStart: parse('19970902T090000')
    }),
    [
      datetime(1998, 4, 10, 0, 0),
      datetime(1998, 4, 10, 0, 1),
      datetime(1998, 4, 10, 0, 2),
      datetime(1998, 4, 10, 0, 3)
    ]
  )

  testRecurring('testMinutelyaByWeekno',
    new RRule({eFreq: RRule.MINUTELY,
      diCount: 3,
      aByWeekno: 20,
      dtStart: parse('19970902T090000')
    }),
    [
      datetime(1998, 5, 11, 0, 0),
      datetime(1998, 5, 11, 0, 1),
      datetime(1998, 5, 11, 0, 2)
    ]
  )

  testRecurring('testMinutelyaByWeeknoAndWeekDay',
    new RRule({eFreq: RRule.MINUTELY,
      diCount: 3,
      aByWeekno: 1,
      aByWeekday: RRule.MO,
      dtStart: parse('19970902T090000')
    }),
    [
      datetime(1997, 12, 29, 0, 0),
      datetime(1997, 12, 29, 0, 1),
      datetime(1997, 12, 29, 0, 2)
    ]
  )

  testRecurring('testMinutelyaByWeeknoAndWeekDayLarge',
    new RRule({eFreq: RRule.MINUTELY,
      diCount: 3,
      aByWeekno: 52,
      aByWeekday: RRule.SU,
      dtStart: parse('19970902T090000')
    }),
    [
      datetime(1997, 12, 28, 0, 0),
      datetime(1997, 12, 28, 0, 1),
      datetime(1997, 12, 28, 0, 2)
    ]
  )

  testRecurring('testMinutelyaByWeeknoAndWeekDayLast',
    new RRule({eFreq: RRule.MINUTELY,
      diCount: 3,
      aByWeekno: -1,
      aByWeekday: RRule.SU,
      dtStart: parse('19970902T090000')
    }),
    [
      datetime(1997, 12, 28, 0, 0),
      datetime(1997, 12, 28, 0, 1),
      datetime(1997, 12, 28, 0, 2)
    ]
  )

  testRecurring('testMinutelyaByWeeknoAndWeekDay53',
    new RRule({eFreq: RRule.MINUTELY,
      diCount: 3,
      aByWeekno: 53,
      aByWeekday: RRule.MO,
      dtStart: parse('19970902T090000')
    }),
    [
      datetime(1998, 12, 28, 0, 0),
      datetime(1998, 12, 28, 0, 1),
      datetime(1998, 12, 28, 0, 2)
    ]
  )

  testRecurring('testMinutelyByHour',
    new RRule({eFreq: RRule.MINUTELY,
      diCount: 3,
      aByHour: [6, 18],
      dtStart: parse('19970902T090000')
    }),
    [
      datetime(1997, 9, 2, 18, 0),
      datetime(1997, 9, 2, 18, 1),
      datetime(1997, 9, 2, 18, 2)
    ]
  )

  testRecurring('testMinutelyByMinute',
    new RRule({eFreq: RRule.MINUTELY,
      diCount: 3,
      aByMinute: [6, 18],
      dtStart: parse('19970902T090000')
    }),
    [
      datetime(1997, 9, 2, 9, 6),
      datetime(1997, 9, 2, 9, 18),
      datetime(1997, 9, 2, 10, 6)
    ]
  )

  testRecurring('testMinutelyByHourAndMinute',
    new RRule({eFreq: RRule.MINUTELY,
      diCount: 3,
      aByHour: [6, 18],
      aByMinute: [6, 18],
      dtStart: parse('19970902T090000')
    }),
    [
      datetime(1997, 9, 2, 18, 6),
      datetime(1997, 9, 2, 18, 18),
      datetime(1997, 9, 3, 6, 6)
    ]
  )

  testRecurring('testSecondly',
    new RRule({eFreq: RRule.SECONDLY,
      diCount: 3,
      dtStart: parse('19970902T090000')
    }),
    [
      datetime(1997, 9, 2, 9, 0, 0),
      datetime(1997, 9, 2, 9, 0, 1),
      datetime(1997, 9, 2, 9, 0, 2)
    ]
  )

  testRecurring('testSecondlyInterval',
    new RRule({eFreq: RRule.SECONDLY,
      diCount: 3,
      dwInterval: 2,
      dtStart: parse('19970902T090000')
    }),
    [
      datetime(1997, 9, 2, 9, 0, 0),
      datetime(1997, 9, 2, 9, 0, 2),
      datetime(1997, 9, 2, 9, 0, 4)
    ]
  )

  testRecurring('testSecondlyIntervalLarge',
    new RRule({eFreq: RRule.SECONDLY,
      diCount: 3,
      dwInterval: 90061,
      dtStart: parse('19970902T090000')
    }),
    [
      datetime(1997, 9, 2, 9, 0, 0),
      datetime(1997, 9, 3, 10, 1, 1),
      datetime(1997, 9, 4, 11, 2, 2)
    ]
  )

  testRecurring('testSecondlyByMonth',
    new RRule({eFreq: RRule.SECONDLY,
      diCount: 3,
      aByMonth: [1, 3],
      dtStart: parse('19970902T090000')
    }),
    [
      datetime(1998, 1, 1, 0, 0, 0),
      datetime(1998, 1, 1, 0, 0, 1),
      datetime(1998, 1, 1, 0, 0, 2)
    ]
  )

  testRecurring('testSecondlyByMonthDay',
    new RRule({eFreq: RRule.SECONDLY,
      diCount: 3,
      aByMonthday: [1, 3],
      dtStart: parse('19970902T090000')
    }),
    [
      datetime(1997, 9, 3, 0, 0, 0),
      datetime(1997, 9, 3, 0, 0, 1),
      datetime(1997, 9, 3, 0, 0, 2)
    ]
  )

  testRecurring('testSecondlyByMonthAndMonthDay',
    new RRule({eFreq: RRule.SECONDLY,
      diCount: 3,
      aByMonth: [1, 3],
      aByMonthday: [5, 7],
      dtStart: parse('19970902T090000')
    }),
    [
      datetime(1998, 1, 5, 0, 0, 0),
      datetime(1998, 1, 5, 0, 0, 1),
      datetime(1998, 1, 5, 0, 0, 2)
    ]
  )

  testRecurring('testSecondlyByWeekDay',
    new RRule({eFreq: RRule.SECONDLY,
      diCount: 3,
      aByWeekday: [RRule.TU, RRule.TH],
      dtStart: parse('19970902T090000')
    }),
    [
      datetime(1997, 9, 2, 9, 0, 0),
      datetime(1997, 9, 2, 9, 0, 1),
      datetime(1997, 9, 2, 9, 0, 2)
    ]
  )

  testRecurring('testSecondlyByNWeekDay',
    new RRule({eFreq: RRule.SECONDLY,
      diCount: 3,
      aByWeekday: [RRule.TU.nth(1), RRule.TH.nth(-1)],
      dtStart: parse('19970902T090000')
    }),
    [
      datetime(1997, 9, 2, 9, 0, 0),
      datetime(1997, 9, 2, 9, 0, 1),
      datetime(1997, 9, 2, 9, 0, 2)
    ]
  )

  testRecurring('testSecondlyByMonthAndWeekDay',
    new RRule({eFreq: RRule.SECONDLY,
      diCount: 3,
      aByMonth: [1, 3],
      aByWeekday: [RRule.TU, RRule.TH],
      dtStart: parse('19970902T090000')
    }),
    [
      datetime(1998, 1, 1, 0, 0, 0),
      datetime(1998, 1, 1, 0, 0, 1),
      datetime(1998, 1, 1, 0, 0, 2)
    ]
  )

  testRecurring('testSecondlyByMonthAndNWeekDay',
    new RRule({eFreq: RRule.SECONDLY,
      diCount: 3,
      aByMonth: [1, 3],
      aByWeekday: [RRule.TU.nth(1), RRule.TH.nth(-1)],
      dtStart: parse('19970902T090000')
    }),
    [
      datetime(1998, 1, 1, 0, 0, 0),
      datetime(1998, 1, 1, 0, 0, 1),
      datetime(1998, 1, 1, 0, 0, 2)
    ]
  )

  testRecurring('testSecondlyByMonthDayAndWeekDay',
    new RRule({eFreq: RRule.SECONDLY,
      diCount: 3,
      aByMonthday: [1, 3],
      aByWeekday: [RRule.TU, RRule.TH],
      dtStart: parse('19970902T090000')
    }),
    [
      datetime(1998, 1, 1, 0, 0, 0),
      datetime(1998, 1, 1, 0, 0, 1),
      datetime(1998, 1, 1, 0, 0, 2)
    ]
  )

  testRecurring('testSecondlyByMonthAndMonthDayAndWeekDay',
    new RRule({eFreq: RRule.SECONDLY,
      diCount: 3,
      aByMonth: [1, 3],
      aByMonthday: [1, 3],
      aByWeekday: [RRule.TU, RRule.TH],
      dtStart: parse('19970902T090000')
    }),
    [
      datetime(1998, 1, 1, 0, 0, 0),
      datetime(1998, 1, 1, 0, 0, 1),
      datetime(1998, 1, 1, 0, 0, 2)
    ]
  )

  testRecurring('testSecondlyByYearDay',
    new RRule({eFreq: RRule.SECONDLY,
      diCount: 4,
      aByYearday: [1, 100, 200, 365],
      dtStart: parse('19970902T090000')
    }),
    [
      datetime(1997, 12, 31, 0, 0, 0),
      datetime(1997, 12, 31, 0, 0, 1),
      datetime(1997, 12, 31, 0, 0, 2),
      datetime(1997, 12, 31, 0, 0, 3)
    ]
  )

  testRecurring('testSecondlyByYearDayNeg',
    new RRule({eFreq: RRule.SECONDLY,
      diCount: 4,
      aByYearday: [-365, -266, -166, -1],
      dtStart: parse('19970902T090000')
    }),
    [
      datetime(1997, 12, 31, 0, 0, 0),
      datetime(1997, 12, 31, 0, 0, 1),
      datetime(1997, 12, 31, 0, 0, 2),
      datetime(1997, 12, 31, 0, 0, 3)
    ]
  )

  testRecurring('testSecondlyByMonthAndYearDay',
    new RRule({eFreq: RRule.SECONDLY,
      diCount: 4,
      aByMonth: [4, 7],
      aByYearday: [1, 100, 200, 365],
      dtStart: parse('19970902T090000')
    }),
    [
      datetime(1998, 4, 10, 0, 0, 0),
      datetime(1998, 4, 10, 0, 0, 1),
      datetime(1998, 4, 10, 0, 0, 2),
      datetime(1998, 4, 10, 0, 0, 3)
    ]
  )

  testRecurring('testSecondlyByMonthAndYearDayNeg',
    new RRule({eFreq: RRule.SECONDLY,
      diCount: 4,
      aByMonth: [4, 7],
      aByYearday: [-365, -266, -166, -1],
      dtStart: parse('19970902T090000')
    }),
    [
      datetime(1998, 4, 10, 0, 0, 0),
      datetime(1998, 4, 10, 0, 0, 1),
      datetime(1998, 4, 10, 0, 0, 2),
      datetime(1998, 4, 10, 0, 0, 3)
    ]
  )

  testRecurring('testSecondlyaByWeekno',
    new RRule({eFreq: RRule.SECONDLY,
      diCount: 3,
      aByWeekno: 20,
      dtStart: parse('19970902T090000')
    }),
    [
      datetime(1998, 5, 11, 0, 0, 0),
      datetime(1998, 5, 11, 0, 0, 1),
      datetime(1998, 5, 11, 0, 0, 2)
    ]
  )

  testRecurring('testSecondlyaByWeeknoAndWeekDay',
    new RRule({eFreq: RRule.SECONDLY,
      diCount: 3,
      aByWeekno: 1,
      aByWeekday: RRule.MO,
      dtStart: parse('19970902T090000')
    }),
    [
      datetime(1997, 12, 29, 0, 0, 0),
      datetime(1997, 12, 29, 0, 0, 1),
      datetime(1997, 12, 29, 0, 0, 2)
    ]
  )

  testRecurring('testSecondlyaByWeeknoAndWeekDayLarge',
    new RRule({eFreq: RRule.SECONDLY,
      diCount: 3,
      aByWeekno: 52,
      aByWeekday: RRule.SU,
      dtStart: parse('19970902T090000')
    }),
    [
      datetime(1997, 12, 28, 0, 0, 0),
      datetime(1997, 12, 28, 0, 0, 1),
      datetime(1997, 12, 28, 0, 0, 2)
    ]
  )

  testRecurring('testSecondlyaByWeeknoAndWeekDayLast',
    new RRule({eFreq: RRule.SECONDLY,
      diCount: 3,
      aByWeekno: -1,
      aByWeekday: RRule.SU,
      dtStart: parse('19970902T090000')
    }),
    [
      datetime(1997, 12, 28, 0, 0, 0),
      datetime(1997, 12, 28, 0, 0, 1),
      datetime(1997, 12, 28, 0, 0, 2)
    ]
  )

  testRecurring('testSecondlyaByWeeknoAndWeekDay53',
    new RRule({eFreq: RRule.SECONDLY,
      diCount: 3,
      aByWeekno: 53,
      aByWeekday: RRule.MO,
      dtStart: parse('19970902T090000')
    }),
    [
      datetime(1998, 12, 28, 0, 0, 0),
      datetime(1998, 12, 28, 0, 0, 1),
      datetime(1998, 12, 28, 0, 0, 2)
    ]
  )

  testRecurring('testSecondlyByHour',
    new RRule({eFreq: RRule.SECONDLY,
      diCount: 3,
      aByHour: [6, 18],
      dtStart: parse('19970902T090000')
    }),
    [
      datetime(1997, 9, 2, 18, 0, 0),
      datetime(1997, 9, 2, 18, 0, 1),
      datetime(1997, 9, 2, 18, 0, 2)
    ]
  )

  testRecurring('testSecondlyByMinute',
    new RRule({eFreq: RRule.SECONDLY,
      diCount: 3,
      aByMinute: [6, 18],
      dtStart: parse('19970902T090000')
    }),
    [
      datetime(1997, 9, 2, 9, 6, 0),
      datetime(1997, 9, 2, 9, 6, 1),
      datetime(1997, 9, 2, 9, 6, 2)
    ]
  )

  testRecurring('testUntilNotMatching',
    new RRule({eFreq: RRule.DAILY,
      diCount: 3,
      dtStart: parse('19970902T090000'),
      dtUntil: parse('19970905T080000')
    }),
    [
      datetime(1997, 9, 2, 9, 0),
      datetime(1997, 9, 3, 9, 0),
      datetime(1997, 9, 4, 9, 0)
    ]
  )

  testRecurring('testUntilMatching',
    new RRule({eFreq: RRule.DAILY,
      diCount: 3,
      dtStart: parse('19970902T090000'),
      dtUntil: parse('19970904T090000')
    }),
    [
      datetime(1997, 9, 2, 9, 0),
      datetime(1997, 9, 3, 9, 0),
      datetime(1997, 9, 4, 9, 0)
    ]
  )

  testRecurring('testUntilSingle',
    new RRule({eFreq: RRule.DAILY,
      diCount: 3,
      dtStart: parse('19970902T090000'),
      dtUntil: parse('19970902T090000')
    }),
    [
      datetime(1997, 9, 2, 9, 0)
    ]
  )

  testRecurring('testUntilEmpty',
    new RRule({eFreq: RRule.DAILY,
      diCount: 3,
      dtStart: parse('19970902T090000'),
      dtUntil: parse('19970901T090000')
    }),
    []
  )

  testRecurring('testUntilWithDate',
    new RRule({eFreq: RRule.DAILY,
      diCount: 3,
      dtStart: parse('19970902T090000'),
      dtUntil: datetime(1997, 9, 5)
    }),
    [
      datetime(1997, 9, 2, 9, 0),
      datetime(1997, 9, 3, 9, 0),
      datetime(1997, 9, 4, 9, 0)
    ]
  )

  testRecurring('testDTStartIsDate',
    new RRule({eFreq: RRule.DAILY,
      diCount: 3,
      dtStart: datetime(1997, 9, 2)
    }),
    [
      datetime(1997, 9, 2, 0, 0),
      datetime(1997, 9, 3, 0, 0),
      datetime(1997, 9, 4, 0, 0)
    ]
  )

  testRecurring('testDTStartWithMicroseconds',
    new RRule({eFreq: RRule.DAILY,
      diCount: 3,
      dtStart: parse('19970902T090000.5')
    }),
    [
      datetime(1997, 9, 2, 9, 0),
      datetime(1997, 9, 3, 9, 0),
      datetime(1997, 9, 4, 9, 0)
    ]
  )

  testRecurring('testMaxYear',
    new RRule({eFreq: RRule.YEARLY,
      diCount: 3,
      aByMonth: 2,
      aByMonthday: 31,
      dtStart: parse('99970902T090000')
    }),
    []
  )

  testRecurring('testSubsecondStartYearly',
    new RRule({
      eFreq: RRule.YEARLY,
      diCount: 1,
      dtStart: new Date(1420063200001)
    }),
    [
      new Date(1420063200001)
    ]
  )

  testRecurring('testSubsecondStartMonthlyByMonthDay',
    new RRule({
      eFreq: RRule.MONTHLY,
      diCount: 1,
      bysetpos: [-1, 1],
      dtStart: new Date(1356991200001)
    }),
    [
      new Date(1356991200001)
    ]
  )

  it('testAfterBefore', function () {
    'YEARLY,MONTHLY,DAILY,HOURLY,MINUTELY,SECONDLY'.split(',').forEach(function (freqStr: keyof typeof Frequency) {
      const date = new Date(1356991200001)
      const rr = new RRule({
        eFreq: RRule[freqStr],
        dtStart: date
      })

      expect(date.getTime()).equals(rr.options.dtStart.getTime(),
        'the supplied dtStart differs from RRule.options.dtStart')
      let res: Date = rr.before(rr.after(rr.options.dtStart))

      let resTimestamp: number
      if (res != null) resTimestamp = res.getTime()
      expect(resTimestamp).equals(rr.options.dtStart.getTime(),
        'after dtStart , followed by before does not return dtStart')
    })
  })

  it('calculates aByWeekday recurrences correctly across DST boundaries', () => {
    let rule = new RRule({
      eFreq: RRule.WEEKLY,
      dtStart: new Date(Date.UTC(2018, 9, 0, 0, 0, 0)),
      dwInterval: 1,
      aByWeekday: [RRule.SU, RRule.WE],
      dtUntil: new Date(Date.UTC(2018, 9, 9, 0, 0, 0))
    })

    expect(rule.all()).to.deep.equal([
      new Date('2018-09-30T00:00:00.000Z'),
      new Date('2018-10-03T00:00:00.000Z'),
      new Date('2018-10-07T00:00:00.000Z')
    ])
  })

  it('generates weekly events (#247)', () => {
    const startEvent = 1533895200000
    const endSearch = 1543618799999

    const rrule = new RRule({
      eFreq: RRule.WEEKLY,
      dwInterval: 1,
      dtStart: new Date(startEvent),
      dtUntil: new Date(endSearch)
    })

    expect(rrule.all()).to.deep.equal([
      new Date('2018-08-10T10:00:00.000Z'),
      new Date('2018-08-17T10:00:00.000Z'),
      new Date('2018-08-24T10:00:00.000Z'),
      new Date('2018-08-31T10:00:00.000Z'),
      new Date('2018-09-07T10:00:00.000Z'),
      new Date('2018-09-14T10:00:00.000Z'),
      new Date('2018-09-21T10:00:00.000Z'),
      new Date('2018-09-28T10:00:00.000Z'),
      new Date('2018-10-05T10:00:00.000Z'),
      new Date('2018-10-12T10:00:00.000Z'),
      new Date('2018-10-19T10:00:00.000Z'),
      new Date('2018-10-26T10:00:00.000Z'),
      new Date('2018-11-02T10:00:00.000Z'),
      new Date('2018-11-09T10:00:00.000Z'),
      new Date('2018-11-16T10:00:00.000Z'),
      new Date('2018-11-23T10:00:00.000Z'),
      new Date('2018-11-30T10:00:00.000Z')
    ])
  })

  it('generates monthly (#233)', () => {
    const start = new Date(Date.parse('Mon Aug 06 2018 10:30:00 GMT+0530'))
    const end = new Date(Date.parse('Mon Oct 08 2018 11:00:00 GMT+0530'))

    const rrule = new RRule({
      eFreq: RRule.MONTHLY,
      dwInterval: 1,
      dtStart: start,
      dtUntil: end
    })

    expect(rrule.all()).to.deep.equal([
      new Date('2018-08-06T05:00:00.000Z'),
      new Date('2018-09-06T05:00:00.000Z'),
      new Date('2018-10-06T05:00:00.000Z')
    ])
  })

  describe('time zones', () => {
    const targetZone = 'America/Los_Angeles'
    const startDate = DateTime.utc(2013, 8, 6, 11, 0, 0)
    const dtStart = startDate.toJSDate()

    it('generates correct recurrences when recurrence is in dst and current time is standard time', () => {
      const currentLocalDate = DateTime.local(2013, 2, 6, 11, 0, 0)
      setMockDate(currentLocalDate.toJSDate())

      const rule = new RRule({
        dtStart,
        diCount: 1,
        tzid: targetZone
      })
      const recurrence = rule.all()[0]
      const expected = expectedDate(startDate, currentLocalDate, targetZone)

      expect(recurrence)
        .to.deep.equal(
          expected 
        )

      resetMockDate()
    })

    it('generates correct recurrences when recurrence is in dst and current time is dst', () => {
      const currentLocalDate = DateTime.local(2013, 8, 6, 11, 0, 0)
      setMockDate(currentLocalDate.toJSDate())

      const rule = new RRule({
        dtStart,
        diCount: 1,
        tzid: targetZone
      })
      const recurrence = rule.all()[0]
      const expected = expectedDate(startDate, currentLocalDate, targetZone)

      expect(recurrence)
        .to.deep.equal(
          expected 
        )

      resetMockDate()
    })

    it('generates correct recurrences when recurrence is in dst and current time is standard time', () => {
      const currentLocalDate = DateTime.local(2013, 2, 6, 11, 0, 0)
      setMockDate(currentLocalDate.toJSDate())

      const rule = new RRule({
        dtStart,
        diCount: 1,
        tzid: targetZone
      })
      const recurrence = rule.after(new Date(0))
      const expected = expectedDate(startDate, currentLocalDate, targetZone)

      expect(recurrence)
        .to.deep.equal(
          expected 
        )

      resetMockDate()
    })
  })

  it('throws an error when dtStart is invalid', () => {
    const invalidDate = new Date(undefined)
    const validDate = new Date(Date.UTC(2017, 0, 1))
    expect(() => new RRule({ dtStart: invalidDate })).to.throw('Invalid options: dtStart')
    expect(() => new RRule({ dtStart: validDate, dtUntil: invalidDate })).to.throw('Invalid options: dtUntil')

    const rule = new RRule({
      dtStart: new Date(Date.UTC(2017, 0, 1)),
      eFreq: Frequency.DAILY,
      dwInterval: 1
    })

    expect(() => rule.after(invalidDate)).to.throw('Invalid date passed in to RRule.after')
    expect(() => rule.before(invalidDate)).to.throw('Invalid date passed in to RRule.before')
    expect(() => rule.between(invalidDate, validDate)).to.throw('Invalid date passed in to RRule.between')
    expect(() => rule.between(validDate, invalidDate)).to.throw('Invalid date passed in to RRule.between')
  })
})
