import { apiSlice } from 'App/api/apiSlice.ts';

export interface Project {
  id: number;
  direction: number;
  name: string;
  description: string | null;
  supervisor: number | null;
  curators: number[];
  author: number;
}

const projectApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getProjects: builder.query<Project[], void>({
      query: () => '/api/project/',  // Получение списка проектов
      providesTags: ['Project'],
    }),
    getProjectById: builder.query<Project, number>({
      query: (id) => `/api/project/${id}`, // Получение проекта по id
      providesTags: ['Project'],
    }),
    createProject: builder.mutation<Project, Omit<Project, 'id'>>({
      query: (newProject) => ({    // Создание нового проекта
        url: '/api/project/create',
        method: 'POST',
        body: newProject,
      }),
      invalidatesTags: ['Project'],
    }),
    updateProject: builder.mutation<Project, { id: number; data: Omit<Project, 'id'> }>({
      query: ({ id, ...data }) => ({  // Обновление проекта
        url: `/api/project/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Project'],
    }),
    partialUpdateProject: builder.mutation<Project, { id: number; data: Partial<Omit<Project, 'id'>> }>({
      query: ({ id, ...data }) => ({ // Обновление проекта
        url: `/api/project/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: ['Project'],
    }),
    deleteProject: builder.mutation<void, number>({
      query: (id) => ({  // Удаление проекта
        url: `/api/project/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Project'],
    }),
    
  }),
});

export const {
  useGetProjectsQuery,
  useGetProjectByIdQuery,
  useCreateProjectMutation,
  useUpdateProjectMutation,
  usePartialUpdateProjectMutation,
  useDeleteProjectMutation,
} = projectApi;
