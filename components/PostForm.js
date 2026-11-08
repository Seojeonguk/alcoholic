import { createContext, useContext, useMemo } from 'react';

// 글 작성 폼의 값과 dispatch를 입력 컴포넌트(Title · Day · Location · Tags · Content · Photo)에 넘겨 줌
// 새 글은 redux의 초안을, 글 수정은 GalleryForm의 로컬 state를 넘겨서 수정이 초안을 덮어쓰지 않음(#325)
// 두 곳 모두 gallerySlice의 reducer를 쓰므로 액션(updateTitle 등)은 같음
const PostFormContext = createContext(null);

export function PostFormProvider({ form, dispatch, children }) {
  const value = useMemo(() => ({ form, dispatch }), [form, dispatch]);
  return <PostFormContext.Provider value={value}>{children}</PostFormContext.Provider>;
}

// { form, dispatch }를 돌려줌. PostFormProvider 안에서만 씀
export function usePostForm() {
  const value = useContext(PostFormContext);
  if (!value) {
    throw new Error('usePostForm은 PostFormProvider 안에서만 쓸 수 있어요.');
  }
  return value;
}
