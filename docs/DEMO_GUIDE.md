# EduBridge 플랫폼 시연 가이드

## 📋 개요

EduBridge는 AI 기반 교육 플랫폼으로, 다음 4가지 핵심 기능을 제공합니다:

1. **AI 문제 생성** - 교과서 기반 자동 문제 생성
2. **문제 풀이 및 로그 수집** - 학습 과정 추적
3. **리포트 생성 및 조회** - AI 기반 학습 분석
4. **챗봇 학습 도우미** - 실시간 학습 지원

## 🚀 시작하기

### 1. 환경 설정

```bash
# 의존성 설치
npm install

# 데이터베이스 마이그레이션
npx prisma migrate deploy

# 시드 데이터 생성 (테스트 계정 포함)
npm run db:seed

# 개발 서버 실행
npm run dev
```

서버가 실행되면 브라우저에서 `http://localhost:3000` 접속

### 2. 테스트 계정

#### 교사 계정
- **이메일**: `math_teacher1@example.com`
- **비밀번호**: `password123`
- **역할**: 문제 생성, 리포트 조회

#### 학생 계정
- **이메일**: `student1@example.com`
- **비밀번호**: `password123`
- **역할**: 문제 풀이, 챗봇 사용

## 🎯 시연 시나리오

### 시나리오 1: AI 문제 생성 (교사)

#### 1단계: 로그인
1. 메인 페이지에서 "로그인" 클릭
2. 교사 계정으로 로그인 (`math_teacher1@example.com` / `password123`)
3. 자동으로 교사 대시보드로 이동

#### 2단계: 문제 생성 페이지 접근
1. 좌측 사이드바에서 "문제 관리" 클릭
2. "AI 문제 생성" 버튼 클릭 또는 `/problems/generate` 직접 접근

#### 3단계: 문제 생성 설정
1. **과목 선택**: 수학(MATH), 영어(ENGLISH), 과학(SCIENCE) 등
2. **난이도 선택**: 쉬움(EASY), 보통(MEDIUM), 어려움(HARD)
3. **학년 선택**: 중1~고3
4. **생성 개수**: 1~10개
5. **단원 입력**: (선택사항) 예: "이차방정식"

#### 4단계: 문제 생성 및 확인
1. "문제 생성" 버튼 클릭
2. AI가 자동으로 문제 생성 (2~5초 소요)
3. 생성된 문제 미리보기
4. 필요시 문제 수정
5. "저장" 버튼으로 문제 데이터베이스에 저장

#### 기대 결과
- ✅ AI가 선택한 조건에 맞는 문제 자동 생성
- ✅ 문제, 보기, 정답, 해설 포함
- ✅ 데이터베이스에 저장되어 학생들이 풀 수 있음

---

### 시나리오 2: 문제 풀이 및 로그 수집 (학생)

#### 1단계: 로그아웃 후 학생 로그인
1. 우측 상단 프로필 → "로그아웃"
2. 학생 계정으로 로그인 (`student1@example.com` / `password123`)
3. 자동으로 학습 페이지(`/my/learning`)로 이동

#### 2단계: 학습 자료 선택
1. 학습 목록에서 학습 자료 선택
2. "학습 시작" 버튼 클릭
3. 문제 목록 페이지로 이동

#### 3단계: 문제 풀이
1. 첫 번째 문제부터 순차적으로 풀기
2. 각 문제마다:
   - 문제 내용 읽기
   - 보기 선택
   - "제출" 버튼 클릭
   - 즉시 정답/오답 피드백
   - "다음 문제" 버튼으로 이동

#### 4단계: 로그 수집 확인
**백그라운드에서 자동 수집되는 데이터:**
- ⏱️ 문제당 소요 시간
- ✓/✗ 정답 여부
- 🔄 시도 횟수
- 📊 선택한 답변
- 📅 완료 시간

#### 5단계: 결과 확인
1. 모든 문제 완료 시 자동으로 결과 페이지 이동
2. 전체 정답률, 소요 시간 확인
3. 틀린 문제만 다시 풀기 옵션

#### 기대 결과
- ✅ 실시간 문제 풀이 가능
- ✅ 즉각적인 피드백 제공
- ✅ 모든 학습 활동 자동 로그 수집
- ✅ 데이터베이스에 `Attempt`, `ProblemProgress` 테이블에 저장

---

### 시나리오 3: 리포트 생성 및 조회 (교사)

#### 1단계: 교사 계정으로 재로그인
1. 로그아웃 후 교사 계정으로 다시 로그인
2. 대시보드로 이동

#### 2단계: 리포트 생성
1. 좌측 사이드바에서 "교사 리포트" 클릭 (`/teacher-reports`)
2. "새 리포트 생성" 버튼 클릭
3. 리포트 설정:
   - **제목**: 예: "2025년 1월 수학 학습 분석"
   - **리포트 유형**: 진도 리포트, 성과 분석 등
   - **대상 반**: (선택사항)
   - **대상 학생**: (선택사항)

