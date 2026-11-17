import { isString, sortBy } from 'lodash'
import i18n from 'uiSrc/i18n'
import { IRecommendationsStatic } from 'uiSrc/slices/interfaces/recommendations'

const replaceVariables = (
  value: any[] | any,
  parameter?: string[],
  params?: any,
) =>
  parameter && isString(value)
    ? value.replace(/\$\{\d}/g, (matched) => {
        const parameterIndex: string = matched.substring(
          matched.indexOf('{') + 1,
          matched.lastIndexOf('}'),
        )
        return params[parameter[+parameterIndex]]
      })
    : value

const sortRecommendations = (
  recommendations: any[],
  recommendationsContent: IRecommendationsStatic,
) =>
  sortBy(recommendations, [
    ({ name }) => name !== 'searchJSON',
    ({ name }) => name !== 'searchIndexes',
    ({ name }) => recommendationsContent[name]?.redisStack,
    ({ name }) => name,
  ])

function getTranslatedTipTitle(name: string, fallback: string): string
function getTranslatedTipTitle(
  name: string,
  fallback?: string,
): string | undefined
function getTranslatedTipTitle(name: string, fallback?: string) {
  const key = `tips.content.${name}.title`
  return i18n.exists(key) ? i18n.t(key as never) : fallback
}

export { sortRecommendations, replaceVariables, getTranslatedTipTitle }
