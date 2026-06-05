# Review Hardening

Use this before opening or updating a Redis Insight plugin PR. It captures review issues that are easy for coding agents to miss because the happy path works.

## Start From Review Discipline

- Treat every bot or human comment as a hypothesis. Confirm it against code, tests, and Redis/Insight behavior before changing code.
- Reproduce the failing shape with a focused test first. If the issue is valid, keep the regression test.
- Prefer the narrowest verification scope that proves the change: package tests, parser tests, manifest matcher tests, and typecheck. Do not run a full RedisInsight build for every comment unless the changed surface requires it.
- When replying to PR comments, state the behavior fixed, the test added, and the commit that contains it.

## Manifest and Matcher Checklist

- Match whole Redis command tokens, not prefixes. A command must not match a longer command with the same prefix (e.g. a `*STORE` or `*_RO` variant).
- Keep multi-visualization defaults mutually exclusive for overlapping commands. If one view is the default for one result shape, another can be available but must not also be the blanket default for the same command shape.
- If `matchQuery.anyRegex` / `noneRegex` is used, keep regexes bounded and linear. Avoid repeated broad alternatives followed by trailing `[\s\S]{0,N}`.
- Make token alternatives disjoint: quoted strings, double-quoted strings, and unquoted tokens should not overlap in a way that creates backtracking spikes.
- Test native command names, module command names, and store/scalar variants separately. Query/result rows and scalar/store commands often need different visualization defaults.

## Parser Checklist

- Tokenize the Redis command before inspecting options. Raw `indexOf("PARAMS")`, `indexOf("SEARCH")`, or `indexOf("FILTER")` will misread keys, members, index names, and quoted query text.
- Preserve empty quoted tokens in the tokenizer. `""` and `''` should still occupy an argument position, even if the downstream parser later rejects that command shape.
- Keyword positions matter. For `FT.HYBRID`, skip the command and index tokens when detecting `SEARCH` / `FILTER`, and skip `PARAMS` key/value ranges when parsing predicates.
- Strip or ignore large option payloads only when the token is the actual option for the command grammar. Do not strip a key/member named like an option keyword, an index named like one, or query text containing one.
- Preserve the raw unit/format returned by Redis (the token that follows the relevant option in the command string) before any internal normalization.
- Validate blank numeric parts before calling `Number(...)`; JavaScript treats `Number("")` as `0`.
- Differentiate empty result sets from malformed/incomplete rows so the UI can show the right guidance.
- Handle search-like arrays, aggregate-like arrays, and Redis 8 map-style objects before generic object fallback. Arrays are objects in JavaScript, so order matters.
- Avoid `Math.max(...largeArray)` or similar spread over result sets. Reduce or loop to avoid call stack and argument limits.

## Visualization Library Checklist

- Validate library preconditions before rendering (non-empty series, valid bounds/ranges, sized container). Bail to an empty/error state instead of calling render APIs with bad input.
- Do not let library callbacks (cell renderers, tooltip/popup builders, icon factories) capture stale React state. Keep live values in refs or recreate the instance when the callback dependencies change.
- Build tooltip/popup/cell DOM with `textContent` or escaped React output, not interpolated HTML from Redis data.
- Destroy/dispose the library instance before re-creating it on re-render to avoid leaks.
- For large result sets, use loops/reductions and avoid per-render expensive parsing unless the input changed.
- Use mode-aware empty/error titles. Different visualizations in the same plugin should not all show the same generic failure message.

## Code Hygiene Checklist

- Remove dead plugin config files and unused exports instead of leaving them for reviewers to rediscover.
- Enforce declared limits or delete them. A `maxRows` / `maxPoints` constant that nobody reads is a bug magnet.
- Centralize shared conversion constants/helpers so parsers and visualizations cannot drift.
- Keep component-local types and large constants in sibling `.types.ts` and `.constants.ts` files when the component is already large.
- Keep return types honest and simple. Do not use a tuple type when the function returns arbitrary-length arrays.
- After discriminated-union narrowing, remove unreachable null/error branches. A defensive check that cannot run makes the real state model harder to review.
- Memoize parsed command/results when parsing is nontrivial or feeds the visualization render.

## Test Matrix

Add focused tests for any surface you touch:

- Manifest matcher: exact command boundaries, default exclusivity, distinct result shapes (scalar vs row vs nested).
- Command parser: keyword-like key/member/index names, empty quoted tokens, option keywords appearing in native commands and in query text, large payloads, empty rows, malformed rows, Redis 8 object responses.
- Unit/format handling: commands that take a unit or format argument return values in that same unit/format; cover each variant the plugin supports.
- Visualization state: control updates while rendered, empty/invalid input sets, distinct per-mode error titles.
- Performance guardrails: large result counts, large payloads, and no spread into `Math.max`.
