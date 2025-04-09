import { apiSlice } from 'App/api/apiSlice.ts';

interface User {
  telegram?: string;
  email?: string;
  surname?: string;
  name?: string;
  partonymic?: string;
  course?: number;
  university?: string;
  vk?: string;
  job?: string;
  specializations?: number[];
}

interface Comment {
  id: number;
  author_info: User;
  task: number;
  file: string;
  content: string;
}

export const CommentApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // 🔹 Получить все чек-листы для задачи
    getCommentsByTask: builder.query<Comment[], number>({
      query: (taskId) => ({
        url: `/api/tasks/${taskId}/comments/`,
        withCredentials: true,
      }),
      transformResponse: (response: { results: Comment[] }) => response.results,
      providesTags: ['Comment'],
    }),

    // 🔹 Создать чек-лист для задачи
    createComment: builder.mutation<Comment, { taskId: number; data: FormData }>({
      query: ({ taskId, data }) => ({
        url: `/api/tasks/${taskId}/comments/`,
        method: 'POST',
        body: data,
        withCredentials: true,
      }),
      invalidatesTags: (result, error, { taskId }) => [{ type: 'Comment', id: taskId }],
    }),

    updateComment: builder.mutation<Comment, { id: number; data: FormData | Partial<Comment> }>({
      query: ({ id, data }) => ({
        url: `/api/comments/${id}/`,
        method: 'PATCH',
        body: data,
        withCredentials: true,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Comment', id }],
    }),

    // 🔹 Удалить чек-лист
    deleteComment: builder.mutation<void, number>({
      query: (id) => ({
        url: `/api/comments/${id}/`,
        method: 'DELETE',
        withCredentials: true,
      }),
      invalidatesTags: (result, error, id) => [{ type: 'Comment', id: id }],
    }),

  }),
});

export const {
  useGetCommentsByTaskQuery,
  useCreateCommentMutation,
  useUpdateCommentMutation,
  useDeleteCommentMutation,
} = CommentApiSlice;
