import { NextRequest, NextResponse } from 'next/server';
import { getRequestId } from './request-context';

export function okJson<T>(data: T, cache: string = 'private, max-age=60', request?: NextRequest) {
  const headers: Record<string, string> = { 'Cache-Control': cache };
  if (request) headers['X-Request-Id'] = getRequestId(request);
  return NextResponse.json(data as any, { headers });
}

export function getSearchParams(request: NextRequest) {
  return new URL(request.url).searchParams;
}

export function getPagination(sp: URLSearchParams) {
  const page = parseInt(sp.get('page') || '1');
  const limit = parseInt(sp.get('limit') || '10');
  return { page: Number.isFinite(page) ? page : 1, limit: Number.isFinite(limit) ? limit : 10 };
}

export function getParam(sp: URLSearchParams, key: string) {
  const v = sp.get(key);
  return v && v.length > 0 ? v : undefined;
}
