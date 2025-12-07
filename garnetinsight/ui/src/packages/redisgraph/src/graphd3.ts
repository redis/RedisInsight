import * as d3 from 'd3'
import * as Utils from './utils'

import {
  NODE_STROKE_WIDTH,
  NODE_RADIUS,
  ZOOM_PROPS,
  EDGE_CAPTION_EXTERNAL,
} from './constants'

const DEFAULT_OPTIONS = {
  arrowSize: 5,
  highlight: undefined,
  minCollision: undefined,
  graphData: undefined,
  nodeOutlineFillColor: undefined,
  nodeRadius: NODE_RADIUS,
  relationshipColor: '#a5abb6',
  zoomFit: false,
  labelProperty: 'name',
  infoPanel: false,
  relationshipWidth: 1.5,
}

const COLORS = [
  '#68bdf6', // light blue
  '#6dce9e', // green #1
  '#faafc2', // light pink
  '#f2baf6', // purple
  '#ff928c', // light red
  '#fcea7e', // light yellow
  '#ffc766', // light orange
  '#405f9e', // navy blue
  '#a5abb6', // dark gray
  '#78cecb', // green #2,
  '#b88cbb', // dark purple
  '#ced2d9', // light gray
  '#e84646', // dark red
  '#fa5f86', // dark pink
  '#ffab1a', // dark orange
  '#fcda19', // dark yellow
  '#797b80', // black
  '#c9d96f', // pistacchio
  '#47991f', // green #3
  '#70edee', // turquoise
  '#ff75ea', // pink
]

class Point {
  x: number
  y: number

  constructor(_x: number, _y: number) {
    this.x = _x
    this.y = _y
  }

  toString(): string {
    return `${this.x} ${this.y}`
  }
}

function LoopArrow(
  nodeRadius: number,
  straightLength: number,
  spreadDegrees: number,
  shaftWidth: number,
  headWidth: number,
  headLength: number,
  captionHeight: number,
) {
  this.outline
  this.overlay, this.shaftLength
  this.midShaftPoint

  const spread = (spreadDegrees * Math.PI) / 180
  const r1 = nodeRadius
  const r2 = nodeRadius + headLength
  const r3 = nodeRadius + straightLength
  const loopRadius = r3 * Math.tan(spread / 2)
  const shaftRadius = shaftWidth / 2
  this.shaftLength = loopRadius * 3 + shaftWidth

  const normalPoint = function (
    sweep: number,
    radius: number,
    displacement: number,
  ) {
    const localLoopRadius = radius * Math.tan(spread / 2)
    const cy = radius / Math.cos(spread / 2)
    return new Point(
      (localLoopRadius + displacement) * Math.sin(sweep),
      cy + (localLoopRadius + displacement) * Math.cos(sweep),
    )
  }

  this.midShaftPoint = normalPoint(0, r3, shaftRadius + captionHeight / 2 + 2)
  const startPoint = (radius: number, displacement: number) =>
    normalPoint((Math.PI + spread) / 2, radius, displacement)
  const endPoint = (radius: number, displacement: number) =>
    normalPoint(-(Math.PI + spread) / 2, radius, displacement)

  this.outline = function () {
    const inner = loopRadius - shaftRadius
    const outer = loopRadius + shaftRadius
    return [
      'M',
      startPoint(r1, shaftRadius),
      'L',
      startPoint(r3, shaftRadius),
      'A',
      outer,
      outer,
      0,
      1,
      1,
      endPoint(r3, shaftRadius),
      'L',
      endPoint(r2, shaftRadius),
      'L',
      endPoint(r2, -headWidth / 2),
      'L',
      endPoint(r1, 0),
      'L',
      endPoint(r2, headWidth / 2),
      'L',
      endPoint(r2, -shaftRadius),
      'L',
      endPoint(r3, -shaftRadius),
      'A',
      inner,
      inner,
      0,
      1,
      0,
      startPoint(r3, -shaftRadius),
      'L',
      startPoint(r1, -shaftRadius),
      'Z',
    ].join(' ')
  }

  this.overlay = function (minWidth: number) {
    const displacement = Math.max(minWidth / 2, shaftRadius)
    const inner = loopRadius - displacement
    const outer = loopRadius + displacement
    return [
      'M',
      startPoint(r1, displacement),
      'L',
      startPoint(r3, displacement),
      'A',
      outer,
      outer,
      0,
      1,
      1,
      endPoint(r3, displacement),
      'L',
      endPoint(r2, displacement),
      'L',
      endPoint(r2, -displacement),
      'L',
      endPoint(r3, -displacement),
      'A',
      inner,
      inner,
      0,
      1,
      0,
      startPoint(r3, -displacement),
      'L',
      startPoint(r1, -displacement),
      'Z',
    ].join(' ')
  }
}

function StraightArrow(
  startRadius: number,
  endRadius: number,
  centreDistance: number,
  shaftWidth: number,
  headWidth: number,
  headHeight: number,
  captionLayout: string,
) {
  this.length
  this.midShaftPoint
  this.outline
  this.overlay
  this.shaftLength
  this.deflection = 0

  this.length = centreDistance - (startRadius + endRadius)
  this.shaftLength = this.length - headHeight

  const startArrow = startRadius
  const endShaft = startArrow + this.shaftLength
  const endArrow = startArrow + this.length
  const shaftRadius = shaftWidth / 2
  const headRadius = headWidth / 2

  this.midShaftPoint = {
    x: startArrow + this.shaftLength / 2,
    y: 0,
  }

  // for shortCaptionLength we use textBoundingBox = text.node().getComputedTextLength(),
  this.outline = function (shortCaptionLength: number) {
    if (captionLayout === EDGE_CAPTION_EXTERNAL) {
      const startBreak =
        startArrow + (this.shaftLength - shortCaptionLength) / 2
      const endBreak = endShaft - (this.shaftLength - shortCaptionLength) / 2

      return [
        'M',
        startArrow,
        shaftRadius,
        'L',
        startBreak,
        shaftRadius,
        'L',
        startBreak,
        -shaftRadius,
        'L',
        startArrow,
        -shaftRadius,
        'Z',
        'M',
        endBreak,
        shaftRadius,
        'L',
        endShaft,
        shaftRadius,
        'L',
        endShaft,
        headRadius,
        'L',
        endArrow,
        0,
        'L',
        endShaft,
        -headRadius,
        'L',
        endShaft,
        -shaftRadius,
        'L',
        endBreak,
        -shaftRadius,
        'Z',
      ].join(' ')
    } else {
      return [
        'M',
        startArrow,
        shaftRadius,
        'L',
        endShaft,
        shaftRadius,
        'L',
        endShaft,
        headRadius,
        'L',
        endArrow,
        0,
        'L',
        endShaft,
        -headRadius,
        'L',
        endShaft,
        -shaftRadius,
        'L',
        startArrow,
        -shaftRadius,
        'Z',
      ].join(' ')
    }
  }

  this.overlay = function (minWidth: number) {
    const radius = Math.max(minWidth / 2, shaftRadius)
    return [
      'M',
      startArrow,
      radius,
      'L',
      endArrow,
      radius,
      'L',
      endArrow,
      -radius,
      'L',
      startArrow,
      -radius,
      'Z',
    ].join(' ')
  }
}

