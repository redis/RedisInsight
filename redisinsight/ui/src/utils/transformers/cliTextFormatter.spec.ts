import formatToText from 'uiSrc/utils/transformers/cliTextFormatter'

describe('formatToText', () => {
  it('renders nil', () => {
    expect(formatToText(null)).toEqual('(nil)')
  })

  it('renders a JS integer as (integer)', () => {
    expect(formatToText(5)).toEqual('(integer) 5')
  })

  it('renders a tagged u64 integer reply as (integer)', () => {
    expect(
      formatToText({ type: 'integer', value: '9007199254740994' }),
    ).toEqual('(integer) 9007199254740994')
  })

  it('renders tagged integer leaves nested in an array (ARSCAN)', () => {
    const reply = [{ type: 'integer', value: '9007199254740994' }, 'valuetest']

    expect(formatToText(reply)).toEqual(
      '1) (integer) 9007199254740994\n2) "valuetest"',
    )
  })

  it('still quotes plain string replies', () => {
    expect(formatToText('hello')).toEqual('"hello"')
  })

  it('still flattens a plain object reply', () => {
    expect(formatToText({ field: 'value' })).toEqual('1) "field"\n2) "value"')
  })
})
