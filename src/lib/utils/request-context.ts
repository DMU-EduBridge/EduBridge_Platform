import { NextRequest } from 'next/server';

export function getRequestId(req: NextRequest): string {
  const header = req.headers.get('x-request-id') || '';
  if (header) return header;
  return crypto.randomUUID();
}
