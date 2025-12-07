import { removeEmpty } from 'uiSrc/utils'

describe('removeEmpty', () => {
  it('should remove empty fields from object', () => {
    expect(removeEmpty({ a: '', b: { c: '', d: { g: '' } }, e: 1 })).toEqual({
      b: { d: {} },
      e: 1,
    })
    expect(removeEmpty({ a: '' })).toEqual({})
    expect(removeEmpty({ a: '', b: { c: '' }, e: 1 })).toEqual({ b: {}, e: 1 })
  })
})
