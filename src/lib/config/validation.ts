import { NextResponse } from 'next/server';
import { ZodSchema, ZodError } from 'zod';

export type ParseResult<T> =
  | { success: true; data: T }
  | { success: false; response: NextResponse };

export function parseJsonBody<T>(body: unknown, schema: ZodSchema<T>): ParseResult<T> {
  try {
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return { success: false, response: zodErrorResponse(parsed.error) };
    }
    return { success: true, data: parsed.data };
  } catch (error) {
    return {
      success: false,
      response: NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 }),
    };
  }
}

export function zodErrorResponse(error: ZodError) {
  const issues = error.errors.map((e) => ({
    path: e.path.join('.'),
    message: e.message,
    code: e.code,
  }));
  return NextResponse.json(
    {
      error: 'ValidationError',
      issues,
    },
    { status: 400 },
  );
}
