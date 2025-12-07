function resolveProps(d: Object | Array<unknown>): any {
  if (!Array.isArray(d) && typeof d === 'object') {
    return d
  } else if (Array.isArray(d)) {
    const key = d[0]
    if (d.length === 2) {
      const value = d[1]
      return {
        key,
        value,
      }
    } else {
      return {
        key,
        value: d.filter((_, i) => i !== 0),
      }
    }
  }
}

interface INode {
  id: string
  labels: string[]
  properties: { [key: string]: string | number | object }
}

interface IEdge {
  id: string
  type: string
  source: string
  target: string
  properties: { [key: string]: string | number | object }
}

interface IResponseParser {
  nodes: INode[]
  edges: IEdge[]
  nodeIds: Set<string>
  edgeIds: Set<string>
  labels: { [key: string]: number }
  types: { [key: string]: number }
  headers: any
  hasNamedPathItem: boolean
  npNodeIds: string[]
  npEdgeIds: string[]
  danglingEdgeIds: Set<string>
}

function responseParser(data: any): IResponseParser {
  const headers = data[0]
  let nodes: INode[] = []
  let nodeIds = new Set<string>()
  let edgeIds = new Set<string>()
  let edges: IEdge[] = []
  let types: { [key: string]: number } = {}
  let labels: { [key: string]: number } = {}
  let hasNamedPathItem = false
  let npNodeIds: string[] = []
  let npEdgeIds: string[] = []
  let danglingEdgeIds = new Set<string>()
  if (data.length < 2)
    return {
      nodes,
      edges,
      types,
      labels,
      headers,
      nodeIds,
      edgeIds,
      hasNamedPathItem,
      npNodeIds,
      npEdgeIds,
      danglingEdgeIds,
    }

  const entries = data[1].map((entry: any) => {
    /* entry -> has headers number of items */
    entry.map((item: any) => {
      if (Array.isArray(item)) {
        if (item[0][0] === 'id' && item[1][0] === 'labels') {
          const node: INode = {
            id: item[0][1],
            labels: item[1][1],
            properties: {},
          }
          labels[item[1][1]] = labels[item[1][1]] + 1 || 1
          const propValues = item[2][1]
          propValues.map((x: any) => {
            const v = resolveProps(x)
            node['properties'][v.key] = v.value
          })
          if (nodes.findIndex((e: INode) => e.id === item[0][1]) === -1) {
            nodes.push(node)
          }
        } else if (item[0][0] === 'id' && item[1][0] === 'type') {
          const edge: IEdge = {
            id: item[0][1],
            type: item[1][1],
            source: item[2][1],
            target: item[3][1],
            properties: {},
          }
          types[item[1][1]] = types[item[1][1]] + 1 || 1
          const propValues = item[4][1]
          propValues.map((x: any) => {
            const v = resolveProps(x)
            edge['properties'][v.key] = v.value
          })
          if (!edgeIds.has(edge.id)) {
            edges.push(edge)
            edgeIds.add(edge.id)
          }
        } else {
          // unknown item?
        }
      } else if (typeof item === 'string') {
        try {
          // If named path response, try to parse it
          hasNamedPathItem = true
          let [nIds, eIds] = ParseEntitesFromNamedPathResponse(item)
          nodeIds = new Set([...nodeIds, ...nIds])
          edgeIds = new Set([...edgeIds, ...eIds])

          npNodeIds = Array.from(new Set([...npNodeIds, ...nIds]))
          npEdgeIds = Array.from(new Set([...npEdgeIds, ...eIds]))
        } catch {
          // maybe just a normal string
        }
      }
    })
  })

  danglingEdgeIds = new Set([...edgeIds].filter((eId) => !nodeIds.has(eId)))

  return {
    headers,
    nodes,
    edges,
    types,
    labels,
    nodeIds,
    edgeIds,
    hasNamedPathItem,
    npNodeIds,
    npEdgeIds,
    danglingEdgeIds,
  }
}

function ResultsParser(data: any[][]): { headers: any[]; results: any[] } {
  if (data.length === 0) return { headers: [], results: [] }

  const headers = data[0]
  const records = data[1]

  const results: any[] = []

  records.forEach((record: any[]) => {
    const result: any = {}
    record.forEach((entity, i) => {
      result[headers[i]] = {}
      if (Array.isArray(entity)) {
        if (entity[0][0] === 'id') {
          const item: any = {
            id: entity[0][1],
            properties: {},
          }
          let propValues = []
          if (entity[1][0] === 'labels') {
            item.labels = entity[1][1]
            propValues = entity[2][1]
          } else if (entity[1][0] === 'type') {
            item.type = entity[1][1]
            item.source = entity[2][1]
            item.target = entity[3][1]
            propValues = entity[4][1]
          }
          propValues.map((x: any) => {
            const v = resolveProps(x)
            item['properties'][v.key] = v.value
          })
          result[headers[i]] = item.properties /* here */
        } else {
          result[headers[i]] = entity
        }
      } else {
        result[headers[i]] = entity
      }
    })
    results.push(result)
  })
  return {
    headers,
    results,
  }
}

function isDigit(c: string): boolean {
  return '0' <= c && c <= '9'
}

function parseDigit(resp: string, i: number): [string, number] {
  let k = ''
  while (isDigit(resp[i])) {
    k += resp[i]
    i += 1
  }
  return [k, i]
}

function ParseEntitesFromNamedPathResponse(resp: string): [string[], string[]] {
  const EOF = -1
  let tok = 0
  let k = 1

  let nodes: string[] = []
  let edges: string[] = []

  while (tok !== EOF) {
    switch (resp[k]) {
      case '(':
        k += 1
        let nodeId = ''
        ;[nodeId, k] = parseDigit(resp, k)
        if (nodeId !== '') nodes.push(nodeId)
        else throw Error('Parse error: Unable to parse Node id')
        k += 1
        break
      case ' ':
        k += 1
        break
      case '[':
        k += 1
        let edgeId = ''
        ;[edgeId, k] = parseDigit(resp, k)
        if (edgeId !== '') edges.push(edgeId)
        else throw Error('Parse error: Unable to parse Edge id')
        k += 1
        break
      case ',':
        k += 1
        break
      case ']':
        if (k === resp.length - 1) {
          tok = EOF
        }
        break
      default:
        throw Error('Parse error: Unknown')
    }
  }

  return [nodes, edges]
}

export { responseParser, ResultsParser, ParseEntitesFromNamedPathResponse }
