import { replaceSpaces } from './replaceSpaces'

export function formatLongName(
  name = '',
  maxNameLength = 500,
  endPartLength = 50,
  separator = '  ...  ',
) {
  // replace whitespace characters to no-break spaces - to prevent collapse spaces
  const currentName = replaceSpaces(name)
  if (currentName.length <= maxNameLength) {
    return currentName
  }
  const startPart = currentName.substring(
    0,
    maxNameLength - endPartLength - separator.length,
  )
  const endPart = currentName.substring(currentName.length - endPartLength)
  return `${startPart}${separator}${endPart}`
}
