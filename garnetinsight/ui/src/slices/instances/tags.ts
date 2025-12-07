import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { ApiEndpoints } from 'uiSrc/constants'
import { apiService } from 'uiSrc/services'
import { RootState } from '../store'
import { InitialTagsState } from '../interfaces/tag'

export const initialState: InitialTagsState = {
  data: [],
  selectedTags: new Set<string>(),
  loading: false,
  error: null,
}

export const fetchTags = createAsyncThunk('tags/fetchTags', async () => {
  const response = await apiService.get(ApiEndpoints.TAGS)
  return response.data
})

const tagsSlice = createSlice({
  name: 'tags',
  initialState,
  reducers: {
    setSelectedTags: (
      state,
      action: PayloadAction<InitialTagsState['selectedTags']>,
    ) => {
      state.selectedTags = action.payload
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTags.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchTags.fulfilled, (state, action) => {
        state.loading = false
        state.data = action.payload
      })
      .addCase(fetchTags.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to fetch tags'
      })
  },
})

export const { setSelectedTags } = tagsSlice.actions

export const tagsSelector = (state: RootState) => state.connections.tags

export default tagsSlice.reducer
