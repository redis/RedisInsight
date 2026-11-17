import React, { type ComponentPropsWithoutRef, memo, useMemo } from 'react'
import ReactMarkdown, { type Components, type ExtraProps } from 'react-markdown'
import remarkGfm from 'remark-gfm'
import type { PluggableList } from 'unified'
import { remarkRedisCodeBlock } from 'uiSrc/utils/formatters/markdown/remarkRedisCodeBlock'
import { remarkRedisInsightLink } from 'uiSrc/utils/formatters/markdown/remarkRedisInsightLink'
import { safeUrl } from 'uiSrc/utils/formatters/markdown/safeUrl'
import { getFileUrlFromMd } from 'uiSrc/utils/pathUtil'
import { IS_ABSOLUTE_PATH } from 'uiSrc/constants/regex'
import i18n from 'uiSrc/i18n'
import {
  MarkdownRendererProps,
  MarkdownLeafComponents,
} from './MarkdownRenderer.types'

// Flattens a react-markdown node's children into a plain string, for leaves
// (RedisCode/CodeBlock) that take string children instead of React nodes.
const nodeText = (children: React.ReactNode): string =>
  React.Children.toArray(children)
    .map((child) => (typeof child === 'string' ? child : ''))
    .join('')

// The rediscode/codeblock/redisupload/redisinsightlink nodes are hast elements
// tagged via remarkRedisCodeBlock/remarkRedisInsightLink's `data.hName`; their
// `properties` shape is guaranteed by those plugins, not by react-markdown's
// generic node type, so the node arg is typed loosely here.
/* eslint-disable @typescript-eslint/no-explicit-any */

// Renders a Redis code fence via the caller's RedisCode leaf (with a Run
// button), falling back to plain code when no leaf is supplied.
export const makeRedisCodeElement = (
  RedisCode: MarkdownLeafComponents['RedisCode'] | undefined,
  path: string,
) =>
  function RedisCodeElement({ node }: any) {
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
  }

// Renders a non-Redis code fence via the caller's CodeBlock leaf (Copilot
// only; tutorials leave these as plain code), falling back to plain code.
export const makeCodeBlockElement = (
  CodeBlock: MarkdownLeafComponents['CodeBlock'] | undefined,
) =>
  function CodeBlockElement({ node }: any) {
    const { label = '', lang = '', value = '' } = node?.properties || {}
    if (!CodeBlock) return <code>{value}</code>
    return (
      <CodeBlock label={label} lang={lang}>
        {value}
      </CodeBlock>
    )
  }

// Renders a redis-upload fence via the caller's RedisUpload leaf.
export const makeRedisUploadElement = (
  RedisUpload: MarkdownLeafComponents['RedisUpload'] | undefined,
  path: string,
) =>
  function RedisUploadElement({ node }: any) {
    const { file = '', label = '' } = node?.properties || {}
    if (!RedisUpload) return null
    // RedisUpload resolves its own path (via getPathToResource), so it needs a
    // bare, decoded pathname rather than a full absolute URL. A malformed
    // `file` can make `new URL`/`decodeURI` throw (URIError); skip the block
    // rather than crash the render tree.
    let resolved: string
    try {
      resolved = decodeURI(new URL(getFileUrlFromMd(file, path)).pathname)
    } catch {
      return null
    }
    return <RedisUpload label={label} path={resolved} />
  }

// Renders a redisinsight: link (structured by remarkRedisInsightLink) via the
// caller's RedisInsightLink leaf.
export const makeRedisInsightLinkElement = (
  RedisInsightLink: MarkdownLeafComponents['RedisInsightLink'] | undefined,
) =>
  function RedisInsightLinkElement({ node }: any) {
    const { url = '', text = '' } = node?.properties || {}
    if (!RedisInsightLink) return <>{text}</>
    return <RedisInsightLink url={url} text={text} />
  }

/* eslint-enable @typescript-eslint/no-explicit-any */