function ArcArrow(
  startRadius: number,
  endRadius: number,
  endCentre: number,
  _deflection: number,
  arrowWidth: number,
  headWidth: number,
  headLength: number,
  captionLayout: string,
) {
  this.deflection = _deflection
  const square = (l: number) => l * l

  const deflectionRadians = (this.deflection * Math.PI) / 180
  const startAttach = {
    x: Math.cos(deflectionRadians) * startRadius,
    y: Math.sin(deflectionRadians) * startRadius,
  }

  const radiusRatio = startRadius / (endRadius + headLength)
  const homotheticCenter = (-endCentre * radiusRatio) / (1 - radiusRatio)

  const intersectWithOtherCircle = function (
    fixedPoint: Point,
    radius: number,
    xCenter: number,
    polarity: number,
  ) {
    const gradient = fixedPoint.y / (fixedPoint.x - homotheticCenter)
    const hc = fixedPoint.y - gradient * fixedPoint.x

    const A = 1 + square(gradient)
    const B = 2 * (gradient * hc - xCenter)
    const C = square(hc) + square(xCenter) - square(radius)

    const intersection: Point = {
      x: (-B + polarity * Math.sqrt(square(B) - 4 * A * C)) / (2 * A),
      y: 0,
    }
    intersection.y = (intersection.x - homotheticCenter) * gradient

    return intersection
  }

  const endAttach = intersectWithOtherCircle(
    startAttach,
    endRadius + headLength,
    endCentre,
    -1,
  )

  const g1 = -startAttach.x / startAttach.y
  const c1 = startAttach.y + square(startAttach.x) / startAttach.y
  const g2 = -(endAttach.x - endCentre) / endAttach.y
  const c2 =
    endAttach.y + ((endAttach.x - endCentre) * endAttach.x) / endAttach.y

  const cx = (c1 - c2) / (g2 - g1)
  const cy = g1 * cx + c1

  const arcRadius = Math.sqrt(
    square(cx - startAttach.x) + square(cy - startAttach.y),
  )
  const startAngle = Math.atan2(startAttach.x - cx, cy - startAttach.y)
  const endAngle = Math.atan2(endAttach.x - cx, cy - endAttach.y)
  let sweepAngle = endAngle - startAngle
  if (this.deflection > 0) {
    sweepAngle = 2 * Math.PI - sweepAngle
  }

  this.shaftLength = sweepAngle * arcRadius
  if (startAngle > endAngle) {
    this.shaftLength = 0
  }

  let midShaftAngle = (startAngle + endAngle) / 2
  if (this.deflection > 0) {
    midShaftAngle += Math.PI
  }
  this.midShaftPoint = {
    x: cx + arcRadius * Math.sin(midShaftAngle),
    y: cy - arcRadius * Math.cos(midShaftAngle),
  }

  const startTangent = function (dr: number) {
    const dx = (dr < 0 ? 1 : -1) * Math.sqrt(square(dr) / (1 + square(g1)))
    const dy = g1 * dx
    return {
      x: startAttach.x + dx,
      y: startAttach.y + dy,
    }
  }

  const endTangent = function (dr: number) {
    const dx = (dr < 0 ? -1 : 1) * Math.sqrt(square(dr) / (1 + square(g2)))
    const dy = g2 * dx
    return {
      x: endAttach.x + dx,
      y: endAttach.y + dy,
    }
  }

  const angleTangent = (angle: number, dr: number) => ({
    x: cx + (arcRadius + dr) * Math.sin(angle),
    y: cy - (arcRadius + dr) * Math.cos(angle),
  })

  const endNormal = function (dc: number) {
    const dx = (dc < 0 ? -1 : 1) * Math.sqrt(square(dc) / (1 + square(1 / g2)))
    const dy = dx / g2
    return {
      x: endAttach.x + dx,
      y: endAttach.y - dy,
    }
  }

  const endOverlayCorner = function (dr: number, dc: number) {
    const shoulder = endTangent(dr)
    const arrowTip = endNormal(dc)
    return {
      x: shoulder.x + arrowTip.x - endAttach.x,
      y: shoulder.y + arrowTip.y - endAttach.y,
    }
  }

  const coord = (point: Point) => `${point.x},${point.y}`

  const shaftRadius = arrowWidth / 2
  const headRadius = headWidth / 2
  const positiveSweep = startAttach.y > 0 ? 0 : 1
  const negativeSweep = startAttach.y < 0 ? 0 : 1

  this.outline = function (shortCaptionLength: number) {
    if (startAngle > endAngle) {
      return [
        'M',
        coord(endTangent(-headRadius)),
        'L',
        coord(endNormal(headLength)),
        'L',
        coord(endTangent(headRadius)),
        'Z',
      ].join(' ')
    }

    if (captionLayout === EDGE_CAPTION_EXTERNAL) {
      let captionSweep = shortCaptionLength / arcRadius
      if (this.deflection > 0) {
        captionSweep *= -1
      }

      const startBreak = midShaftAngle - captionSweep / 2
      const endBreak = midShaftAngle + captionSweep / 2

      return [
        'M',
        coord(startTangent(shaftRadius)),
        'L',
        coord(startTangent(-shaftRadius)),
        'A',
        arcRadius - shaftRadius,
        arcRadius - shaftRadius,
        0,
        0,
        positiveSweep,
        coord(angleTangent(startBreak, -shaftRadius)),
        'L',
        coord(angleTangent(startBreak, shaftRadius)),
        'A',
        arcRadius + shaftRadius,
        arcRadius + shaftRadius,
        0,
        0,
        negativeSweep,
        coord(startTangent(shaftRadius)),
        'Z',
        'M',
        coord(angleTangent(endBreak, shaftRadius)),
        'L',
        coord(angleTangent(endBreak, -shaftRadius)),
        'A',
        arcRadius - shaftRadius,
        arcRadius - shaftRadius,
        0,
        0,
        positiveSweep,
        coord(endTangent(-shaftRadius)),
        'L',
        coord(endTangent(-headRadius)),
        'L',
        coord(endNormal(headLength)),
        'L',
        coord(endTangent(headRadius)),
        'L',
        coord(endTangent(shaftRadius)),
        'A',
        arcRadius + shaftRadius,
        arcRadius + shaftRadius,
        0,
        0,
        negativeSweep,
        coord(angleTangent(endBreak, shaftRadius)),
      ].join(' ')
    } else {
      return [
        'M',
        coord(startTangent(shaftRadius)),
        'L',
        coord(startTangent(-shaftRadius)),
        'A',
        arcRadius - shaftRadius,
        arcRadius - shaftRadius,
        0,
        0,
        positiveSweep,
        coord(endTangent(-shaftRadius)),
        'L',
        coord(endTangent(-headRadius)),
        'L',
        coord(endNormal(headLength)),
        'L',
        coord(endTangent(headRadius)),
        'L',
        coord(endTangent(shaftRadius)),
        'A',
        arcRadius + shaftRadius,
        arcRadius + shaftRadius,
        0,
        0,
        negativeSweep,
        coord(startTangent(shaftRadius)),
      ].join(' ')
    }
  }

  this.overlay = function (minWidth: number) {
    const radius = Math.max(minWidth / 2, shaftRadius)
    return [
      'M',
      coord(startTangent(radius)),
      'L',
      coord(startTangent(-radius)),
      'A',
      arcRadius - radius,
      arcRadius - radius,
      0,
      0,
      positiveSweep,
      coord(endTangent(-radius)),
      'L',
      coord(endOverlayCorner(-radius, headLength)),
      'L',
      coord(endOverlayCorner(radius, headLength)),
      'L',
      coord(endTangent(radius)),
      'A',
      arcRadius + radius,
      arcRadius + radius,
      0,
      0,
      negativeSweep,
      coord(startTangent(radius)),
    ].join(' ')
  }
}

