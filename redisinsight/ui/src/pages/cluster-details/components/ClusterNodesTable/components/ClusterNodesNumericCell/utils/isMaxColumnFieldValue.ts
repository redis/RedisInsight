export const isMaxColumnFieldValue = <T>(
  field: keyof T,
  value: number,
  data: T[],
): boolean => {
  const numericValues = data
    .map((node) => node[field] ?? 0)
    .filter((v) => typeof v === 'number')

  if (numericValues.length === 0) {
    return false
  }

  const { max, count } = numericValues.reduce(
    (prev, cur) => {
      if (cur > prev.max) {
        return { max: cur, count: 1 }
      }
      if (cur === prev.max) {
        return { ...prev, count: prev.count + 1 }
      }
      return prev
    },
    { max: numericValues[0], count: 0 },
  )

  return value === max && count === 1
}