#### 3단계: AI 리포트 생성
1. "리포트 생성" 버튼 클릭
2. AI가 학습 로그 분석 시작
3. 생성 진행 상태 표시
4. 완료 시 자동으로 리포트 상세 페이지 이동

#### 4단계: 리포트 조회 및 분석
**생성된 리포트 내용:**
- 📊 **기본 통계**: 전체 학생 수, 평균 정답률, 평균 소요 시간
- 📈 **성적 분포**: 성적대별 학생 분포
- 🎯 **약점 분석**: 낮은 정답률 문제 분석
- ⭐ **우수 학생**: 상위 성적 학생 목록
- 💡 **개선 제안**: AI가 제안하는 학습 방향

#### 5단계: 리포트 관리
1. 리포트 목록에서 과거 리포트 조회
2. PDF 다운로드 (선택사항)
3. 리포트 공유 (선택사항)

#### 기대 결과
- ✅ 수집된 학습 로그 기반 자동 분석
- ✅ AI가 학생별 약점 파악
- ✅ 데이터 기반 학습 개선 제안
- ✅ 시각화된 차트와 그래프

---

### 시나리오 4: 챗봇 학습 도우미 (학생)

#### 1단계: 학생 계정으로 로그인
1. 학생 계정으로 로그인
2. 대시보드 또는 학습 페이지로 이동

#### 2단계: AI 어시스턴트 접근
1. 좌측 사이드바에서 "AI 어시스턴트" 클릭 (`/ai-assistant`)
2. 챗봇 인터페이스 표시

#### 3단계: 챗봇과 대화
**질문 예시:**
```
학생: "이차방정식이 뭐예요?"
AI: "이차방정식은 x²을 포함하는 방정식으로..."

학생: "근의 공식을 알려주세요"
AI: "근의 공식은 x = (-b ± √(b² - 4ac)) / 2a 입니다..."

학생: "예제 문제를 풀어주세요"
AI: "문제: x² + 5x + 6 = 0을 풀어보세요..."
```

#### 4단계: 학습 자료 기반 답변
- 📚 교과서 내용 기반 정확한 답변
- 💡 단계별 설명 제공
- 🎯 관련 예제 문제 제시
- 🔗 추가 학습 자료 추천

#### 5단계: 대화 이력 관리
1. 새 대화 시작
2. 이전 대화 이력 조회
3. 대화 삭제

#### 기대 결과
- ✅ 실시간 AI 응답
- ✅ 교과 내용 기반 정확한 정보
- ✅ 대화 이력 자동 저장
- ✅ 컨텍스트 유지 대화

---

## 🔍 주요 기능별 상세 설명

### 1. AI 문제 생성 기능

**기술 스택:**
- OpenAI GPT-4 API
- Vector Database (ChromaDB)
- RAG (Retrieval-Augmented Generation)

**동작 과정:**
1. 교사가 과목, 난이도, 단원 선택
2. Vector DB에서 관련 교과서 내용 검색
3. 검색된 내용을 컨텍스트로 GPT-4에 전달
4. AI가 문제, 보기, 정답, 해설 생성
5. 생성된 문제를 데이터베이스에 저장

**API 엔드포인트:**
- `POST /api/problems/generate` - 문제 생성
- `POST /api/problems/batch` - 대량 문제 저장
- `GET /api/problems` - 문제 목록 조회

---

### 2. 문제 풀이 및 로그 수집

**데이터베이스 테이블:**
- `Attempt` - 각 문제 시도 기록
- `ProblemProgress` - 학습 진행 상황

**수집 데이터:**
```typescript
{
  userId: string,
  problemId: string,
  studyId: string,
  attemptNumber: number,
  selectedAnswer: string,
  isCorrect: boolean,
  startedAt: DateTime,
  completedAt: DateTime,
  timeSpent: number (ms)
}
```

**실시간 추적:**
- 문제 시작 시간
- 답변 제출 시간
- 정답 여부
- 소요 시간 계산

**API 엔드포인트:**
- `POST /api/learning/[studyId]/attempt` - 답변 제출
- `GET /api/learning/[studyId]/progress` - 진행 상황 조회

---

### 3. 리포트 생성 및 조회

**분석 항목:**
1. **기본 통계**
   - 총 학생 수
   - 평균 정답률
   - 평균 소요 시간
   - 완료율

2. **성적 분포**
   - 성적대별 학생 수
   - 정답률 히스토그램

3. **약점 분석**
   - 낮은 정답률 문제
   - 많이 틀린 유형
   - 오래 걸린 문제

4. **우수 학생**
   - 상위 10% 학생
   - 개선된 학생

5. **AI 제안**
   - 학습 방향 제안
   - 추천 문제
   - 개선 방안

**API 엔드포인트:**
- `POST /api/teacher-reports` - 리포트 생성
- `GET /api/teacher-reports` - 리포트 목록
- `GET /api/teacher-reports/[id]` - 리포트 상세
- `POST /api/teacher-reports/[id]/generate` - AI 리포트 생성

