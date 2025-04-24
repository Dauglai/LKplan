import { apiSlice } from 'App/api/apiSlice.ts';

export interface Meeting {
  id: number;
  name: string;
  datetime: string;
  event: number;
}

export interface RespondPayload {
  user: number;
  meeting: number;
  attending: boolean;
  reason: string;
}

export const MeetingApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getAllMeetings: builder.query({
      query: () =>({
        url: `api/meetings/`,
        withCredentials: true,
      }),
      transformResponse: (response: { results: Meeting[] }) => response.results,
      providesTags: ['Meeting'],
    }),
    getMeetings: builder.query<Meeting[], number>({
      query: (teamId) =>({
        url: `api/meetings/?team=${teamId}`,
        withCredentials: true,
      }),
      transformResponse: (response: { results: Meeting[] }) => response.results,
      providesTags: ['Meeting'],
    }),

    // 🔹 Получить собрания по пользователю
    getUserMeetings: builder.query<Meeting[], number>({
      query: (userId) => ({
        url: `api/meetings/?participant=${userId}`,
        withCredentials: true,
      }),
      transformResponse: (response: { meetings: Meeting[] }) => response.results,
      providesTags: ['Meeting'],
    }),

    // 🔹 Получить собрания по команде
    getTeamMeetings: builder.query<Meeting[], number>({
      query: (teamId) => ({
        url: `api/meetings/?team=${teamId}`,
        withCredentials: true,
      }),
      transformResponse: (response: { meetings: Meeting[] }) => response.results,
      providesTags: ['Meeting'],
    }),

    createMeeting: builder.mutation<Meeting, Partial<Meeting>>({
      query: ( data) => ({
        url: `api/meetings/`,
        method: 'POST',
        body: data,
        headers: {
          'Content-Type': 'application/json',
        },
        withCredentials: true,
      }),
      invalidatesTags: ['Meeting'],
    }),


    updateMeeting: builder.mutation<Meeting, Partial<Meeting> & { id: number }>({
      query: ({ id, ...body }) => ({
        url: `api/meetings/${id}/`,
        method: 'PATCH',
        body,
      }),
      headers: {
        'Content-Type': 'application/json',
      },
      withCredentials: true,
      invalidatesTags: ['Meeting'],
    }),

    respondMeeting: builder.mutation<void, RespondPayload>({
      query: (body) => ({
        url: `api/meetings/respond/`,
        method: 'POST',
        body,
        headers: {
          'Content-Type': 'application/json',
        },
        withCredentials: true,
      }),
      invalidatesTags: ['RespondPayload'],
    }),

  }),
});

export const { useGetAllMeetingsQuery,   useGetUserMeetingsQuery,
  useGetTeamMeetingsQuery, useGetMeetingsQuery, useCreateMeetingMutation, useUpdateMeetingMutation, useRespondMeetingMutation } = MeetingApiSlice;
