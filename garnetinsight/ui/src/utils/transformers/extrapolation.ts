export const formatExtrapolation = (
  value: number | string,
  showPrefix: boolean = true,
): string | number => (showPrefix ? `~${value}` : value)

export const extrapolate = (
  value: number,
  options: { apply: boolean; extrapolation?: number; showPrefix?: boolean },
  fn: (val: number) => string | number = (val) => val,
): number | string => {
  const { apply, extrapolation = 1, showPrefix = true } = options
  if (!apply) {
    return fn(value)
  }

  const extrapolated = extrapolation * value
  const appliedFn = fn(extrapolated)

  return formatExtrapolation(appliedFn, showPrefix)
}
