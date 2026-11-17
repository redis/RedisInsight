import React from 'react'

import {
  FormField,
  RiInfoIconProps,
} from 'uiSrc/components/base/forms/FormField'
import { TextArea } from 'uiSrc/components/base/inputs'
import { Text } from 'uiSrc/components/base/text'
import { useTranslation } from 'uiSrc/i18n'
import { HostInfoTooltipContent } from '../../../host-info-tooltip-content/HostInfoTooltipContent'

export interface Props {
  value: string
  onChange: (e: React.ChangeEvent<any>) => void
}

const ConnectionUrl = ({ value, onChange }: Props) => {
  const { t } = useTranslation()

  const connectionUrlInfo: RiInfoIconProps = {
    content: HostInfoTooltipContent({ includeAutofillInfo: false, t }),
    placement: 'right',
    maxWidth: '100%',
  }

  return (
    <FormField
      label={<Text>{t('addDatabase.connectionUrl.label')}</Text>}
      infoIconProps={connectionUrlInfo}
    >
      <TextArea
        name="connectionURL"
        id="connectionURL"
        value={value}
        onChangeCapture={onChange}
        placeholder="redis://default@127.0.0.1:6379"
        data-testid="connection-url"
      />
    </FormField>
  )
}

export default ConnectionUrl
