import { Vote } from 'uiSrc/constants/recommendations'
import { DislikeIcon, LikeIcon } from 'uiSrc/components/base/icons'

export const iconType = {
  [Vote.Like]: LikeIcon,
  [Vote.Dislike]: DislikeIcon,
}
