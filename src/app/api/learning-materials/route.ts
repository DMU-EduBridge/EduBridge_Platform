import { parseJsonBody } from '@/lib/config/validation';
import { logger, withErrorHandler } from '@/lib/utils/error-handler';
import { getPagination, getParam, getSearchParams, okJson } from '@/lib/utils/http';
import { getRequestId } from '@/lib/utils/request-context';
import { MaterialListResponseSchema } from '@/server/dto/material';
import { materialService } from '@/server/services/material.service';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
export const dynamic = 'force-dynamic';

// 학습 자료 목록 조회
async function getLearningMaterials(request: NextRequest) {
  const sp = getSearchParams(request);
  const search = getParam(sp, 'search');
  const subject = getParam(sp, 'subject');
  const status = getParam(sp, 'status');
  const { page, limit } = getPagination(sp);

  const { items: materials, total } = await materialService.list({
    search,
    subject,
    status,
    page,
    limit,
  });
  logger.info('Learning materials fetched', {
    count: materials.length,
    page,
    limit,
    requestId: getRequestId(request),
  });
  const payload = {
    materials,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
  MaterialListResponseSchema.parse(payload);
  return okJson(payload, 'private, max-age=60', request);
}

// 새 학습 자료 생성
const createMaterialSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  subject: z.string().min(1),
  difficulty: z.string().min(1),
  // 문자열로 와도 숫자로 강제 변환 허용
  estimatedTime: z.coerce.number().int().nonnegative().optional(),
  content: z.string().min(1),
  // files가 객체 배열(예: {url,name,...})로 와도 문자열(URL/이름)로 정규화
  files: z.preprocess((v) => {
    if (Array.isArray(v)) {
      return v
        .map((f: any) => (typeof f === 'string' ? f : (f?.url ?? f?.name ?? null)))
        .filter((s: any) => typeof s === 'string');
    }
    return v;
  }, z.array(z.string()).optional()),
  status: z.string().default('DRAFT'),
});

async function createLearningMaterial(request: NextRequest) {
  const raw = await request.json();
  const parsed = parseJsonBody(raw, createMaterialSchema);
  if (!parsed.success) return parsed.response;

  const { title, description, subject, difficulty, estimatedTime, content, files, status } =
    parsed.data;

  const material = await materialService.create({
    title,
    description,
    subject,
    difficulty,
    estimatedTime,
    content,
    files: files as string[],
    status,
  });

  return NextResponse.json(material, { status: 201 });
}

export const GET = withErrorHandler(getLearningMaterials);
export const POST = withErrorHandler(createLearningMaterial);
