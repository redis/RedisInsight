import React, { type ComponentPropsWithoutRef, useMemo } from 'react'
import ReactMarkdown, { type Components, type ExtraProps } from 'react-markdown'
import remarkGfm from 'remark-gfm'
import type { PluggableList } from 'unified'
import { remarkRedisCodeBlock } from 'uiSrc/utils/formatters/markdown/remarkRedisCodeBlock'
import { remarkRedisInsightLink } from 'uiSrc/utils/formatters/markdown/remarkRedisInsightLink'
import { safeUrl } from 'uiSrc/utils/formatters/markdown/safeUrl'
import { getFileUrlFromMd } from 'uiSrc/utils/pathUtil'
import { IS_ABSOLUTE_PATH } from 'uiSrc/constants/regex'
import { MarkdownRendererProps } from './MarkdownRenderer.types'

// Flattens a react-markdown node's children into a plain string, for leaves
// (RedisCode/CodeBlock) that take string children instead of React nodes.
const nodeText = (children: React.ReactNode): string =>
  React.Children.toArray(children)
    .map((child) => (typeof child === 'string' ? child : ''))
    .join('')

/**
 * Shared markdown renderer for the tutorial pane and Copilot chat. Wraps
 * react-markdown with remark-gfm, remarkRedisCodeBlock (structured Redis code
 * fences), and remarkRedisInsightLink (structured redisinsight: links), plus
 * safeUrl (drops unsafe link/image schemes) and element overrides that
 * delegate to the caller-supplied leaf components. Renders without
 * rehype-raw, so raw HTML in the source is shown as escaped text rather than
 * parsed into elements.
 *
 * react-markdown's `components` map is typed to intrinsic HTML tag names, but
 * remarkRedisCodeBlock/remarkRedisInsightLink emit hast elements with custom
 * tag names (rediscode/codeblock/redisupload/redisinsightlink) via
 * `data.hName`. Cast through `unknown` to add those handlers alongside the
 * built-in `a`/`img` overrides.
 */
export const MarkdownRenderer = ({
  children,
  path = '',
  components,
  allLangs = false,
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

  const remarkPlugins: PluggableList = useMemo(
    () => [
      remarkGfm,
      [remarkRedisCodeBlock, { allLangs }],
      remarkRedisInsightLink,
    ],
    [allLangs],
  )

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
      // A malformed `file` can make `new URL`/`decodeURI` throw (URIError);
      // skip the block rather than crash the render tree.
      let resolved: string
      try {
        resolved = decodeURI(new URL(getFileUrlFromMd(file, path)).pathname)
      } catch {
        return null
      }
      return <RedisUpload label={label} path={resolved} />
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- see rediscode above.
    redisinsightlink: ({ node }: any) => {
      const { url = '', text = '' } = node?.properties || {}
      if (!RedisInsightLink) return <>{text}</>
      return <RedisInsightLink url={url} text={text} />
    },
    a: ({
      href = '',
      title,
      children: linkChildren,
    }: ComponentPropsWithoutRef<'a'> & ExtraProps) => {
      const text = nodeText(linkChildren)

      // redisinsight: links never reach this handler with their scheme
      // intact: safeUrl's allowlist strips unknown schemes before urlTransform
      // returns, so they're rewritten to structured redisinsightlink nodes by
      // remarkRedisInsightLink in the remark phase, before sanitization runs.
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

      // In-page anchors must keep their href unchanged: resolving them
      // against `path` via getFileUrlFromMd would rewrite `#section` into an
      // absolute file URL and lose the hash.
      if (href.startsWith('#')) return <a href={href}>{linkChildren}</a>

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
      remarkPlugins={remarkPlugins}
      urlTransform={safeUrl}
      // react-markdown's Components type only allows intrinsic HTML tag
      // names as keys, but our remark plugins emit hast elements tagged
      // rediscode/codeblock/redisupload/redisinsightlink via data.hName.
      // Cast through unknown to register those handlers alongside the
      // built-in a/img overrides.
      components={mapped as unknown as Components}
    >
      {children}
    </ReactMarkdown>
  )
}
