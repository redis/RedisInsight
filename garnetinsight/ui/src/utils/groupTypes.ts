import { GROUP_TYPES_DISPLAY, GroupTypesDisplay } from 'uiSrc/constants'
import { Nullable } from 'uiSrc/utils/types'

export const NO_TYPE_NAME = 'Unknown'

export const getGroupTypeDisplay = (type?: Nullable<string>) =>
  type
    ? type in GROUP_TYPES_DISPLAY
      ? GROUP_TYPES_DISPLAY[type as GroupTypesDisplay]
      : type?.replace(/_/g, ' ')
    : NO_TYPE_NAME
