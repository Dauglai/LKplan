import { useLocation, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setCredentials, logOut } from 'Features/Auth/model/authSlice';
import { baseURL, googleClientId } from 'App/config/api';
import { useEffect } from 'react';

const GoogleLoginButton = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';

  useEffect(() => {
    /* @ts-ignore */
    if (window.google) {
      window.google.accounts.id.initialize({
        client_id: googleClientId,
        callback: handleCredentialResponse,
      });

      window.google.accounts.id.renderButton(
        document.getElementById('googleSignInDiv'),
        { theme: 'outline', size: 'large'}
      );
    }
  }, []);
  

  const handleCredentialResponse = async (response: any) => {
    const { credential } = response;

    try {
      const res = await fetch(`${baseURL}api/auth/convert-token/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          grant_type: 'convert_token',
          client_id: "Z6ny8w15wLeyRVaR0L39uoQ5HTE9x1xAIyzWARpv",
          backend: 'google-oauth2',
          token: credential,
        }),
      });

      if (!res.ok) throw new Error('Ошибка авторизации');

      const data = await res.json();
      console.log('Успешный вход через Google:', data);

      // 1. Сохраняем токены в localStorage
      localStorage.setItem('access_token', data.access_token);
      localStorage.setItem('refresh_token', data.refresh_token);

      // 2. Формируем объект пользователя 
      const userData = {
        access_token: data.access_token,
        refresh_token: data.refresh_token,
        user: {
          username: data.email,
          email: data.email,
        },
      };

      // 3. Сохраняем в Redux
      dispatch(logOut()); // Сначала разлогиниваемся
      dispatch(setCredentials(userData)); // Затем сохраняем новые данные

      // 4. Редирект
      navigate(from, { replace: true });

    } catch (err) {
      console.error('Ошибка при входе через Google:', err);
    }
  };

  return <div id="googleSignInDiv" style={{ marginTop : 24 }}/>;
};

export default GoogleLoginButton;
