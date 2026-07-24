import React, { type ComponentPropsWithoutRef } from 'react'
import ReactMarkdown, { type Components, type ExtraProps } from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { remarkRedisCodeBlock } from 'uiSrc/utils/formatters/markdown/remarkRedisCodeBlock'
import { safeUrl } from 'uiSrc/utils/formatters/markdown/safeUrl'
import { getFileUrlFromMd } from 'uiSrc/utils/pathUtil'
import { IS_ABSOLUTE_PATH } from 'uiSrc/constants/regex'
import { EXTERNAL_LINKS } from 'uiSrc/constants/links'
import { MarkdownRendererProps } from './MarkdownRenderer.types'

const REMARK_PLUGINS = [remarkGfm, remarkRedisCodeBlock]

// Flattens a react-markdown node's children into a plain string, for leaves
// (RedisCode/CodeBlock) that take string children instead of React nodes.
const nodeText = (children: React.ReactNode): string =>
  React.Children.toArray(children)
    .map((child) => (typeof child === 'string' ? child : ''))
    .join('')

/**
 * Shared markdown renderer for the tutorial pane and Copilot chat. Wraps
 * react-markdown with remark-gfm and remarkRedisCodeBlock (structured Redis
 * code fences), safeUrl (drops unsafe link/image schemes), and element
 * overrides that delegate to the caller-supplied leaf components. Renders
 * without rehype-raw, so raw HTML in the source is shown as escaped text
 * rather than parsed into elements.
 *
 * react-markdown's `components` map is typed to intrinsic HTML tag names, but
 * remarkRedisCodeBlock emits hast elements with custom tag names (rediscode/
 * codeblock/redisupload) via `data.hName`. Cast through `unknown` to add
 * those handlers alongside the built-in `a`/`img` overrides.
 */
export const MarkdownRenderer = ({
  children,
  path = '',
  components,
}: MarkdownRendererProps) => {
  const {
    RedisCode,
    CodeBlock,
    RedisUpload,
    ExternalLink,
    CloudLink,
    RedisInsightLink,
    Image,
  } = components

  const mapped = {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- react-markdown's node type is a generic hast Element; the custom hProperties shape is guaranteed by remarkRedisCodeBlock, not by react-markdown's types.
    rediscode: ({ node }: any) => {
      const {
        label = '',
        params = '',
        lang = 'redis',
        value = '',
      } = node?.properties || {}
      if (!RedisCode) return <code>{value}</code>
      return (
        <RedisCode label={label} params={params} lang={lang} path={path}>
          {value}
        </RedisCode>
      )
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- see rediscode above.
    codeblock: ({ node }: any) => {
      const { label = '', lang = '', value = '' } = node?.properties || {}
      if (!CodeBlock) return <code>{value}</code>
      return (
        <CodeBlock label={label} lang={lang}>
          {value}
        </CodeBlock>
      )
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- see rediscode above.
    redisupload: ({ node }: any) => {
      const { file = '', label = '' } = node?.properties || {}
      if (!RedisUpload) return null
      // RedisUpload resolves its own path (via getPathToResource), so it
      // needs a bare, decoded pathname rather than a full absolute URL.
      const resolved = decodeURI(new URL(getFileUrlFromMd(file, path)).pathname)
      return <RedisUpload label={label} path={resolved} />
    },
    a: ({
      href = '',
      title,
      children: linkChildren,
    }: ComponentPropsWithoutRef<'a'> & ExtraProps) => {
      const text = nodeText(linkChildren)

      if (href.toLowerCase().startsWith('redisinsight:')) {
        if (!RedisInsightLink) return <>{linkChildren}</>
        return (
          <RedisInsightLink
            url={href.replace('redisinsight:', '')}
            text={text || EXTERNAL_LINKS.redisIo}
          />
        )
      }

      if (title === 'Redis Cloud') {
        if (!CloudLink) return <>{linkChildren}</>
        return <CloudLink url={href} text={text || 'Redis Cloud'} />
      }

      if (IS_ABSOLUTE_PATH.test(href)) {
        if (!ExternalLink)
          return (
            <a href={href} target="_blank" rel="noopener noreferrer">
              {linkChildren}
            </a>
          )
        return <ExternalLink href={href}>{linkChildren}</ExternalLink>
      }

      return <a href={getFileUrlFromMd(href, path)}>{linkChildren}</a>
    },
    img: ({ src = '', alt }: ComponentPropsWithoutRef<'img'> & ExtraProps) => {
      const resolved = getFileUrlFromMd(src, path)
      if (!Image) return <img src={resolved} alt={alt || ''} />
      return <Image src={resolved} />
    },
  }

  return (
    <ReactMarkdown
      remarkPlugins={REMARK_PLUGINS}
      urlTransform={safeUrl}
      // react-markdown's Components type only allows intrinsic HTML tag
      // names as keys, but remarkRedisCodeBlock emits hast elements tagged
      // rediscode/codeblock/redisupload via data.hName. Cast through
      // unknown to register those handlers alongside the built-in a/img
      // overrides.
      components={mapped as unknown as Components}
    >
      {children}
    </ReactMarkdown>
  )
}
