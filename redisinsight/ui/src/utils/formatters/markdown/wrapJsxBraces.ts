// Wraps JSX curly braces as {"$&"} string expressions so JsxParser renders them
// literally instead of evaluating them. Tag syntax such as `>` is left intact so
// raw HTML keeps working.
export const wrapJsxBraces = (value: string): string =>
  value.replace(/[{}]/g, '{"$&"}')
