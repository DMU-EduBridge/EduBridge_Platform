type Locale = 'ko' | 'en';

const messages: Record<string, Record<Locale, string>> = {
  DB_UNIQUE: {
    ko: '중복된 값이 존재합니다.',
    en: 'Duplicate value exists.',
  },
  DB_FK: {
    ko: '참조 무결성 위반입니다. 요청 데이터를 확인하세요.',
    en: 'Foreign key constraint violation. Please check your request data.',
  },
  NOT_FOUND: {
    ko: '리소스를 찾을 수 없습니다.',
    en: 'Resource not found.',
  },
  DB_ERROR: {
    ko: '데이터베이스 오류가 발생했습니다.',
    en: 'A database error occurred.',
  },
  SERVER_ERROR: {
    ko: '서버 오류가 발생했습니다.',
    en: 'Server error occurred.',
  },
};

export function getErrorMessage(code: string, locale: Locale = 'ko'): string {
  const table = messages[code];
  if (!table) return messages.SERVER_ERROR[locale];
  return table[locale] || table.ko;
}
