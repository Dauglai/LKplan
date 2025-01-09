import { apiSlice, getCSRFToken } from 'App/api/apiSlice.ts';

export interface Review {
  id: number;
  application: number;
  status: number;
  is_link: boolean;
  is_approved: boolean;
  comment: string | null;
  dateTime: Date;
}

const reviewApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getReviews: builder.query<Review[], void>({
      query: () => ({
        url:'/api/app_review/',   //получение списка отзывов
        withCredentials: true,} 
      ), 
      providesTags: ['AppReview'],
      transformResponse: (response: Review[]) => {
        return response.map((review: Review) => ({
          ...review,
          dateTime: new Date(review.dateTime),
        }));
      },
    }),
    getReviewById: builder.query<Review, number>({
      query: (id) => ({
        url: `/api/app_review/${id}/`,    //Получение отзыва по id
        withCredentials: true,}
      ),
      providesTags: ['AppReview'],
      transformResponse: (response: Review) => ({
        ...response,
        dateTime: new Date(response.dateTime),
      }),
    }),
    createReview: builder.mutation<Review, Omit<Review, 'id' | 'dateTime'>>({
      query: (newReview) => ({ //Создание отзыва
        url: '/api/app_review/',
        method: 'POST',
        body: newReview,
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': getCSRFToken(),
        },
        withCredentials: true,
      }),
      invalidatesTags: ['AppReview'],
    }),
    updateReview: builder.mutation<Review, { id: number; data: Omit<Review, 'id' | 'dateTime'> }>({
      query: ({ id, ...data }) => ({
        url: `/api/app_review/${id}/`,
        method: 'PUT',
        body: data,
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': getCSRFToken(),
        },
        withCredentials: true,
      }),
      invalidatesTags: ['AppReview'],
    }),
    partialUpdateReview: builder.mutation<Review, { id: number; data: Partial<Omit<Review, 'id' | 'dateTime'>> }>({
      query: ({ id, ...data }) => ({
        url: `/api/app_review/${id}/`,
        method: 'PATCH',
        body: data,
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': getCSRFToken(),
        },
        withCredentials: true,
      }),
      invalidatesTags: ['AppReview'],
    }),
    deleteReview: builder.mutation<void, number>({
      query: (id) => ({
        url: `/api/app_review/${id}/`,
        method: 'DELETE',
        headers: {
          'X-CSRFToken': getCSRFToken(),
        },
        withCredentials: true,
      }),
      invalidatesTags: ['AppReview'],
    }),
  }),
});

export const {
  useGetReviewsQuery,
  useGetReviewByIdQuery,
  useCreateReviewMutation,
  useUpdateReviewMutation,
  usePartialUpdateReviewMutation,
  useDeleteReviewMutation,
} = reviewApi;

