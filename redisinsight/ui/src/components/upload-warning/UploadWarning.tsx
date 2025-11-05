import React from "react"
import { Text } from "uiSrc/components/base/text"
import { UploadWarningBanner } from "uiSrc/components/upload-warning/styles"

const UploadWarning = () => (
  <UploadWarningBanner
    message={
      <Text size="s">
        Use files only from trusted authors to avoid automatic execution of
        malicious code.
      </Text>
    }
    show
    showIcon
    variant="attention"
  />
)

export default UploadWarning
