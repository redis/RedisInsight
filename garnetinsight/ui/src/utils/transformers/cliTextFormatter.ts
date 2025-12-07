import { flattenDeep, isArray, isInteger, isNull, isObject } from 'lodash'
import { bulkReplyCommands } from 'uiSrc/constants'

const formatToText = (reply: any, command: string = ''): string => {
  let result
  if (isNull(reply)) {
    result = '(nil)'
  } else if (isInteger(reply)) {
    result = `(integer) ${reply}`
  } else if (isArray(reply)) {
    result = formatRedisArrayReply(reply)
  } else if (isObject(reply)) {
    result = formatRedisArrayReply(flattenDeep(Object.entries(reply)))
  } else if (isFormattedCommand(command)) {
    result = reply
  } else {
    result = `"${reply}"`
  }

  return result
}

const isFormattedCommand = (commandLine: string = '') =>
  !!bulkReplyCommands?.find((command) =>
    commandLine?.trim().toUpperCase().startsWith(command),
  )

const formatRedisArrayReply = (reply: any | any[], level = 0): string => {
  let result: string
  if (isArray(reply)) {
    if (!reply.length) {
      result = '(empty list or set)'
    } else {
      result = reply
        .map((item, index) => {
          const leftMargin = index > 0 ? '   '.repeat(level) : ''
          const lineIndex = `${leftMargin}${index + 1})`
          const value = formatRedisArrayReply(item, level + 1)
          return `${lineIndex} ${value}`
        })
        .join('\n')
    }
  } else {
    result = `"${reply}"`
  }
  return result
}

export default formatToText
