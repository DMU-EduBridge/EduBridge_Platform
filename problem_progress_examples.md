# ProblemProgress 테이블 예시 데이터

## 📊 테이블 구조 요약

```sql
model ProblemProgress {
  id             String    @id @default(cuid())
  userId         String    // 학습자 ID
  studyId        String    // 학습 자료 ID
  problemId      String    // 문제 ID
  attemptNumber  Int       @default(1) // 시도 번호
  selectedAnswer String?   // 선택한 답안
  isCorrect      Boolean   @default(false) // 정답 여부
  startedAt      DateTime? // 시작 시간 (최근 추가)
  completedAt    DateTime? // 완료 시간
  timeSpent      Int       @default(0) // 소요 시간(초) (최근 추가)
  lastAccessed   DateTime  @default(now()) // 마지막 접근 시간
  createdAt      DateTime  @default(now())
  updatedAt      DateTime  @updatedAt
}
```

## 🎯 실제 예시 데이터

### 1. 김민수 학생의 수학 학습 진행도

```json
{
  "id": "pp_001",
  "userId": "user_kim_minsu",
  "studyId": "study_quadratic_equations",
  "problemId": "prob_quadratic_001",
  "attemptNumber": 1,
  "selectedAnswer": "x = 2, 3",
  "isCorrect": true,
  "startedAt": "2024-01-15T10:30:00Z",
  "completedAt": "2024-01-15T10:35:00Z",
  "timeSpent": 300,
  "lastAccessed": "2024-01-15T10:35:00Z",
  "createdAt": "2024-01-15T10:30:00Z",
  "updatedAt": "2024-01-15T10:35:00Z"
}
```

### 2. 이지영 학생의 과학 문제 재시도

```json
{
  "id": "pp_002",
  "userId": "user_lee_jiyoung",
  "studyId": "study_photosynthesis",
  "problemId": "prob_photosynthesis_001",
  "attemptNumber": 2,
  "selectedAnswer": "빛에너지가 엽록소에 의해 흡수되어 ATP와 NADPH를 생성하고, 이를 이용해 포도당을 합성합니다.",
  "isCorrect": true,
  "startedAt": "2024-01-15T14:20:00Z",
  "completedAt": "2024-01-15T14:28:00Z",
  "timeSpent": 480,
  "lastAccessed": "2024-01-15T14:28:00Z",
  "createdAt": "2024-01-15T14:15:00Z",
  "updatedAt": "2024-01-15T14:28:00Z"
}
```

### 3. 박준호 학생의 영어 문제 풀이 (오답)

```json
{
  "id": "pp_003",
  "userId": "user_park_junho",
  "studyId": "study_english_grammar",
  "problemId": "prob_present_perfect_001",
  "attemptNumber": 1,
  "selectedAnswer": "I had studied English",
  "isCorrect": false,
  "startedAt": "2024-01-15T16:45:00Z",
  "completedAt": "2024-01-15T16:47:00Z",
  "timeSpent": 120,
  "lastAccessed": "2024-01-15T16:47:00Z",
  "createdAt": "2024-01-15T16:45:00Z",
  "updatedAt": "2024-01-15T16:47:00Z"
}
```

### 4. 김민수 학생의 피타고라스 정리 문제 (시간 초과)

```json
{
  "id": "pp_004",
  "userId": "user_kim_minsu",
  "studyId": "study_geometry",
  "problemId": "prob_pythagoras_001",
  "attemptNumber": 1,
  "selectedAnswer": "6",
  "isCorrect": false,
  "startedAt": "2024-01-15T11:00:00Z",
  "completedAt": "2024-01-15T11:05:00Z",
  "timeSpent": 300,
  "lastAccessed": "2024-01-15T11:05:00Z",
  "createdAt": "2024-01-15T11:00:00Z",
  "updatedAt": "2024-01-15T11:05:00Z"
}
```

### 5. 이지영 학생의 원의 넓이 문제 (빠른 정답)

```json
{
  "id": "pp_005",
  "userId": "user_lee_jiyoung",
  "studyId": "study_circle_area",
  "problemId": "prob_circle_area_001",
  "attemptNumber": 1,
  "selectedAnswer": "9π cm²",
  "isCorrect": true,
  "startedAt": "2024-01-15T15:10:00Z",
  "completedAt": "2024-01-15T15:12:00Z",
  "timeSpent": 120,
  "lastAccessed": "2024-01-15T15:12:00Z",
  "createdAt": "2024-01-15T15:10:00Z",
  "updatedAt": "2024-01-15T15:12:00Z"
}
```

### 6. 박준호 학생의 중력 법칙 문제 (재시도 후 정답)

```json
{
  "id": "pp_006",
  "userId": "user_park_junho",
  "studyId": "study_gravity_law",
  "problemId": "prob_gravity_001",
  "attemptNumber": 2,
  "selectedAnswer": "중력의 크기는 거리의 제곱에 반비례한다",
  "isCorrect": true,
  "startedAt": "2024-01-15T17:30:00Z",
  "completedAt": "2024-01-15T17:35:00Z",
  "timeSpent": 300,
  "lastAccessed": "2024-01-15T17:35:00Z",
  "createdAt": "2024-01-15T17:25:00Z",
  "updatedAt": "2024-01-15T17:35:00Z"
}
```

