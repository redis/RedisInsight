import { checkExistingPath } from './rejson'

describe('checkExistingPath', () => {
  it('returns true for empty path (a.k.a. the whole object)', () => {
    const obj = { foo: 123 }
    expect(checkExistingPath(`$`, obj)).toBe(true)
  })

  it('detects root-level existing key', () => {
    const obj = { foo: 123 }
    expect(checkExistingPath(`$['foo']`, obj)).toBe(true)
  })

  it('detects root-level missing key', () => {
    const obj = { foo: 123 }
    expect(checkExistingPath(`$['bar']`, obj)).toBe(false)
  })

  it('detects nested existing key', () => {
    const obj = { array: { nested: 42 } }
    expect(checkExistingPath(`$['array']['nested']`, obj)).toBe(true)
  })

  it('detects nested missing key', () => {
    const obj = { array: { nested: 42 } }
    expect(checkExistingPath(`$['array']['newNested']`, obj)).toBe(false)
  })

  it('returns false if parent is missing', () => {
    const obj = {}
    expect(checkExistingPath(`$['nonExistent']['child']`, obj)).toBe(false)
  })

  it('handles numeric index paths', () => {
    const obj = { arr: [{ val: 1 }] }
    expect(checkExistingPath(`$['arr'][0]['val']`, obj)).toBe(true)
    expect(checkExistingPath(`$['arr'][1]['val']`, obj)).toBe(false)
  })

  it('handles non-object parents gracefully', () => {
    const obj = { a: 123 }
    expect(checkExistingPath(`$['a']['b']`, obj)).toBe(false) // number can't have a child
  })
})
