import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkRehype from 'remark-rehype'
import remarkGfm from 'remark-gfm'
import rehypeStringify from 'rehype-stringify'

import {
  remarkRedisUpload,
  remarkLink,
  rehypeLinks,
  rehypeWrapSymbols,
  remarkImage,
  remarkCode,
  remarkSanitize,
  remarkWrapHtmlSymbols,
} from 'uiSrc/utils/formatters/markdown'
import { IFormatter, IFormatterConfig } from './formatter.interfaces'

class MarkdownToJsxString implements IFormatter {
  format(input: any, config?: IFormatterConfig): Promise<string> {
    const { data, path = '', codeOptions = {} } = input
    return new Promise((resolve, reject) => {
      unified()
        .use(remarkParse)
        .use(remarkSanitize)
        .use(remarkGfm) // support GitHub Flavored Markdown
        .use(remarkWrapHtmlSymbols) // Neutralize JSX braces in raw HTML before custom components are emitted
        .use(remarkRedisUpload, path) // Add custom component for redis-upload code block
        .use(remarkCode, codeOptions) // Add custom component for Redis code block
        .use(remarkImage, path) // Add custom component for Redis code block
        .use(remarkLink) // Customise links
        .use(remarkRehype, { allowDangerousHtml: true }) // Pass raw HTML strings through.
        .use(rehypeLinks, config ? { history: config.history } : undefined) // Customise links
        .use(rehypeWrapSymbols) // Wrap special symbols inside curly braces for JSX parse
        .use(rehypeStringify, { allowDangerousHtml: true }) // Serialize the raw HTML strings
        .process(data)
        .then((file) => {
          resolve(String(file))
        })
        .catch((error) => reject(error))
    })
  }
}

export default MarkdownToJsxString
