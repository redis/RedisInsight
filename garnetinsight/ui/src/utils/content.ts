import { merge } from 'lodash'
import { ContentCreateRedis } from 'uiSrc/slices/interfaces/content'

export const getContentByFeature = (
  content: ContentCreateRedis,
  featureFlags: any,
) => {
  if (!content?.features) return content

  let featureContent = content

  Object.keys(content.features).forEach((featureName: string) => {
    if (featureFlags?.[featureName]?.flag) {
      // @ts-ignore
      featureContent = merge({}, content, content.features[featureName])
    }
  })

  return featureContent
}
