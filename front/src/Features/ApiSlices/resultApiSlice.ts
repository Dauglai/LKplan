// Features/ApiSlices/resultApiSlice.ts
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { apiSlice } from 'App/api/apiSlice.ts';

export interface Result {
  id: number;
  name: string;
  link: string;
  team: number;
}
export const ResultApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getAllResults: builder.query({
      query: () =>({
        url: `api/results/`,
        withCredentials: true,
      }),
      transformResponse: (response: { results: Result[] }) => response.results,
      providesTags: ['Result'],
    }),
    getResults: builder.query<Result[], number>({
      query: (teamId) =>({
        url: `api/results/?team=${teamId}`,
        withCredentials: true,
      }),
      transformResponse: (response: { results: Result[] }) => response.results,
      providesTags: ['Result'],
    }),
    createResult: builder.mutation<Result, Partial<Result>>({
      query: ( data) => ({
        url: `api/results/`,
        method: 'POST',
        body: data,
        headers: {
          'Content-Type': 'application/json',
        },
        withCredentials: true,
      }),
      invalidatesTags: ['Result'],
    }),
    updateResult: builder.mutation<Result, Partial<Result> & { id: number }>({
      query: ({ id, ...body }) => ({
        url: `api/results/${id}/`,
        method: 'PATCH',
        body,
      }),
      headers: {
        'Content-Type': 'application/json',
      },
      withCredentials: true,
      invalidatesTags: ['Result'],
    }),
  }),
});

export const { useGetAllResultsQuery, useGetResultsQuery, useCreateResultMutation, useUpdateResultMutation } = ResultApiSlice;
