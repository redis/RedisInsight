import {
  TimeSeries,
  TimeUnit,
} from './interfaces'

function charCodeSum(str: string) {
  let sum = 0
  for (let i = 0; i < str.length; i++) {
    sum += str.charCodeAt(i)
  }
  return sum
}

export const COLORS_DARK = [
  { color: '#6A1DC3', borderColor: '#6A1DC3', textColor: '#FFFFFF' },
  { color: '#364CFF', borderColor: '#364CFF', textColor: '#FFFFFF' },
  { color: '#008556', borderColor: '#008556', textColor: '#FFFFFF' },
  { color: '#333D4F', borderColor: '#333D4F', textColor: '#FFFFFF' },
  { color: '#9C5C2B', borderColor: '#9C5C2B', textColor: '#FFFFFF' },
  { color: '#A00A6B', borderColor: '#A00A6B', textColor: '#FFFFFF' },
  { color: '#6F7C07', borderColor: '#6F7C07', textColor: '#FFFFFF' },
  { color: '#14708D', borderColor: '#14708D', textColor: '#FFFFFF' },
  { color: '#AA4E4E', borderColor: '#AA4E4E', textColor: '#FFFFFF' },
  { color: '#6E6E6E', borderColor: '#6E6E6E', textColor: '#FFFFFF' },
]

export const EDGE_COLORS_DARK = [
  { color: '#C7C7C7', borderColor: '#C7C7C7', textColor: '#FFFFFF' },
  { color: '#E3AAAA', borderColor: '#E3AAAA', textColor: '#FFFFFF' },
  { color: '#ACCCD7', borderColor: '#ACCCD7', textColor: '#FFFFFF' },
  { color: '#C7CEA8', borderColor: '#C7CEA8', textColor: '#FFFFFF' },
  { color: '#D9A0C6', borderColor: '#D9A0C6', textColor: '#FFFFFF' },
  { color: '#D4BAA7', borderColor: '#D4BAA7', textColor: '#FFFFFF' },
  { color: '#B8C5DB', borderColor: '#B8C5DB', textColor: '#FFFFFF' },
  { color: '#A5D4C3', borderColor: '#A5D4C3', textColor: '#FFFFFF' },
  { color: '#CDDDF8', borderColor: '#CDDDF8', textColor: '#FFFFFF' },
  { color: '#C7B0EA', borderColor: '#C7B0EA', textColor: '#FFFFFF' },
]

export const COLORS = [
  { color: '#C7B0EA', borderColor: '#C7B0EA', textColor: '#000000' },
  { color: '#CDDDF8', borderColor: '#CDDDF8', textColor: '#000000' },
  { color: '#A5D4C3', borderColor: '#A5D4C3', textColor: '#000000' },
  { color: '#B8C5DB', borderColor: '#B8C5DB', textColor: '#000000' },
  { color: '#D4BAA7', borderColor: '#D4BAA7', textColor: '#000000' },
  { color: '#D9A0C6', borderColor: '#D9A0C6', textColor: '#000000' },
  { color: '#C7CEA8', borderColor: '#C7CEA8', textColor: '#000000' },
  { color: '#ACCCD7', borderColor: '#ACCCD7', textColor: '#000000' },
  { color: '#E3AAAA', borderColor: '#E3AAAA', textColor: '#000000' },
  { color: '#C7C7C7', borderColor: '#C7C7C7', textColor: '#000000' },
]

export const EDGE_COLORS = [
  { color: '#6E6E6E', borderColor: '#6E6E6E', textColor: '#000000' },
  { color: '#A85050', borderColor: '#A85050', textColor: '#000000' },
  { color: '#1D6F8A', borderColor: '#1D6F8A', textColor: '#000000' },
  { color: '#6F7B23', borderColor: '#6F7B23', textColor: '#000000' },
  { color: '#9E1669', borderColor: '#9E1669', textColor: '#000000' },
  { color: '#9A5D34', borderColor: '#9A5D34', textColor: '#000000' },
  { color: '#363F4F', borderColor: '#363F4F', textColor: '#000000' },
  { color: '#0F8459', borderColor: '#0F8459', textColor: '#000000' },
  { color: '#384EF9', borderColor: '#384EF9', textColor: '#000000' },
  { color: '#6924BD', borderColor: '#6924BD', textColor: '#000000' },
]

interface IColor {
  color: string
  textColor: string
  borderColor: string
}

export interface IGoodColor extends IColor {}

/*
 * ColorPicker: Get colors based on `label`.
 */
export class ColorPicker<T extends IColor> {
  // All the default colors are stored here.
  private readonly colors: T[]

  // store all the colors that are not taken by any label at a certain window.
  private currentColorStore: T[]

  // cache for label and its chosen color.
  private labelStore: { [keyName: string]: T }

  constructor(colors: T[]) {
    this.colors = [...colors]
    this.currentColorStore = [...colors]
    this.labelStore = {}
  }

  /*
   * Get a color object of type `T` based on `label`.
   */
  getColor(label: string) {
    // if the label has been seen previously, return the stored color.
    if (this.labelStore[label] !== undefined) {
      return this.labelStore[label]
    }

    // if the current color store is empty, i.e., all the colors has
    // been taken, so reset the color store to default color set.
    if (this.currentColorStore.length === 0) {
      this.currentColorStore = [...this.colors]
    }
    // get the color by hashing the label.
    const goodColor =
      this.currentColorStore[charCodeSum(label) % this.currentColorStore.length]

    // since the color has been taken by `label`, remove it from the current color store.
    this.currentColorStore = this.currentColorStore.filter(
      (color) => color !== goodColor,
    )

    // cache the label and color key value pair.
    this.labelStore[label] = goodColor
    return goodColor
  }
}

/*
 * GoodColorPicker: ColorPicker but only good colors.
 */
export class GoodColorPicker extends ColorPicker<IGoodColor> {
  constructor(COLORS: IGoodColor[]) {
    super(COLORS)
  }
}

export function hexToRGBA(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16),
    g = parseInt(hex.slice(3, 5), 16),
    b = parseInt(hex.slice(5, 7), 16)

  if (alpha) {
    return 'rgba(' + r + ', ' + g + ', ' + b + ', ' + alpha + ')'
  } else {
    return 'rgb(' + r + ', ' + g + ', ' + b + ')'
  }
}

export function normalizeDatapointUnits(
  timeSeries: TimeSeries[],
  unit: TimeUnit,
): TimeSeries[] {
  try {
    if (unit === TimeUnit.seconds) {
      return timeSeries.map((ts) => {
        return {
          ...ts,
          datapoints: ts.datapoints.map(([timestamp, label]) => [
            timestamp * 1_000,
            label,
          ]),
        }
      })
    }
  } catch (e) {
    // ignore an error to return original data
  }

  return timeSeries
}

export function determineDefaultTimeUnits(timeSeries: TimeSeries[]): TimeUnit {
  return timeSeries?.[0]?.datapoints?.[0]?.[0] > 1e10
    ? TimeUnit.milliseconds
    : TimeUnit.seconds
}
