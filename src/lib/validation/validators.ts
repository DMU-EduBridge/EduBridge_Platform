import { z } from 'zod';
import { ValidationError } from '../errors';

/**
 * 검증 유틸리티 함수들
 */

/**
 * Zod 에러를 커스텀 ValidationError로 변환
 */
export function handleZodError(error: z.ZodError): ValidationError {
  const details = error.errors.map((err) => ({
    field: err.path.join('.'),
    message: err.message,
    code: err.code,
  }));

  return new ValidationError('입력 데이터 검증에 실패했습니다.', details);
}

/**
 * 스키마 검증 래퍼 함수
 */
export function validateWithSchema<T>(
  schema: z.ZodSchema<T>,
  data: unknown,
  errorMessage?: string,
): T {
  try {
    return schema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw handleZodError(error);
    }
    throw new ValidationError(errorMessage || '데이터 검증에 실패했습니다.');
  }
}

/**
 * 안전한 스키마 검증 함수
 */
export function safeValidateWithSchema<T>(
  schema: z.ZodSchema<T>,
  data: unknown,
): {
  success: boolean;
  data?: T;
  error?: ValidationError;
} {
  try {
    const result = schema.parse(data);
    return { success: true, data: result };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: handleZodError(error),
      };
    }
    return {
      success: false,
      error: new ValidationError('알 수 없는 검증 오류가 발생했습니다.'),
    };
  }
}

/**
 * 부분 검증 함수 (partial validation)
 */
export function validatePartial<T>(
  schema: z.ZodSchema<T>,
  data: unknown,
  errorMessage?: string,
): Partial<T> {
  try {
    return schema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw handleZodError(error);
    }
    throw new ValidationError(errorMessage || '부분 데이터 검증에 실패했습니다.');
  }
}

/**
 * 배열 검증 함수
 */
export function validateArray<T>(
  schema: z.ZodSchema<T>,
  data: unknown[],
  errorMessage?: string,
): T[] {
  try {
    return z.array(schema).parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw handleZodError(error);
    }
    throw new ValidationError(errorMessage || '배열 데이터 검증에 실패했습니다.');
  }
}

/**
 * 쿼리 파라미터 검증 함수
 */
export function validateQueryParams<T>(
  schema: z.ZodSchema<T>,
  searchParams: URLSearchParams,
  errorMessage?: string,
): T {
  try {
    const params: Record<string, any> = {};

    for (const [key, value] of Array.from(searchParams.entries())) {
      // 숫자로 변환 가능한지 확인
      if (!isNaN(Number(value))) {
        params[key] = Number(value);
      } else if (value === 'true' || value === 'false') {
        params[key] = value === 'true';
      } else {
        params[key] = value;
      }
    }

    return schema.parse(params);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw handleZodError(error);
    }
    throw new ValidationError(errorMessage || '쿼리 파라미터 검증에 실패했습니다.');
  }
}

/**
 * 요청 본문 검증 함수
 */
export function validateRequestBody<T>(
  schema: z.ZodSchema<T>,
  body: unknown,
  errorMessage?: string,
): T {
  try {
    return schema.parse(body);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw handleZodError(error);
    }
    throw new ValidationError(errorMessage || '요청 본문 검증에 실패했습니다.');
  }
}

/**
 * ID 검증 함수
 */
export function validateId(id: string, fieldName: string = 'ID'): string {
  try {
    return z.string().uuid(`${fieldName}는 유효한 UUID 형식이어야 합니다.`).parse(id);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw handleZodError(error);
    }
    throw new ValidationError(`${fieldName} 검증에 실패했습니다.`);
  }
}

/**
 * 이메일 검증 함수
 */
export function validateEmail(email: string): string {
  try {
    return z.string().email('유효하지 않은 이메일 형식입니다.').parse(email);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw handleZodError(error);
    }
    throw new ValidationError('이메일 검증에 실패했습니다.');
  }
}

/**
 * 비밀번호 검증 함수
 */
export function validatePassword(password: string): string {
  try {
    return z
      .string()
      .min(8, '비밀번호는 최소 8자 이상이어야 합니다.')
      .max(128, '비밀번호는 최대 128자까지 가능합니다.')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
        '비밀번호는 대문자, 소문자, 숫자, 특수문자를 포함해야 합니다.',
      )
      .parse(password);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw handleZodError(error);
    }
    throw new ValidationError('비밀번호 검증에 실패했습니다.');
  }
}

/**
 * 페이지네이션 검증 함수
 */
export function validatePagination(params: { page?: string | number; limit?: string | number }): {
  page: number;
  limit: number;
} {
  try {
    return z
      .object({
        page: z
          .union([z.string(), z.number()])
          .transform((val) => Number(val))
          .refine((val) => val >= 1, '페이지는 1 이상이어야 합니다.')
          .default(1),
        limit: z
          .union([z.string(), z.number()])
          .transform((val) => Number(val))
          .refine((val) => val >= 1 && val <= 100, '제한은 1-100 사이여야 합니다.')
          .default(20),
      })
      .parse(params);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw handleZodError(error);
    }
    throw new ValidationError('페이지네이션 검증에 실패했습니다.');
  }
}

/**
 * 검증 미들웨어 생성 함수
 */
export function createValidationMiddleware<T>(schema: z.ZodSchema<T>) {
  return (data: unknown): T => {
    return validateWithSchema(schema, data);
  };
}

/**
 * 조건부 검증 함수
 */
export function validateConditionally<T>(
  schema: z.ZodSchema<T>,
  data: unknown,
  condition: boolean,
  errorMessage?: string,
): T | undefined {
  if (!condition) return undefined;

  try {
    return schema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw handleZodError(error);
    }
    throw new ValidationError(errorMessage || '조건부 검증에 실패했습니다.');
  }
}