interface INode extends d3.SimulationNodeDatum {
  id: string
  properties: { [key: string]: string | number | object }
  labels: string[]
  color: string
  angleX: number
  angleY: number
  links: string[]
  targetLabels: { [label: string]: number }
}

interface IRelationship extends d3.SimulationLinkDatum<INode> {
  id: string
  properties: { [key: string]: string | number | object }
  type: string
  startNode: string
  endNode: string
  source: INode
  target: INode
  naturalAngle: number
  centreDistance: number
  isLoop: () => boolean
  captionLayout: string
  captionHeight: number
  arrow: {
    outline: Function
    overlay: Function
    shaftLength: number
    midShaftPoint: Point
  }
  fetchedAutomatically?: boolean
}

interface IGraph {
  nodes: INode[]
  relationships: IRelationship[]
}

interface IZoomFuncs {
  zoomIn: () => d3.Transition<SVGSVGElement, unknown, null, undefined>
  zoomOut: () => d3.Transition<SVGSVGElement, unknown, null, undefined>
  resetZoom: () => d3.Transition<SVGSVGElement, unknown, null, undefined>
  center: () => d3.Transition<SVGSVGElement, unknown, null, undefined>
}

export interface IGraphD3 {
  graphDataToD3Data: (data: any) => IGraph
  size: () => {
    nodes: number
    relationships: number
  }
  updateWithD3Data: (d3Data: any) => void
  updateWithGraphData: (graphData: any) => void
  zoomFuncs: IZoomFuncs
  toggleShowAutomaticEdges: () => void
}

