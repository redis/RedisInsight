// truncate Number to Range:
// 500 => 500
// 1500 => 1 K
// 2500000 => 2 M
// 2500000000 => 2 B
export const truncateNumberToRange = (number: number) => {
  const thousand = 1_000
  const million = 1_000_000
  const billion = 1_000_000_000

  if (number >= billion) {
    return `${Math.floor(number / billion)} B`
  }

  if (number >= million) {
    return `${Math.floor(number / million)} M`
  }

  if (number >= thousand) {
    return `${Math.floor(number / thousand)} K`
  }

  return number.toString()
}

export const truncatePercentage = (value = 0, afterDotCount = 0) =>
  Number.isInteger(value) ? value : value.toFixed(afterDotCount)
