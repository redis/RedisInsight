export interface Tag {
  id: string
  key: string
  value: string
  createdAt: string
  updatedAt: string
}

export interface InitialTagsState {
  data: Tag[]
  selectedTags: Set<string>
  loading: boolean
  error: string | null
}
