import React from 'react'
import {
  KeyTypes,
  MODULES_KEY_TYPES_NAMES,
  ModulesKeyTypes,
} from 'uiSrc/constants'
import { KeyDetailsHeaderProps } from 'uiSrc/pages/browser/modules'
import { RedisResponseBuffer } from 'uiSrc/slices/interfaces'
import { isTruncatedString } from 'uiSrc/utils'
import TooLongKeyNameDetails from 'uiSrc/pages/browser/modules/key-details/components/too-long-key-name-details/TooLongKeyNameDetails'
import ModulesTypeDetails from '../modules-type-details/ModulesTypeDetails'
import UnsupportedTypeDetails from '../unsupported-type-details/UnsupportedTypeDetails'
import { RejsonDetailsWrapper } from '../rejson-details'
import { StringDetails } from '../string-details'
import { ZSetDetails } from '../zset-details'
import { SetDetails } from '../set-details'
import { HashDetails } from '../hash-details'
import { ListDetails } from '../list-details'
import { StreamDetails } from '../stream-details'
import { VectorSetDetails } from '../vectorset-details'

export interface Props extends KeyDetailsHeaderProps {
  onOpenAddItemPanel: () => void
  onCloseAddItemPanel: () => void
  keyType: KeyTypes | ModulesKeyTypes
  keyProp: RedisResponseBuffer | null
}

const DynamicTypeDetails = (props: Props) => {
  const { keyType: selectedKeyType, keyProp } = props

  const TypeDetails: any = {
    [KeyTypes.ZSet]: <ZSetDetails {...props} />,
    [KeyTypes.Set]: <SetDetails {...props} />,
    [KeyTypes.String]: <StringDetails {...props} />,
    [KeyTypes.Hash]: <HashDetails {...props} />,
    [KeyTypes.List]: <ListDetails {...props} />,
    [KeyTypes.ReJSON]: <RejsonDetailsWrapper {...props} />,
    [KeyTypes.Stream]: <StreamDetails {...props} />,
    [KeyTypes.VectorSet]: <VectorSetDetails {...props} />,
  }

  if (isTruncatedString(keyProp)) {
    return <TooLongKeyNameDetails onClose={props.onCloseKey} />
  }

  // Supported key type
  if (selectedKeyType && selectedKeyType in TypeDetails) {
    return TypeDetails[selectedKeyType]
  }

  // Unsupported redis modules key type
  if (
    Object.values(ModulesKeyTypes).includes(selectedKeyType as ModulesKeyTypes)
  ) {
    return (
      <ModulesTypeDetails
        moduleName={MODULES_KEY_TYPES_NAMES[selectedKeyType]}
        onClose={props.onCloseKey}
      />
    )
  }

  // Unsupported key type
  return <UnsupportedTypeDetails onClose={props.onCloseKey} />
}

export { DynamicTypeDetails }
