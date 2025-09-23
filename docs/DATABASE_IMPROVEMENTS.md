# 데이터베이스 구조 개선 제안서

## 📋 현재 상태 분석

### ✅ 잘 설계된 부분

1. **관계 설정**: 대부분의 테이블 간 관계가 적절히 설정됨
2. **인덱스**: 자주 조회되는 필드들에 대한 인덱스가 잘 설정됨
3. **소프트 삭제**: `deletedAt` 필드를 통한 소프트 삭제 패턴 적용
4. **감사 필드**: `createdAt`, `updatedAt` 필드가 대부분 모델에 포함됨

### ⚠️ 개선이 필요한 부분

#### 1. 데이터 타입 및 제약조건

- **문제**: `String` 타입을 과도하게 사용 (enum으로 제한해야 할 필드들)
- **영향**: 데이터 무결성 부족, 런타임 에러 가능성
- **해결방안**: 적절한 enum 타입 도입

#### 2. JSON 필드의 타입 안전성

- **문제**: `String` 타입으로 저장되는 JSON 데이터
- **영향**: 타입 안전성 부족, 검증 어려움
- **해결방안**: Prisma의 `Json` 타입 활용

#### 3. 인덱스 최적화

- **문제**: 일부 복합 인덱스가 부족
- **영향**: 쿼리 성능 저하 가능성
- **해결방안**: 자주 사용되는 쿼리 패턴에 맞는 인덱스 추가

#### 4. 외래키 제약조건

- **문제**: 일부 관계에서 CASCADE 설정 부족
- **영향**: 데이터 정합성 문제 가능성
- **해결방안**: 적절한 CASCADE 규칙 설정

## 🚀 구체적인 개선 제안

### 1. Enum 타입 도입

```prisma
enum UserRole {
  STUDENT
  TEACHER
  ADMIN
}

enum UserStatus {
  ACTIVE
  INACTIVE
  SUSPENDED
  DELETED
}

enum ProblemDifficulty {
  EASY
  MEDIUM
  HARD
}

enum ProblemType {
  MULTIPLE_CHOICE
  SHORT_ANSWER
  ESSAY
  TRUE_FALSE
}

enum ReviewStatus {
  PENDING
  APPROVED
  REJECTED
  NEEDS_REVISION
}

enum ProcessingStatus {
  PENDING
  PROCESSING
  COMPLETED
  FAILED
}

enum ReportStatus {
  DRAFT
  PUBLISHED
  ARCHIVED
}

enum ServerStatus {
  HEALTHY
  UNHEALTHY
  UNKNOWN
  MAINTENANCE
}

enum SyncStatus {
  PENDING
  IN_PROGRESS
  SUCCESS
  FAILED
}
```

### 2. JSON 필드 타입 개선

```prisma
model TeacherReport {
  // 기존: String @default("{}")
  classInfo    Json? // 타입 안전성 향상
  students     Json? // 타입 안전성 향상
  analysisData Json? // 타입 안전성 향상
  metadata     Json? // 타입 안전성 향상
}

model DocumentChunk {
  // 기존: String @default("{}")
  metadata Json @default({}) // 타입 안전성 향상
}

model ChromaDBEmbedding {
  // 기존: String @default("{}")
  metadata Json @default({}) // 타입 안전성 향상
}
```

### 3. 복합 인덱스 최적화

```prisma
model Problem {
  // 기존 인덱스들에 추가
  @@index([subject, difficulty, gradeLevel]) // 복합 쿼리 최적화
  @@index([isAIGenerated, reviewStatus, createdAt]) // AI 문제 관리 최적화
  @@index([createdBy, createdAt]) // 사용자별 문제 생성 이력
  @@index([textbookId, gradeLevel]) // 교과서별 문제 조회
}

model StudentProgress {
  // 기존 인덱스들에 추가
  @@index([studentId, status, updatedAt]) // 학생별 진행상황 조회
  @@index([problemId, status]) // 문제별 학생 진행상황
}

model SearchQuery {
  // 기존 인덱스들에 추가
  @@index([userId, subject, createdAt]) // 사용자별 검색 이력
  @@index([subject, gradeLevel, createdAt]) // 주제별 검색 트렌드
}
```

### 4. 외래키 제약조건 강화