function GraphD3(_selector: HTMLDivElement, _options: any): IGraphD3 {
  let info: any
  let nodes: INode[]
  let shouldShowAutomaticEdges = false
  let relationship: d3.Selection<SVGGElement, IRelationship, SVGGElement, any>
  let labelCounter = 0
  let labels: { [key: string]: number } = {}
  let relationshipOutline
  let relationshipOverlay
  let relationshipText
  let relationships: IRelationship[]
  let selector: HTMLDivElement
  let simulation: d3.Simulation<any, any>
  let svg: d3.Selection<any, unknown, null, undefined>
  let svgNodes: d3.Selection<
    d3.BaseType | SVGPathElement,
    any,
    SVGGElement,
    unknown
  >
  let svgRelationships: d3.Selection<
    d3.BaseType | SVGGElement,
    any,
    SVGGElement,
    unknown
  >
  let svgScale: number
  let svgTranslate: number[]
  let node: any
  let justLoaded = false
  let nominalTextSize = 10
  let maxTextSize = 24
  let coreSvg = null
  let height = 585

  let zoomFuncs: IZoomFuncs

  const options = { ...DEFAULT_OPTIONS, ..._options }
  let zoom: d3.ZoomBehavior<Element, unknown> = options.graphZoom

  const { labelColors, edgeColors } = options

  function color() {
    return COLORS[Math.floor(Math.random() * COLORS.length)]
  }

  function appendGraph(container: d3.Selection<any, unknown, null, undefined>) {
    let mainSvg = container
      .append('svg')
      .attr('width', '100%')
      .attr('height', height)
      .attr('class', 'graphd3-graph')
      .call(
        options.graphZoom.on('zoom', (event) => {
          let scale = event.transform.k
          const translate = [event.transform.x, event.transform.y]
          if (svgTranslate) {
            translate[0] += svgTranslate[0]
            translate[1] += svgTranslate[1]
          }
          if (svgScale) {
            scale *= svgScale
          }

          let node = svg.selectAll('.node')
          let textSize = nominalTextSize
          if (nominalTextSize * scale > maxTextSize)
            textSize = maxTextSize / scale
          appendTextToNode(node, textSize)
          let text = node.selectAll('.text')
          text.attr('font-size', textSize - 3 + 'px')
          svg.attr(
            'transform',
            `translate(${translate[0]}, ${translate[1]}) scale(${scale})`,
          )
        }),
      )
      .on('dblclick.zoom', null)
    svg = mainSvg.append('g').attr('width', '100%').attr('height', '100%')

    zoomFuncs = {
      zoomIn: () => mainSvg.transition().call(zoom.scaleBy, ZOOM_PROPS.ZOOM_IN),
      zoomOut: () =>
        mainSvg.transition().call(zoom.scaleBy, ZOOM_PROPS.ZOOM_OUT),
      resetZoom: () =>
        mainSvg.transition().call(zoom.scaleTo, ZOOM_PROPS.ZOOM_RESET),
      center: () =>
        mainSvg
          .transition()
          .call(
            zoom.translateTo,
            ...ZOOM_PROPS.CAMERA_CENTER(
              mainSvg.node().getBoundingClientRect().width,
              mainSvg.node().getBoundingClientRect().height,
            ),
          ),
    }

    svgRelationships = svg.append('g').attr('class', 'relationships')

    svgNodes = svg.append('g').attr('class', 'nodes')

    coreSvg = mainSvg
  }

  function appendInfoPanel(container) {
    return container.append('div').attr('class', 'd3-info')
  }

  function appendInfoElement(className, nodeData) {
    let colorNode
    let property

    if (nodeData.labels) {
      ;[property] = nodeData.labels
      colorNode = nodeData.color
    } else {
      colorNode = '#808080'
      property = nodeData.type
    }

    info
      .append('span')
      .attr('class', className)
      .html(`<strong>${property}</strong>`)
      .style('background-color', colorNode)
      .style('border-color', Utils.darkenColor(colorNode))
      .style('color', Utils.invertColor(colorNode))
  }

  function appendInfoElementProperty(cls, property, value) {
    info
      .append('span')
      .attr('class', cls)
      .html(`<strong>${property}</strong> ${value}`)
  }

  function stickNode(ele, event, d) {
    /* eslint-disable */
    d.fx = event.x
    d.fy = event.y
    /* eslint-enable */

    // Add a ring to specify that the node was selected
    d3.select(ele).attr('class', 'node selected')
  }

  function dragEnded(event, d) {
    if (!event.active) {
      simulation.alphaTarget(0)
    }

    if (typeof options.onNodeDragEnd === 'function') {
      options.onNodeDragEnd(this, d, event)
    }
  }

  function dragged(event, d) {
    stickNode(this, event, d)

    // Don't move other nodes on drag of one node.
    svg.selectAll('.node').each((n: any) => {
      if (d.id !== n.id) {
        n.fx = n.x
        n.fy = n.y
      }
    })
  }

  function dragStarted(event, d) {
    if (!event.active) {
      simulation.alphaTarget(0.3).restart()
    }
    /* eslint-disable */
    d.fx = d.x
    d.fy = d.y
    /* eslint-enable */

    if (typeof options.onNodeDragStart === 'function') {
      options.onNodeDragStart(this, d, event)
    }

    // Select the entity to display its info
    if (info) {
      updateInfo(d)
    }
  }

  function clearInfo() {
    info.html('')
  }

  function updateInfo(d) {
    clearInfo()

    if (typeof options.onDisplayInfo === 'function') {
      options.onDisplayInfo(info, d)
      return
    }

    appendInfoElement('class', d)
    appendInfoElementProperty('property', '&lt;id&gt;', d.id)

    Object.keys(d.properties).forEach((property) => {
      appendInfoElementProperty(
        'property',
        property,
        JSON.stringify(d.properties[property]),
      )
    })
  }

  function appendNode() {
    return node
      .enter()
      .append('g')
      .attr('class', (d) => {
        const label = d.labels?.length ? d.labels[0] : ''
        let classes = 'node'
        let highlight

        if (options.highlight) {
          for (let i = 0; i < options.highlight.length; i += 1) {
            highlight = options.highlight[i]

            if (
              label === highlight.class &&
              d.properties[highlight.property] === highlight.value
            ) {
              classes += ' node-highlighted'
              break
            }
          }
        }

        return classes
      })
      .on('click', function onNodeClick(event, d) {
        /* eslint-disable */
        d.fx = null
        d.fy = null
        /* eslint-enable */

        if (typeof options.onNodeClick === 'function') {
          options.onNodeClick(this, d, event)
        }

        if (info) {
          updateInfo(d)
        }
      })
      .on('dblclick', function onNodeDoubleClick(event, d) {
        stickNode(this, event, d)

        if (typeof options.onNodeDoubleClick === 'function') {
          options.onNodeDoubleClick(this, d, event)
        }

        ;[...new Set(nodes.map((n) => n.labels[0]))].forEach((l) => {
          if (labels[l] === undefined) {
            labels[l] = labelCounter
            labelCounter += 1
          }
        })

        // Pulse on double click
        Utils.pulse(d3.select(event.currentTarget).select('.outline'))

        // Calculating the next positio of the node takes some times
        // so start transition only after the calculation. So delay
        // starting the transition by some milliseconds.
        setTimeout(
          () =>
            d3
              .select('.graphd3-graph')
              .transition()
              .duration(500)
              .call(zoom.translateTo as any, d.x, d.y),
          10,
        )
      })
      .on('mouseenter', function onNodeMouseEnter(event, d) {
        if (typeof options.onNodeMouseEnter === 'function') {
          options.onNodeMouseEnter(this, d, event)
        }
      })
      .on('mouseleave', function onNodeMouseLeave(event, d) {
        if (info) {
          // clearInfo(d)
        }

        if (typeof options.onNodeMouseLeave === 'function') {
          options.onNodeMouseLeave(this, d, event)
        }
      })
      .call(
        d3
          .drag()
          .on('start', dragStarted)
          .on('drag', dragged)
          .on('end', dragEnded),
      )
  }

  function appendRingToNode(svgNode) {
    return svgNode
      .append('circle')
      .attr('class', 'ring')
      .style(
        'stroke',
        (d) => labelColors(d.labels?.length ? d.labels[0] : '').borderColor,
      )
      .attr('r', options.nodeRadius * 1.16)
  }

  function appendOutlineToNode(svgNode) {
    return svgNode
      .append('circle')
      .attr('class', 'outline')
      .attr('r', options.nodeRadius)
      .style(
        'fill',
        (d) => labelColors(d.labels?.length ? d.labels[0] : '').color,
      )
      .style(
        'stroke',
        (d) => labelColors(d.labels?.length ? d.labels[0] : '').borderColor,
      )
  }

  function appendNodeInfo(svgNode) {
    if (!options.onNodeInfoClick) {
      return
    }

    const g = svgNode
      .append('g')
      .attr('class', 'info')
      .attr('transform', 'translate(9, -28)')
      .on('click', function onNodeInfoClick(event, d) {
        if (typeof options.onNodeInfoClick === 'function') {
          options.onNodeInfoClick(this, d, event)
        }

        if (info) {
          updateInfo(d)
        }
      })

    g.append('rect')
      .attr('width', '20px')
      .attr('height', '20px')
      .style('fill', '#444')
      .style('stroke', '#54b3ff')
      .attr('rx', 10)
      .attr('ry', 10)

    g.append('text')
      .text('i')
      .attr('fill', 'white')
      .attr('font-size', 11)
      .attr('x', '9')
      .attr('y', '14')
  }

  function appendTextToNode(svgNode, textSize = null) {
    svgNode
      .selectAll('text')
      .data((d) => {
        let label: string
        if (typeof options.onLabelNode === 'function') {
          label = options.onLabelNode(d)
        } else {
          label = d.properties?.name || d.properties?.title
        }
        label ||= ''
        if (textSize !== null) {
          let maxLength = maxTextSize - textSize + 15
          label =
            label.length > maxLength
              ? Utils.truncateText(label, maxLength)
              : label
        }
        let wrappedLabel = Utils.wrapText(label, 7)
        return wrappedLabel.split('\n').map((k) => ({
          text: k,
          actual: wrappedLabel,
          d,
        }))
      })
      .join('text')
      .text((d) => d.text)
      .attr('y', (d, i) => {
        const calculatePosition = (l: number) => {
          if (l == 1) return 0
          else {
            let arr = []
            for (let m = 0; m < l / 2; m++) {
              let z = m * 10
              arr = [-z - 5, ...arr]
              arr = [...arr, z + 5]
            }
            return arr
          }
        }
        const r = calculatePosition(d.actual.split('\n').length)
        return r[i]
      })
      .attr('class', 'text')
      .attr('font-size', () => nominalTextSize + 'px')
      .attr(
        'fill',
        ({ d }) => labelColors(d.labels?.length ? d.labels[0] : '').textColor,
      )
      .attr('pointer-events', 'none')
      .attr('text-anchor', 'middle')
      .attr('dy', () => options.nodeRadius / ((options.nodeRadius * 25) / 100))
  }

  function appendNodeToGraph() {
    const n = appendNode()

    appendRingToNode(n)
    appendOutlineToNode(n)
    appendNodeInfo(n)
    appendTextToNode(n, null)

    return n
  }

  function contains(array, id) {
    const filter = array.filter((elem) => elem.id === id)

    return filter.length > 0
  }

  function appendRelationship() {
    return relationship
      .enter()
      .append('g')
      .attr('class', (r) => `relationship relationship-${r.id}`)
      .on('dblclick', function onRelationshipDoubleClick(event, d) {
        if (typeof options.onRelationshipDoubleClick === 'function') {
          options.onRelationshipDoubleClick(this, d, event)
        }
      })
      .on('click', (event, d) => {
        if (info) {
          updateInfo(d)
        }
      })
  }

  function appendOutlineToRelationship(r) {
    return r
      .append('path')
      .attr('class', 'outline')
      .attr('fill', (d) => edgeColors(d.type).color)
  }

  function appendOverlayToRelationship(r) {
    return r
      .append('path')
      .attr('class', 'overlay')
      .style('fill', (d) => edgeColors(d.type).color)
  }

  function appendTextToRelationship(r) {
    return r
      .append('text')
      .attr('class', 'text')
      .attr('fill', (d) => edgeColors(d.type).color)
      .attr('font-size', '12px')
      .attr('pointer-events', 'none')
      .attr('text-anchor', 'middle')
      .text((d) => d.type)
  }

  function appendRelationshipToGraph() {
    const svgRelationship = appendRelationship()

    const text = appendTextToRelationship(svgRelationship)

    const outline = appendOutlineToRelationship(svgRelationship)
    const overlay = appendOverlayToRelationship(svgRelationship)

    return {
      outline,
      overlay,
      relationship: svgRelationship,
      text,
    }
  }

  function updateNodes(n: INode) {
    Array.prototype.push.apply(nodes, n)

    node = svgNodes.selectAll('.node').data(nodes, (d: INode) => d.id)

    const nodeEnter = appendNodeToGraph()
    node = nodeEnter.merge(node)
  }

  function updateRelationships(r: IRelationship) {
    Array.prototype.push.apply(relationships, r)
    let a = svgRelationships.selectAll('.relationship')
    relationship = svgRelationships
      .selectAll('.relationship')
      .data(relationships, (d: IRelationship) => d.id) as d3.Selection<
      SVGGElement,
      IRelationship,
      SVGGElement,
      any
    >

    const relationshipEnter = appendRelationshipToGraph()

    relationship = relationshipEnter.relationship.merge(relationship)
    relationshipOutline = svg.selectAll('.relationship .outline')
    relationshipOutline = relationshipEnter.outline.merge(relationshipOutline)

    relationshipOverlay = svg.selectAll('.relationship .overlay')
    relationshipOverlay = relationshipEnter.overlay.merge(relationshipOverlay)

    relationshipText = svg.selectAll('.relationship .text')
    relationshipText = relationshipEnter.text.merge(relationshipText)
  }

  function updateNodesAndRelationships(n, r) {
    let nodeIds = nodes.map((n) => n.id)
    n = n.filter((k) => !nodeIds.includes(k.id))

    let edgeIds = relationships.map((e) => e.id)
    const previousEdges = [...r]
    r = r.filter((k) => !edgeIds.includes(k.id))

    if (relationship !== undefined) {
      relationship.each((r) => {
        // If an edge is being fetchedAutomatically and is now added
        // in new data, mark fetchedAutomatically to false.
        if (
          r.fetchedAutomatically &&
          previousEdges.map((k) => k.id).includes(r.id)
        ) {
          r.fetchedAutomatically = false
        }
      })
    }

    updateRelationships(r)
    updateNodes(n)

    simulation.nodes(nodes)
    simulation.force(
      'link',
      d3.forceLink(relationships).id((d: IRelationship) => d.id),
    )

    // Every time the function is run, do check whether automatically fetched edges must be rendered.
    d3.selectAll('.relationship').each((r: IRelationship) => {
      if (!shouldShowAutomaticEdges && r.fetchedAutomatically) {
        d3.selectAll(`.relationship-${r.id}`).remove()
      }
    })
  }

  function graphDataToD3Data(data) {
    const graph: IGraph = {
      nodes: nodes,
      relationships: [],
    }

    data.results.forEach((result) => {
      result.data.forEach((dataItem) => {
        dataItem.graph.nodes.forEach((nodeData) => {
          if (!contains(graph.nodes, nodeData.id)) {
            const randomColor = nodeData.labels?.length === 0 ? 'gray' : color()

            graph.nodes.push({
              ...nodeData,
              color: options.nodeOutlineFillColor
                ? options.nodeOutlineFillColor
                : randomColor,
            })
          }
        })

        dataItem.graph.relationships.forEach((relationshipData) => {
          graph.relationships.push({
            ...relationshipData,
            source: relationshipData.startNode,
            target: relationshipData.endNode,
          })
        })

        dataItem.graph.relationships.sort((a, b) => {
          if (a.source > b.source) {
            return 1
          }

          if (a.source < b.source) {
            return -1
          }

          if (a.target > b.target) {
            return 1
          }

          if (a.target < b.target) {
            return -1
          }

          return 0
        })
      })
    })

    mapData(graph)

    return graph
  }

  function updateWithD3Data(d3Data) {
    // marker
    updateNodesAndRelationships(d3Data.nodes, d3Data.relationships)
  }

  function updateWithGraphData(graphData) {
    const d3Data = graphDataToD3Data(graphData)
    updateWithD3Data(d3Data)
  }

  function loadGraphData(graphData) {
    nodes = []
    relationships = []

    updateWithGraphData(graphData)
  }

  function rotatePoint(c, p, angle) {
    return Utils.rotate(c.x, c.y, p.x, p.y, angle)
  }

  function rotation(source, target) {
    return (
      (Math.atan2(target.y - source.y, target.x - source.x) * 180) / Math.PI
    )
  }

  function size() {
    return {
      nodes: nodes.length,
      relationships: relationships.length,
    }
  }

  function unitaryNormalVector(source, target, newLength) {
    const center = { x: 0, y: 0 }
    const vector = Utils.unitaryVector(source, target, newLength)

    return rotatePoint(center, vector, 90)
  }

  function tickRelationshipsOutlines() {
    relationship.each(function (relationship) {
      // FIXME:

      let rel = d3.select(this),
        outline = rel.select('.outline') as unknown as d3.Selection<
          d3.BaseType,
          IRelationship,
          null,
          undefined
        >,
        text = rel.select('.text'),
        textPadding = 8,
        textLength = text.node().getComputedTextLength(),
        captionLength = textLength > 0 ? textLength + textPadding : 0

      outline.attr('d', (d) => {
        if (captionLength > d.arrow.shaftLength) {
          captionLength = d.arrow.shaftLength
        }
        return d.arrow.outline(captionLength)
      })
    })
  }

  function tickRelationshipsOverlays() {
    relationshipOverlay.attr('d', (d) => {
      return d.arrow.overlay(options.arrowSize)
    })
  }

  function tickRelationshipsTexts() {
    relationshipText.attr('transform', (rel) => {
      if (rel.naturalAngle < 90 || rel.naturalAngle > 270) {
        return `rotate(180 ${rel.arrow.midShaftPoint.x} ${rel.arrow.midShaftPoint.y})`
      } else {
        return null
      }
    })

    relationshipText.attr('x', (rel) => rel.arrow.midShaftPoint.x)
    relationshipText.attr(
      'y',
      //TODO: Make the fontsize and padding dynamic
      (rel) => rel.arrow.midShaftPoint.y + 8.5 / 2 - 1,
    )
  }

  function tickRelationships() {
    //TODO: add multiple cases

    layoutRelationships()

    if (relationship) {
      layoutRelationships()

      relationship.attr('transform', (d) => {
        return `translate(${d.source.x} ${d.source.y}) rotate(${
          d.naturalAngle + 180
        })`
      })

      tickRelationshipsTexts()
      tickRelationshipsOutlines()
      tickRelationshipsOverlays()
    }
  }

  function tickNodes() {
    if (node) {
      node.attr('transform', (d) => `translate(${d.x}, ${d.y})`)
    }
  }

  function tick() {
    simulation.tick(1)
    tickNodes()
    tickRelationships()
  }

  // eslint-disable-next-line no-unused-vars
  function zoomFit() {
    const bounds = svg.node().getBBox()
    const parent = svg.node().parentElement.parentElement

    if (!parent) {
      return
    }

    const fullWidth = parent.clientWidth
    const fullHeight = parent.clientHeight
    const { width, height } = bounds
    const midX = bounds.x + width / 2
    const midY = bounds.y + height / 2

    if (width === 0 || height === 0) {
      return // nothing to fit
    }

    svgScale = 0.85 / Math.max(width / fullWidth, height / fullHeight)
    svgTranslate = [
      fullWidth / 2 - svgScale * midX,
      fullHeight / 2 - svgScale * midY,
    ]

    svg.attr(
      'transform',
      `translate(${svgTranslate[0]}, ${svgTranslate[1]}) scale(${svgScale})`,
    )
  }

  function initSimulation() {
    const spreadFactor = 1.25
    return d3
      .forceSimulation()
      .force(
        'link',
        d3
          .forceLink()
          .id((d: IRelationship) => d.id)
          .distance(70),
      )
      .force(
        'charge',
        d3.forceManyBody().strength((d, i) => (i ? -5000 : 500)),
      )
      .force(
        'y',
        d3.forceY(svg.node().parentElement.parentElement.clientHeight / 2),
      )
      .force(
        'center',
        d3.forceCenter(
          svg.node().parentElement.parentElement.clientWidth / 2,
          svg.node().parentElement.parentElement.clientHeight / 2,
        ),
      )
      .on('tick', () => {
        tick()
      })
      .on('end', () => {
        if (options.zoomFit && !justLoaded) {
          justLoaded = true
          zoomFit()
        }
      })
  }

  function init() {
    if (!options.minCollision) {
      options.minCollision = options.nodeRadius * 2
    }

    selector = _selector

    const container = d3.select(selector)

    container.attr('class', 'graphd3').html('')

    if (options.infoPanel) {
      info = appendInfoPanel(container)
    }

    appendGraph(container)

    simulation = initSimulation()

    if (options.graphData) {
      loadGraphData(options.graphData)
    } else {
      console.error('Error: graphData is empty!')
    }

    ;[...new Set(nodes.map((n) => n.labels[0]))].forEach((l) => {
      if (labels[l] === undefined) {
        labels[l] = labelCounter
        labelCounter += 1
      }
    })

    simulation
      .force(
        'x',
        d3.forceX((d) => d.angleX || 0),
      )
      .force(
        'y',
        d3.forceY((d) => d.angleY || 0),
      )
      .force(
        'center',
        d3.forceCenter(
          svg.node().parentElement.parentElement.clientWidth / 2,
          svg.node().parentElement.parentElement.clientHeight / 2,
        ),
      )
      .force('centerX', d3.forceX(0).strength(0.03))
      .force('centerX', d3.forceX(0).strength(0.03))
  }

  init()

  class NodePair {
    nodeA: INode
    nodeB: INode
    relationships: IRelationship[]

    constructor(node1: INode, node2: INode) {
      if (node1.id < node2.id) {
        this.nodeA = node1
        this.nodeB = node2
      } else {
        this.nodeA = node2
        this.nodeB = node1
      }
      this.relationships = []
    }

    isLoop(): boolean {
      return this.nodeA.id === this.nodeB.id
    }

    toString() {
      return `${this.nodeA.id}:${this.nodeB.id}`
    }
  }

  function layoutRelationships() {
    const nodePairs = groupedRelationships()
    computeGeometryForNonLoopArrows(nodePairs)
    distributeAnglesForLoopArrows(nodePairs, relationships)

    return (() => {
      const result = []
      for (let nodePair of Array.from(nodePairs)) {
        for (let relationship of Array.from(nodePair.relationships)) {
          delete relationship.arrow
        }

        let middleRelationshipIndex = (nodePair.relationships.length - 1) / 2
        let defaultDeflectionStep = 30
        const maximumTotalDeflection = 150
        const numberOfSteps = nodePair.relationships.length - 1
        const totalDeflection = defaultDeflectionStep * numberOfSteps

        let deflectionStep =
          totalDeflection > maximumTotalDeflection
            ? maximumTotalDeflection / numberOfSteps
            : defaultDeflectionStep

        result.push(
          (() => {
            for (let i = 0; i < nodePair.relationships.length; i++) {
              let ref
              const relationship = nodePair.relationships[i]
              const nodeRadius = options.nodeRadius
              const shaftWidth = options.relationshipWidth
              const headWidth = options.arrowSize
              const headHeight = headWidth

              if (nodePair.isLoop()) {
                relationship.arrow = new LoopArrow(
                  nodeRadius,
                  40,
                  defaultDeflectionStep,
                  shaftWidth,
                  headWidth,
                  headHeight,
                  relationship.captionHeight || 11,
                )
              } else {
                if (i === middleRelationshipIndex) {
                  relationship.arrow = new StraightArrow(
                    nodeRadius,
                    nodeRadius,
                    relationship.centreDistance,
                    shaftWidth,
                    headWidth,
                    headHeight,
                    relationship.captionLayout || EDGE_CAPTION_EXTERNAL,
                  )
                } else {
                  let deflection =
                    deflectionStep * (i - middleRelationshipIndex)

                  if (nodePair.nodeA !== relationship.source) {
                    deflection *= -1
                  }

                  relationship.arrow = new ArcArrow(
                    nodeRadius,
                    nodeRadius,
                    relationship.centreDistance,
                    deflection,
                    shaftWidth,
                    headWidth,
                    headHeight,
                    relationship.captionLayout || EDGE_CAPTION_EXTERNAL,
                  )
                }
              }
            }
          })(),
        )
      }
      return result
    })()
  }

  //FIXME:DONT HAVE TO REPEAT

  function findNode(id, nodes) {
    let match
    nodes.forEach((node) => {
      if (node.id == id) match = node
    })
    return match
  }

  function mapData(d: IGraph) {
    d.relationships.map((r) => {
      let source = findNode(r.startNode, d.nodes)
      let target = findNode(r.endNode, d.nodes)

      source.links = source.links
        ? Array.from(new Set([...source.links, target.labels[0]]))
        : [target.labels[0]]
      ;(r.source = source),
        (r.target = target),
        (r.naturalAngle = 0),
        (r.isLoop = function () {
          return this.source === this.target
        })
      return r
    })

    nodes.map((n) => {
      if (n.links !== undefined) {
        let labels = {}
        n.links.forEach((l, i) => {
          labels[l] = i
        })

        const equalAngles = 360 / Object.keys(labels).length
        let angleIterator = 0
        Object.keys(labels).map((l) => {
          labels[l] = angleIterator
          angleIterator += equalAngles
        })

        n.targetLabels = labels
      }
    })

    d.relationships.map((r) => {
      const radius = 1300
      const onlyOne = Object.keys(r.source.targetLabels).length === 1

      const degree =
        (Math.PI * 2 * r.source.targetLabels[r.target.labels[0]]) / 360
      const angleX = onlyOne ? 0 : radius * Math.sin(degree)
      const angleY = onlyOne ? 0 : radius * Math.cos(degree)

      r.target.angleX = angleX
      r.target.angleY = angleY
    })
  }

  function groupedRelationships(): NodePair[] {
    const groups: {
      [key: string]: NodePair
    } = {}
    for (const relationship of Array.from(relationships)) {
      let nodePair = new NodePair(relationship.source, relationship.target)
      nodePair =
        groups[nodePair.toString()] != null
          ? groups[nodePair.toString()]
          : nodePair
      nodePair.relationships.push(relationship)
      groups[nodePair.toString()] = nodePair
    }
    return (() => {
      const result = []
      for (const ignored in groups) {
        const pair = groups[ignored]
        result.push(pair)
      }
      return result
    })()
  }

  function computeGeometryForNonLoopArrows(nodePairs: NodePair[]) {
    const square = (distance: number) => distance * distance
    return (() => {
      const result: number[][] | undefined = []
      for (let nodePair of Array.from(nodePairs)) {
        if (!nodePair.isLoop()) {
          const dx = nodePair.nodeA.x - nodePair.nodeB.x
          const dy = nodePair.nodeA.y - nodePair.nodeB.y
          let angle = ((Math.atan2(dy, dx) / Math.PI) * 180 + 360) % 360
          let centreDistance = Math.sqrt(square(dx) + square(dy))
          result.push(
            (() => {
              const result1: number[] = []
              for (const relationship of Array.from(nodePair.relationships)) {
                relationship.naturalAngle =
                  relationship.target === nodePair.nodeA
                    ? (angle + 180) % 360
                    : angle
                result1.push((relationship.centreDistance = centreDistance))
              }
              return result1
            })(),
          )
        } else {
          result.push(undefined)
        }
      }
      return result
    })()
  }

  function distributeAnglesForLoopArrows(
    nodePairs: NodePair[],
    relationships: IRelationship[],
  ) {
    return (() => {
      const result = []
      for (let nodePair of Array.from(nodePairs)) {
        if (nodePair.isLoop()) {
          let i: number, separation: number
          let angles = []
          const node = nodePair.nodeA
          for (let relationship of Array.from(relationships)) {
            if (!relationship.isLoop()) {
              if (relationship.source === node) {
                angles.push(relationship.naturalAngle)
              }
              if (relationship.target === node) {
                angles.push(relationship.naturalAngle + 180)
              }
            }
          }
          angles = angles.map((a) => (a + 360) % 360).sort((a, b) => a - b)
          if (angles.length > 0) {
            let end: number, start: number
            let biggestGap = {
              start: 0,
              end: 0,
            }
            for (i = 0; i < angles.length; i++) {
              const angle = angles[i]
              start = angle
              end = i === angles.length - 1 ? angles[0] + 360 : angles[i + 1]
              if (end - start > biggestGap.end - biggestGap.start) {
                biggestGap.start = start
                biggestGap.end = end
              }
            }
            separation =
              (biggestGap.end - biggestGap.start) /
              (nodePair.relationships.length + 1)
            result.push(
              (() => {
                const result1 = []
                for (i = 0; i < nodePair.relationships.length; i++) {
                  const relationship = nodePair.relationships[i]
                  result1.push(
                    (relationship.naturalAngle =
                      (biggestGap.start + (i + 1) * separation - 90) % 360),
                  )
                }
                return result1
              })(),
            )
          } else {
            separation = 360 / nodePair.relationships.length

            result.push(
              (() => {
                const result2 = []
                for (i = 0; i < nodePair.relationships.length; i++) {
                  const relationship = nodePair.relationships[i]
                  result2.push((relationship.naturalAngle = i * separation))
                }
                return result2
              })(),
            )
          }
        } else {
          result.push(undefined)
        }
      }
      return result
    })()
  }

  function resize() {
    const isFullScreen =
      parent.document.body.getElementsByClassName('fullscreen').length > 0
    if (isFullScreen) {
      coreSvg.attr('height', parent.document.body.offsetHeight - 50)
      coreSvg
        .transition()
        .call(
          zoom.translateTo,
          ...ZOOM_PROPS.CAMERA_CENTER(
            coreSvg.node().getBoundingClientRect().width,
            coreSvg.node().getBoundingClientRect().height - 300,
          ),
        )
    } else {
      coreSvg.attr('height', height)
      coreSvg
        .transition()
        .call(
          zoom.translateTo,
          ...ZOOM_PROPS.CAMERA_CENTER(
            coreSvg.node().getBoundingClientRect().width,
            coreSvg.node().getBoundingClientRect().height,
          ),
        )
    }
    simulation.restart()
  }

  d3.select(window).on('resize', resize)

  resize()

  function toggleShowAutomaticEdges() {
    // Simply re-run the function. `updateNodesAndRelationships` internally checks for `shouldShowAutomaticEdges` prop to render edges that were fetched automatically.
    shouldShowAutomaticEdges = !shouldShowAutomaticEdges
    updateNodesAndRelationships([], [])
    simulation.restart()
  }

  return {
    graphDataToD3Data,
    size,
    updateWithD3Data,
    updateWithGraphData,
    zoomFuncs,
    toggleShowAutomaticEdges,
  }
}

export default GraphD3