---

### 4. 챗봇 학습 도우미

**기술:**
- OpenAI GPT-4 Chat API
- Session Management
- Context Window

**기능:**
- 실시간 질의응답
- 학습 자료 기반 답변
- 대화 이력 저장
- 멀티 세션 지원

**데이터베이스 테이블:**
- `ChatSession` - 대화 세션
- `ChatMessage` - 대화 메시지
- `ChatCitation` - 참조 출처

**API 엔드포인트:**
- `POST /api/chat/sessions` - 새 세션 생성
- `GET /api/chat/sessions` - 세션 목록
- `POST /api/chat/sessions/[id]/messages` - 메시지 전송
- `GET /api/chat/sessions/[id]/messages` - 메시지 이력

---

## 📊 데이터베이스 스키마

### 주요 테이블

```sql
-- 사용자
User {
  id: String
  email: String
  name: String
  role: UserRole (STUDENT|TEACHER|ADMIN)
}

-- 문제
Problem {
  id: String
  title: String
  content: String
  type: ProblemType
  difficulty: ProblemDifficulty
  subject: Subject
  correctAnswer: String
  explanation: String
  isAIGenerated: Boolean
}

-- 문제 풀이 기록
Attempt {
  id: String
  userId: String
  problemId: String
  selected: String
  isCorrect: Boolean
  timeSpent: Int
  createdAt: DateTime
}

-- 학습 진행 상황
ProblemProgress {
  id: String
  userId: String
  studyId: String
  problemId: String
  attemptNumber: Int
  isCorrect: Boolean
  timeSpent: Int
}

-- 교사 리포트
TeacherReport {
  id: String
  title: String
  content: String
  reportType: ReportType
  analysisData: Json
  createdBy: String
  createdAt: DateTime
}

-- 챗 세션
ChatSession {
  id: String
  userId: String
  title: String
  lastMessageAt: DateTime
}

-- 챗 메시지
ChatMessage {
  id: String
  sessionId: String
  role: ChatRole (USER|ASSISTANT)
  content: String
  createdAt: DateTime
}
```

---

## 🎨 UI/UX 특징

### 디자인 시스템
- **프레임워크**: Tailwind CSS
- **컴포넌트**: Radix UI + Shadcn/ui
- **아이콘**: Lucide React
- **애니메이션**: Framer Motion

### 반응형 디자인
- 모바일 우선 설계
- 태블릿, 데스크톱 최적화
- 다크모드 지원 (향후)

### 접근성
- ARIA 레이블
- 키보드 네비게이션
- 스크린 리더 지원

---

## 🔧 트러블슈팅

### 문제 1: 데이터베이스 연결 오류
```bash
# 해결 방법
npx prisma generate
npx prisma migrate deploy
```

### 문제 2: 포트 충돌
```bash
# 다른 포트 사용
PORT=3002 npm run dev
```

### 문제 3: AI 서비스 연결 실패
- `.env` 파일에 `OPENAI_API_KEY` 확인
- AI 서버 실행 상태 확인

---

## 📈 성능 최적화

### 적용된 최적화
1. **데이터베이스**
   - 인덱스 최적화
   - 쿼리 최적화
   - 커넥션 풀링

2. **프론트엔드**
   - React Query 캐싱
   - 코드 스플리팅
   - 이미지 최적화

3. **API**
   - 응답 캐싱
   - Rate Limiting
   - 배치 처리

---

## 🚀 배포 가이드

### Vercel 배포
```bash
# Vercel CLI 설치
npm i -g vercel

# 배포
vercel --prod
```

### Docker 배포
```bash
# 이미지 빌드
docker-compose build

# 컨테이너 실행
docker-compose up -d
```

---

## 📝 체크리스트

### 시연 전 확인사항
- [ ] 데이터베이스 연결 확인
- [ ] 시드 데이터 생성 완료
- [ ] 개발 서버 정상 실행
- [ ] 테스트 계정 로그인 가능
- [ ] 각 핵심 기능 동작 확인
- [ ] 네트워크 연결 안정적

### 시연 중 강조점
- [ ] AI 문제 생성 속도와 품질
- [ ] 실시간 로그 수집
- [ ] 리포트의 인사이트 깊이
- [ ] 챗봇 응답의 정확성
- [ ] 직관적인 UI/UX

---

## 📞 지원

### 문의
- 이메일: support@edubridge.com
- GitHub Issues: [EduBridge Issues](https://github.com/DMU-EduBridge/EduBridge_Platform/issues)

### 문서
- [개발 가이드](./DEVELOPMENT_GUIDE.md)
- [API 문서](./API_DOCUMENTATION.md)
- [프로젝트 구조](./PROJECT_STRUCTURE.md)
- [라우팅 구조](./ROUTING.md)

---

**마지막 업데이트**: 2025년 1월 17일
**버전**: v1.0.0
**작성자**: EduBridge Team
