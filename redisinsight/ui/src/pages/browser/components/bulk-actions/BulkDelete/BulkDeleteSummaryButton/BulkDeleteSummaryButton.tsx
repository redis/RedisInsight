import React, { useEffect, useMemo } from 'react'
import { RiSecondaryButton } from 'uiBase/forms'
import { DownloadIcon } from 'uiBase/icons'
import { RiLink } from 'uiBase/display'
import { Maybe } from 'uiSrc/utils'
import { RedisString } from 'apiSrc/common/constants'

export interface BulkDeleteSummaryButtonProps {
  pattern: string
  deletedKeys: Maybe<RedisString[]>
  keysType: string
  children: React.ReactNode
}

const getFileName = () => `bulk-delete-report-${Date.now()}.txt`

const BulkDeleteSummaryButton = ({
  pattern,
  deletedKeys,
  keysType,
  children,
  ...rest
}: BulkDeleteSummaryButtonProps) => {
  const fileUrl = useMemo(() => {
    const content =
      `Pattern: ${pattern}\n` +
      `Key type: ${keysType}\n\n` +
      `Keys:\n\n` +
      `${deletedKeys?.map((key) => Buffer.from(key).toString()).join('\n')}`

    const blob = new Blob([content], { type: 'text/plain' })
    return URL.createObjectURL(blob)
  }, [deletedKeys, pattern, keysType])

  useEffect(
    () => () => {
      URL.revokeObjectURL(fileUrl)
    },
    [fileUrl],
  )

  return (
    <RiSecondaryButton
      color="secondary"
      icon={DownloadIcon}
      iconSide="left"
      data-testid="download-bulk-delete-report"
      {...rest}
    >
      <RiLink download={getFileName()} href={fileUrl}>
        {children}
      </RiLink>
    </RiSecondaryButton>
  )
}

export default BulkDeleteSummaryButton
