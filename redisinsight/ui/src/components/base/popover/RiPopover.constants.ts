export const ANCHOR_POSITION_MAP = {
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
} as const

export const PANEL_PADDING_SIZE_MAP = {
  l: 24,
  m: 18,
  s: 8,
  none: 0,
} as const
