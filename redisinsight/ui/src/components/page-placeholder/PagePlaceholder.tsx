import React from 'react'

import { RiLoadingLogo } from 'uiBase/display'
import { RiEmptyPrompt } from 'uiBase/layout'
import { getConfig } from 'uiSrc/config'
import LogoIcon from 'uiSrc/assets/img/logo_small.svg'

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
