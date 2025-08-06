import React from 'react'

import { RiLoadingLogo } from 'uiBase/display'
import { RiEmptyPrompt } from 'uiBase/layout'
import LogoIcon from 'uiSrc/assets/img/logo_small.svg'
import { getConfig } from 'uiSrc/config'

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
