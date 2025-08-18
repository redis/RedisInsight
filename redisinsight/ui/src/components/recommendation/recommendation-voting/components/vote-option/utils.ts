import { DislikeIcon, LikeIcon } from 'uiBase/icons'
import { Vote } from 'uiSrc/constants/recommendations'
import { Nullable } from 'uiSrc/utils'

export const getVotedText = (vote: Nullable<Vote>) =>
  vote === Vote.Like
    ? 'Share your ideas with us.'
    : 'Tell us how we can improve.'

export const voteTooltip = Object.freeze({
  [Vote.Like]: 'Useful',
  [Vote.Dislike]: 'Not Useful',
})

export const iconType = {
  [Vote.Like]: LikeIcon,
  [Vote.Dislike]: DislikeIcon,
}
