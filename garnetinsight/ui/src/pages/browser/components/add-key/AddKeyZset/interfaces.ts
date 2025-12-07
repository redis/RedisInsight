export interface IZsetMemberState {
  name: string
  score: string
  id: number
}

export const INITIAL_ZSET_MEMBER_STATE: IZsetMemberState = {
  name: '',
  score: '',
  id: 0,
}
