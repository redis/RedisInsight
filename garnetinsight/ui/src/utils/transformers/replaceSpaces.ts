export default function replaceSpaces(text: string | number = '') {
  if (text === ' ') {
    return '\u00a0'
  }
  return text?.toString().replace(/\s\s/g, '\u00a0\u00a0') ?? ''
}
