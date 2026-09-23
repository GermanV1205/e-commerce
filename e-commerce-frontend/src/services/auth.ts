import { api } from './api';
import type { AuthUser } from '../types';

const USER_KEY = 'user';

export const saveSession = (user: AuthUser) => {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
};

export const clearSession = () => {
  localStorage.removeItem(USER_KEY);
};

export const getUser = (): AuthUser | null => {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    clearSession();
    return null;
  }
};

export const isAuthenticated = (): boolean => getUser() !== null;

export const logoutRequest = async () => {
  try {
    await api.post('/auth/logout');
  } finally {
    clearSession();
  }
};

export const apiErrorMessage = (error: unknown, fallback: string): string => {
  if (typeof error === 'object' && error !== null && 'response' in error) {
    const response = (error as { response?: { data?: { message?: string | string[] } } }).response;
    const message = response?.data?.message;

    if (Array.isArray(message)) return message.join('. ');
    if (typeof message === 'string') return message;
  }

  return fallback;
};

export const apiErrorStatus = (error: unknown): number | undefined => {
  if (typeof error === 'object' && error !== null && 'response' in error) {
    return (error as { response?: { status?: number } }).response?.status;
  }
  return undefined;
};
