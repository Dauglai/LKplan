// utils/auth.ts
import jwt_decode from 'jwt-decode';

interface DecodedToken {
  user_id: number;
  exp: number;
  iat: number;
}

export function getCurrentUserId(): number | null {
  const token = localStorage.getItem('access'); // или sessionStorage
  if (!token) return null;

  try {
    const decoded: DecodedToken = jwt_decode(token);
    return decoded.user_id;
  } catch (e) {
    console.error('Ошибка при декодировании токена', e);
    return null;
  }
}
