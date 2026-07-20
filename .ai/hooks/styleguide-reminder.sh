#!/usr/bin/env bash
# PreToolUse hook: nudges the agent to the right styleguide skill based on which
# part of the repo it's editing, so the rules don't depend on a skill self-triggering.
# Maps path -> frontend / backend / testing / e2e-testing skill reminders.
set -euo pipefail

input=$(cat)
path=$(printf '%s' "$input" | jq -r '.tool_input.file_path // .tool_input.path // ""')
[ -z "$path" ] && exit 0

reminders=()

# E2E first: its specs are *.spec.ts too, but use the e2e skill, not the unit one.
case "$path" in
  *tests/e2e-playwright/*)
    reminders+=("e2e-testing skill (.ai/skills/e2e-testing/SKILL.md): use Page Object Models (no raw selectors in tests), fixtures for setup, and Playwright auto-waiting/expect — never fixed waitForTimeout. Build test data with Fishery factories + faker.")
    ;;
  *redisinsight/ui/src/*)
    reminders+=("frontend skill (.ai/skills/frontend/SKILL.md): one component per directory (Name.tsx / .styles.ts / .types.ts / .spec.tsx); styles in .styles.ts via styled-components imported as 'import * as S' (local only); layout components (Row/Col/FlexGroup) over div; theme spacing/colors over magic values; internal wrappers from uiSrc/components/ui, never @redis-ui/* directly.")
    case "$path" in
      *.spec.ts|*.spec.tsx)
        reminders+=("testing skill (.ai/skills/testing/SKILL.md): build UI test data with Fishery factories from redisinsight/ui/src/mocks/factories/<domain>/ — reuse an existing <Name>.factory.ts or add one there, never inline mock objects. Shared renderComponent helper, faker for primitives, waitFor over fixed timeouts.")
        ;;
    esac
    ;;
  *redisinsight/api/src/*|*redisinsight/api/test/*)
    reminders+=("backend skill (.ai/skills/backend/SKILL.md): NestJS module/controller/service/DTO structure, constructor dependency injection, DTOs with class-validator, and proper Nest exceptions for error handling.")
    case "$path" in
      *.spec.ts)
        reminders+=("testing skill (.ai/skills/testing/SKILL.md): use Fishery factories + faker for test data (never hardcoded mocks), AAA structure, and clear mocks between tests.")
        ;;
    esac
    ;;
  *)
    exit 0
    ;;
esac

[ ${#reminders[@]} -eq 0 ] && exit 0

ctx=$(printf '%s\n' "${reminders[@]}")
jq -n --arg ctx "$ctx" \
  '{hookSpecificOutput: {hookEventName: "PreToolUse", additionalContext: $ctx}}'
