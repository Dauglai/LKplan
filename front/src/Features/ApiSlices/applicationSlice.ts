import { apiSlice } from 'App/api/apiSlice.ts';

export interface Application {
  id: number;
  user: number; 
  project: number; 
  event: number | null;
  direction: number | null;
  specialization: number | null;
  team: number | null;
  message: string | null;
  dateTime: Date;
  //status: number;
}

const applicationApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getApplications: builder.query<Application[], void>({
      query: () => '/api/application/',  // Получение списка заявок
      providesTags: ['Application'],
      transformResponse: (response: Application[]) => {
        return response.map((application: Application) => ({
          ...application,
          dateTime: new Date(application.dateTime),
        }));
      },
    }),
    getApplicationById: builder.query<Application, number>({
        query: (id) => `/api/application/${id}/`,  // Получение заявки по id
        providesTags: ['Application'],
        transformResponse: (response: Application) => ({
            ...response,
            dateTime: new Date(response.dateTime),
        }),
    }),
    createApplication: builder.mutation<Application, Omit<Application, 'id' | 'datetime'>>({
      query: (newApplication) => ({    // Создание новой заявки
        url: '/api/application/',
        method: 'POST',
        body: {
            ...newApplication,
            dateTime: newApplication.dateTime.toISOString(),
          },
      }),
      invalidatesTags: ['Application'],
    }),
    updateApplication: builder.mutation<Application, { id: number; data: Omit<Application, 'id' | 'datetime'> }>({
      query: ({ id, ...data }) => ({   // Обновление заявки
        url: `/api/application/${id}/`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Application'],
    }),
    partialUpdateApplication: builder.mutation<Application, { id: number; data: Partial<Omit<Application, 'id' | 'datetime'>> }>({
      query: ({ id, ...data }) => ({
        url: `/api/application/${id}/`, // Обновление заявки
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: ['Application'],
    }),      
    deleteApplication: builder.mutation<void, number>({
      query: (id) => ({   // Удаление заявки
        url: `/api/application/${id}/`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Application'],
    }),
  }),
});

export const {
  useGetApplicationsQuery,
  useGetApplicationByIdQuery,
  useCreateApplicationMutation,
  useUpdateApplicationMutation,
  usePartialUpdateApplicationMutation,
  useDeleteApplicationMutation,
} = applicationApi;
