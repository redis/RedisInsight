export type RGBColor = [number, number, number]

export interface ColorScheme {
  cHueStart: number
  cHueRange: number
  cSaturation: number
  cLightness: number
}

const HSLToRGB = (h: number, sI: number, lI: number): RGBColor => {
  const s = sI / 100
  const l = lI / 100
  const k = (n: number) => (n + h / 30) % 12
  const a = s * Math.min(l, 1 - l)
  const f = (n: number) =>
    l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)))

  return [255 * f(0), 255 * f(8), 255 * f(4)]
}

const PBC = (r: number, g: number, b: number): number =>
  Math.sqrt(0.299 * (r * r) + 0.587 * (g * g) + 0.114 * (b * b)) / 255

const correctBrightness = (rgb: RGBColor, cLightness: number) =>
  1 / ((PBC(...rgb) * 100) / cLightness)

const applyBrightnessToRGB = (rgb: RGBColor, cLightness: number): RGBColor => {
  const [r, g, b] = rgb
  return [
    Math.round(r * correctBrightness([r, g, b], cLightness)),
    Math.round(g * correctBrightness([r, g, b], cLightness)),
    Math.round(b * correctBrightness([r, g, b], cLightness)),
  ] as RGBColor
}

const getRGBColorByScheme = (
  index: number,
  shift: number,
  colorScheme: ColorScheme,
): RGBColor => {
  const nc = index * shift + colorScheme.cHueStart
  const rgb: RGBColor = HSLToRGB(
    nc,
    colorScheme.cSaturation,
    colorScheme.cLightness,
  )
  return applyBrightnessToRGB(rgb, colorScheme.cLightness)
}

const rgb = (rgb: RGBColor) => `rgb(${rgb.join(', ')})`

export {
  HSLToRGB,
  correctBrightness,
  applyBrightnessToRGB,
  getRGBColorByScheme,
  rgb,
}
