import { apiSlice  } from 'App/api/apiSlice.ts';
import dayjs from 'dayjs';

/**
 * Интерфейс для представления данных мероприятия.
 * Используется для описания структуры объекта мероприятия в системе.
 */
export interface Event {
  event_id?: number;  // Уникальный идентификатор мероприятия (не обязательный, может быть строковым или числовым)
  name: string;       // Название мероприятия
  specializations: number[]; // Список идентификаторов специализаций, связанных с мероприятием
  description: string | null; // Описание мероприятия
  start: string | null;       // Дата и время начала мероприятия
  end: string | null;         // Дата и время окончания мероприятия
  end_app: string | null;     // Дата и время окончания подачи заявок
  stage: string;              // Этап мероприятия
}

/**
 * API-слайс для работы с данными мероприятий.
 * Включает в себя эндпоинты для получения, создания, обновления и удаления мероприятий.
 */
const eventApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Эндпоинт для получения списка мероприятий.
    getEvents: builder.query<Event[], void>({
      query: () => ({
        url: '/api/events/',  // URL для получения списка мероприятий
        withCredentials: true, // Отправка сессии/кредитов пользователя
      }),
      providesTags: ['Event'], // Указывает, что данные мероприятий должны быть обновлены/перезапрошены
      transformResponse: (response: { count: number; next: string | null; previous: string | null; results: Event[] }) => {
        return response.results.map(event => ({
          ...event,
          start: event.start ? new Date(event.start) : null,   // Преобразуем дату начала в объект Date
          end: event.end ? new Date(event.end) : null,         // Преобразуем дату окончания в объект Date
          end_app: event.end_app ? new Date(event.end_app) : null, // Преобразуем дату окончания подачи заявок в объект Date
        }));
      },
    }),

    // Эндпоинт для получения одного мероприятия по его ID.
    getEventById: builder.query<Event, number>({
      query: (id) => ({
        url: `/api/events/${id}`,  // URL для получения мероприятия по ID
        withCredentials: true,
      }),
      providesTags: (result, error, id) => [{ type: 'Event', id }], // Тег для обновления конкретного мероприятия
      transformResponse: (response: Event) => ({
        ...response,
        start: response.start ? new Date(response.start) : null,   // Преобразуем даты в объект Date
        end: response.end ? new Date(response.end) : null,
        end_app: response.end_app ? new Date(response.end_app) : null,
      }),
    }),

    // Эндпоинт для создания нового мероприятия.
    createEvent: builder.mutation<Event, Omit<Event, 'event_id'>>({
      query: (newEvent) => {
        const formatDate = (value?: string | null) => {
          const parsed = dayjs(value, 'DD.MM.YYYY', true); // Используем dayjs для парсинга и форматирования даты
          return parsed.isValid() ? parsed.format('YYYY-MM-DD') : null;
        };

        return {
          url: '/api/events/create/',  // URL для создания нового мероприятия
          method: 'POST',              // Метод POST
          body: {
            ...newEvent,
            start: formatDate(newEvent.start),  // Форматируем дату начала
            end: formatDate(newEvent.end),      // Форматируем дату окончания
            end_app: formatDate(newEvent.end_app),  // Форматируем дату окончания подачи заявок
          },
          headers: {
            'Content-Type': 'application/json', // Указываем, что тело запроса в формате JSON
          },
          withCredentials: true,  // Отправка сессии/кредитов пользователя
        };
      },
      invalidatesTags: ['Event'], // После создания нужно обновить список мероприятий
    }),

    // Эндпоинт для обновления мероприятия.
    updateEvent: builder.mutation<Event, { id: number; data: Omit<Event, 'event_id'> }>({
      query: ({ id, data }) => ({
        url: `/api/events/${id}`,  // URL для обновления мероприятия по ID
        method: 'PUT',             // Метод PUT для полного обновления
        body: data,               // Тело запроса: обновленные данные мероприятия
        headers: {
          'Content-Type': 'application/json', // Указываем, что тело запроса в формате JSON
        },
        withCredentials: true,  // Отправка сессии/кредитов пользователя
      }),
      invalidatesTags: ['Event'], // После обновления нужно перезапросить данные мероприятий
    }),

    // Эндпоинт для частичного обновления мероприятия.
    partialUpdateEvent: builder.mutation<Event, { id: number; data: Partial<Omit<Event, 'event_id'>> }>({
      query: ({ id, data }) => ({
        url: `/api/events/${id}`,  // URL для частичного обновления мероприятия по ID
        method: 'PATCH',           // Метод PATCH для частичного обновления
        body: data,               // Тело запроса: частично обновленные данные мероприятия
        headers: {
          'Content-Type': 'application/json', // Указываем, что тело запроса в формате JSON
        },
        withCredentials: true,  // Отправка сессии/кредитов пользователя
      }),
      invalidatesTags: ['Event'], // После обновления нужно перезапросить данные мероприятий
    }),

    // Эндпоинт для удаления мероприятия.
    deleteEvent: builder.mutation<void, number>({
      query: (id) => ({
        url: `/api/events/delete/${id}`,  // URL для удаления мероприятия по ID
        method: 'DELETE',                 // Метод DELETE для удаления
        withCredentials: true,            // Отправка сессии/кредитов пользователя
      }),
      invalidatesTags: ['Event'], // После удаления нужно перезапросить данные мероприятий
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


