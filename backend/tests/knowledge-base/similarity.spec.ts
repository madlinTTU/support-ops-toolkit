import { jaccard, tokenize } from '../../src/knowledge-base/similarity.js'

describe('tokenize', () => {
  it('tokenize_mixedCaseText_returnsLowerCaseWords', () => {
    expect(tokenize('Password RESET', 'Email arrives')).toEqual(new Set(['password', 'reset', 'email', 'arrives']))
  })

  it('tokenize_commonAndShortWords_areDropped', () => {
    // "the" and "you" are stop words, "is" and "to" are shorter than 3 letters.
    expect(tokenize('The invoice is lost', 'to you')).toEqual(new Set(['invoice', 'lost']))
  })

  it('tokenize_punctuation_splitsWords', () => {
    expect(tokenize('Export, fails!', 'error-500')).toEqual(new Set(['export', 'fails', 'error', '500']))
  })
})

describe('jaccard', () => {
  it('jaccard_sameWords_returnsOne', () => {
    expect(jaccard(new Set(['a', 'b']), new Set(['a', 'b']))).toBe(1)
  })

  it('jaccard_noCommonWords_returnsZero', () => {
    expect(jaccard(new Set(['a']), new Set(['b']))).toBe(0)
  })

  it('jaccard_twoOfFourDifferentWordsAreCommon_returnsHalf', () => {
    expect(jaccard(new Set(['a', 'b', 'c']), new Set(['b', 'c', 'd']))).toBe(0.5)
  })

  it('jaccard_bothEmpty_returnsZero', () => {
    expect(jaccard(new Set(), new Set())).toBe(0)
  })
})
