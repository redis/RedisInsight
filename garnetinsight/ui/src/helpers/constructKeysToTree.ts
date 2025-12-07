import { SortOrder } from 'uiSrc/constants'
import { IKeyPropTypes } from 'uiSrc/constants/prop-types/keys'

interface Props {
  items: IKeyPropTypes[]
  delimiterPattern?: string
  delimiters?: string[]
  sorting?: SortOrder
}

export const constructKeysToTree = (props: Props): any[] => {
  const {
    items: keys,
    delimiterPattern = ':',
    delimiters = [],
    sorting = 'ASC',
  } = props
  const keysSymbol = `keys${delimiterPattern}keys`
  const tree: any = {}

  keys.forEach((key: any) => {
    // eslint-disable-next-line prefer-object-spread
    let currentNode: any = tree
    const { nameString: name = '' } = key
    const nameSplitted = name.split(new RegExp(delimiterPattern, 'g'))
    const lastIndex = nameSplitted.length - 1

    nameSplitted.forEach((value: any, index: number) => {
      // create a key leaf
      if (index === lastIndex) {
        // eslint-disable-next-line prefer-object-spread
        currentNode[name + keysSymbol] = Object.assign({}, key, {
          isLeaf: true,
        })
      } else if (currentNode[value] === undefined) {
        currentNode[value] = {}
      }

      currentNode = currentNode[value]
    })
  })

  const ids: any = {}

  // common functions
  const getUniqueId = (): number | string => {
    const candidateId = Math.random().toString(36)

    if (ids[candidateId]) {
      return getUniqueId()
    }

    ids[candidateId] = true
    return candidateId
  }

  // Folders should be always before leaves
  const sortKeysAndFolder = (nodes: string[]) => {
    nodes.sort((a, b) => {
      // Custom sorting for items ending with "keys:keys"
      if (a.endsWith(keysSymbol) && !b.endsWith(keysSymbol)) {
        return 1
      }
      if (!a.endsWith(keysSymbol) && b.endsWith(keysSymbol)) {
        return -1
      }

      // Regular sorting
      if (sorting === 'ASC') {
        return a.localeCompare(b, 'en')
      }
      if (sorting === 'DESC') {
        return b.localeCompare(a, 'en')
      }

      return 0
    })
  }

  // FormatTreeData
  const formatTreeData = (
    tree: any,
    previousKey = '',
    delimiter = ':',
    prevIndex = '',
  ) => {
    const treeNodes: string[] = Object.keys(tree)

    sortKeysAndFolder(treeNodes)

    return treeNodes.map((key, index) => {
      const name = key?.toString()
      const node: any = { nameString: name }
      const path = prevIndex ? `${prevIndex}.${index}` : `${index}`

      // populate node with children nodes
      if (!tree[key].isLeaf && Object.keys(tree[key]).length > 0) {
        const delimiterView = delimiters.length === 1 ? delimiters[0] : '-'
        node.children = formatTreeData(
          tree[key],
          `${previousKey + name + delimiterView}`,
          delimiter,
          path,
        )
        node.keyCount = node.children.reduce(
          (a: any, b: any) => a + (b.keyCount || 1),
          0,
        )
        node.keyApproximate = (node.keyCount / keys.length) * 100
        node.fullName = previousKey + name
      } else {
        // populate leaf
        node.isLeaf = true
        node.children = []
        node.nameString = name.slice(0, -keysSymbol.length)
        node.nameBuffer = tree[key]?.name
        node.fullName = previousKey + name + delimiter
      }

      node.path = path
      node.id = getUniqueId()
      return node
    })
  }

  return formatTreeData(tree, '', delimiterPattern)
}
