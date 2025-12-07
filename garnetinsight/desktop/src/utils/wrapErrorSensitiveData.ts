/* eslint import/prefer-default-export: off */
// Replacing sensitive data inside error message
// todo: split main.ts file and make proper structure
export const wrapErrorMessageSensitiveData = (e: Error) => {
  const regexp = /(\/[^\s]*\/)|(\\[^\s]*\\)/gi
  e.message = e.message.replace(regexp, (_match, unixPath, winPath): string => {
    if (unixPath) {
      return '*****/'
    }
    if (winPath) {
      return '*****\\'
    }

    return _match
  })

  return e
}
