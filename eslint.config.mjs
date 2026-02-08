/**
 * ESLint 9 Flat Configuration
 * 
 * Migration from .eslintrc.js to flat config format.
 * This config is split into separate files for maintainability:
 * 
 * - eslint/base.mjs    - Shared rules and utilities
 * - eslint/ui.mjs      - React/UI configuration (redisinsight/ui/)
 * - eslint/api.mjs     - NestJS/API configuration (redisinsight/api/)
 * - eslint/desktop.mjs - Electron configuration (redisinsight/desktop/)
 * 
 * Rules are initially relaxed to match current codebase behavior.
 * Look for "TODO: Enable gradually" comments to find rules to tighten over time.
 */

import { globalIgnores, prettier } from './eslint/base.mjs'
import { uiConfig, uiTestConfig } from './eslint/ui.mjs'
import { apiConfig, apiUnitTestConfig, apiIntegrationTestConfig } from './eslint/api.mjs'
import { desktopConfig } from './eslint/desktop.mjs'

export default [
  // Global ignores (must be first, standalone object)
  globalIgnores,

  // UI (React) configurations
  uiConfig,
  uiTestConfig,

  // API (NestJS) configurations
  apiConfig,
  apiUnitTestConfig,
  apiIntegrationTestConfig,

  // Desktop (Electron) configuration
  desktopConfig,

  // Prettier - MUST BE LAST to disable conflicting formatting rules
  prettier,
]

