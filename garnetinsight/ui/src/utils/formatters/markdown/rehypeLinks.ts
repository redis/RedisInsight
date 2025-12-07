import { visit } from 'unist-util-visit'
import { createLocation, History } from 'history'
import { IS_ABSOLUTE_PATH } from 'uiSrc/constants/regex'

interface IConfig {
  history: History
}

export const rehypeLinks =
  (config?: IConfig): ((tree: Node) => void) =>
  (tree: any) => {
    visit(tree, 'link', (node) => {
      if (
        node.tagName === 'a' &&
        node.properties &&
        typeof node.properties.href === 'string'
      ) {
        const url: string = node.properties.href
        if (IS_ABSOLUTE_PATH.test(url)) {
          delete node.properties.title
        }
        if (url.startsWith('#') && config?.history) {
          const { location: currentLocation } = config.history
          const newLocation = createLocation(url, null, '', currentLocation)
          newLocation.search = currentLocation.search
          node.properties.href = config.history.createHref(newLocation)
        }
      }
    })
  }
