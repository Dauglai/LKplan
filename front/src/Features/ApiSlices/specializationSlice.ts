import { apiSlice} from 'App/api/apiSlice.ts';

export interface Specialization {
  id: number;
  name: string;
  description: string;
}


const specializationApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getSpecializations: builder.query<Specialization[], void>({
      query: () => ({
        url:'/api/specialization/',   //получение списка специализаций
        withCredentials: true,} 
      ), 
      providesTags: ['Specialization'],
      transformResponse: (response: { count: number; next: string | null; previous: string | null; results: Specialization[] }) => {
        return response.results;
      },
    }),
    getSpecializationById: builder.query<Specialization, number>({
      query: (id) => ({
        url: `/api/specialization/${id}/`,    //Получение специализации по id
        withCredentials: true,}
      ),
      providesTags: ['Specialization'],
    }),
    createSpecialization: builder.mutation<Specialization, Omit<Specialization, 'id'>>({
      query: (newSpecialization) => ({
        url: '/api/specialization/', // Создание специализации
        method: 'POST',
        body: newSpecialization,
        headers: {
          'Content-Type': 'application/json',

        },
        withCredentials: true,
      }),
      invalidatesTags: ['Specialization'],
    }),
    updateSpecialization: builder.mutation<Specialization, { id: number; data: Omit<Specialization, 'id'> }>({
      query: ({ id, ...data }) => ({
        url: `/api/specialization/${id}/`, //обновление специализации
        method: 'PUT',
        body: data,
        headers: {
          'Content-Type': 'application/json',

        },
        withCredentials: true,
      }),
      invalidatesTags: ['Specialization'],
    }),
    partialUpdateSpecialization: builder.mutation<Specialization, { id: number; data: Partial<Omit<Specialization, 'id'>> }>({
      query: ({ id, ...data }) => ({ // Обновление специализации
        url: `/api/specialization/${id}/`,
        method: 'PATCH',
        body: data,
        headers: {
          'Content-Type': 'application/json',

        },
        withCredentials: true,
      }),
      invalidatesTags: ['Specialization'],
    }),
    deleteSpecialization: builder.mutation<void, number>({
      query: (id) => ({
        url: `/api/specialization/${id}/`, // Удаление специализации
        method: 'DELETE',
        headers: {

        },
        withCredentials: true,
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