import { apiSlice } from 'App/api/apiSlice.ts';
import { StatusApp } from './statusAppSlice';
import { Event } from './eventSlice';
import { Project } from './projectSlice';
import { Direction } from './directionSlice';
import { Team } from './teamSlice';

/**
 * Интерфейс для представления данных заявок
 * Используется для описания структуры объектов заявлений в системе.
 */
export interface Application {
  id: number;
  user: number; 
  project: Project | null; 
  event: Event;
  direction: Direction | null;
  specialization: number | null;
  team: Team | null;
  message: string | null;
  date_sub: Date;
  date_end: Date;
  status: StatusApp;
  is_link: boolean;
  is_approved: boolean;
  comment: string | null;
}

const applicationApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getApplications: builder.query<Application[], void>({
      query: () => ({
        url:'/api/application/',   // Получение списка заявок
        withCredentials: true,} 
      ),
      providesTags: ['Application'],
      transformResponse: (response: { count: number; next: string | null; previous: string | null; results: Application[] }) => {
        return response.results.map((application: Application) => ({
          ...application,
          date_sub: new Date(application.date_sub),
        }));
      },
    }),
    getApplicationsUsers: builder.query<Application[], void>({
      query: () => ({
          url:'/api/application/',   // Получение списка заявок
          withCredentials: true,}
      ),
      providesTags: ['Application'],
      transformResponse: (response: { count: number; next: string | null; previous: string | null; results: Application[] }) => {
        return response.results
      },
    }),
    getUserApplications: builder.query<Application[], number>({
      query: (user_id) => ({
          url:`api/application/?user=${user_id}`,   // Получение списка заявок текущего пользователя
          withCredentials: true,}
      ),
      providesTags: ['Application'],
      transformResponse: (response: { results: Application[] }) => response.results,
    }),
    getApplicationById: builder.query<Application, number>({
        query: (id) => ({
          url: `/api/application/${id}`,  // Получение заявки по id
          withCredentials: true,}
        ),
        providesTags: ['Application'],
        transformResponse: (response: Application) => ({
            ...response,
            date_sub: new Date(response.date_sub),
        }),
    }),
    createApplication: builder.mutation<Application, Omit<Application, 'id' | 'datetime'>>({
      query: (newApplication) => ({    // Создание новой заявки
        url: '/api/application/create/',
        method: 'POST',
        body: newApplication,
        headers: {
            'Content-Type': 'application/json',
          },
        withCredentials: true,
      }),
      invalidatesTags: ['Application'],
    }),
    updateApplication: builder.mutation<Application, { id: number; data: Omit<Application, 'id' | 'datetime'> }>({
      query: ({ id, ...data }) => ({   // Обновление заявки
        url: `/api/application/${id}`,
        method: 'PUT',
        body: data,
        headers: {
          'Content-Type': 'application/json',
          
        },
      withCredentials: true,
      }),
      invalidatesTags: ['Application'],
    }),
    partialUpdateApplication: builder.mutation<Application, { id: number; data: Partial<Omit<Application, 'id' | 'datetime'>> }>({
      query: ({ id, data }) => ({
        url: `/api/application/${id}`, // Обновление заявки
        method: 'PATCH',
        body: data,
        headers: {
          'Content-Type': 'application/json',
          
        },
      withCredentials: true,
      }),
      invalidatesTags: ['Application'],
    }),      
    deleteApplication: builder.mutation<void, number>({
      query: (id) => ({   // Удаление заявки
        url: `/api/application/delete/${id}`,
        method: 'DELETE',
        
        withCredentials: true,
      }),
      invalidatesTags: ['Application'],
    }),
  }),
});

export const {
  useGetApplicationsQuery,
  useGetApplicationsUsersQuery,
  useGetUserApplicationsQuery,
  useGetApplicationByIdQuery,
  useCreateApplicationMutation,
  useUpdateApplicationMutation,
  usePartialUpdateApplicationMutation,
  useDeleteApplicationMutation,
} = applicationApi;
