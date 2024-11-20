import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import './index.css';
import App from './App.tsx';
import { store } from '../model/store.ts';
import { Provider } from 'react-redux';
import Layout from 'Shared/ui/layout/layout.tsx';
import RequireAuth from 'Shared/ui/requireAuth.tsx';
import Login from 'Pages/Login/ui/Login.tsx';
import Register from 'Pages/Register/ui/Register.tsx';
import Profile from 'Pages/Profile/ui/Profile.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route path="/" element={<App />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/" element={<RequireAuth />}>
              <Route path="/profile" element={<Profile />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </Provider>
  </StrictMode>
);
