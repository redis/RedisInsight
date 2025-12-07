import { EXTERNAL_LINKS } from 'uiSrc/constants/links'

// Note: Extracted from DatabasesListWrapper.tsx
const handleClickFreeCloudDb = () => {
  window.open(EXTERNAL_LINKS.cloudConsole, '_blank')
}

export default handleClickFreeCloudDb
