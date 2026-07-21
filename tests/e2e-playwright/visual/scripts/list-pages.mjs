#!/usr/bin/env node
/**
 * Route inventory for the visual catalog.
 *
 * Statically parses `redisinsight/ui/src/constants/pages.ts` (the single source
 * of truth for routes) and prints every page, grouped by what setup it needs to
 * reach: nothing, a connected database, an RDI instance, or a discovery flow.
 *
 * Use it as the checklist of screens to cover with visual scenes.
 *
 *   node visual/scripts/list-pages.mjs
 */
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const here = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(here, '../../../..')
const src = readFileSync(
  path.join(root, 'redisinsight/ui/src/constants/pages.ts'),
  'utf8',
)

// 1. PageNames enum: name -> url segment
const pageNames = {}
const enumBody = src.match(/export enum PageNames \{([\s\S]*?)\}/)[1]
for (const m of enumBody.matchAll(/(\w+)\s*=\s*'([^']+)'/g)) {
  pageNames[m[1]] = m[2]
}

// 2. Local path consts (redisCloud, sentinel, azure, rdi)
const consts = {}
for (const m of src.matchAll(/^const (\w+) = '([^']+)'/gm)) {
  consts[m[1]] = m[2]
}

// 3. Resolve a template body into a concrete route pattern
const resolve = (tpl) =>
  tpl
    .replace(/\$\{PageNames\.(\w+)\}/g, (_, k) => pageNames[k] ?? `:${k}`)
    .replace(/\$\{(redisCloud|sentinel|azure|rdi)\}/g, (_, k) => consts[k])
    .replace(/\$\{instanceId\}/g, ':instanceId')
    .replace(/\$\{rdiInstance\}/g, ':rdiInstanceId')
    .replace(/\$\{[^}]+\}/g, ':param')

// 4. Parse the Pages object entries (key -> first string/template literal found)
const block = src.match(/export const Pages = \{([\s\S]*)\n\}/)[1]
const entryRe = /^ {2}(\w+):\s*([\s\S]*?)(?=,\n {2}\w+:|,?\n\})/gm

const routes = []
for (const m of block.matchAll(entryRe)) {
  const key = m[1]
  const value = m[2].trim()
  let route
  const tpl = value.match(/`([^`]*)`/) // template literal
  const str = value.match(/^'([^']*)'/) // plain string
  if (tpl) route = resolve(tpl[1])
  else if (str) route = str[1]
  else if (consts[value]) route = consts[value] // shorthand: `redisCloud,`
  else continue
  // Skip query-param deep-links / unresolved complex templates — not distinct screens.
  if (route.includes('?') || route.includes('${')) continue
  routes.push({ key, route, dynamic: /=>/.test(value) })
}

// 5. Categorise by required setup
const group = (r) => {
  if (r.route.includes(':rdiInstanceId')) return 'RDI instance'
  if (r.route.includes(':instanceId')) return 'Connected database'
  if (/redis-cloud|sentinel|azure|redis-enterprise/.test(r.route))
    return 'Discovery flow'
  return 'No setup (app-level)'
}

const groups = {}
for (const r of routes) (groups[group(r)] ??= []).push(r)

const order = [
  'No setup (app-level)',
  'Connected database',
  'RDI instance',
  'Discovery flow',
]
console.log(`\nRoute inventory — ${routes.length} pages\n${'='.repeat(40)}`)
for (const g of order) {
  if (!groups[g]) continue
  console.log(`\n## ${g} (${groups[g].length})`)
  for (const r of groups[g].sort((a, b) => a.route.localeCompare(b.route))) {
    console.log(`  ${r.route.padEnd(48)} ${r.key}`)
  }
}
console.log('')
