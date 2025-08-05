import React, { useEffect, useState } from 'react'
import { Popover } from '@redis-ui/components'

import { useGenerateId } from 'uiSrc/components/base/utils'
import { PopoverPlacementMapType, TourStepProps } from './types'

const popoverPlacementMap: PopoverPlacementMapType = {
  upCenter: {
    placement: 'top',
    align: 'center',
  },
  upLeft: {
    placement: 'top',
    align: 'start',
  },
  upRight: {
    placement: 'top',
    align: 'end',
  },
  downCenter: {
    placement: 'bottom',
    align: 'center',
  },
  downLeft: {
    placement: 'bottom',
    align: 'start',
  },
  downRight: {
    placement: 'bottom',
    align: 'end',
  },
  leftCenter: {
    placement: 'left',
    align: 'center',
  },
  leftUp: {
    placement: 'left',
    align: 'start',
  },
  leftDown: {
    placement: 'left',
    align: 'end',
  },
  rightCenter: {
    placement: 'right',
    align: 'center',
  },
  rightUp: {
    placement: 'right',
    align: 'start',
  },
  rightDown: {
    placement: 'right',
    align: 'end',
  },
}

export const RiTourStep = ({
  open,
  content,
  title,
  placement = 'rightUp',
  className = '',
  children,
  minWidth = 300,
  maxWidth,
  offset = 5,
  ...rest
}: TourStepProps) => {
  const [isVisible, setIsVisible] = useState(open)
  const id = useGenerateId()
  const titleId = `${id}-title`

  useEffect(() => {
    setIsVisible(open)
  }, [open])

  if (!isVisible) {
    return null
  }
  const place = popoverPlacementMap[placement]
  const popoverContent = (
    <Popover.Card.Compose style={{ minWidth, maxWidth }}>
      <Popover.Card.Header.Compose id={titleId}>
        {title}
      </Popover.Card.Header.Compose>
      <Popover.Card.Body.Compose>{content}</Popover.Card.Body.Compose>
    </Popover.Card.Compose>
  )
  return (
    <Popover
      className={className}
      open={isVisible}
      placement={place.placement}
      align={place.align}
      sideOffset={offset}
      alignOffset={-10}
      content={popoverContent}
      id={id}
      aria-labelledby={titleId}
      {...rest}
      withButton
      persistent
    >
      {children}
    </Popover>
  )
}
