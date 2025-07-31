import React from 'react'
import { EuiEmptyPrompt } from '@elastic/eui'
import LogoIcon from 'uiSrc/assets/img/logo_small.svg'
import { getConfig } from 'uiSrc/config'
import { RiLoadingLogo } from 'uiSrc/components/base/display'

const riConfig = getConfig()

const PagePlaceholder = () => (
  <>
    {riConfig.app.env !== 'development' && (
      <EuiEmptyPrompt
        data-testid="page-placeholder"
        icon={<RiLoadingLogo src={LogoIcon} $size="XXL" />}
        titleSize="s"
      />
    )}
  </>
)

export default PagePlaceholder
