import { authOptions } from '@/lib/core/auth';
import { logger } from '@/lib/monitoring';
import { TextbookResponseSchema, UpdateTextbookSchema } from '@/lib/schemas/api';
import { textbookService } from '@/server';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';

/**
 * 특정 교과서 조회
 */
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
    }

    const textbook = await textbookService.getTextbookById(params.id);

    if (!textbook) {
      return NextResponse.json({ error: '교과서를 찾을 수 없습니다.' }, { status: 404 });
    }

    // 응답 스키마 검증
    const response = TextbookResponseSchema.parse(textbook);

    return NextResponse.json(response);
  } catch (error) {
    logger.error('교과서 조회 API 오류', undefined, {
      textbookId: params.id,
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json({ error: '교과서 조회에 실패했습니다.' }, { status: 500 });
  }
}

/**
 * 특정 교과서 업데이트
 */
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
    }

    const body = await request.json();
    const parsed = UpdateTextbookSchema.safeParse(body);

    if (!parsed.success) {
      logger.error('잘못된 요청 데이터입니다.', undefined, { details: parsed.error.errors });
      return NextResponse.json(
        { error: '잘못된 요청 데이터입니다.', details: parsed.error.errors },
        { status: 400 },
      );
    }

    const textbook = await textbookService.updateTextbook(params.id, parsed.data);

    // 응답 스키마 검증
    const response = TextbookResponseSchema.parse(textbook);

    return NextResponse.json(response);
  } catch (error) {
    logger.error('교과서 업데이트 API 오류', undefined, {
      textbookId: params.id,
      error: error instanceof Error ? error.message : String(error),
    });

    if (error instanceof Error && error.message.includes('교과서를 찾을 수 없습니다')) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    return NextResponse.json({ error: '교과서 업데이트에 실패했습니다.' }, { status: 500 });
  }
}

/**
 * 특정 교과서 삭제
 */
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
    }

    const textbook = await textbookService.deleteTextbook(params.id);

    // 응답 스키마 검증
    const response = TextbookResponseSchema.parse(textbook);

    return NextResponse.json(response);
  } catch (error) {
    logger.error('교과서 삭제 API 오류', undefined, {
      textbookId: params.id,
      error: error instanceof Error ? error.message : String(error),
    });

    if (error instanceof Error && error.message.includes('교과서를 찾을 수 없습니다')) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    return NextResponse.json({ error: '교과서 삭제에 실패했습니다.' }, { status: 500 });
  }
}
