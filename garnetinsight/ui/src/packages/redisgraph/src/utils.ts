import * as d3 from 'd3'

export function pulse(node: d3.Selection<SVGElement, any, any, any>) {
  var times = 0
  ;(function repeat() {
    node
      .transition()
      .duration(100)
      .attr('class', '')
      .attr('data-pulse', 'true')
      .attr('stroke', 'purple')
      .attr('stroke-width', 0)
      .attr('stroke-opacity', 0)
      .transition()
      .duration(500)
      .attr('stroke-width', 0)
      .attr('stroke-opacity', 1)
      .transition()
      .duration(1000)
      .attr('stroke-width', 65)
      .attr('stroke-opacity', 0)
      .ease(d3.easeCubicInOut)
      .on('end', () => {
        if (times === 3) {
          node.transition().attr('data-pulse', '').attr('class', 'outline')
          return
        }
        times++
        repeat()
      })
  })()
}
export const toString = (d) => {
  let s = d.labels ? d.labels[0] : d.type

  s += ` (<id>:  ${d.id}`

  Object.keys(d.properties).forEach((property) => {
    s += `, ${property} : ${JSON.stringify(d.properties[property])}`
  })

  s += ')'

  return s
}

export const truncateText = (str = '', length = 100) => {
  const ending = '...'

  if (str.length > length) {
    return str.substring(0, length - ending.length) + ending
  }

  return str
}

export const rotate = (cx, cy, x, y, angle) => {
  const radians = (Math.PI / 180) * angle
  const cos = Math.cos(radians)
  const sin = Math.sin(radians)
  const nx = cos * (x - cx) + sin * (y - cy) + cx
  const ny = cos * (y - cy) - sin * (x - cx) + cy

  return { x: nx, y: ny }
}

export const unitaryVector = (source, target, newLength) => {
  const length =
    Math.sqrt((target.x - source.x) ** 2 + (target.y - source.y) ** 2) /
    Math.sqrt(newLength || 1)

  return {
    x: (target.x - source.x) / length,
    y: (target.y - source.y) / length,
  }
}

export const darkenColor = (color) => d3.rgb(color).darker(1)

function charCodeSum(str: string | undefined) {
  if (str === undefined) return 0
  let sum = 0
  for (let i = 0; i < str.length; i++) {
    sum += str.charCodeAt(i)
  }
  return sum
}

export function invertColor(hex: string) {
  if (hex.indexOf('#') === 0) {
    hex = hex.slice(1)
  }
  // convert 3-digit hex to 6-digits.
  if (hex.length === 3) {
    hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2]
  }
  if (hex.length !== 6) {
    throw new Error('Invalid HEX color.')
  }
  // invert color components
  var r = (255 - parseInt(hex.slice(0, 2), 16)).toString(16),
    g = (255 - parseInt(hex.slice(2, 4), 16)).toString(16),
    b = (255 - parseInt(hex.slice(4, 6), 16)).toString(16)
  // pad each with zeros and return
  return '#' + padZero(r) + padZero(g) + padZero(b)
}

function padZero(str) {
  let len = str.length || 2
  var zeros = new Array(len).join('0')
  return (zeros + str).slice(-len)
}

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

export function wrapText(s: string, w: number) {
  return s.replace(
    new RegExp(`(?![^\\n]{1,${w}}$)([^\\n]{1,${w}})\\s`, 'g'),
    '$1\n',
  )
}

export function commandIsSuccess(resp: [{ response: any; status: string }]) {
  return (
    (Array.isArray(resp) && resp.length >= 1) || resp[0].status === 'success'
  )
}

export function getFetchNodesByIdQuery(
  graphKey: string,
  nodeIds: number[],
): string {
  return `graph.ro_query ${graphKey} "MATCH (n) WHERE id(n) IN [${nodeIds}] RETURN DISTINCT n"`
}

export function getFetchNodesByEdgeIdQuery(
  graphKey: string,
  edgeIds: number[],
  existingNodeIds: number[],
): string {
  return `graph.ro_query ${graphKey} "MATCH (n)-[t]->(m) WHERE id(t) IN [${edgeIds}] AND NOT id(n) IN [${existingNodeIds}] AND NOT id(m) IN [${existingNodeIds}] RETURN n, m"`
}

export function getFetchEdgesByIdQuery(
  graphKey: string,
  edgeIds: number[],
): string {
  return `graph.ro_query ${graphKey} "MATCH ()-[t]->() WHERE id(t) IN [${edgeIds}] RETURN DISTINCT t"`
}

export function getFetchDirectNeighboursOfNodeQuery(
  graphKey: string,
  nodeId: number,
): string {
  return `graph.ro_query "${graphKey}" "MATCH (n)-[t]-(m) WHERE id(n)=${nodeId} RETURN t, m"`
}

export function getFetchNodeRelationshipsQuery(
  graphKey: string,
  sourceNodeIds: number[],
  destNodeIds: number[],
  existingEdgeIds: number[],
): string {
  return `graph.ro_query ${graphKey} "MATCH (n)-[t]->(m) WHERE (ID(n) IN [${sourceNodeIds}] OR ID(m) IN [${destNodeIds}]) AND NOT ID(t) IN [${existingEdgeIds}] RETURN DISTINCT t"`
}
