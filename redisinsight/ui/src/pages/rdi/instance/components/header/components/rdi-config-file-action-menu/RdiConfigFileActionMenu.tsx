import React, { useState } from 'react'
import UploadModal from 'uiSrc/pages/rdi/pipeline-management/components/upload-modal/UploadModal'
import Download from 'uiSrc/pages/rdi/instance/components/download'
import { IconButton } from 'uiSrc/components/base/forms/buttons'
import {
  UploadIcon,
  MoreactionsIcon,
  DownloadIcon,
  SaveIcon,
} from 'uiSrc/components/base/icons'

import { Menu } from '@redis-ui/components'
import DownloadFromServerModal from 'uiSrc/pages/rdi/pipeline-management/components/download-from-server-modal/DownloadFromServerModal'

const RdiConfigFileActionMenu = () => {
  const [isOpen, setIsOpen] = useState(false)

  const closeMenu = () => setIsOpen(false)

  const button = (
    <IconButton
      role="button"
      icon={MoreactionsIcon}
      data-testid="rdi-config-file-action-menu-trigger"
      aria-label="rdi-config-file-action-menu-trigger"
    />
  )

  return (
    <Menu open={isOpen} onOpenChange={setIsOpen}>
      <Menu.Trigger withButton>{button}</Menu.Trigger>
      <Menu.Content>
        <DownloadFromServerModal
          onClose={closeMenu}
          trigger={
            <Menu.Content.Item
              text="Download deployed pipeline"
              icon={DownloadIcon}
              onClick={(e) => e.preventDefault()}
              aria-labelledby="Upload pipeline button"
              data-testid="upload-pipeline-btn"
            />
          }
        />
        <UploadModal
          onClose={closeMenu}
          trigger={
            <Menu.Content.Item
              text="Import pipeline from ZIP file"
              icon={UploadIcon}
              onClick={(e) => e.preventDefault()}
              aria-labelledby="Upload file button"
              data-testid="upload-file-btn"
            />
          }
        />
        <Download
          trigger={
            <Menu.Content.Item
              text="Save pipeline to ZIP file"
              icon={SaveIcon}
              aria-labelledby="Download pipeline button"
              data-testid="download-pipeline-btn"
            />
          }
        />
      </Menu.Content>
    </Menu>
  )
}

export default RdiConfigFileActionMenu
