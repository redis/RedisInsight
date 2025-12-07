/// <reference types="vite-plugin-svgr/client" />

interface ImportMetaEnv {
  readonly RI_BASE_API_URL: string
  readonly RI_APP_PREFIX: string
  readonly RI_APP_PORT: number
  readonly RI_SCAN_TREE_COUNT: number
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
