import type { ComponentType, ReactNode } from 'react'

// Leaf components a consumer (tutorials, Copilot chat) supplies to render the
// structured nodes produced by remarkRedisCodeBlock plus links/images. Every
// leaf is optional; omitted leaves fall back to plain markdown rendering.
export interface MarkdownLeafComponents {
  RedisCode: ComponentType<{
    label: string
    params?: string
    lang: string
    path?: string
    children: string
  }>
  CodeBlock: ComponentType<{ label?: string; lang?: string; children: string }>
  RedisUpload: ComponentType<{ label: string; path: string }>
  ExternalLink: ComponentType<{ href: string; children?: ReactNode }>
  CloudLink: ComponentType<{ url: string; text: string }>
  RedisInsightLink: ComponentType<{ url: string; text: string }>
  Image: ComponentType<{ src: string }>
}

export interface MarkdownRendererProps {
  children: string
  path?: string
  components: Partial<MarkdownLeafComponents>
  onError?: () => void
}