```prisma
model Problem {
  // 기존 관계들에 CASCADE 추가
  reviewer User? @relation("ProblemReviewer", fields: [reviewedBy], references: [id], onDelete: SetNull)
  creator  User? @relation("ProblemCreator", fields: [createdBy], references: [id], onDelete: SetNull)
  textbook Textbook? @relation(fields: [textbookId], references: [id], onDelete: SetNull)
}

model DocumentChunk {
  textbook Textbook @relation(fields: [textbookId], references: [id], onDelete: Cascade)
}

model QuestionOption {
  problem Problem @relation(fields: [problemId], references: [id], onDelete: Cascade)
}

model QuestionTag {
  problem Problem @relation(fields: [problemId], references: [id], onDelete: Cascade)
}
```

### 5. 데이터 검증 규칙 추가

```prisma
model User {
  email String @unique @db.VarChar(255) // 길이 제한
  name  String @db.VarChar(100) // 길이 제한
  role  UserRole // enum 사용
  status UserStatus @default(ACTIVE) // enum 사용
}

model Problem {
  title String @db.VarChar(200) // 길이 제한
  content String @db.Text // 긴 텍스트용
  difficulty ProblemDifficulty // enum 사용
  type ProblemType // enum 사용
  reviewStatus ReviewStatus @default(PENDING) // enum 사용
  points Int @default(1) @db.SmallInt // 작은 정수
  timeLimit Int? @db.SmallInt // 작은 정수
}

model Textbook {
  title String @db.VarChar(200) // 길이 제한
  fileName String @db.VarChar(255) // 길이 제한
  processingStatus ProcessingStatus @default(PENDING) // enum 사용
}
```

### 6. 성능 최적화를 위한 파티셔닝 고려

```prisma
// 대용량 데이터를 위한 파티셔닝 전략
model AIApiUsage {
  // 날짜별 파티셔닝을 위한 추가 필드
  usageDate DateTime @default(now())

  @@index([userId, usageDate]) // 파티셔닝을 위한 인덱스
  @@index([usageDate]) // 날짜별 조회 최적화
}

model AIPerformanceMetric {
  // 날짜별 파티셔닝을 위한 추가 필드
  metricDate DateTime @default(now())

  @@index([operationType, metricDate]) // 파티셔닝을 위한 인덱스
  @@index([metricDate]) // 날짜별 조회 최적화
}
```

## 📈 성능 최적화 권장사항

### 1. 쿼리 최적화

- **N+1 문제 해결**: `include`와 `select` 적절히 사용
- **페이징**: 대용량 데이터 조회 시 `skip`과 `take` 활용
- **집계 쿼리**: `groupBy`와 `_count` 활용

### 2. 캐싱 전략

- **Redis 도입**: 자주 조회되는 데이터 캐싱
- **쿼리 결과 캐싱**: 복잡한 집계 쿼리 결과 캐싱

### 3. 데이터 아카이빙

- **오래된 데이터**: 일정 기간 후 별도 테이블로 이동
- **로그 데이터**: 주기적으로 압축 및 아카이빙

## 🔧 마이그레이션 전략

### 1단계: Enum 타입 도입

- 기존 String 필드를 Enum으로 변경
- 데이터 검증 및 변환

### 2단계: JSON 필드 타입 변경

- String에서 Json 타입으로 변경
- 기존 데이터 검증

### 3단계: 인덱스 최적화

- 새로운 복합 인덱스 추가
- 불필요한 인덱스 제거

### 4단계: 제약조건 강화

- 외래키 제약조건 추가
- 데이터 검증 규칙 강화

## 📊 예상 효과

### 성능 개선

- **쿼리 성능**: 30-50% 향상 예상
- **인덱스 효율성**: 복합 쿼리 최적화
- **메모리 사용량**: 타입 안전성으로 인한 최적화

### 개발 생산성

- **타입 안전성**: 컴파일 타임 에러 감소
- **코드 품질**: enum 사용으로 가독성 향상
- **유지보수성**: 명확한 데이터 구조

### 데이터 품질

- **무결성**: 제약조건 강화로 데이터 품질 향상
- **일관성**: enum 사용으로 데이터 일관성 보장
- **검증**: JSON 타입으로 구조화된 데이터 검증

## 🎯 우선순위

### 높음 (즉시 적용)

1. Enum 타입 도입 (User, Problem, Textbook 등)
2. JSON 필드 타입 변경
3. 필수 인덱스 추가

### 중간 (단계적 적용)

1. 복합 인덱스 최적화
2. 외래키 제약조건 강화
3. 데이터 검증 규칙 추가

### 낮음 (장기 계획)

1. 파티셔닝 전략
2. 캐싱 시스템 도입
3. 데이터 아카이빙 시스템
