import { apiSlice } from 'App/api/apiSlice.ts';

export interface Specialization {
    id: number;
    name: string;
    description: string;
}

const specializationApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getSpecializations: builder.query<Specialization[], void>({
      query: () => '/api/specialization/', //получение списка специализаций
      providesTags: ['Specialization'],
    }),
    getSpecializationById: builder.query<Specialization, number>({
      query: (id) => `/api/specialization/${id}/`, //Получение специализации по id
      providesTags: ['Specialization'],
    }),
    createSpecialization: builder.mutation<Specialization, Omit<Specialization, 'id'>>({
      query: (newSpecialization) => ({
        url: '/api/specialization/create', //создание специализации
        method: 'POST',
        body: newSpecialization,
      }),
      invalidatesTags: ['Specialization'],
    }),
    updateSpecialization: builder.mutation<Specialization, { id: number; data: Omit<Specialization, 'id'> }>({
      query: ({ id, ...data }) => ({
        url: `/api/specialization/${id}/`, //обновление специализации
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Specialization'],
    }),
    partialUpdateSpecialization: builder.mutation<Specialization, { id: number; data: Partial<Omit<Specialization, 'id'>> }>({
      query: ({ id, ...data }) => ({ // Обновление специализации
        url: `/api/specialization/${id}/`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: ['Specialization'],
    }),
    deleteSpecialization: builder.mutation<void, number>({
      query: (id) => ({
        url: `/api/specialization/${id}/`, // Удаление специализации
        method: 'DELETE',
      }),
      invalidatesTags: ['Specialization'],
    }),
  }),
});

export const {
  useGetSpecializationsQuery,
  useGetSpecializationByIdQuery,
  useCreateSpecializationMutation,
  useUpdateSpecializationMutation,
  usePartialUpdateSpecializationMutation,
  useDeleteSpecializationMutation,
} = specializationApi;