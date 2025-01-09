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
      query: () => '/api/teams/', // Получение списка команд
      providesTags: ['Team'],
    }),
    getTeamById: builder.query<Team, number>({
      query: (id) => `/api/teams/${id}`, // Получение команды по ID
      providesTags: ['Team'],
    }),
    createTeam: builder.mutation<Team, Omit<Team, 'id'>>({
      query: (newTeam) => ({ // Создание команды
        url: '/api/teams/create',
        method: 'POST',
        body: newTeam,
      }),
      invalidatesTags: ['Team'],
    }),
    updateTeam: builder.mutation<Team, { id: number; data: Omit<Team, 'id'> }>({
      query: ({ id, ...data }) => ({
        url: `/api/teams/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Team'],
    }),
    partialUpdateTeam: builder.mutation<Team, { id: number; data: Partial<Omit<Team, 'id'>> }>({
      query: ({ id, data }) => ({
        url: `/api/teams/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: ['Team'],
    }),
    /* deleteTeam: builder.mutation<void, number>({
      query: (id) => ({
        url: `/api/teams/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Team'],
    }), */
  }),
});

export const {
  useGetTeamsQuery,
  useGetTeamByIdQuery,
  useCreateTeamMutation,
  useUpdateTeamMutation,
  usePartialUpdateTeamMutation,
  //useDeleteTeamMutation,
} = teamApi;

