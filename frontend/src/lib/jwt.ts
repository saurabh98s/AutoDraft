import { jwtDecode } from 'jwt-decode';

interface DecodedToken {
  sub: string;
  exp: number;
  role: string;
}

export const decodeToken = (token: string): DecodedToken | null => {
  try {
    return jwtDecode<DecodedToken>(token);
  } catch (error) {
    console.error('Failed to decode token:', error);
    return null;
  }
};

export const isTokenExpired = (token: string): boolean => {
  const decoded = decodeToken(token);
  if (!decoded) return true;
  
  const currentTime = Date.now() / 1000;
  return decoded.exp < currentTime;
};

export const getTokenExpiry = (token: string): number | null => {
  const decoded = decodeToken(token);
  return decoded ? decoded.exp * 1000 : null;
};

export const getTokenRole = (token: string): string | null => {
  const decoded = decodeToken(token);
  return decoded ? decoded.role : null;
};

export const getTokenUserId = (token: string): string | null => {
  const decoded = decodeToken(token);
  return decoded ? decoded.sub : null;
}; 