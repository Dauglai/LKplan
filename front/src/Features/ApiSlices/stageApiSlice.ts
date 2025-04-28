import { apiSlice} from 'App/api/apiSlice.ts';

export interface Stage {
  id: number;
  name: string;
  color: string;
  project: number;
  position: number;
}

const stageApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({

    getStages: builder.query<Stage[], void>({
      query: () => ({
        url: '/api/stages/',
        withCredentials: true,
      }),
      providesTags: ['Stage'],
      transformResponse: (response: { count: number; next: string | null; previous: string | null; results: Stage[] }) => {
        return response.results;
      },
    }),

    getStageById: builder.query<Stage, number>({
      query: (id) => ({
        url: `/api/stages/${id}`,
        withCredentials: true,
      }),
      providesTags: ['Stage'],
    }),

    createStage: builder.mutation<Stage, Omit<Stage, 'id'>>({
      query: (data) => ({    // Создание нового проекта
        url: '/api/stages/',
        method: 'POST',
        body: data,
        headers: {
          'Content-Type': 'application/json',
        },
        withCredentials: true,
      }),
      invalidatesTags: ['Stage'],
    }),

    updateStage: builder.mutation<Stage, { id: number; data: Partial<Stage> }>({
      query: ({ id, data }) => ({  // Обновление проекта
        url: `/api/stages/${id}/`,
        method: 'PUT',
        body: data,
        headers: {
          'Content-Type': 'application/json',
        },
        withCredentials: true,
      }),
      invalidatesTags: ['Stage'],
    }),

    partialUpdateStage: builder.mutation<Stage, { id: number; data: Partial<Omit<Stage, 'id'>> }>({
      query: ({ id, ...data }) => ({ // Обновление проекта
        url: `/api/stages/${id}/`,
        method: 'PATCH',
        body: data,
        headers: {
          'Content-Type': 'application/json',
        },
        withCredentials: true,
      }),
      invalidatesTags: ['Stage'],
    }),

    deleteStage: builder.mutation<void, number>({
      query: (id) => ({
        url: `/api/stages/${id}/`,
        method: 'DELETE',
        withCredentials: true,
      }),
      invalidatesTags: ['Stage'],
    }),

  }),
});


export const {
  useGetStagesQuery,
  useGetStageByIdQuery,
  useCreateStageMutation,
  useUpdateStageMutation,
  usePartialUpdateStageMutation,
  useDeleteStageMutation,
} = stageApi;
