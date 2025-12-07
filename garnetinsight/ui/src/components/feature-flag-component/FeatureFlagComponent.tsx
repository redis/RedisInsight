import React from 'react'
import { isArray } from 'lodash'
import { useSelector } from 'react-redux'
import { FeatureFlags } from 'uiSrc/constants/featureFlags'
import { appFeatureFlagsFeaturesSelector } from 'uiSrc/slices/app/features'

export interface Props {
  name: FeatureFlags | FeatureFlags[]
  children?: JSX.Element | JSX.Element[]
  otherwise?: React.ReactElement
  enabledByDefault?: boolean
}

const FeatureFlagComponent = (props: Props) => {
  const { children, name, otherwise, enabledByDefault } = props
  const features = useSelector(appFeatureFlagsFeaturesSelector)

  const nameArray = isArray(name) ? name : [name]
  const matchingFeatures = nameArray.map(
    (feature) => features?.[feature] || { flag: enabledByDefault },
  )
  const allFlagsEnabled = matchingFeatures.every((feature) => feature.flag)

  if (!allFlagsEnabled) {
    return otherwise ?? null
  }

  if (!children) {
    return null
  }

  return <>{children}</>
}

export default FeatureFlagComponent
