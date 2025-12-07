import { Nullable } from 'uiSrc/utils'

export const getTruncatedName = (fullName?: Nullable<string>) => {
  if (!fullName) return ''

  if (!/\s/g.test(fullName)) {
    return fullName.charAt(0).toUpperCase()
  }

  return fullName
    .split(' ')
    .splice(0, 2)
    .map((i) => i.charAt(0))
    .join('')
    .toUpperCase()
}
