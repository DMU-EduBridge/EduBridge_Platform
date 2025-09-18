import fs from 'fs';
import { writeFile } from 'fs/promises';
import { join } from 'path';

export class UploadService {
  private readonly maxFileSize = 5 * 1024 * 1024;
  private readonly allowed = new Set(['image/jpeg', 'image/png', 'image/gif', 'application/pdf']);
  private readonly dangerousExtensions = new Set(['.exe', '.bat', '.cmd', '.scr', '.pif', '.com']);

  sanitizeFilename(name: string) {
    // 위험한 확장자 체크
    const ext = name.toLowerCase().substring(name.lastIndexOf('.'));
    if (this.dangerousExtensions.has(ext)) {
      throw new Error('Dangerous file extension detected');
    }

    return name
      .replace(/[^a-zA-Z0-9._-]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^[-.]+|[-.]+$/g, '');
  }

  validate(file: File) {
    if (!file) throw new Error('No file uploaded');
    if (!this.allowed.has(file.type)) throw new Error('Unsupported file type');
    if (file.size > this.maxFileSize) throw new Error('File too large');

    // 파일명 길이 제한
    if (file.name.length > 255) throw new Error('Filename too long');

    // 파일명에 위험한 문자 체크
    if (file.name.includes('..') || file.name.includes('/') || file.name.includes('\\')) {
      throw new Error('Invalid filename');
    }
  }

  async save(file: File) {
    this.validate(file);
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const timestamp = Date.now();
    const sanitized = this.sanitizeFilename(file.name || 'upload');
    const filename = `${timestamp}-${sanitized}`;
    const uploadsDir = join(process.cwd(), 'public', 'uploads');
    const path = join(uploadsDir, filename);

    if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
    await writeFile(path, buffer);
    return { filename, url: `/uploads/${filename}`, size: file.size, type: file.type };
  }
}

export const uploadService = new UploadService();
