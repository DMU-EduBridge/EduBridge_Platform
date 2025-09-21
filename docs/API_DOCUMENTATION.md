# EduBridge Platform - API 문서

## 📋 목차

1. [API 개요](#api-개요)
2. [인증 API](#인증-api)
3. [Educational AI System API](#educational-ai-system-api)
4. [Teacher Report System API](#teacher-report-system-api)
5. [통합 관리 API](#통합-관리-api)
6. [기존 기능 API](#기존-기능-api)
7. [에러 처리](#에러-처리)
8. [응답 형식](#응답-형식)

## 🔌 API 개요

### 기본 정보

- **Base URL**: `http://localhost:3000/api`
- **인증**: NextAuth.js 세션 기반
- **응답 형식**: JSON
- **에러 처리**: HTTP 상태 코드 + 에러 메시지

### 공통 헤더

```http
Content-Type: application/json
Authorization: Bearer <session-token>
```

## 🔐 인증 API

### 1. 로그인

```http
POST /api/auth/login
```

**요청 본문:**

```json
{
  "email": "teacher1@example.com",
  "password": "password123"
}
```

**응답:**

```json
{
  "success": true,
  "message": "로그인 성공",
  "user": {
    "id": "cmftqee060001egzknp7jsnd8",
    "name": "김수학",
    "email": "teacher1@example.com",
    "role": "TEACHER",
    "subject": "수학"
  }
}
```

### 2. 로그아웃

```http
POST /api/auth/logout
```

**응답:**

```json
{
  "success": true,
  "message": "로그아웃 성공"
}
```

### 3. 역할 설정

```http
POST /api/auth/setup
```

**요청 본문:**

```json
{
  "role": "TEACHER",
  "subject": "수학",
  "school": "EduBridge 중학교"
}
```

## 📚 Educational AI System API

### 1. 교과서 관리

#### 교과서 목록 조회

```http
GET /api/textbooks?page=1&limit=10&subject=수학
```

**쿼리 파라미터:**

- `page`: 페이지 번호 (기본값: 1)
- `limit`: 페이지당 항목 수 (기본값: 10)
- `subject`: 과목 필터
- `gradeLevel`: 학년 필터
- `status`: 처리 상태 필터

**응답:**

```json
{
  "success": true,
  "data": {
    "textbooks": [
      {
        "id": "cmftqee060001egzknp7jsnd8",
        "title": "중학교 수학 1학년",
        "subject": "수학",
        "gradeLevel": "중1",
        "publisher": "교육부",
        "fileName": "math_1.pdf",
        "fileSize": 1024000,
        "totalChunks": 15,
        "processingStatus": "completed",
        "uploadedBy": "김수학",
        "createdAt": "2025-01-21T13:29:24.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 4,
      "totalPages": 1
    }
  }
}
```

#### 교과서 업로드

```http
POST /api/textbooks
```

**요청 본문 (FormData):**

```
title: "중학교 수학 1학년"
subject: "수학"
gradeLevel: "중1"
publisher: "교육부"
file: <PDF 파일>
```

**응답:**

```json
{
  "success": true,
  "message": "교과서 업로드 성공",
  "data": {
    "id": "cmftqee060001egzknp7jsnd8",
    "title": "중학교 수학 1학년",
    "processingStatus": "processing"
  }
}
```

#### 교과서 상세 조회

```http
GET /api/textbooks/[id]
```

**응답:**

```json
{
  "success": true,
  "data": {
    "id": "cmftqee060001egzknp7jsnd8",
    "title": "중학교 수학 1학년",
    "subject": "수학",
    "gradeLevel": "중1",
    "publisher": "교육부",
    "fileName": "math_1.pdf",
    "filePath": "/uploads/math_1.pdf",
    "fileSize": 1024000,
    "mimeType": "application/pdf",
    "totalChunks": 15,
    "processingStatus": "completed",
    "uploadedBy": "김수학",
    "createdAt": "2025-01-21T13:29:24.000Z",
    "chunks": [
      {
        "id": "chunk_1",
        "chunkIndex": 0,
        "content": "중학교 수학 1학년의 1번째 청크입니다...",
        "contentLength": 250
      }
    ]
  }
}
```

### 2. AI 문제 생성

#### 문제 생성

```http
POST /api/questions
```

**요청 본문:**

```json
{
  "textbookId": "cmftqee060001egzknp7jsnd8",
  "subject": "수학",
  "gradeLevel": "중3",
  "unit": "이차방정식",
  "difficulty": "medium",
  "questionCount": 5,
  "prompt": "이차방정식의 해를 구하는 문제를 생성해주세요"
}
```

**응답:**

```json
{
  "success": true,
  "message": "문제 생성 성공",
  "data": {
    "questions": [
      {
        "id": "q_1",
        "questionText": "다음 중 이차방정식 x² - 5x + 6 = 0의 해는?",
        "subject": "수학",
        "gradeLevel": "중3",
        "unit": "이차방정식",
        "difficulty": "medium",
        "correctAnswer": 1,
        "explanation": "인수분해를 이용하여 (x-2)(x-3) = 0이므로 x = 2, 3입니다.",
        "options": [
          { "optionNumber": 1, "optionText": "x = 2, 3", "isCorrect": true },
          { "optionNumber": 2, "optionText": "x = 1, 6", "isCorrect": false },
          { "optionNumber": 3, "optionText": "x = -2, -3", "isCorrect": false },
          { "optionNumber": 4, "optionText": "해가 없음", "isCorrect": false }
        ],
        "qualityScore": 0.85,
        "generationTimeMs": 2500,
        "tokensUsed": 1200,
        "costUsd": 0.05
      }
    ],
    "totalCost": 0.25,
    "totalTokens": 6000,
    "generationTime": 12500
  }
}
```

#### 생성된 문제 목록 조회

```http
GET /api/questions?page=1&limit=10&subject=수학&difficulty=medium
```

### 3. RAG 벡터 검색

#### 컨텍스트 검색

```http
POST /api/search
```

**요청 본문:**

```json
{
  "queryText": "이차방정식 해 구하기",
  "subject": "수학",
  "gradeLevel": "중3",
  "unit": "이차방정식",
  "limit": 10,
  "similarityThreshold": 0.7
}
```

**응답:**

```json
{
  "success": true,
  "data": {
    "queryId": "search_1",
    "results": [
      {
        "chunkId": "chunk_1",
        "content": "이차방정식 x² - 5x + 6 = 0의 해를 구하는 방법...",
        "similarityScore": 0.92,
        "rankPosition": 1,
        "metadata": {
          "subject": "수학",
          "gradeLevel": "중3",
          "chunkIndex": 5
        }
      }
    ],
    "searchTimeMs": 150,
    "totalResults": 8
  }
}
```

#### 검색 히스토리 조회

```http
GET /api/search/history?page=1&limit=20&subject=수학
```

## 📊 Teacher Report System API

### 1. 교사 리포트 생성

#### 리포트 생성

```http
POST /api/teacher-reports
```

**요청 본문:**

```json
{
  "title": "1학년 1반 수학 과목 리포트",
  "reportType": "full",
  "classInfo": {
    "grade": 1,
    "classNum": 1,
    "subject": "수학",
    "semester": "1학기",
    "year": 2024,
    "teacher": "김수학",
    "totalStudents": 30
  },
  "students": [
    {
      "id": 1,
      "name": "김민수",
      "math": 85,
      "korean": 78,
      "english": 72
    }
  ],
  "analysisTypes": ["basic_statistics", "achievement_distribution", "struggling_students"]
}
```

**응답:**

```json
{
  "success": true,
  "message": "교사 리포트 생성 성공",
  "data": {
    "id": "report_1",
    "title": "1학년 1반 수학 과목 리포트",
    "reportType": "full",
    "status": "completed",
    "analysisData": {
      "basicStatistics": {
        "average": 78.5,
        "median": 80.0,
        "std": 12.3,
        "min": 45.0,
        "max": 95.0,
        "count": 30
      },
      "achievementDistribution": {
        "high": 8,
        "medium": 15,
        "low": 7,
        "total": 30
      },
      "strugglingStudents": [
        {
          "name": "최지혜",
          "score": 45.0,
          "gap": -33.5
        }
      ]
    },
    "generationTimeMs": 5000,
    "tokensUsed": 2000,
    "costUsd": 0.08,
    "createdAt": "2025-01-21T13:29:24.000Z"
  }
}
```

#### 리포트 목록 조회

```http
GET /api/teacher-reports?page=1&limit=10&status=completed
```

#### 리포트 상세 조회

```http
GET /api/teacher-reports/[id]
```

## 🖥️ 통합 관리 API

### 1. 대시보드 데이터

#### 대시보드 통계 조회

```http
GET /api/dashboard
```

**응답:**

```json
{
  "success": true,
  "data": {
    "overview": {
      "totalUsers": 14,
      "totalTeachers": 4,
      "totalStudents": 9,
      "totalProblems": 15,
      "totalReports": 35
    },
    "aiUsage": {
      "questionsGenerated": 3,
      "textbooksUploaded": 4,
      "searchesPerformed": 3,
      "totalCostUsd": 0.2
    },
    "recentActivity": [
      {
        "id": "activity_1",
        "type": "question_generation",
        "description": "김수학 선생님이 수학 문제 3개를 생성했습니다",
        "timestamp": "2025-01-21T13:29:24.000Z"
      }
    ],
    "serverStatus": {
      "educational_ai": {
        "status": "healthy",
        "responseTimeMs": 150,
        "version": "1.0.0"
      },
      "teacher_report": {
        "status": "healthy",
        "responseTimeMs": 200,
        "version": "1.0.0"
      }
    }
  }
}
```

### 2. AI 서버 관리

#### AI 서버 상태 조회

```http
GET /api/ai/servers
```

**응답:**

```json
{
  "success": true,
  "data": {
    "servers": [
      {
        "serverName": "educational_ai",
        "serverUrl": "http://localhost:8000",
        "status": "healthy",
        "responseTimeMs": 150,
        "version": "1.0.0",
        "lastChecked": "2025-01-21T13:29:24.000Z",
        "services": {
          "embedding": "healthy",
          "questionGeneration": "healthy",
          "vectorSearch": "healthy"
        }
      },
      {
        "serverName": "teacher_report",
        "serverUrl": "http://localhost:8001",
        "status": "healthy",
        "responseTimeMs": 200,
        "version": "1.0.0",
        "lastChecked": "2025-01-21T13:29:24.000Z",
        "services": {
          "reportGeneration": "healthy",
          "dataAnalysis": "healthy",
          "visualization": "healthy"
        }
      }
    ]
  }
}
```

#### AI 서버 동기화

```http
POST /api/ai/sync
```

**요청 본문:**

```json
{
  "serverName": "educational_ai",
  "syncType": "data_sync"
}
```

## 📝 기존 기능 API

### 1. 문제 관리

- `GET /api/problems` - 문제 목록 조회
- `POST /api/problems` - 문제 생성
- `GET /api/problems/[id]` - 문제 상세 조회
- `PUT /api/problems/[id]` - 문제 수정
- `DELETE /api/problems/[id]` - 문제 삭제

### 2. 분석 리포트

- `GET /api/reports` - 리포트 목록 조회
- `POST /api/reports` - 리포트 생성
- `GET /api/reports/[id]` - 리포트 상세 조회

### 3. 학생 관리

- `GET /api/students` - 학생 목록 조회
- `POST /api/students` - 학생 등록
- `GET /api/students/[id]` - 학생 상세 조회

## ❌ 에러 처리

### HTTP 상태 코드

- `200` - 성공
- `201` - 생성 성공
- `400` - 잘못된 요청
- `401` - 인증 실패
- `403` - 권한 없음
- `404` - 리소스 없음
- `500` - 서버 오류

### 에러 응답 형식

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "요청 데이터가 올바르지 않습니다",
    "details": {
      "field": "email",
      "reason": "이메일 형식이 올바르지 않습니다"
    }
  }
}
```

### 주요 에러 코드

- `VALIDATION_ERROR` - 데이터 검증 실패
- `AUTHENTICATION_ERROR` - 인증 실패
- `AUTHORIZATION_ERROR` - 권한 없음
- `RESOURCE_NOT_FOUND` - 리소스 없음
- `AI_SERVER_ERROR` - AI 서버 오류
- `DATABASE_ERROR` - 데이터베이스 오류

## 📋 응답 형식

### 성공 응답

```json
{
  "success": true,
  "message": "요청이 성공적으로 처리되었습니다",
  "data": {
    // 실제 데이터
  },
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10
  }
}
```

### 페이지네이션

모든 목록 API는 페이지네이션을 지원합니다:

- `page`: 페이지 번호 (기본값: 1)
- `limit`: 페이지당 항목 수 (기본값: 10)
- `total`: 전체 항목 수
- `totalPages`: 전체 페이지 수

### 필터링 및 정렬

- `subject`: 과목 필터
- `gradeLevel`: 학년 필터
- `difficulty`: 난이도 필터
- `status`: 상태 필터
- `sortBy`: 정렬 기준
- `sortOrder`: 정렬 순서 (asc, desc)

---

**최종 업데이트**: 2025년 1월 21일  
**문서 버전**: 1.0.0  
**작성자**: EduBridge Development Team