### 7. 김민수 학생의 영어 단어 문제 (미완료)

```json
{
  "id": "pp_007",
  "userId": "user_kim_minsu",
  "studyId": "study_english_vocabulary",
  "problemId": "prob_beautiful_word",
  "attemptNumber": 1,
  "selectedAnswer": null,
  "isCorrect": false,
  "startedAt": "2024-01-15T18:00:00Z",
  "completedAt": null,
  "timeSpent": 0,
  "lastAccessed": "2024-01-15T18:00:00Z",
  "createdAt": "2024-01-15T18:00:00Z",
  "updatedAt": "2024-01-15T18:00:00Z"
}
```

### 8. 이지영 학생의 삼각함수 문제 (AI 생성 문제)

```json
{
  "id": "pp_008",
  "userId": "user_lee_jiyoung",
  "studyId": "study_trigonometry",
  "problemId": "prob_ai_trigonometry_001",
  "attemptNumber": 1,
  "selectedAnswer": "1/2",
  "isCorrect": true,
  "startedAt": "2024-01-15T19:15:00Z",
  "completedAt": "2024-01-15T19:18:00Z",
  "timeSpent": 180,
  "lastAccessed": "2024-01-15T19:18:00Z",
  "createdAt": "2024-01-15T19:15:00Z",
  "updatedAt": "2024-01-15T19:18:00Z"
}
```

## 📈 데이터 분석 예시

### 학습자별 정답률 분석

```sql
SELECT
  u.name as 학생명,
  COUNT(*) as 총_문제수,
  SUM(CASE WHEN pp.isCorrect = true THEN 1 ELSE 0 END) as 정답수,
  ROUND(
    SUM(CASE WHEN pp.isCorrect = true THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 2
  ) as 정답률
FROM ProblemProgress pp
JOIN User u ON pp.userId = u.id
GROUP BY pp.userId, u.name
ORDER BY 정답률 DESC;
```

**결과:**

- 이지영: 4문제 중 4정답 (100%)
- 김민수: 3문제 중 1정답 (33.3%)
- 박준호: 2문제 중 1정답 (50%)

### 과목별 평균 소요 시간

```sql
SELECT
  p.subject as 과목,
  COUNT(*) as 문제수,
  ROUND(AVG(pp.timeSpent), 2) as 평균_소요시간_초,
  ROUND(AVG(pp.timeSpent) / 60, 2) as 평균_소요시간_분
FROM ProblemProgress pp
JOIN Problem p ON pp.problemId = p.id
WHERE pp.completedAt IS NOT NULL
GROUP BY p.subject
ORDER BY 평균_소요시간_초 DESC;
```

**결과:**

- 과학: 평균 390초 (6.5분)
- 수학: 평균 240초 (4분)
- 영어: 평균 120초 (2분)

### 학습 자료별 완료율

```sql
SELECT
  lm.title as 학습자료명,
  COUNT(DISTINCT pp.userId) as 학습자수,
  COUNT(*) as 총_시도수,
  SUM(CASE WHEN pp.completedAt IS NOT NULL THEN 1 ELSE 0 END) as 완료수,
  ROUND(
    SUM(CASE WHEN pp.completedAt IS NOT NULL THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 2
  ) as 완료율
FROM ProblemProgress pp
JOIN LearningMaterial lm ON pp.studyId = lm.id
GROUP BY lm.id, lm.title
ORDER BY 완료율 DESC;
```

## 🔗 다른 테이블과의 관계 예시

### User 테이블과의 관계

```json
{
  "user": {
    "id": "user_kim_minsu",
    "name": "김민수",
    "role": "STUDENT",
    "gradeLevel": "중3"
  },
  "progressEntries": ["pp_001", "pp_004", "pp_007"]
}
```

### Problem 테이블과의 관계

```json
{
  "problem": {
    "id": "prob_quadratic_001",
    "title": "이차방정식의 해 구하기",
    "subject": "수학",
    "difficulty": "MEDIUM",
    "type": "MULTIPLE_CHOICE"
  },
  "progressEntries": ["pp_001", "pp_002"]
}
```

### LearningMaterial 테이블과의 관계

```json
{
  "learningMaterial": {
    "id": "study_quadratic_equations",
    "title": "이차방정식 학습 가이드",
    "subject": "수학",
    "difficulty": "MEDIUM"
  },
  "progressEntries": ["pp_001", "pp_002"]
}
```

## 💡 활용 사례

1. **개인화된 학습 분석**: 각 학생의 문제 풀이 패턴 분석
2. **교사 리포트 생성**: 클래스 전체의 학습 현황 파악
3. **AI 추천 시스템**: 어려운 문제나 학습 자료 추천
4. **성능 최적화**: 자주 접근하는 문제나 학습 자료 캐싱
5. **학습 효과 측정**: 시간 대비 정답률 분석
