import { parseJsonBody } from '@/lib/config/validation';
import { prisma } from '@/lib/core/prisma';
import { withErrorHandler } from '@/lib/utils/error-handler';
import { serializeArray } from '@/lib/utils/json';
import { Prisma } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
export const dynamic = 'force-dynamic';

// 학습 자료 목록 조회
async function getLearningMaterials(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get('search');
  const subject = searchParams.get('subject');
  const status = searchParams.get('status');
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '10');

  const where: Prisma.LearningMaterialWhereInput = {};

  if (search) {
    where.OR = [{ title: { contains: search } }, { description: { contains: search } }];
  }

  if (subject && subject !== 'all') {
    where.subject = subject;
  }

  if (status && status !== 'all') {
    where.status = status;
  }

  const [materials, total] = await Promise.all([
    prisma.learningMaterial.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.learningMaterial.count({ where }),
  ]);

  return NextResponse.json(
    {
      materials,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    },
    { headers: { 'Cache-Control': 'private, max-age=60' } },
  );
}

// 새 학습 자료 생성
const createMaterialSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  subject: z.string().min(1),
  difficulty: z.string().min(1),
  estimatedTime: z.number().int().nonnegative().optional(),
  content: z.string().min(1),
  files: z.array(z.string()).optional(),
  status: z.string().default('DRAFT'),
});

async function createLearningMaterial(request: NextRequest) {
  const raw = await request.json();
  const parsed = parseJsonBody(raw, createMaterialSchema);
  if (!parsed.success) return parsed.response;

  const { title, description, subject, difficulty, estimatedTime, content, files, status } =
    parsed.data;

  const material = await prisma.learningMaterial.create({
    data: {
      title,
      description,
      subject,
      difficulty,
      estimatedTime: estimatedTime ?? 0,
      content,
      files: serializeArray(files),
      status: status ?? 'DRAFT',
      isActive: true,
    },
  });

  return NextResponse.json(material, { status: 201 });
}

export const GET = withErrorHandler(getLearningMaterials);
export const POST = withErrorHandler(createLearningMaterial);
