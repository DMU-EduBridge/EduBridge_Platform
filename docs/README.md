# EduBridge Documentation

## Database ERD

Entity Relationship Diagram이 자동으로 생성됩니다.

- **파일 위치**: `erd.svg`
- **생성 명령어**: `npm run erd:generate`
- **자동 생성**: 스키마 변경 후 `prisma generate` 실행 시 자동 생성

## ERD 업데이트 방법

1. Prisma 스키마 수정 (`prisma/schema.prisma`)
2. ERD 재생성: `npm run erd:generate`
3. 변경사항 확인: `docs/erd.svg` 파일 확인

## ERD 설정

ERD 생성기는 `prisma/schema.prisma`에 설정되어 있습니다:

```prisma
generator erd {
  provider = "prisma-erd-generator"
  output   = "../docs/erd.svg"
}
```
