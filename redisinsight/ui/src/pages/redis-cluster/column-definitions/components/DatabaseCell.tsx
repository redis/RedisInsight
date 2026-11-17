import React from 'react'
import { RiTooltip } from 'uiSrc/components'
import { formatLongName } from 'uiSrc/utils'
import { CellText } from 'uiSrc/components/auto-discover'
import { useTranslation } from 'uiSrc/i18n'

import styles from '../../styles.module.scss'

export interface DatabaseCellProps {
  name: string
}

export const DatabaseCell = ({ name }: DatabaseCellProps) => {
  const { t } = useTranslation()
  const cellContent = (name || '')
    .substring(0, 200)
    .replace(/\s\s/g, '\u00a0\u00a0')

  return (
    <div role="presentation" data-testid={`db_name_${name}`}>
      <RiTooltip
        position="bottom"
        title={t('cluster.column.database')}
        className={styles.tooltipColumnName}
        anchorClassName="truncateText"
        content={formatLongName(name || '')}
      >
        <CellText>{cellContent}</CellText>
      </RiTooltip>
    </div>
  )
}
