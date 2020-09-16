import { parseOptions } from '../src/parseoptions'
import { expect } from 'chai'
import RRule from '../src'

describe('TZID', () => {
  it('leaves null when null', () => {
    const options = parseOptions({ tzid: null })
    // tslint:disable-next-line:no-unused-expression
    expect(options.parsedOptions.tzid).to.be.null
  })

  it('uses a string when passed in', () => {
    const options = parseOptions({ tzid: 'America/Los_Angeles' })
    expect(options.parsedOptions.tzid).to.equal('America/Los_Angeles')
  })
})

describe('aByWeekday', () => {
  it('works with a single numeric day', () => {
    const options = parseOptions({ aByWeekday: 1 })
    expect(options.parsedOptions.aByWeekday).to.eql([1])
  })

  it('works with a single Weekday day', () => {
    const options = parseOptions({ aByWeekday: RRule.TU })
    expect(options.parsedOptions.aByWeekday).to.eql([1])
  })

  it('works with a single string day', () => {
    const options = parseOptions({ aByWeekday: 'TU' })
    expect(options.parsedOptions.aByWeekday).to.eql([1])
  })

  it('works with a multiple numeric days', () => {
    const options = parseOptions({ aByWeekday: [1, 2] })
    expect(options.parsedOptions.aByWeekday).to.eql([1, 2])
  })

  it('works with a multiple Weekday days', () => {
    const options = parseOptions({ aByWeekday: [RRule.TU, RRule.WE] })
    expect(options.parsedOptions.aByWeekday).to.eql([1, 2])
  })

  it('works with a multiple string days', () => {
    const options = parseOptions({ aByWeekday: ['TU', 'WE'] })
    expect(options.parsedOptions.aByWeekday).to.eql([1, 2])
  })
})
