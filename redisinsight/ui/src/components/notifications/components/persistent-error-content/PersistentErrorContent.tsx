import React, { useEffect, useState } from 'react'
import { ColorText } from 'uiSrc/components/base/text'
import { FlexItem, Row } from 'uiSrc/components/base/layout/flex'
import { Spacer } from 'uiSrc/components/base/layout/spacer'
import { Button } from 'uiSrc/components/base/forms/buttons'
import { CopyIcon, ToastCheckIcon } from 'uiSrc/components/base/icons'
import { handleCopy } from 'uiSrc/utils'

export interface Props {
  text: string
}

const PersistentErrorContent = ({ text }: Props) => {
  const [isCopied, setIsCopied] = useState(false)

  const handleCopyClick = () => {
    handleCopy(text)
    setIsCopied(true)
  }

  useEffect(() => {
    if (isCopied) {
      const timeout = setTimeout(() => {
        setIsCopied(false)
      }, 2000)
      return () => clearTimeout(timeout)
    }
    return undefined
  }, [isCopied])

  return (
    <>
      <ColorText color="danger">{text}</ColorText>
      <Spacer />
      <Row justify="end">
        <FlexItem>
          <Button
            onClick={handleCopyClick}
            icon={isCopied ? ToastCheckIcon : CopyIcon}
            size="s"
            data-testid="copy-error-message-btn"
          >
            {isCopied ? 'Copied' : 'Copy'}
          </Button>
        </FlexItem>
      </Row>
    </>
  )
}

export default PersistentErrorContent
