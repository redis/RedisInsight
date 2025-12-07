import { ColorScheme, getRGBColorByScheme, rgb } from 'uiSrc/utils/colors'

const colorScheme: ColorScheme = {
  cHueStart: 180,
  cHueRange: 140,
  cSaturation: 55,
  cLightness: 45,
}

const RGBColorsTests: any[] = [
  // colors for length 3
  [0, 0, [39, 135, 135]],
  [1, 140 / 3, [66, 101, 226]],
  [2, 140 / 3, [143, 60, 208]],

  // other colors
  [1, 140 / 3, [66, 101, 226]],
  [2, 140 / 4, [101, 72, 248]],
  [3, 140 / 5, [129, 65, 224]],
  [4, 140 / 6, [143, 60, 208]],
  [5, 140 / 7, [151, 57, 197]],
]

describe('getRGBColorByScheme', () => {
  it.each(RGBColorsTests)(
    'for input: %s (index), %s (shift), should be output: %s',
    (index, shift, expected) => {
      const result = getRGBColorByScheme(index, shift, colorScheme)
      expect(result).toEqual(expected)
    },
  )
})

describe('rgb', () => {
  it('should return proper rgb string color', () => {
    expect(rgb([0, 0, 0])).toEqual('rgb(0, 0, 0)')
    expect(rgb([100, 30, 10])).toEqual('rgb(100, 30, 10)')
  })
})
