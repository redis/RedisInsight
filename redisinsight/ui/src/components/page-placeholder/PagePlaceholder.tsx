import React from 'react'

import LogoIcon from 'uiSrc/assets/img/logo_small.svg'
import { getConfig } from 'uiSrc/config'
import { RiLoadingLogo } from 'uiSrc/components/base/display'
import { RiEmptyPrompt } from 'uiSrc/components/base/layout'

const riConfig = getConfig()

const PagePlaceholder = () => (
  <>
    {riConfig.app.env !== 'development' && (
      <RiEmptyPrompt
        data-testid="page-placeholder"
        icon={<RiLoadingLogo src={LogoIcon} $size="XXL" />}
      />
    )}
  </>
)

export default PagePlaceholder
