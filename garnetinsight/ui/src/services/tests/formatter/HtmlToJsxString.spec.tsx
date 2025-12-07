import React from 'react'
import HtmlToJsxString from '../../formatter/HtmlToJsxString'

describe('HtmlToJsxString', () => {
  it('should return proper string', async () => {
    const div = <div />
    const formatter = new HtmlToJsxString()
    const result = await formatter.format(div)
    expect(result).toEqual(String(div))
  })
})
