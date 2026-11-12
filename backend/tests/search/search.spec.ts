import { toSearchPattern } from '../../src/search/search.js'

describe('toSearchPattern', () => {
  it('toSearchPattern_plainWord_wrapsItInPercentSigns', () => {
    expect(toSearchPattern('password')).toBe('%password%')
  })

  it('toSearchPattern_spacesAround_areTrimmed', () => {
    expect(toSearchPattern('  password  ')).toBe('%password%')
  })

  it('toSearchPattern_wordsWithSpaceInside_keepTheSpace', () => {
    expect(toSearchPattern('reset email')).toBe('%reset email%')
  })

  it('toSearchPattern_emptyBlankOrMissing_returnsNull', () => {
    expect(toSearchPattern('')).toBeNull()
    expect(toSearchPattern('   ')).toBeNull()
    expect(toSearchPattern(undefined)).toBeNull()
  })

  it('toSearchPattern_specialCharacters_areEscaped', () => {
    expect(toSearchPattern('100%')).toBe('%100\\%%')
    expect(toSearchPattern('a_b')).toBe('%a\\_b%')
    expect(toSearchPattern('c:\\dir')).toBe('%c:\\\\dir%')
  })
})
