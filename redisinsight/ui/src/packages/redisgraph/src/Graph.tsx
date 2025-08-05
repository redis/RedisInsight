import React, { useEffect, useRef, useState, useMemo } from 'react'
import * as d3 from 'd3'
import { executeRedisCommand, formatRedisReply } from 'redisinsight-plugin-sdk'
import { RiSwitchInput } from 'uiSrc/components/base/inputs'
import { RiTooltip } from 'uiSrc/components'
import { TOOLTIP_DELAY_LONG } from 'uiSrc/constants'
import Graphd3, { IGraphD3 } from './graphd3'
import { responseParser } from './parser'
import {
  IGoodColor,
  GoodColorPicker,
  getFetchNodesByIdQuery,
  getFetchDirectNeighboursOfNodeQuery,
  getFetchNodeRelationshipsQuery,
  getFetchEdgesByIdQuery,
  getFetchNodesByEdgeIdQuery,
  commandIsSuccess,
} from './utils'
import {
  EDGE_COLORS,
  EDGE_COLORS_DARK,
  NODE_COLORS,
  NODE_COLORS_DARK,
} from './constants'
import { RiIconButton } from '../../../components/base/forms/buttons'
import { CancelSlimIcon } from '../../../components/base/icons'

enum EntityType {
  Node = 'Node',
  Edge = 'Edge',
}

interface ISelectedEntityProps {
  property: string
  color: string
  backgroundColor: string
  props: { [key: string]: string | number | object }
  type: EntityType
}

const isDarkTheme = document.body.classList.contains('theme_DARK')

const colorPicker = (COLORS: IGoodColor[]) => {
  const color = new GoodColorPicker(COLORS)
  return (label: string) => color.getColor(label)
}

