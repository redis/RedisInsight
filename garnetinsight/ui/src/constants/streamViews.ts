import { StreamViewType } from 'uiSrc/slices/interfaces/stream'

export const StreamViews = Object.freeze({
  [StreamViewType.Data]: 'entries',
  [StreamViewType.Groups]: 'consumer_groups',
  [StreamViewType.Consumers]: 'consumers',
  [StreamViewType.Messages]: 'pending_messages_list',
})
