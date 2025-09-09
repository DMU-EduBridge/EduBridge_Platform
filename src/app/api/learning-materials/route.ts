import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/core/prisma';
import { Prisma } from '@prisma/client';

// 학습 자료 목록 조회
export async function GET(request: NextRequest) {
  try {
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

    return NextResponse.json({
      materials,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching learning materials:', error);
    return NextResponse.json({ error: 'Failed to fetch learning materials' }, { status: 500 });
  }
}

// 새 학습 자료 생성
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      title,
      description,
      subject,
      difficulty,
      estimatedTime,
      content,
      files,
      status = 'DRAFT',
    } = body;

    const material = await prisma.learningMaterial.create({
      data: {
        title,
        description,
        subject,
        difficulty,
        estimatedTime: parseInt(estimatedTime) || 0,
        content,
        files: JSON.stringify(files || []),
        status,
        isActive: true,
      },
    });

    return NextResponse.json(material, { status: 201 });
  } catch (error) {
    console.error('Error creating learning material:', error);
    return NextResponse.json({ error: 'Failed to create learning material' }, { status: 500 });
  }
}
