import { getRequestId } from '@/lib/utils/request-context';
import { UploadResponseSchema } from '@/server/dto/upload';
import { uploadService } from '@/server/services/upload.service';
import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const data = await request.formData();
    const file: File | null = (data.get('file') as unknown as File) || null;

    if (!file) return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    const saved = await uploadService.save(file);
    const payload = { success: true, ...saved };
    UploadResponseSchema.parse(payload);
    return NextResponse.json(payload, {
      headers: { 'Cache-Control': 'no-store', 'X-Request-Id': getRequestId(request) },
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 });
  }
}
