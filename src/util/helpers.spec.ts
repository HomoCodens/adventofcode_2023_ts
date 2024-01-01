import { expect } from 'chai'
import { describe, it } from 'node:test'
import { firstMissingInSequence, padNumber } from './helpers'

describe('padNumber', () => {
    it('pads a number with one zero', () => {
        expect(padNumber(3)).to.equal('03')
    })

    it('does not pad 2 digit numbers', () => {
        expect(padNumber(24)).to.equal('24')
    })
})

describe('firstMissingInSequence', () => {
    it('return the first missing number > 0 in a sequence', () => {
        expect(firstMissingInSequence([1, 2, 4])).to.equal(3)
    })

    it('handles the 1 case', () => {
        expect(firstMissingInSequence([2, 3, 4])).to.equal(1)
    })

    it('always starts at 1', () => {
        expect(firstMissingInSequence([1000, 1001, 1002])).to.equal(1)
    })

    it('returns n + 1 when none are missing', () => {
        expect(firstMissingInSequence([1, 2, 3])).to.equal(4)
    })
})