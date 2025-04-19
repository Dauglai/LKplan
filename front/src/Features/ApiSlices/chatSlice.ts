import { apiSlice } from 'App/api/apiSlice.ts';

export interface Chat {
  id?: number;
  event: number
  type: 'ВК' | 'ТГ';
  name: string; 
  description: string | null;
  link: string;
}

const chatApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getchats: builder.query<chat[], number>({
      query: () => ({
        url: `/api/chat/list`,
        withCredentials: true,
      }),
      providesTags: ['Chat'],
    }),
    
    // Получение одного чата по ID
    getchatById: builder.query<chat, number>({
      query: (id) => ({
        url: `/api/orgChat/detail/${id}`, // Получаем чат по ID
        withCredentials: true,
      }),
      providesTags: ['Chat'],
    }),
    
    // Создание нового чата
    createchat: builder.mutation<chat, Omit<chat, 'id'>>({
      query: (newChat) => ({
        url: '/api/orgChat/create',
        method: 'POST',
        body: newChat,
        headers: {
          'Content-Type': 'application/json',
        },
        withCredentials: true,
      }),
      invalidatesTags: ['Chat'],
    }),

    // Обновление чата
    updatechat: builder.mutation<chat, { id: number; data: Omit<chat, 'id'> }>({
      query: ({ id, ...data }) => ({
        url: `/api/orgChat/detail/${id}`,
        method: 'PUT',
        body: data,
        headers: {
          'Content-Type': 'application/json',
        },
        withCredentials: true,
      }),
      invalidatesTags: ['Chat'],
    }),

    // Частичное обновление чата
    partialUpdatechat: builder.mutation<chat, { id: number; data: Partial<Omit<chat, 'id'>> }>({
      query: ({ id, ...data }) => ({
        url: `/api/orgChat/detail/${id}`,
        method: 'PATCH',
        body: data,
        headers: {
          'Content-Type': 'application/json',
        },
        withCredentials: true,
      }),
      invalidatesTags: ['Chat'],
    }),

    // Удаление чата
    deletechat: builder.mutation<void, number>({
      query: (id) => ({
        url: `/api/orgChat/detail/${id}`,
        method: 'DELETE',
        withCredentials: true,
      }),
      invalidatesTags: ['Chat'],
    }),
  }),
});

export const {
  useGetchatsQuery,
  useGetchatByIdQuery,
  useCreatechatMutation,
  useUpdatechatMutation,
  usePartialUpdatechatMutation,
  useDeletechatMutation,
} = chatApi;
