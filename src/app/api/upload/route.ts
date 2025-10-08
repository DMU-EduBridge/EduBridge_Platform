import { logger } from '@/lib/monitoring';
import { ok, withAuth } from '@/server/http/handler';
import { uploadService } from '@/server/services/upload.service';
import { NextRequest } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  return withAuth(async ({ userId }) => {
    const data = await request.formData();
    const file: File | null = (data.get('file') as unknown as File) || null;

    if (!file) {
      return new Response(
        JSON.stringify({ success: false, error: 'No file uploaded', code: 'NO_FILE' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } },
      );
    }

    const result = await uploadService.save(file);
    logger.info('파일 업로드 성공', {
      userId,
      fileName: result.fileName,
      fileSize: result.fileSize,
    });
    return new Response(JSON.stringify(ok(result)), {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store',
      },
    });
  });
}
