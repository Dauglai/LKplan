import { apiSlice } from 'App/api/apiSlice.ts';

export interface Team {
  id: number;
  name: string;
  project: number | null;
  students: number[]; 
}

const teamApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getTeams: builder.query<Team[], void>({
      query: () => ({
        url:'/api/teams/',   //получение списка команд
        withCredentials: true,} 
      ), 
      providesTags: ['Team'],
      transformResponse: (response: { count: number; next: string | null; previous: string | null; results: Team[] }) => {
        return response.results;
      },
    }),
    getTeamById: builder.query<Team, number>({
      query: (id) => ({
        url: `/api/teams/${id}/`,    //Получение команды по id
        withCredentials: true,}
      ),
      providesTags: ['Team'],
    }),
    createTeam: builder.mutation<Team, Omit<Team, 'id'>>({
      query: (newTeam) => ({ // Создание команды
        url: '/api/teams/create/',
        method: 'POST',
        body: newTeam,
        headers: {
          'Content-Type': 'application/json',

        },
        withCredentials: true,
      }),
      invalidatesTags: ['Team'],
    }),
    updateTeam: builder.mutation<Team, { id: number; data: Omit<Team, 'id'> }>({
      query: ({ id, data }) => ({
        url: `/api/teams/${id}/`,
        method: 'PUT',
        body: data,
        headers: {
          'Content-Type': 'application/json',
        },
        withCredentials: true,
      }),
      invalidatesTags: ['Team'],
    }),
    partialUpdateTeam: builder.mutation<Team, { id: number; data: Partial<Omit<Team, 'id'>> }>({
      query: ({ id, data }) => ({
        url: `/api/teams/${id}/`,
        method: 'PATCH',
        body: data,
        headers: {
          'Content-Type': 'application/json',

        },
        withCredentials: true,
      }),
      invalidatesTags: ['Team'],
    }),
    deleteTeam: builder.mutation<void, number>({
      query: (id) => ({
        url: `/api/teams/${id}/`,
        method: 'DELETE',
        withCredentials: true,
      }),
      invalidatesTags: ['Team'],
    }),
  }),
});

export const {
  useGetTeamsQuery,
  useGetTeamByIdQuery,
  useCreateTeamMutation,
  useUpdateTeamMutation,
  usePartialUpdateTeamMutation,
  useDeleteTeamMutation,
} = teamApi;

