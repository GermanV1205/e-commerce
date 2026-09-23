import type { CookieOptions, Response } from 'express';

export const ACCESS_COOKIE = 'access_token';
export const REFRESH_COOKIE = 'refresh_token';

const isProduction = () => process.env.NODE_ENV === 'production';

const baseCookie = (): CookieOptions => ({
  httpOnly: true,
  secure: isProduction(),
  sameSite: isProduction() ? 'none' : 'lax',
  path: '/',
});

export const accessCookieOptions = (maxAgeMs: number): CookieOptions => ({
  ...baseCookie(),
  maxAge: maxAgeMs,
});

export const refreshCookieOptions = (maxAgeMs: number): CookieOptions => ({
  ...baseCookie(),
  maxAge: maxAgeMs,
});

export const clearAuthCookies = (res: Response) => {
  const options = baseCookie();
  res.clearCookie(ACCESS_COOKIE, options);
  res.clearCookie(REFRESH_COOKIE, options);
};
