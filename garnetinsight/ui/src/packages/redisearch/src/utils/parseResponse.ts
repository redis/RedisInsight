import { chunk, fromPairs, isArray, isEmpty, last } from 'lodash'
import {
  CommandArgument,
  ResultFieldNameView,
  ResultInfoField,
  InfoAttributesBoolean,
} from '../constants'

const parseSearchRawResponse = (command: string, initResult: any[]) => {
  const chunkCount = getChunkCountSearch(command)

  return chunk(initResult, chunkCount).map(([key, ...initValues]: string[]) => {
    let values: any = last(initValues)
    let fields: any = {}

    if (isEmpty(initValues)) {
      return { Doc: key }
    }

    if (command.includes(CommandArgument.WithScores)) {
      const [score, scoreValues, others] = initValues
      values = [
        ResultFieldNameView.Score,
        score,
        ...(scoreValues || []),
        ...(others || []),
      ]

      if (command.includes(CommandArgument.WithPayloads)) {
        const [payload] = scoreValues || []
        values = [ResultFieldNameView.Payloads, payload, ...values]
      }
    } else if (command.includes(CommandArgument.WithPayloads)) {
      const [payload, payloadValues = [], ...other] = initValues
      values = [
        ResultFieldNameView.Payloads,
        payload,
        ...(payloadValues || []),
        ...other,
      ]
    }

    values = chunk(values, 2)
    fields = fromPairs(values)

    return { Doc: key, ...fields }
  })
}

const parseAggregateRawResponse = (initResult: any[]) => {
  const result: any[] = initResult?.map((values: any) => {
    if (isArray(values) && values?.length > 1) {
      return { ...fromPairsChunk(values, 2) }
    }
    if (isArray(values)) {
      return []
    }

    return values.toString()
  })

  return result
}

const parseInfoRawResponse = (initResult: any[]) => {
  const result: any[] = chunk(initResult, 2).map(([field, value]: any) => {
    if (
      isArray(value) &&
      (field === ResultInfoField.Fields || field === ResultInfoField.Attributes)
    ) {
      const values =
        field === ResultInfoField.Fields
          ? value.map((field) => [
              ResultFieldNameView.Name.toLowerCase(),
              ...field,
            ])
          : value
      return [
        field,
        values.map((attrs: any[]) => {
          const newAttrs = attrs.reduce(
            (prev, current) =>
              InfoAttributesBoolean.indexOf(current) !== -1
                ? [...prev, current, true]
                : [...prev, current],
            [],
          )

          return fromPairsChunk(newAttrs, 2)
        }),
      ]
    }
    if (isArray(value) && field !== ResultInfoField.Options) {
      return [field, fromPairsChunk(value, 2)]
    }

    return [field, value]
  })

  return fromPairs(result)
}

const fromPairsChunk = (arr: any[] = [], count: number = 2) =>
  fromPairs(chunk(arr, count))

const getChunkCountSearch = (command: string = '') => {
  let count = 2
  const onlyKeysChunkCount = 1
  const specialArgs = [
    CommandArgument.WithSortKeys,
    CommandArgument.WithScores,
    CommandArgument.WithPayloads,
  ]

  if (getIsKeysOnly(command)) count = onlyKeysChunkCount

  specialArgs.forEach((arg) => command.toUpperCase().includes(arg) && ++count)

  return count
}

const getIsKeysOnly = (command: string = '') =>
  command.toUpperCase().includes(CommandArgument.NoContent) ||
  command.toUpperCase().includes(`${CommandArgument.Return} 0`)

export {
  parseInfoRawResponse,
  parseSearchRawResponse,
  parseAggregateRawResponse,
}