const labelColors = colorPicker(isDarkTheme ? NODE_COLORS_DARK : NODE_COLORS)
const edgeColors = colorPicker(isDarkTheme ? EDGE_COLORS_DARK : EDGE_COLORS)
export default function Graph(props: {
  graphKey: string
  data: any[]
  command: string
}) {
  const d3Container = useRef<HTMLDivElement>()
  const [container, setContainer] = useState<IGraphD3>(null)
  const [selectedEntity, setSelectedEntity] =
    useState<ISelectedEntityProps | null>(null)
  const [start, setStart] = useState<boolean>(false)
  const [showAutomaticEdges, setShowAutomaticEdges] = useState(false)
  const [parsedRedisReply, setParsedRedisReply] = useState('')

  const parsedResponse = responseParser(props.data)
  const nodeIds = new Set(parsedResponse.nodes.map((n) => n.id))
  const edgeIds = new Set(parsedResponse.edges.map((e) => e.id))
  const isNoDataToVisualize =
    nodeIds.size === 0 &&
    parsedResponse.nodeIds.size === 0 &&
    parsedResponse.danglingEdgeIds.size === 0

  useEffect(() => {
    if (isNoDataToVisualize) {
      const getParsedResponse = async () => {
        const formattedResponse = await formatRedisReply(
          props.data,
          props.command,
        )
        setParsedRedisReply(formattedResponse)
      }
      getParsedResponse()
    }
  }, [])

  // TODO: refactor to do not call hooks conditionally
  if (isNoDataToVisualize) {
    return (
      <>
        <div className="responseInfo">
          No data to visualize. Raw information is presented below.
        </div>
        <div className="parsedRedisReply">{parsedRedisReply}</div>
      </>
    )
  }

  const data = {
    results: [
      {
        columns: parsedResponse.headers,
        data: [
          {
            graph: {
              nodes: parsedResponse.nodes,
              relationships: parsedResponse.edges
                /* If edge is present in dangling edges, add them since we are gonna retrive them from the node by dangling edges query */
                .filter(
                  (e) =>
                    (nodeIds.has(e.source) && nodeIds.has(e.target)) ||
                    parsedResponse.danglingEdgeIds.has(e.id),
                )
                .map((e) => ({ ...e, startNode: e.source, endNode: e.target })),
            },
          },
        ],
      },
    ],
    errors: [],
  }

  const [nodeLabels, setNodeLabels] = useState(parsedResponse.labels)
  const [edgeTypes, setEdgeTypes] = useState(parsedResponse.types)

  const [graphData, setGraphData] = useState(data)

  useMemo(async () => {
    let newGraphData = graphData
    const newNodeLabels: { [key: string]: number } = nodeLabels
    const newEdgeTypes: { [key: string]: number } = edgeTypes

    if (parsedResponse.danglingEdgeIds.size > 0) {
      /*
       * Fetch dangling edges
       */
      try {
        const resp = await executeRedisCommand(
          getFetchNodesByEdgeIdQuery(
            props.graphKey,
            [...parsedResponse.danglingEdgeIds],
            [...nodeIds],
          ),
        )

        if (commandIsSuccess(resp)) {
          const parsedData = responseParser(resp[0].response)
          parsedData.nodes.forEach((n) => {
            nodeIds.add(n.id)
            n.labels.forEach(
              (l) => (newNodeLabels[l] = newNodeLabels[l] + 1 || 1),
            )
          })

          /* Since its obvious from the query that only nodes will be
          returned, so putting empty array for relationships field. */
          newGraphData = {
            ...newGraphData,
            results: [
              ...newGraphData.results,
              {
                columns: parsedData.headers,
                data: [
                  {
                    graph: {
                      nodes: parsedData.nodes,
                      relationships: [],
                    },
                  },
                ],
              },
            ],
          }
        }
      } catch {}
    }

    if (
      parsedResponse.hasNamedPathItem &&
      parsedResponse.npNodeIds.length > 0
    ) {
      try {
        /* Fetch named path nodes */
        let resp = await executeRedisCommand(
          getFetchNodesByIdQuery(props.graphKey, [...parsedResponse.npNodeIds]),
        )
        if (commandIsSuccess(resp)) {
          const parsedData = responseParser(resp[0].response)
          parsedData.nodes.forEach((n) => {
            nodeIds.add(n.id)
            n.labels.forEach(
              (l) => (newNodeLabels[l] = newNodeLabels[l] + 1 || 1),
            )
          })

          if (parsedResponse.npEdgeIds.length > 0) {
            resp = await executeRedisCommand(
              getFetchEdgesByIdQuery(props.graphKey, [
                ...parsedResponse.npEdgeIds,
              ]),
            )
            if (commandIsSuccess(resp)) {
              const edgeParsedData = responseParser(resp[0].response)
              parsedData.edges = [...edgeParsedData.edges]
              parsedData.edgeIds = edgeParsedData.edgeIds
            }
          }

          parsedData.edges = parsedData.edges.filter((e) => !edgeIds.has(e.id))
          parsedData.edges.forEach((e) => {
            edgeIds.add(e.id)
            newEdgeTypes[e.type] = newEdgeTypes[e.type] + 1 || 1
          })

          newGraphData = {
            ...newGraphData,
            results: [
              ...newGraphData.results,
              {
                columns: parsedData.headers,
                data: [
                  {
                    graph: {
                      nodes: parsedData.nodes,
                      relationships: parsedData.edges
                        .filter(
                          (e) => nodeIds.has(e.source) && nodeIds.has(e.target),
                        )
                        .map((e) => ({
                          ...e,
                          startNode: e.source,
                          endNode: e.target,
                        })),
                    },
                  },
                ],
              },
            ],
          }
        }
      } catch {}
    }

    try {
      /* Fetch neighbours automatically */
      if (nodeIds.size > 0) {
        const resp = await executeRedisCommand(
          getFetchNodeRelationshipsQuery(
            props.graphKey,
            [...nodeIds],
            [...nodeIds],
            [...edgeIds],
          ),
        )

        if (commandIsSuccess(resp)) {
          const parsedData = responseParser(resp[0].response)

          /* This block is not needed since only edges are retrieved. */
          parsedData.nodes.forEach((n) => {
            nodeIds.add(n.id)
            n.labels.forEach(
              (l) => (newNodeLabels[l] = newNodeLabels[l] + 1 || 1),
            )
          })

          const filteredEdges = parsedData.edges
            .filter((e) => !edgeIds.has(e.id))
            .filter((e) => nodeIds.has(e.source) && nodeIds.has(e.target))
            .map((e) => {
              edgeIds.add(e.id)
              newEdgeTypes[e.type] = newEdgeTypes[e.type] + 1 || 1
              return {
                ...e,
                startNode: e.source,
                endNode: e.target,
                fetchedAutomatically: true,
              }
            })

          setGraphData({
            ...newGraphData,
            results: [
              ...newGraphData.results,
              {
                columns: parsedData.headers,
                data: [
                  {
                    graph: {
                      nodes: parsedData.nodes,
                      relationships: filteredEdges,
                    },
                  },
                ],
              },
            ],
          })
        }
      }
    } catch {}

    setNodeLabels(newNodeLabels)
    setEdgeTypes(newEdgeTypes)

    setStart(true)
  }, [])

  const zoom = d3.zoom().scaleExtent([0, 3]) /* min, mac of zoom */
  useEffect(() => {
    if (container != null) return
    if (!start) return

    const graphd3 = Graphd3(d3Container.current, {
      labelColors,
      edgeColors,
      highlight: [],
      graphZoom: zoom,
      minCollision: 60,
      graphData,
      infoPanel: true,
      // nodeRadius: 25,
      onLabelNode: (node) =>
        node.properties?.name ||
        node.properties?.title ||
        node.id.toString() ||
        (node.labels ? node.labels[0] : ''),
      onNodeClick: (nodeSvg, node, event) => {
        if (d3.select(nodeSvg).attr('class').indexOf('selected') > 0) {
          d3.select(nodeSvg).attr('class', 'node')
        }
      },
      async onNodeDoubleClick(nodeSvg, node) {
        /* Get direct neighbours automatically */
        const data = await executeRedisCommand(
          getFetchDirectNeighboursOfNodeQuery(props.graphKey, node.id),
        )
        if (!commandIsSuccess(data)) return
        const parsedData = responseParser(data[0].response)

        const newNodeLabels = nodeLabels
        const newEdgeTypes = edgeTypes

        parsedData.nodes.forEach((n) => {
          nodeIds.add(n.id)
          n.labels.forEach(
            (l) => (newNodeLabels[l] = newNodeLabels[l] + 1 || 1),
          )
        })
        const filteredEdges = parsedData.edges
          .filter((e) => !edgeIds.has(e.id))
          .map((e) => ({
            ...e,
            startNode: e.source,
            endNode: e.target,
          }))
        filteredEdges.forEach((e) => {
          edgeIds.add(e.id)
          newEdgeTypes[e.type] = newEdgeTypes[e.type] + 1 || 1
        })

        graphd3.updateWithGraphData({
          results: [
            {
              columns: parsedData.headers,
              data: [
                {
                  graph: {
                    nodes: parsedData.nodes,
                    relationships: filteredEdges,
                  },
                },
              ],
            },
          ],
          errors: [],
        })

        setNodeLabels(newNodeLabels)
        setEdgeTypes(newEdgeTypes)
      },
      onRelationshipDoubleClick(relationship) {},
      onDisplayInfo: (infoSvg, entity) => {
        let property: string
        let entityColor: IGoodColor
        let t: EntityType

        if (entity.labels) {
          ;[property] = entity.labels
          entityColor = labelColors(property)
          t = EntityType.Node
        } else {
          property = entity.type
          entityColor = edgeColors(property)
          t = EntityType.Edge
        }

        setSelectedEntity({
          property,
          type: t,
          backgroundColor: entityColor.color,
          props: { '<id>': entity.id, ...entity.properties },
          color: entityColor.textColor,
        })
      },
      zoomFit: false,
    })

    setContainer(graphd3)
  }, [start])

  return (
    <div className="core-container" data-testid="query-graph-container">
      <div className="automatic-edges-switch">
        <RiTooltip
          position="bottom"
          delay={TOOLTIP_DELAY_LONG}
          content="Toggle visibility of automatically fetched relationships"
        >
          <RiSwitchInput
            title="All relationships"
            checked={showAutomaticEdges}
            onCheckedChange={() => {
              container.toggleShowAutomaticEdges()
              setShowAutomaticEdges(!showAutomaticEdges)
            }}
          />
        </RiTooltip>
      </div>
      <div className="d3-info">
        <div className="graph-legends">
          {Object.keys(nodeLabels).length > 0 && (
            <div className="d3-info-labels">
              {Object.keys(nodeLabels).map((item, i) => (
                <div
                  className="box-node-label"
                  style={{
                    backgroundColor: labelColors(item).color,
                    color: labelColors(item).textColor,
                  }}
                  key={item + i}
                >
                  {item}
                </div>
              ))}
            </div>
          )}
          {Object.keys(edgeTypes).length > 0 && (
            <div className="d3-info-labels">
              {Object.keys(edgeTypes).map((item, i) => (
                <div
                  key={item + i.toString()}
                  className="box-edge-type"
                  style={{
                    borderColor: edgeColors(item).color,
                    color: edgeColors(item).color,
                  }}
                >
                  {item}
                </div>
              ))}
            </div>
          )}
        </div>
        {selectedEntity && (
          <div className="info-component">
            <div className="info-header">
              {selectedEntity.type === EntityType.Node ? (
                <div
                  className="box-node-label"
                  style={{
                    backgroundColor: selectedEntity.backgroundColor,
                    color: selectedEntity.color,
                  }}
                >
                  {selectedEntity.property}
                </div>
              ) : (
                <div
                  className="box-edge-type"
                  style={{
                    borderColor: selectedEntity.backgroundColor,
                    color: selectedEntity.backgroundColor,
                  }}
                >
                  {selectedEntity.property}
                </div>
              )}
              <RiIconButton
                onClick={() => setSelectedEntity(null)}
                icon={CancelSlimIcon}
                aria-label="Close"
              />
            </div>
            <div className="info-props">
              {Object.keys(selectedEntity.props).map((k) => (
                <>
                  <div>{k}</div>
                  <div>{JSON.stringify(selectedEntity.props[k])}</div>
                </>
              ))}
            </div>
          </div>
        )}
      </div>
      <div ref={d3Container} id="graphd3" />
      <div
        style={{
          position: 'absolute',
          bottom: '110px',
          right: '10px',
          borderRadius: '4px',
          boxShadow: '0 1px 6px rgb(0 0 0 / 16%), 0 1px 6px rgb(0 0 0 / 23%)',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {[
          {
            name: 'Zoom In',
            onClick: () => container.zoomFuncs.zoomIn(),
            icon: 'magnifyWithPlus',
          },
          {
            name: 'Zoom Out',
            onClick: () => container.zoomFuncs.zoomOut(),
            icon: 'magnifyWithMinus',
          },
          {
            name: 'Reset Zoom',
            onClick: () => container.zoomFuncs.resetZoom(),
            icon: 'bullseye',
          },
          {
            name: 'Center',
            onClick: () => container.zoomFuncs.center(),
            icon: 'editorItemAlignCenter',
          },
        ].map((item) => (
          <RiTooltip position="left" content={item.name}>
            <RiIconButton
              onClick={item.onClick}
              icon={item.icon}
              aria-label={item.name}
            />
          </RiTooltip>
        ))}
      </div>
    </div>
  )
}
