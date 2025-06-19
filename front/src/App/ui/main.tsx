import React, { StrictMode } from 'react'; // Базовые React-импорты
import { createRoot } from 'react-dom/client'; // Рендеринг React-приложения
import { BrowserRouter, Route, Routes } from 'react-router-dom'; // Маршрутизация
import { Provider } from 'react-redux'; // Redux Provider
import { UserRolesProvider } from 'Features/context/UserRolesContext.tsx'; // Контекст ролей пользователя
import './index.css'; // Глобальные стили

import App from './App.tsx'; // Главный компонент приложения
import { store } from '../model/store.ts'; // Redux store

import Layout from 'Shared/ui/layout/layout.tsx'; // Основной layout
import RequireAuth from 'Shared/ui/requireAuth.tsx'; // HOC для авторизации
import { RequireRole } from 'Shared/ui/RequireRole.tsx'; // HOC для проверки ролей
import { NotificationProvider } from 'Components/Common/Notification/Notification.tsx'; // Уведомления

// Импорты страниц
import Login from 'Pages/Login/Login.tsx'; // Страница входа
import Register from 'Pages/Register/Register.tsx'; // Страница регистрации
import Profile from 'Pages/Profile/Profile.tsx'; // Профиль пользователя
import RequestsManagement from 'Pages/RequestsList/RequestsManagement.tsx'; // Управление заявками
import Tasks from 'Pages/Tasks/Tasks.tsx'; // Задачи проекта
import { ConfigProvider } from 'antd'; // Ant Design провайдер
import EventsManagement from 'Pages/EventsList/EventsManagement.tsx'; // Управление событиями
import ProjectsManagement from 'Pages/ProjectsList/ProjectsManagement.tsx'; // Управление проектами
import DirectionsManagement from 'Pages/DirectionsList/DirectionsManagement.tsx'; // Управление направлениями
import SetupDirectionForm from 'Pages/DirectionForm/SetupDirectionForm.tsx'; // Форма направления
import TeamsManagement from 'Pages/TeamsList/TeamsManagement.tsx'; // Управление командами
import EventPage from 'Pages/Event/EventPage.tsx'; // Страница события
import EventForm from 'Pages/EventsList/EventForm/EventForm.tsx'; // Форма события
import EventSetupSummary from 'Pages/Event/EventSetupSummary.tsx'; // Итоги настройки
import StagesPage from 'Pages/StagesPage/StagesPage.tsx'; // Страница этапов
import ProjectPage from 'Pages/Project/ProjectPage.tsx'; // Страница проекта
import ProjectForm from 'Pages/ProjectForm/SetupProjectForm.tsx'; // Форма проекта
import TeamPage from 'Pages/Team/TeamPage.tsx'; // Страница команды
import UsersProfilePage from 'Pages/UsersProfile/UsersProfilePage.tsx'; // Профиль другого пользователя
import EmailVerifiedPage from 'Pages/Register/EmailVerified.tsx'; // Подтверждение email
import PasswordResetRequest from 'Pages/Login/PasswordResetRequest.tsx'; // Запрос сброса пароля
import PasswordResetConfirm from 'Pages/Login/PasswordResetConfirm.tsx'; // Подтверждение сброса пароля
import KanbanPage from 'Pages/KanbanPage/KanbanPage.tsx'; // Kanban доска
import TeamCreationPage from 'Pages/Team/TeamCreate/TeamCreationPage.tsx'; // Создание команды
import GanttPage from 'Pages/Tasks/Gant/GanttPage.tsx'; // Диаграмма Ганта

/**
 * Тема Ant Design для кастомизации компонентов
 */
const theme = {
  token: {
    colorPrimary: '#FED201', // Основной цвет
    colorTextBase: '#424242', // Базовый цвет текста
    colorTextLightSolid: '#424242', // Цвет текста на светлом фоне
    controlHeightLG: '51px', // Высота больших контролов
    fontSizeLG: '24px', // Размер большого шрифта
  },
};

/**
 * Точка входа в приложение
 * Инициализирует React-приложение с настройками:
 * - Redux store
 * - Контекст ролей пользователя
 * - Систему уведомлений
 * - Маршрутизацию
 * - Ant Design тему
 */
createRoot(document.getElementById('root')!).render(
  //<StrictMode>
    <ConfigProvider theme={theme}>
      <Provider store={store}>
        <UserRolesProvider>
          <NotificationProvider>
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Layout />}>
                  <Route path="/" element={<App />}/>
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/email-verified" element={<EmailVerifiedPage />} />
                  <Route path="/password-reset-request" element={<PasswordResetRequest />} />
                  <Route path="/password-reset/confirm" element={<PasswordResetConfirm />} />
                  <Route path="/" element={<RequireAuth />}>

                  {/* Маршруты только для организатора */}
                    <Route element={<RequireRole allowedRoles={['organizer']} />}>
                      <Route path="/requests" element={<RequestsManagement />} /> 
                      <Route path="/event-setup" element={<EventForm />} />
                      <Route path="/event/:id/edit" element={<EventForm />} />
                      <Route path="/directions-setup" element={<SetupDirectionForm/>} />
                      <Route path="/projects-setup" element={<ProjectForm />} />
                      <Route path="/stages-setup" element={<StagesPage />} />
                      <Route path="/event-setup-save" element={<EventSetupSummary />} />
                    </Route>

                    {/* Маршруты только для практикантов */}
                    <Route element={<RequireRole allowedRoles={['projectant']} />}>
                    </Route>

                    {/* Общие маршруты для авторизованных */}
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/profile/:id" element={<UsersProfilePage />} />
                    <Route path="/events" element={<EventsManagement />} />
                    <Route path="/directions" element={<DirectionsManagement />} />
                    <Route path="/projects" element={<ProjectsManagement />} />
                    <Route path="/event/:id" element={<EventPage />} />
                    <Route path="/project/:id" element={<ProjectPage />} />
                    <Route path="/teams" element={<TeamsManagement />} />
                    <Route path="/teams/create" element={<TeamCreationPage />}/>
                    <Route path="/teams/:teamId" element={<TeamPage />} />
                    <Route path="/projects/:projectId/tasks" element={<Tasks />} />
                    <Route path="/projects/:projectId/kanban" element={<KanbanPage />} />
                    <Route path="/projects/:projectId/gantt" element={<GanttPage />} />

                  </Route>
              </Route>
              </Routes>
            </BrowserRouter>
          </NotificationProvider>
        </UserRolesProvider>
      </Provider>
    </ConfigProvider>
  //</StrictMode>
);