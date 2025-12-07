import React from 'react'
import { useSelector } from 'react-redux'
import { DATETIME_FORMATTER_DEFAULT, TimezoneOption } from 'uiSrc/constants'
import { userSettingsConfigSelector } from 'uiSrc/slices/user/user-settings'
import { formatTimestamp } from 'uiSrc/utils'
import { RiTooltip } from 'uiSrc/components'
import styles from './styles.module.scss'

export interface Props {
  date: Date | string | number
}

const FormatedDate = ({ date }: Props) => {
  const config = useSelector(userSettingsConfigSelector)
  const dateFormat = config?.dateFormat || DATETIME_FORMATTER_DEFAULT
  const timezone = config?.timezone || TimezoneOption.Local

  if (!date) return null

  const formatedDate = formatTimestamp(date, dateFormat, timezone)

  return (
    <RiTooltip anchorClassName={styles.text} content={formatedDate}>
      <span>{formatedDate}</span>
    </RiTooltip>
  )
}

export default FormatedDate
