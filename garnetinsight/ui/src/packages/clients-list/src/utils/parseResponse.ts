import { Buffer } from 'buffer'

export const parseClientListResponse = (response: string) =>
  response
    .split(/\r?\n/)
    .filter((r: string) => r)
    .map((row: string) => {
      const value = row.split(' ')
      const obj: any = {}
      value.forEach((v: string) => {
        const pair = v.split('=')
        // eslint-disable-next-line prefer-destructuring
        obj[pair[0]] = pair[1]
      })
      return obj
    })

export const parseJSONASCIIResponse = (response: string): string =>
  getBufferFromSafeASCIIString(response).toString()

export const getBufferFromSafeASCIIString = (str: string): Buffer => {
  const bytes = []

  for (let i = 0; i < str.length; i += 1) {
    if (str[i] === '\\') {
      if (str[i + 1] === 'x') {
        const hexString = str.substr(i + 2, 2)
        if (isHex(hexString)) {
          bytes.push(Buffer.from(hexString, 'hex'))
          i += 3
          // eslint-disable-next-line no-continue
          continue
        }
      }

      if (['a', '"', '\\', 'b', 't', 'n', 'r'].includes(str[i + 1])) {
        switch (str[i + 1]) {
          case 'a':
            bytes.push(Buffer.from('\u0007'))
            break
          case 'b':
            bytes.push(Buffer.from('\b'))
            break
          case 't':
            bytes.push(Buffer.from('\t'))
            break
          case 'n':
            bytes.push(Buffer.from('\n'))
            break
          case 'r':
            bytes.push(Buffer.from('\r'))
            break
          default:
            bytes.push(Buffer.from(str[i + 1]))
        }

        i += 1
        // eslint-disable-next-line no-continue
        continue
      }
    }

    bytes.push(Buffer.from(str[i]))
  }

  return Buffer.concat(bytes)
}

function isHex(str: string) {
  return /^[A-F0-9]{1,2}$/i.test(str)
}

export const isJson = (item: any): boolean => {
  let value = typeof item !== 'string' ? JSON.stringify(item) : item
  try {
    value = JSON.parse(value)
  } catch (e) {
    return false
  }

  return typeof value === 'object' && value !== null
}
