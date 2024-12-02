export type Request = {
    id: number;
    name: string;
    status: 'Новые заявки' | 'Вступившие в орг. чат' | 'Приступившие к работе';
    eventName: string;
    direction: 'Игры' | 'Веб-разработка' | '1С';
    project: string;
    specialization: 'Дизайн' | 'Аналитика' | 'Фронтенд';
    testScore: number;
    institution: string;
    course: number;
};
  
  