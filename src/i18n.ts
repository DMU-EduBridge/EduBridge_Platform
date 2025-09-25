import { getRequestConfig } from 'next-intl/server';
import { notFound } from 'next/navigation';

// 지원하는 로케일 목록
export const locales = ['ko', 'en'] as const;
export type Locale = (typeof locales)[number];

export default getRequestConfig(async ({ locale }) => {
  // 지원하지 않는 로케일인 경우 404 반환
  if (!locales.includes(locale as Locale)) notFound();

  return {
    messages: (await import(`../messages/${locale as string}.json`)).default,
    locale: locale as string,
  };
});
