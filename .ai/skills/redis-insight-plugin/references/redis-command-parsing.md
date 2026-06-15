# Redis Command Parsing

Plugins must defensively parse raw Redis responses. Different commands return very different
shapes, and even the same command with different flags returns different shapes.

## Same Command, Different Shapes by Flag

A command's optional modifiers change the response shape mid-flight. A classic pattern: without
modifiers a command returns a flat array of values, but adding `WITH...`-style flags returns a
nested array per entry:

```json
// no modifiers — flat list
["member1", "member2", "member3"]
```

```json
// with extra-data flags — nested per entry
[
  ["member1", "12.34", ["extra", "data"]],
  ["member2", "56.78", ["extra", "data"]]
]
```

Never key parsing off the command name alone — branch on the actual runtime shape, and read the
command string from the activation props to choose the right header/label.

## Worked Example: XRANGE / XREVRANGE

```
XRANGE stream - +
```

Returns an array of `[id, [field, value, field, value, ...]]`:

```json
[
  ["1700000000000-0", ["temp", "22", "humidity", "55"]],
  ["1700000001000-0", ["temp", "23"]]
]
```

Parser sketch:

```ts
export function parseXRange(data: any[]): { id: string; fields: Record<string, string> }[] {
  if (!Array.isArray(data)) return [];
  return data.flatMap(entry => {
    if (!Array.isArray(entry) || entry.length < 2) return [];
    const [id, kv] = entry;
    if (typeof id !== 'string' || !Array.isArray(kv)) return [];
    const fields: Record<string, string> = {};
    for (let i = 0; i + 1 < kv.length; i += 2) {
      const k = kv[i];
      const v = kv[i + 1];
      if (typeof k === 'string') fields[k] = String(v);
    }
    return [{ id, fields }];
  });
}
```

The same defensive structure applies to any command: start from `Array.isArray`, destructure
safely, coerce-and-validate numbers, and drop malformed entries instead of throwing.

## Preserve Raw Values and Units

Some commands accept a unit or format argument and return values in that same unit/format (a
radius unit, a count, a score precision, etc.). If the visualization assumes one unit but the
command used another, labels and scaling will be wrong. Read the relevant token from the command
string and preserve the raw value before any internal normalization.

## Defensive Parsing Rules

- Always start with `if (!Array.isArray(data)) return [];`.
- Never assume nested array length — destructure with `const [a, b, ...rest] = ...`.
- Preserve argument positions when tokenizing commands. Empty quoted strings (`""`, `''`) should become empty-string tokens, not disappear.
- Treat numeric fields as strings; convert with `Number(...)` and validate with `Number.isFinite(...)`.
- Reject blank numeric strings before conversion; `Number('')` is `0`.
- Drop malformed entries silently; surface the count (`"3 of 25 entries skipped"`) in the UI rather than crashing.
- Never throw inside a parser — return an empty array and let the activation function render an empty/error state.
- Avoid `Math.max(...largeArray)` or other spreading of full result sets. Use `reduce` or loops for large responses.
- When parsing `FT.*` or other option-rich command strings, tokenize first and honor command grammar. Do not strip option keywords (`PARAMS`, `SEARCH`, `FILTER`, …) just because those words appear inside a key, member, index name, or quoted query.

## Response Shape Caveats

- **Cluster mode** can return wrapped responses depending on Insight's transport.
- **Modifier flags** change the response shape mid-flight — never key off command name alone.
- **Empty results** are `[]`, but on some commands a missing key returns `null`. Treat both as empty.
- **Module commands** (RedisJSON, RedisTimeSeries, RedisSearch, etc.) return their own shapes — only support what your `matchCommands` declares.
- **Redis 8 / module responses** can be array-like, aggregate-like, or object/map-style. Handle array-specific branches before generic object branches because arrays are objects in JavaScript.
