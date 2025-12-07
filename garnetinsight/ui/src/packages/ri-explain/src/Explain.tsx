/* eslint-disable no-restricted-globals */
import React, { useEffect, useState, useRef } from 'react'
import { Model, Graph } from '@antv/x6'
import { register } from '@antv/x6-react-shape'
import Hierarchy from '@antv/hierarchy'
import { formatRedisReply } from 'garnetinsight-plugin-sdk'

import { RiIcon } from 'uiSrc/components/base/icons/RiIcon'
import { RiTooltip } from 'uiSrc/components/base/tooltip/RITooltip'
import { IconButton } from 'uiSrc/components/base/forms/buttons'

import {
  EDGE_COLOR_BODY_DARK,
  EDGE_COLOR_BODY_LIGHT,
  NODE_COLOR_BODY_DARK,
  NODE_COLOR_BODY_LIGHT,
} from './constants'

import {
  CoreType,
  ModuleType,
  EntityInfo,
  ParseExplain,
  ParseGraphV2,
  ParseProfile,
  GetAncestors,
  GetTotalExecutionTime,
  transformProfileResult,
  findFlatProfile,
} from './parser'
import { ExplainNode, ProfileNode } from './Node'

interface IExplain {
  command: string
  data: [{ response: string[] | string | any }]
}

function getEdgeSize(c: number) {
  return Math.floor(Math.log(c || 1) + 1)
}

function getNodeColor(isDarkTheme: boolean) {
  return isDarkTheme ? NODE_COLOR_BODY_DARK : NODE_COLOR_BODY_LIGHT
}

function getEdgeColor(isDarkTheme: boolean) {
  return isDarkTheme ? EDGE_COLOR_BODY_DARK : EDGE_COLOR_BODY_LIGHT
}

export default function Explain({ command, data }: IExplain): JSX.Element {
  const cmd = command.split(' ')[0].toLowerCase()
  useEffect(() => {
    if (cmd === 'ft.profile') {
      const getParsedResponse = async () => {
        const formattedResponse = await formatRedisReply(
          data[0].response,
          command,
        )
        setParsedRedisReply(formattedResponse)
      }
      getParsedResponse()
    }
  }, [cmd])
  const [parsedRedisReply, setParsedRedisReply] = useState('')

  if (cmd.startsWith('graph')) {
    const info = data[0].response
    const resp = ParseGraphV2(info)

    let profilingTime: IProfilingTime = {}
    const t = command.endsWith('explain') ? CoreType.Explain : CoreType.Profile
    if (t === CoreType.Profile) {
      profilingTime = {
        'Total Execution Time': GetTotalExecutionTime(resp),
      }
    }

    return (
      <ExplainDraw
        data={resp}
        module={ModuleType.Graph}
        type={t}
        profilingTime={profilingTime}
      />
    )
  }

  const module = ModuleType.Search

  if (cmd === 'ft.profile') {
    try {
      const isNewResponse = typeof data[0].response[1]?.[0] === 'string'

      const [, profiles] = data[0].response || []
      const transformedProfiles = isNewResponse
        ? profiles
        : transformProfileResult(profiles)
      const [shard] = findFlatProfile('Shards', transformedProfiles)
      const profileInfo: EntityInfo = ParseProfile(shard)

      const profilingTime = {
        'Total Profile Time': findFlatProfile('Total Profile Time', shard),
        'Parsing Time': findFlatProfile('Parsing Time', shard),
        'Pipeline Creation Time': findFlatProfile(
          'Pipeline Creation Time',
          shard,
        ),
      }

      return (
        <ExplainDraw
          data={profileInfo}
          module={module}
          type={CoreType.Profile}
          profilingTime={profilingTime}
        />
      )
    } catch (e) {
      console.error(e)

      return (
        <>
          <div className="responseFail">
            Some error happened during parsing the data.
          </div>
          <div className="parsedRedisReply">{parsedRedisReply}</div>
        </>
      )
    }
  }

  const resp = data[0].response

  const explainDrawData = ParseExplain(
    Array.isArray(resp) ? resp.join('\n') : resp.split('\\n').join('\n'),
  )
  return (
    <ExplainDraw
      data={explainDrawData}
      module={module}
      type={CoreType.Explain}
    />
  )
}

