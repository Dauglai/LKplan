import { apiSlice} from 'App/api/apiSlice.ts';

export interface Project {
  id: number;
  direction: number;
  name: string;
  description: string | null;
  supervisor: number | null;
  curators: number[];
  creator: number;
}

const projectApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getProjects: builder.query<Project[], void>({
      query: () => ({
        url:'/api/project/',   //получение списка проектов
        withCredentials: true,} 
      ), 
      providesTags: ['Project'],
      transformResponse: (response: { count: number; next: string | null; previous: string | null; results: Project[] }) => {
        return response.results;
      },
    }),
    getProjectById: builder.query<Project, number>({
      query: (id) => ({
        url: `/api/project/${id}/`,    //Получение проекта по id
        withCredentials: true,}
      ),
      providesTags: ['Project'],
    }),
    createProject: builder.mutation<Project, Omit<Project, 'id'>>({
      query: (newProject) => ({    // Создание нового проекта
        url: '/api/project/create',
        method: 'POST',
        body: newProject,
        headers: {
          'Content-Type': 'application/json',

        },
        withCredentials: true,
      }),
      invalidatesTags: ['Project'],
    }),
    updateProject: builder.mutation<Project, { id: number; data: Omit<Project, 'id'> }>({
      query: ({ id, ...data }) => ({  // Обновление проекта
        url: `/api/project/${id}`,
        method: 'PUT',
        body: data,
        headers: {
          'Content-Type': 'application/json',

        },
        withCredentials: true,
      }),
      invalidatesTags: ['Project'],
    }),
    partialUpdateProject: builder.mutation<Project, { id: number; data: Partial<Omit<Project, 'id'>> }>({
      query: ({ id, ...data }) => ({ // Обновление проекта
        url: `/api/project/${id}`,
        method: 'PATCH',
        body: data,
        headers: {
          'Content-Type': 'application/json',

        },
        withCredentials: true,
      }),
      invalidatesTags: ['Project'],
    }),
    /* deleteProject: builder.mutation<void, number>({
      query: (id) => ({  // Удаление проекта
        url: `/api/project/${id}`,
        method: 'DELETE',
        headers: {
          'X-CSRFToken': getCSRFToken(),
        },
        withCredentials: true,
      }),
      invalidatesTags: ['Project'],
    }), */
    
  }),
});

export const {
  useGetProjectsQuery,
  useGetProjectByIdQuery,
  useCreateProjectMutation,
  useUpdateProjectMutation,
  usePartialUpdateProjectMutation,
  //useDeleteProjectMutation,
} = projectApi;
