import { visit } from 'unist-util-visit'

export enum ButtonLang {
  Redis = 'redis',
}

const PARAMS_SEPARATOR = ':'

export const remarkCode =
  (codeOptions?: Record<string, any>): ((tree: Node) => void) =>
  (tree: any) => {
    // Find code node in syntax tree
    visit(tree, 'code', (codeNode) => {
      const { value, meta, lang } = codeNode

      if (!lang && !codeOptions?.allLangs) return

      if (codeOptions?.allLangs) {
        codeNode.type = 'html'
        codeNode.value = `<Code label="${meta || ''}" lang="${lang}">{${JSON.stringify(value)}}</Code>`
      }

      const isRedisLang = lang?.startsWith(ButtonLang.Redis)
      if (isRedisLang) {
        const [, params] = lang?.split(PARAMS_SEPARATOR) || []

        codeNode.type = 'html'
        // Replace it with our custom component
        // path - binding for JsxParser, it will be replaces as prop value
        codeNode.value = `<Code label="${meta || ''}" params="${params}" path={path} lang="redis">{${JSON.stringify(value)}}</Code>`
      }
    })
  }
