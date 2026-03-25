import { visit } from 'unist-util-visit'
import { escapeJsxAttribute } from './escapeJsxAttribute'

export enum ButtonLang {
  Redis = 'redis',
}

const PARAMS_SEPARATOR = ':'

export const remarkCode =
  (codeOptions?: Record<string, any>): ((tree: Node) => void) =>
  (tree: any) => {
    visit(tree, 'code', (codeNode) => {
      const { value, meta, lang } = codeNode

      if (!lang && !codeOptions?.allLangs) return

      if (codeOptions?.allLangs) {
        const safeMeta = escapeJsxAttribute(meta || '')
        const safeLang = escapeJsxAttribute(lang || '')
        codeNode.type = 'html'
        codeNode.value = `<Code label="${safeMeta}" lang="${safeLang}">{${JSON.stringify(value)}}</Code>`
      }

      const isRedisLang = lang?.startsWith(ButtonLang.Redis)
      if (isRedisLang) {
        const [, params] = lang?.split(PARAMS_SEPARATOR) || []
        const safeMeta = escapeJsxAttribute(meta || '')
        const safeParams = escapeJsxAttribute(params || '')

        const jsonValue = JSON.stringify(value)
        codeNode.type = 'html'
        codeNode.value =
          `<Code label="${safeMeta}" params="${safeParams}"` +
          ` path={path} lang="redis">{${jsonValue}}</Code>`
      }
    })
  }
