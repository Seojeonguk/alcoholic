import { createSlice } from '@reduxjs/toolkit';

// 갤러리가 받아 온 내 글 목록(갤러리 목록 모양). 통계 탭(#342)이 Firestore를 다시 읽지 않고 이 목록으로 계산함
// 갤러리가 처음 불러온 뒤부터 글이 바뀔 때마다 채우고, 갤러리가 사라지면(로그아웃 · 탈퇴) 비움
const initialState = {
  items: [],
  // 갤러리가 한 번이라도 불러왔는지. 불러오기 전에는 통계 탭에 자리 표시를 보여 줌
  loaded: false,
};

export const postsSlice = createSlice({
  name: 'posts',
  initialState,
  reducers: {
    setPosts: (state, action) => {
      state.items = action.payload;
      state.loaded = true;
    },
    clearPosts: () => initialState,
  },
});

export const { setPosts, clearPosts } = postsSlice.actions;

export default postsSlice.reducer;
