export interface ZSetMemberPropTypes {
  name: string
  score: string
}

export interface ZSetPropTypes {
  keyName: string
  total: number
  ttl: number
  size: number
  members: ZSetMemberPropTypes[]
}
