export const isMaxColumnFieldValue = <T>(
  field: keyof T,
  value: number,
  data: T[],
): boolean => {
  const numericValues = data
    .map((node) => node[field])
    .filter((v) => typeof v === 'number')

  return (
    Math.max(...numericValues) === value &&
    numericValues.filter((v) => v === value).length === 1
  )
}
