export class UploadService {
  async save(file: File) {
    // 실제 파일 저장 로직 구현 필요
    // 현재는 시뮬레이션
    const fileName = `${Date.now()}_${file.name}`;
    const fileSize = file.size;
    const fileType = file.type;

    return {
      fileName,
      fileSize,
      fileType,
      url: `/uploads/${fileName}`,
      uploadedAt: new Date().toISOString(),
    };
  }
}

export const uploadService = new UploadService();