register({
  shape: 'react-explain-node',
  width: 100,
  height: 100,
  component: ExplainNode as any,
})

register({
  shape: 'react-profile-node',
  width: 100,
  height: 100,
  component: ProfileNode as any,
})

const isDarkTheme = document.body.classList.contains('theme_DARK')

interface IProfilingTime {
  [key: string]: string
}

function ExplainDraw({
  data,
  type,
  module,
  profilingTime,
}: {
  data: any
  type: CoreType
  module: ModuleType
  profilingTime?: IProfilingTime
}): JSX.Element {
  const container = useRef<HTMLDivElement | null>(null)

  const [done, setDone] = useState(false)
  const [collapse, setCollapse] = useState(type !== CoreType.Profile)
  const [isFullScreen, setIsFullScreen] = useState(false)
  const [core, setCore] = useState<Graph>()

  function resize() {
    const isFullScreen =
      parent.document.body.getElementsByClassName('fullscreen').length > 0
    const b = core?.getAllCellsBBox()
    const width = Math.max((b?.width || 1080) + 100, document.body.offsetWidth)
    if (isFullScreen) {
      setIsFullScreen(true)
      const height = Math.max(
        (b?.height || 585) + 100,
        parent.document.body.offsetHeight,
      )
      if (type !== CoreType.Profile && collapse) {
        core?.resize(width, window.outerHeight - 250)
        core?.positionContent('top')
      } else {
        core?.resize(width, height)
      }
    } else {
      setIsFullScreen(false)
      if (type !== CoreType.Profile && collapse) {
        core?.resize(width, 400)
        core?.positionContent('top')
      } else {
        core?.resize(width, (b?.height || 585) + 100)
      }
    }
  }

  window.addEventListener('resize', resize)
  useEffect(() => {
    if (done) return
    setDone(true)

    const graph = new Graph({
      container: container?.current as HTMLElement,
      autoResize: false,
      interacting: false,
      background: {
        color: isDarkTheme ? 'black' : 'white',
      },
      translating: {
        restrict: true,
      },
      async: true,
      virtual: false, // if set to true, only visible parts of the graph will be rendered,
      // which can improve performance, but may cause some issues with missing edges
      panning: true,
    })

    setCore(graph)

    graph.on('resize', () => graph.centerContent())
    graph.on('node:mouseenter', (x) => {
      const { id } = x.node.getData()
      // Find ancestors of a node
      const ancestors = GetAncestors(data, id, { found: false, pairs: [] })
      ancestors.pairs.forEach((p) => {
        // Highlight ancestor and their ancestor
        document
          .querySelector(`#node-${p[0]}`)
          ?.setAttribute('style', 'outline: 1px solid #85A2FE !important;')
        // Get edge size of parent ancestor to apply the right edge stroke
        const edge = graph.getCellById(`${p[0]}-${p[1]}`)
        const edgeColor = '#85A2FE'
        edge.setAttrs({
          line: {
            stroke: edgeColor,
            strokeWidth: (edge.getAttrs() as any)?.line?.strokeWidth,
          },
        })
      })
    })

    graph.on('node:mouseleave', (x) => {
      const { id } = x.node.getData()
      const ancestors = GetAncestors(data, id, { found: false, pairs: [] })
      ancestors.pairs.forEach((p) => {
        document.querySelector(`#node-${p[0]}`)?.setAttribute('style', '')
        const edge = graph.getCellById(`${p[0]}-${p[1]}`)
        const edgeColor = getEdgeColor(isDarkTheme)
        edge.setAttrs({
          line: {
            stroke: edgeColor,
            strokeWidth: (edge.getAttrs() as any)?.line?.strokeWidth,
          },
        })
      })
    })

    resize()

    const result = Hierarchy.compactBox(data, {
      direction: 'BT',
      getHeight() {
        return 200
      },
      getWidth() {
        return 250
      },
      getHGap() {
        return 50
      },
      getVGap() {
        return 0
      },
      nodeSep: type === CoreType.Explain ? 250 : 350,
      rankSep: 150,
      subTreeSep: 0,
    })

    const model: Model.FromJSONData = { nodes: [], edges: [] }
    const traverse = (data: any) => {
      if (data) {
        const info = data.data as EntityInfo

        // snippet if prefix with parent suffix will always be followed by ':'.
        //
        // Currently snippets are passed to child only for TAG
        // expressions which has ':' at the center.
        //
        // Example child data with parent snippet: <PARENT_SNIPPET>:<DATA>
        if (
          !info.snippet &&
          info.parentSnippet &&
          info.data?.startsWith(`${info.parentSnippet}:`)
        ) {
          info.data = info.data.substr(info.parentSnippet.length + 1)
          info.snippet = info.parentSnippet
        }

        if (module === ModuleType.Graph) {
          info.recordsProduced = info.counter
          delete info.counter
          delete info.size
        }

        let nodeProps = {
          shape: 'react-explain-node',
          width: 240,
          height: info.snippet ? 64 : 42,
        }
        if (type === CoreType.Profile) {
          nodeProps = {
            shape: 'react-profile-node',
            width: 320,
            height: info.snippet ? 114 : 86,
          }
        }

        const portId = `${data.id}-source`
        const targetPort = {}
        const targetItem: any = []
        if (info.parentId) {
          targetItem.push({
            id: `${info.id}-${info.parentId}-target`,
            group: `${info.parentId}-target`,
          })
          targetPort[`${info.parentId}-target`] = {
            position: { name: 'bottom' },
            attrs: {
              circle: {
                r: 0,
              },
            },
          }
        }
        model.nodes?.push({
          id: data.id,
          x: (data.x || 0) + document.body.clientWidth / 2,
          y: (data.y || 0) + document.body.clientHeight,
          ...nodeProps,
          data: info,
          attrs: {
            body: {
              fill: getNodeColor(isDarkTheme),
              stroke: 'transparent',
            },
          },
          ports: {
            groups: {
              [portId]: {
                position: { name: 'top' },
                attrs: {
                  circle: {
                    r: 0,
                  },
                },
              },
              ...targetPort,
            },
            items: [
              ...data.children.map((c: { id: string }) => ({
                id: `${data.id}-${c.id}`,
                group: portId,
              })),
              ...targetItem,
            ],
          },
        })
      }
      if (data.children) {
        data.children.forEach((item: any) => {
          const itemRecords = parseInt(item.data.counter || 0)
          const edgeColor = getEdgeColor(isDarkTheme)
          model.edges?.push({
            id: `${data.id}-${item.id}`,
            source: {
              cell: data.id,
              port: `${data.id}-${item.id}`,
            },
            target: {
              cell: item.id,
              port: `${data.id}-${item.id}`,
            },
            router: {
              name: 'manhattan',
              args: {
                startDirections: ['top'],
                endDirections: ['bottom'],
                // cost: 33,
                // step: 10,
                padding: {
                  top: 15,
                  bottom: 10,
                  right: 20,
                  left: 10,
                },
              },
            },
            attrs: {
              line: {
                stroke: edgeColor,
                strokeWidth: getEdgeSize(itemRecords),
                targetMarker: null,
              },
            },
          })
          traverse(item)
        })
      }
    }
    traverse(result)

    graph.fromJSON(model)
    graph.centerContent()
  }, [done])

  const ele = document.querySelector('#container-parent')

  let pos = { top: 0, left: 0, x: 0, y: 0 }

  const mouseMoveHandler = (e: MouseEvent) => {
    // How far the mouse has been moved
    const dx = e.clientX - pos.x
    const dy = e.clientY - pos.y

    // Scroll the element
    if (ele) {
      ele.scrollTop = pos.top - dy
      ele.scrollLeft = pos.left - dx
    }
  }

  const mouseUpHandler = () => {
    document.removeEventListener('mousemove', mouseMoveHandler)
    document.removeEventListener('mouseup', mouseUpHandler)
  }

  const mouseDownHandler = (e: MouseEvent) => {
    pos = {
      // The current scroll
      left: ele?.scrollLeft || 0,
      top: ele?.scrollTop || 0,
      // Get the current mouse position
      x: e.clientX,
      y: e.clientY,
    }

    document.addEventListener('mousemove', mouseMoveHandler)
    setTimeout(() => document.addEventListener('mouseup', mouseUpHandler), 100)
  }

  ele?.addEventListener('mousedown', mouseDownHandler as EventListener)

  if (type !== CoreType.Profile && collapse) {
    core?.resize(undefined, isFullScreen ? window.outerHeight - 250 : 400)
    core?.positionContent('top')
  } else {
    core?.resize(undefined, core?.getContentBBox().height + 100)
  }

  return (
    <div>
      {type !== CoreType.Profile && collapse && (
        <div style={{ paddingTop: '50px' }} />
      )}
      <div
        id="container-parent"
        style={{
          height: isFullScreen
            ? `${window.outerHeight - 170}px`
            : type !== CoreType.Profile && collapse
              ? '500px'
              : '585px',
          width: '100%',
          overflow: 'auto',
        }}
      >
        <div
          style={{ margin: 0, width: '100vw' }}
          ref={container}
          id="container"
        />
        {!collapse && (
          <div className="ZoomMenu">
            {[
              {
                name: 'Zoom In',
                onClick: () => {
                  setTimeout(
                    () => document.addEventListener('mouseup', mouseUpHandler),
                    100,
                  )
                  core && Math.floor(core.zoom()) <= 3 && core?.zoom(0.5)
                  core?.resize(undefined, core?.getContentBBox().height + 50)
                },
                // icon: 'magnifyWithPlus', TODO: needs replacement
                icon: 'PlusSlimIcon',
              },
              {
                name: 'Zoom Out',
                onClick: () => {
                  setTimeout(
                    () => document.addEventListener('mouseup', mouseUpHandler),
                    100,
                  )
                  if (Math.floor(core?.zoom() || 0) <= 0.5) {
                    core?.centerContent()
                  } else {
                    core?.zoom(-0.5)
                  }
                  core?.resize(undefined, core?.getContentBBox().height + 50)
                },
                // icon: 'magnifyWithMinus', TODO: needs replacement
                icon: 'MinusIcon',
              },
              {
                name: 'Reset Zoom',
                onClick: () => {
                  setTimeout(
                    () => document.addEventListener('mouseup', mouseUpHandler),
                    100,
                  )
                  core?.zoomTo(1)
                  core?.resize(undefined, core?.getContentBBox().height + 50)
                },
                // icon: 'bullseye', TODO: needs replacement
                icon: 'IndicatorXIcon',
              },
            ].map((item) => (
              <RiTooltip position="left" content={item.name}>
                <IconButton
                  color="text"
                  onClick={item.onClick}
                  icon={item.icon}
                  aria-label={item.name}
                />
              </RiTooltip>
            ))}
          </div>
        )}
        {type !== CoreType.Profile && (
          <div
            style={{
              paddingBottom:
                isFullScreen && profilingTime && ModuleType.Search
                  ? '60px'
                  : '35px',
            }}
            className="CollapseButton"
            onClick={(e) => {
              e.preventDefault()
              setTimeout(
                () => document.addEventListener('mouseup', mouseUpHandler),
                100,
              )
              if (!collapse) {
                // About to collapse?
                core?.zoomTo(1)
                core?.resize(undefined, core?.getContentBBox().height + 50)
              }
              setCollapse(!collapse)
            }}
            role="button"
            tabIndex={-1}
          >
            {collapse ? (
              <>
                <div>Expand</div>
                <RiIcon className="NodeIcon" size="m" type="ArrowDownIcon" />
              </>
            ) : (
              <>
                <div>Collapse</div>
                <RiIcon className="NodeIcon" size="m" type="ArrowUpIcon" />
              </>
            )}
          </div>
        )}
        {profilingTime && module === ModuleType.Search && (
          <div className="ProfileInfo ProfileTimeInfo">
            {Object.keys(profilingTime).map((key) => (
              <div className="Item">
                <div className="Value">{profilingTime[key]}</div>
                <div className="Key">{key}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