// Routes a markdown link: inert when neutralized, CloudLink for Redis Cloud
// links, the caller's ExternalLink for absolute URLs, and a plain anchor for
// in-page hashes and relative paths (resolved against `path`).
export const makeLinkElement = (
  ExternalLink: MarkdownLeafComponents['ExternalLink'] | undefined,
  CloudLink: MarkdownLeafComponents['CloudLink'] | undefined,
  path: string,
) =>
  function LinkElement({
    href = '',
    title,
    children: linkChildren,
  }: ComponentPropsWithoutRef<'a'> & ExtraProps) {
    // safeUrl (urlTransform) neutralizes dangerous schemes (e.g. javascript:)
    // to an empty href before this handler runs. Render an inert anchor with
    // no href instead of falling through to getFileUrlFromMd, which would
    // resolve '' into a navigable page URL.
    if (!href) return <a>{linkChildren}</a>

    const text = nodeText(linkChildren)

    // redisinsight: links never reach this handler with their scheme intact:
    // safeUrl's allowlist strips unknown schemes, so remarkRedisInsightLink
    // rewrites them to structured redisinsightlink nodes in the remark phase,
    // before sanitization runs.
    if (title === 'Redis Cloud') {
      if (!CloudLink) return <>{linkChildren}</>
      return <CloudLink url={href} text={text || i18n.t('common.redisCloud')} />
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

    // In-page anchors must keep their href unchanged: resolving them against
    // `path` via getFileUrlFromMd would rewrite `#section` into an absolute
    // file URL and lose the hash.
    if (href.startsWith('#')) return <a href={href}>{linkChildren}</a>

    return <a href={getFileUrlFromMd(href, path)}>{linkChildren}</a>
  }

// Renders an image via the caller's Image leaf, resolving relative sources
// against `path`.
export const makeImageElement = (
  Image: MarkdownLeafComponents['Image'] | undefined,
  path: string,
) =>
  function ImageElement({
    src = '',
    alt,
  }: ComponentPropsWithoutRef<'img'> & ExtraProps) {
    // An empty src means safeUrl neutralized a disallowed URL; render nothing
    // rather than resolving '' into a valid page URL.
    if (!src) return null
    const resolved = getFileUrlFromMd(src, path)
    if (!Image) return <img src={resolved} alt={alt || ''} />
    return <Image src={resolved} />
  }

/**
 * Shared markdown renderer for the tutorial pane and Copilot chat. Wraps
 * react-markdown with remark-gfm, remarkRedisCodeBlock (structured Redis code
 * fences), and remarkRedisInsightLink (structured redisinsight: links), plus
 * safeUrl (drops unsafe link/image schemes) and element overrides that
 * delegate to the caller-supplied leaf components. Renders without rehype-raw,
 * so raw HTML in the source is shown as escaped text rather than parsed into
 * elements.
 *
 * react-markdown's `components` map is typed to intrinsic HTML tag names, but
 * remarkRedisCodeBlock/remarkRedisInsightLink emit hast elements with custom
 * tag names (rediscode/codeblock/redisupload/redisinsightlink) via
 * `data.hName`. Cast through `unknown` to add those handlers alongside the
 * built-in `a`/`img` overrides.
 */
export const MarkdownRenderer = memo(function MarkdownRenderer({
  children,
  path = '',
  components,
  allLangs = false,
}: MarkdownRendererProps) {
  const remarkPlugins: PluggableList = useMemo(
    () => [
      remarkGfm,
      [remarkRedisCodeBlock, { allLangs }],
      remarkRedisInsightLink,
    ],
    [allLangs],
  )

  // Memoized on [components, path] (the only things the element components
  // close over) so a caller passing a stable `components` prop and `path`
  // gets a stable map, and ReactMarkdown doesn't re-render its whole tree on
  // unrelated parent re-renders.
  const mapped = useMemo(
    () => ({
      rediscode: makeRedisCodeElement(components.RedisCode, path),
      codeblock: makeCodeBlockElement(components.CodeBlock),
      redisupload: makeRedisUploadElement(components.RedisUpload, path),
      redisinsightlink: makeRedisInsightLinkElement(
        components.RedisInsightLink,
      ),
      a: makeLinkElement(components.ExternalLink, components.CloudLink, path),
      img: makeImageElement(components.Image, path),
    }),
    [components, path],
  )

  return (
    <ReactMarkdown
      remarkPlugins={remarkPlugins}
      urlTransform={safeUrl}
      components={mapped as unknown as Components}
    >
      {children}
    </ReactMarkdown>
  )
})
