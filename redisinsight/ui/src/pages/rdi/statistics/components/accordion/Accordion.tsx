import React from 'react'

import { AutoRefresh } from 'uiSrc/components'

import * as S from './Accordion.styles'

interface Props {
  id: string
  title: string
  children: JSX.Element
  loading?: boolean
  onRefresh?: () => void
  onRefreshClicked?: () => void
  onChangeAutoRefresh?: (
    enableAutoRefresh: boolean,
    refreshRate: string,
  ) => void
  hideAutoRefresh?: boolean
  enableAutoRefreshDefault?: boolean
}

const Accordion = ({
  id,
  title,
  children,
  loading = false,
  onRefresh,
  onRefreshClicked,
  onChangeAutoRefresh,
  hideAutoRefresh = false,
  enableAutoRefreshDefault,
}: Props) => {
  const [lastRefreshTime, setLastRefreshTime] = React.useState(Date.now())

  return (
    <S.AccordionWrapper
      id={id}
      buttonContent={title}
      paddingSize="m"
      initialIsOpen
      extraAction={
        !hideAutoRefresh && (
          <AutoRefresh
            postfix={id}
            displayText
            loading={loading}
            lastRefreshTime={lastRefreshTime}
            onRefresh={() => {
              setLastRefreshTime(Date.now())
              onRefresh?.()
            }}
            onRefreshClicked={onRefreshClicked}
            onEnableAutoRefresh={onChangeAutoRefresh}
            enableAutoRefreshDefault={enableAutoRefreshDefault}
            testid={id}
          />
        )
      }
    >
      {children}
    </S.AccordionWrapper>
  )
}

export default Accordion
