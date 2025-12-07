import { CapabilityStorageItem } from 'uiSrc/constants/storage'
import {
  getCapabilityStorageField,
  setCapabilityStorageField,
} from 'uiSrc/services'
import { getTutorialCapability } from 'uiSrc/utils'

const TIME_TO_READ_POPOVER_TEXT = 1_000

export const isShowCapabilityTutorialPopover = (isFree = false) =>
  !!isFree &&
  !getCapabilityStorageField(CapabilityStorageItem.tutorialPopoverShown) &&
  getTutorialCapability(getCapabilityStorageField(CapabilityStorageItem.source))
    ?.name

export const setCapabilityPopoverShown = () => {
  setTimeout(() => {
    setCapabilityStorageField(CapabilityStorageItem.tutorialPopoverShown, true)
  }, TIME_TO_READ_POPOVER_TEXT)
}
