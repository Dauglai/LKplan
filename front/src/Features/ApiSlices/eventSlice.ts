import { apiSlice, getCSRFToken  } from 'App/api/apiSlice.ts';

export interface Event {
  id: number;
  name: string;
  specializations: number[];
  statuses: number[];
  description: string | null;
  link: string | null;
  start: Date | null;
  end: Date | null;
  supervisor: number;
  author: number;
}

const eventApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getEvents: builder.query<Event[], void>({
      query: () => ({
        url:'/api/events/',   //получение списка мероприятий
        withCredentials: true,} 
      ), 
      providesTags: ['Event'],
      transformResponse: (response: Event[]) => {
        return response.map(event => ({
          ...event,
          start: event.start ? new Date(event.start) : null,
          end: event.end ? new Date(event.end) : null,
        }));
      },
    }),
    getEventById: builder.query<Event, number>({
      query: (id) => ({
        url: `/api/events/${id}/`,    //Получение мероприятия по id
        withCredentials: true,}
      ),
      providesTags: (result, error, id) => [{ type: 'Event', id }],
      transformResponse: (response: Event) => ({
        ...response,
        start: response.start ? new Date(response.start) : null,
        end: response.end ? new Date(response.end) : null,
      }),
    }),
    createEvent: builder.mutation<Event, Omit<Event, 'id'>>({
      query: (newEvent) => ({ // Создаем новое мероприятие
        url: '/api/events/',
        method: 'POST',
        body: {
            ...newEvent,
            start: newEvent.start ? newEvent.start.toISOString() : null,
            end: newEvent.end ? newEvent.end.toISOString() : null,
        },
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': getCSRFToken(),
        },
        withCredentials: true,  
      }),
      invalidatesTags: ['Event'],
    }),
    updateEvent: builder.mutation<Event, { id: number; data: Omit<Event, 'id' | 'statuses' | 'specializations'> }>({
      query: ({ id, data }) => ({   // Обновляем мероприятие
        url: `/api/events/${id}/`,
        method: 'PUT',
        body: {
          ...data,
          start: data.start ? data.start.toISOString() : null,
          end: data.end ? data.end.toISOString() : null,
        },
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': getCSRFToken(),
        },
        withCredentials: true,
      }),
      invalidatesTags: ['Event'],
    }),
    partialUpdateEvent: builder.mutation<Event, { id: number; data: Partial<Omit<Event, 'id' | 'statuses' | 'specializations'>> }>({
      query: ({ id, data }) => ({   // Обновляем мероприятие
        url: `/api/events/${id}/`,
        method: 'PATCH',
        body: {
          ...data,
          start: data.start ? data.start.toISOString() : null,
          end: data.end ? data.end.toISOString() : null,
        },
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': getCSRFToken(),
        },
        withCredentials: true,
      }),
      invalidatesTags: ['Event'],
    }),
    deleteEvent: builder.mutation<void, number>({
      query: (id) => ({  // Удаляем мероприятие
        url: `/api/events/${id}/`,
        method: 'DELETE', 
        headers: {
          'X-CSRFToken': getCSRFToken(),
        },
        withCredentials: true,
      }),
      invalidatesTags: ['Event'],
    }),
  }),
});

export const {
  useGetEventsQuery,
  useGetEventByIdQuery,
  useCreateEventMutation,
  useUpdateEventMutation,
  usePartialUpdateEventMutation,
  useDeleteEventMutation,
} = eventApi;

