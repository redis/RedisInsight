const replaceSpaces = (text = '') => {
  if (text === ' ') {
    return '\u00a0'
  }
  return text.replace(/\s\s/g, '\u00a0\u00a0')
}

export { replaceSpaces }
