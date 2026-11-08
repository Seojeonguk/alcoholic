import { createSlice } from '@reduxjs/toolkit';

// 글을 쓸 때 추천할 전에 쓴 태그 · 장소(#336). 많이 쓴 순서
// 갤러리가 글 목록이 바뀔 때마다 채우고, 갤러리가 사라지면(로그아웃 · 탈퇴) 비움
const initialState = {
  tags: [],
  locations: [],
};

export const suggestionSlice = createSlice({
  name: 'suggestion',
  initialState,
  reducers: {
    setSuggestions: (state, action) => {
      state.tags = action.payload.tags;
      state.locations = action.payload.locations;
    },
    clearSuggestions: () => initialState,
  },
});

export const { setSuggestions, clearSuggestions } = suggestionSlice.actions;

export default suggestionSlice.reducer;
