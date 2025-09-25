import { PrismaClient } from '@prisma/client';
import { logger } from '../src/lib/monitoring';

const prisma = new PrismaClient();

async function main() {
  logger.info('🌱 포괄적인 시드 데이터 생성을 시작합니다...', { service: 'edubridge-api' });

  try {
    // 1. 사용자 데이터 생성 (다양한 역할)
    const users = await Promise.all([
      // 관리자
      prisma.user.upsert({
        where: { email: 'admin@example.com' },
        update: {},
        create: {
          name: '관리자',
          email: 'admin@example.com',
          role: 'ADMIN',
          status: 'ACTIVE',
          avatar: 'https://example.com/admin-avatar.jpg',
          bio: '시스템 관리자입니다.',
        },
      }),
      // 수학 교사들
      prisma.user.upsert({
        where: { email: 'math_teacher1@example.com' },
        update: {},
        create: {
          name: '김수학',
          email: 'math_teacher1@example.com',
          role: 'TEACHER',
          status: 'ACTIVE',
          school: 'EduBridge 중학교',
          subject: '수학',
          avatar: 'https://example.com/math-teacher1.jpg',
          bio: '수학 전문 교사입니다.',
        },
      }),
      prisma.user.upsert({
        where: { email: 'math_teacher2@example.com' },
        update: {},
        create: {
          name: '이수학',
          email: 'math_teacher2@example.com',
          role: 'TEACHER',
          status: 'ACTIVE',
          school: 'EduBridge 고등학교',
          subject: '수학',
          avatar: 'https://example.com/math-teacher2.jpg',
          bio: '고등학교 수학 교사입니다.',
        },
      }),
      // 과학 교사들
      prisma.user.upsert({
        where: { email: 'science_teacher@example.com' },
        update: {},
        create: {
          name: '박과학',
          email: 'science_teacher@example.com',
          role: 'TEACHER',
          status: 'ACTIVE',
          school: 'EduBridge 중학교',
          subject: '과학',
          avatar: 'https://example.com/science-teacher.jpg',
          bio: '과학 전문 교사입니다.',
        },
      }),
      // 영어 교사
      prisma.user.upsert({
        where: { email: 'english_teacher@example.com' },
        update: {},
        create: {
          name: '최영어',
          email: 'english_teacher@example.com',
          role: 'TEACHER',
          status: 'ACTIVE',
          school: 'EduBridge 중학교',
          subject: '영어',
          avatar: 'https://example.com/english-teacher.jpg',
          bio: '영어 전문 교사입니다.',
        },
      }),
      // 학생들
      prisma.user.upsert({
        where: { email: 'student1@example.com' },
        update: {},
        create: {
          name: '김민수',
          email: 'student1@example.com',
          role: 'STUDENT',
          status: 'ACTIVE',
          gradeLevel: '중3',
          avatar: 'https://example.com/student1.jpg',
          bio: '중학교 3학년 학생입니다.',
        },
      }),
      prisma.user.upsert({
        where: { email: 'student2@example.com' },
        update: {},
        create: {
          name: '이지영',
          email: 'student2@example.com',
          role: 'STUDENT',
          status: 'ACTIVE',
          gradeLevel: '중2',
          avatar: 'https://example.com/student2.jpg',
          bio: '중학교 2학년 학생입니다.',
        },
      }),
      prisma.user.upsert({
        where: { email: 'student3@example.com' },
        update: {},
        create: {
          name: '박준호',
          email: 'student3@example.com',
          role: 'STUDENT',
          status: 'ACTIVE',
          gradeLevel: '고1',
          avatar: 'https://example.com/student3.jpg',
          bio: '고등학교 1학년 학생입니다.',
        },
      }),
    ]);

    const mathTeacher1 = users[1];
    const mathTeacher2 = users[2];
    const scienceTeacher = users[3];
    const englishTeacher = users[4];

    // 2. 교과서 데이터 생성 (다양한 과목과 학년)
    const textbooks = await Promise.all([
      // 중학교 수학 교과서들
      prisma.textbook.create({
        data: {
          title: '중학교 수학 1학년',
          subject: '수학',
          gradeLevel: '중1',
          publisher: '교육부',
          fileName: 'math_middle_1.pdf',
          filePath: '/uploads/math_middle_1.pdf',
          fileSize: 1024000,
          mimeType: 'application/pdf',
          totalChunks: 20,
          processingStatus: 'COMPLETED',
          uploadedBy: mathTeacher1.id,
        },
      }),
      prisma.textbook.create({
        data: {
          title: '중학교 수학 2학년',
          subject: '수학',
          gradeLevel: '중2',
          publisher: '교육부',
          fileName: 'math_middle_2.pdf',
          filePath: '/uploads/math_middle_2.pdf',
          fileSize: 1536000,
          mimeType: 'application/pdf',
          totalChunks: 25,
          processingStatus: 'COMPLETED',
          uploadedBy: mathTeacher1.id,
        },
      }),
      prisma.textbook.create({
        data: {
          title: '중학교 수학 3학년',
          subject: '수학',
          gradeLevel: '중3',
          publisher: '교육부',
          fileName: 'math_middle_3.pdf',
          filePath: '/uploads/math_middle_3.pdf',
          fileSize: 2048000,
          mimeType: 'application/pdf',
          totalChunks: 30,
          processingStatus: 'COMPLETED',
          uploadedBy: mathTeacher1.id,
        },
      }),
      // 고등학교 수학 교과서
      prisma.textbook.create({
        data: {
          title: '고등학교 수학 1학년',
          subject: '수학',
          gradeLevel: '고1',
          publisher: '교육부',
          fileName: 'math_high_1.pdf',
          filePath: '/uploads/math_high_1.pdf',
          fileSize: 2560000,
          mimeType: 'application/pdf',
          totalChunks: 35,
          processingStatus: 'COMPLETED',
          uploadedBy: mathTeacher2.id,
        },
      }),
      // 과학 교과서
      prisma.textbook.create({
        data: {
          title: '중학교 과학 2학년',
          subject: '과학',
          gradeLevel: '중2',
          publisher: '교육부',
          fileName: 'science_middle_2.pdf',
          filePath: '/uploads/science_middle_2.pdf',
          fileSize: 1800000,
          mimeType: 'application/pdf',
          totalChunks: 22,
          processingStatus: 'COMPLETED',
          uploadedBy: scienceTeacher.id,
        },
      }),
      // 영어 교과서
      prisma.textbook.create({
        data: {
          title: '중학교 영어 1학년',
          subject: '영어',
          gradeLevel: '중1',
          publisher: '교육부',
          fileName: 'english_middle_1.pdf',
          filePath: '/uploads/english_middle_1.pdf',
          fileSize: 1200000,
          mimeType: 'application/pdf',
          totalChunks: 18,
          processingStatus: 'COMPLETED',
          uploadedBy: englishTeacher.id,
        },
      }),
    ]);

    // 3. 문서 청크 데이터 생성 (RAG 검색용)
    const documentChunks = [];
    for (let i = 0; i < textbooks.length; i++) {
      const textbook = textbooks[i];
      const chunkCount = textbook?.totalChunks || 0;

      for (let j = 0; j < Math.min(chunkCount, 5); j++) {
        // 각 교과서당 최대 5개 청크
        const chunk = await prisma.documentChunk.create({
          data: {
            textbookId: textbook?.id || '',
            chunkIndex: j,
            content: `${textbook?.title}의 ${j + 1}번째 청크입니다. ${textbook?.subject} 과목의 중요한 내용이 포함되어 있습니다.`,
            contentLength: 200 + j * 50,
            embeddingId: `embedding_${textbook?.id}_${j}`,
            metadata: JSON.stringify({
              page: j + 1,
              section: `섹션 ${j + 1}`,
              topic: `${textbook?.subject} 주제 ${j + 1}`,
            }),
          },
        });
        documentChunks.push(chunk);
      }
    }

    // 4. 문제 데이터 생성 (일반 문제와 AI 생성 문제)
    const problems = await Promise.all([
      // 일반 수학 문제들
      prisma.problem.create({
        data: {
          title: '이차방정식의 해 구하기',
          description: '다음 이차방정식의 해를 구하세요: x² - 5x + 6 = 0',
          content:
            '이차방정식 x² - 5x + 6 = 0의 해를 구하는 문제입니다. 인수분해를 이용하여 풀어보세요.',
          subject: '수학',
          gradeLevel: '중3',
          type: 'MULTIPLE_CHOICE',
          difficulty: 'MEDIUM',
          options: JSON.stringify(['x = 2, 3', 'x = 1, 6', 'x = -2, -3', '해가 없음']),
          correctAnswer: 'x = 2, 3',
          explanation: '인수분해를 이용하여 (x-2)(x-3) = 0이므로 x = 2, 3입니다.',
          hints: JSON.stringify([
            '인수분해를 사용해보세요',
            '두 수의 곱이 6이고 합이 5인 수를 찾아보세요',
          ]),
          tags: JSON.stringify(['이차방정식', '인수분해', '수학']),
          points: 5,
          timeLimit: 300,
          isActive: true,
          isAIGenerated: false,
          reviewStatus: 'APPROVED',
          reviewedBy: mathTeacher1.id,
          reviewedAt: new Date(),
        },
      }),
      prisma.problem.create({
        data: {
          title: '삼각함수의 기본값',
          description: 'sin 30°의 값을 구하세요.',
          content: '삼각함수 sin 30°의 값을 구하는 문제입니다.',
          subject: '수학',
          gradeLevel: '고2',
          type: 'MULTIPLE_CHOICE',
          difficulty: 'EASY',
          options: JSON.stringify(['1/2', '√3/2', '1', '0']),
          correctAnswer: '1/2',
          explanation: '30-60-90 삼각형에서 sin 30° = 1/2입니다.',
          hints: JSON.stringify(['30-60-90 삼각형을 생각해보세요']),
          tags: JSON.stringify(['삼각함수', '수학']),
          points: 3,
          timeLimit: 180,
          isActive: true,
          isAIGenerated: false,
          reviewStatus: 'APPROVED',
          reviewedBy: mathTeacher2.id,
          reviewedAt: new Date(),
        },
      }),
      prisma.problem.create({
        data: {
          title: '미분의 정의',
          description: '함수 f(x) = x²의 x = 2에서의 미분계수를 구하세요.',
          content: '함수 f(x) = x²의 x = 2에서의 미분계수를 구하는 문제입니다.',
          subject: '수학',
          gradeLevel: '고3',
          type: 'SHORT_ANSWER',
          difficulty: 'HARD',
          options: JSON.stringify([]),
          correctAnswer: '4',
          explanation: "f'(x) = 2x이므로 f'(2) = 4입니다.",
          hints: JSON.stringify(['미분의 정의를 사용해보세요', "f'(x) = 2x"]),
          tags: JSON.stringify(['미분', '수학']),
          points: 8,
          timeLimit: 600,
          isActive: true,
          isAIGenerated: false,
          reviewStatus: 'APPROVED',
          reviewedBy: mathTeacher2.id,
          reviewedAt: new Date(),
        },
      }),
      // 과학 문제들
      prisma.problem.create({
        data: {
          title: '광합성의 과정',
          description: '광합성에서 빛에너지가 화학에너지로 변환되는 과정을 설명하세요.',
          content: '광합성에서 빛에너지가 화학에너지로 변환되는 과정을 설명하는 문제입니다.',
          subject: '과학',
          gradeLevel: '중2',
          type: 'ESSAY',
          difficulty: 'MEDIUM',
          options: JSON.stringify([]),
          correctAnswer:
            '빛에너지가 엽록소에 의해 흡수되어 ATP와 NADPH를 생성하고, 이를 이용해 포도당을 합성합니다.',
          explanation:
            '광합성은 빛에너지를 화학에너지로 변환하는 과정으로, 엽록소가 빛을 흡수하여 ATP와 NADPH를 만들고, 이를 이용해 포도당을 합성합니다.',
          hints: JSON.stringify([
            '엽록소의 역할을 생각해보세요',
            'ATP와 NADPH의 생성 과정을 설명해보세요',
          ]),
          tags: JSON.stringify(['광합성', '과학', '생물']),
          points: 10,
          timeLimit: 900,
          isActive: true,
          isAIGenerated: false,
          reviewStatus: 'APPROVED',
          reviewedBy: scienceTeacher.id,
          reviewedAt: new Date(),
        },
      }),
      // 영어 문제들
      prisma.problem.create({
        data: {
          title: '영어 문법 - 현재완료',
          description: '다음 문장을 현재완료 시제로 바꾸세요: "I study English"',
          content: '다음 문장을 현재완료 시제로 바꾸는 문제입니다.',
          subject: '영어',
          gradeLevel: '중1',
          type: 'SHORT_ANSWER',
          difficulty: 'EASY',
          options: JSON.stringify([]),
          correctAnswer: 'I have studied English',
          explanation: '현재완료 시제는 have/has + 과거분사 형태로 만듭니다.',
          hints: JSON.stringify(['현재완료 시제의 구조를 생각해보세요', 'have/has + 과거분사']),
          tags: JSON.stringify(['영어', '문법', '현재완료']),
          points: 4,
          timeLimit: 240,
          isActive: true,
          isAIGenerated: false,
          reviewStatus: 'APPROVED',
          reviewedBy: englishTeacher.id,
          reviewedAt: new Date(),
        },
      }),
      // AI 생성 문제들
      prisma.problem.create({
        data: {
          title: 'AI 생성 이차방정식 문제',
          description: 'AI가 생성한 이차방정식 문제입니다.',
          content: '다음 중 이차방정식 x² - 5x + 6 = 0의 해는?',
          subject: '수학',
          gradeLevel: '중3',
          unit: '이차방정식',
          type: 'MULTIPLE_CHOICE',
          difficulty: 'MEDIUM',
          options: JSON.stringify(['x = 2, 3', 'x = 1, 6', 'x = -2, -3', '해가 없음']),
          correctAnswer: 'x = 2, 3',
          explanation: '인수분해를 이용하여 (x-2)(x-3) = 0이므로 x = 2, 3입니다.',
          generationPrompt: '이차방정식의 해를 구하는 문제를 생성해주세요.',
          contextChunkIds: JSON.stringify([
            documentChunks[0]?.id || '',
            documentChunks[1]?.id || '',
          ]),
          qualityScore: 0.85,
          generationTimeMs: 2500,
          modelName: 'gpt-4',
          tokensUsed: 1200,
          costUsd: 0.05,
          textbookId: textbooks[2].id, // 중3 수학 교과서
          createdBy: mathTeacher1.id,
          isAIGenerated: true,
          isActive: true,
          reviewStatus: 'PENDING',
        },
      }),
      prisma.problem.create({
        data: {
          title: 'AI 생성 광합성 문제',
          description: 'AI가 생성한 광합성 관련 문제입니다.',
          content: '광합성에서 빛에너지가 화학에너지로 변환되는 과정을 설명하세요.',
          subject: '과학',
          gradeLevel: '중2',
          unit: '광합성',
          type: 'ESSAY',
          difficulty: 'HARD',
          options: JSON.stringify([]),
          correctAnswer:
            '빛에너지가 엽록소에 의해 흡수되어 ATP와 NADPH를 생성하고, 이를 이용해 포도당을 합성합니다.',
          explanation:
            '빛에너지가 엽록소에 의해 흡수되어 ATP와 NADPH를 생성하고, 이를 이용해 포도당을 합성합니다.',
          generationPrompt: '광합성 과정에 대한 설명 문제를 생성해주세요.',
          contextChunkIds: JSON.stringify([documentChunks[4]?.id || '']),
          qualityScore: 0.92,
          generationTimeMs: 3200,
          modelName: 'gpt-4',
          tokensUsed: 1500,
          costUsd: 0.07,
          textbookId: textbooks[4].id, // 중2 과학 교과서
          createdBy: scienceTeacher.id,
          isAIGenerated: true,
          isActive: true,
          reviewStatus: 'PENDING',
        },
      }),
    ]);

    // 5. 문제 선택지 데이터 생성
    const questionOptions = await Promise.all([
      // 이차방정식 문제 선택지
      prisma.questionOption.create({
        data: {
          problemId: problems[0].id,
          optionNumber: 1,
          optionText: 'x = 2, 3',
          isCorrect: true,
        },
      }),
      prisma.questionOption.create({
        data: {
          problemId: problems[0].id,
          optionNumber: 2,
          optionText: 'x = 1, 6',
          isCorrect: false,
        },
      }),
      prisma.questionOption.create({
        data: {
          problemId: problems[0].id,
          optionNumber: 3,
          optionText: 'x = -2, -3',
          isCorrect: false,
        },
      }),
      prisma.questionOption.create({
        data: {
          problemId: problems[0].id,
          optionNumber: 4,
          optionText: '해가 없음',
          isCorrect: false,
        },
      }),
      // 삼각함수 문제 선택지
      prisma.questionOption.create({
        data: {
          problemId: problems[1].id,
          optionNumber: 1,
          optionText: '1/2',
          isCorrect: true,
        },
      }),
      prisma.questionOption.create({
        data: {
          problemId: problems[1].id,
          optionNumber: 2,
          optionText: '√3/2',
          isCorrect: false,
        },
      }),
      prisma.questionOption.create({
        data: {
          problemId: problems[1].id,
          optionNumber: 3,
          optionText: '1',
          isCorrect: false,
        },
      }),
      prisma.questionOption.create({
        data: {
          problemId: problems[1].id,
          optionNumber: 4,
          optionText: '0',
          isCorrect: false,
        },
      }),
    ]);

    // 6. 문제 태그 데이터 생성
    const questionTags = await Promise.all([
      prisma.questionTag.create({
        data: {
          problemId: problems[0].id,
          tagName: '이차방정식',
        },
      }),
      prisma.questionTag.create({
        data: {
          problemId: problems[0].id,
          tagName: '인수분해',
        },
      }),
      prisma.questionTag.create({
        data: {
          problemId: problems[1].id,
          tagName: '삼각함수',
        },
      }),
      prisma.questionTag.create({
        data: {
          problemId: problems[2].id,
          tagName: '미분',
        },
      }),
      prisma.questionTag.create({
        data: {
          problemId: problems[3].id,
          tagName: '광합성',
        },
      }),
      prisma.questionTag.create({
        data: {
          problemId: problems[3].id,
          tagName: '생물',
        },
      }),
    ]);

    // 7. 검색 쿼리 데이터 생성
    const searchQueries = await Promise.all([
      prisma.searchQuery.create({
        data: {
          queryText: '이차방정식 해 구하기',
          subject: '수학',
          gradeLevel: '중3',
          unit: '이차방정식',
          resultsCount: 3,
          searchTimeMs: 150,
          userId: mathTeacher1.id,
          sessionId: 'session_1',
        },
      }),
      prisma.searchQuery.create({
        data: {
          queryText: '광합성 과정',
          subject: '과학',
          gradeLevel: '중2',
          unit: '광합성',
          resultsCount: 2,
          searchTimeMs: 200,
          userId: scienceTeacher.id,
          sessionId: 'session_2',
        },
      }),
      prisma.searchQuery.create({
        data: {
          queryText: '삼각함수 기본값',
          subject: '수학',
          gradeLevel: '고2',
          unit: '삼각함수',
          resultsCount: 4,
          searchTimeMs: 120,
          userId: mathTeacher2.id,
          sessionId: 'session_3',
        },
      }),
    ]);

    // 8. 검색 결과 데이터 생성
    const searchResults = await Promise.all([
      prisma.searchResult.create({
        data: {
          queryId: searchQueries[0].id,
          chunkId: documentChunks[0]?.id || '',
          similarityScore: 0.95,
          rankPosition: 1,
        },
      }),
      prisma.searchResult.create({
        data: {
          queryId: searchQueries[0].id,
          chunkId: documentChunks[1]?.id || '',
          similarityScore: 0.87,
          rankPosition: 2,
        },
      }),
      prisma.searchResult.create({
        data: {
          queryId: searchQueries[1].id,
          chunkId: documentChunks[4]?.id || '',
          similarityScore: 0.92,
          rankPosition: 1,
        },
      }),
    ]);

    // 9. 교사 리포트 데이터 생성
    const teacherReports = await Promise.all([
      prisma.teacherReport.create({
        data: {
          title: '1학년 1반 수학 과목 리포트',
          content:
            '학급 전체 학습 현황 분석 리포트입니다. 학생들의 수학 성취도를 종합적으로 분석했습니다.',
          reportType: 'full',
          classInfo: JSON.stringify({
            gradeLevel: 1,
            class: 1,
            subject: '수학',
            teacher: '김수학',
            totalStudents: 30,
            semester: '1학기',
            year: 2024,
          }),
          students: JSON.stringify([
            { id: 1, name: '김민수', math: 85, korean: 78, english: 72, science: 80 },
            { id: 2, name: '이지영', math: 92, korean: 88, english: 85, science: 90 },
            { id: 3, name: '박준호', math: 78, korean: 82, english: 75, science: 85 },
            { id: 4, name: '최수진', math: 95, korean: 90, english: 88, science: 92 },
            { id: 5, name: '정민호', math: 70, korean: 75, english: 68, science: 72 },
          ]),
          analysisData: JSON.stringify({
            average: 78.5,
            median: 80.0,
            std: 12.3,
            min: 45.0,
            max: 95.0,
            distribution: {
              excellent: 8,
              good: 12,
              average: 7,
              below_average: 3,
            },
          }),
          status: 'PUBLISHED',
          createdBy: mathTeacher1.id,
        },
      }),
      prisma.teacherReport.create({
        data: {
          title: '2학년 3반 과학 과목 리포트',
          content: '과학 과목 학습 현황 및 개선 방안을 제시한 리포트입니다.',
          reportType: 'subject',
          classInfo: JSON.stringify({
            gradeLevel: 2,
            class: 3,
            subject: '과학',
            teacher: '박과학',
            totalStudents: 28,
            semester: '1학기',
            year: 2024,
          }),
          students: JSON.stringify([
            { id: 1, name: '김과학', science: 88, math: 85, korean: 80, english: 75 },
            { id: 2, name: '이실험', science: 92, math: 90, korean: 85, english: 82 },
            { id: 3, name: '박연구', science: 85, math: 88, korean: 78, english: 80 },
          ]),
          analysisData: JSON.stringify({
            average: 88.3,
            median: 88.0,
            std: 3.5,
            min: 80.0,
            max: 92.0,
            distribution: {
              excellent: 15,
              good: 10,
              average: 3,
              below_average: 0,
            },
          }),
          status: 'PUBLISHED',
          createdBy: scienceTeacher.id,
        },
      }),
    ]);

    // 10. AI 사용량 데이터 생성
    const aiApiUsage = await Promise.all([
      prisma.aIApiUsage.create({
        data: {
          userId: mathTeacher1.id,
          apiType: 'question_generation',
          modelName: 'gpt-4',
          tokensUsed: 1200,
          costUsd: 0.05,
          requestCount: 1,
          responseTimeMs: 2500,
          success: true,
          errorMessage: null,
        },
      }),
      prisma.aIApiUsage.create({
        data: {
          userId: scienceTeacher.id,
          apiType: 'question_generation',
          modelName: 'gpt-4',
          tokensUsed: 1500,
          costUsd: 0.07,
          requestCount: 1,
          responseTimeMs: 3200,
          success: true,
          errorMessage: null,
        },
      }),
      prisma.aIApiUsage.create({
        data: {
          userId: mathTeacher2.id,
          apiType: 'context_search',
          modelName: 'gpt-3.5-turbo',
          tokensUsed: 800,
          costUsd: 0.03,
          requestCount: 1,
          responseTimeMs: 1200,
          success: true,
          errorMessage: null,
        },
      }),
    ]);

    // 11. AI 성능 메트릭 데이터 생성
    const aiPerformanceMetrics = await Promise.all([
      prisma.aIPerformanceMetric.create({
        data: {
          operationType: 'question_generation',
          durationMs: 2500,
          success: true,
          errorMessage: null,
          metadata: JSON.stringify({
            model: 'gpt-4',
            subject: '수학',
            difficulty: 'medium',
            accuracy: 0.92,
          }),
          userId: mathTeacher1.id,
        },
      }),
      prisma.aIPerformanceMetric.create({
        data: {
          operationType: 'question_generation',
          durationMs: 3200,
          success: true,
          errorMessage: null,
          metadata: JSON.stringify({
            model: 'gpt-4',
            subject: '과학',
            difficulty: 'hard',
            accuracy: 0.88,
          }),
          userId: scienceTeacher.id,
        },
      }),
      prisma.aIPerformanceMetric.create({
        data: {
          operationType: 'context_search',
          durationMs: 1200,
          success: true,
          errorMessage: null,
          metadata: JSON.stringify({
            model: 'gpt-3.5-turbo',
            endpoint: '/api/search/context',
            response_time: 1.2,
          }),
          userId: mathTeacher2.id,
        },
      }),
    ]);

    // 12. AI 사용 통계 데이터 생성
    const aiUsageStatistics = await Promise.all([
      prisma.aIUsageStatistics.upsert({
        where: {
          userId_date: {
            userId: mathTeacher1.id,
            date: '2024-01-21',
          },
        },
        update: {},
        create: {
          userId: mathTeacher1.id,
          date: '2024-01-21',
          questionsGenerated: 15,
          textbooksUploaded: 2,
          searchesPerformed: 8,
          totalCostUsd: 0.75,
        },
      }),
      prisma.aIUsageStatistics.upsert({
        where: {
          userId_date: {
            userId: scienceTeacher.id,
            date: '2024-01-21',
          },
        },
        update: {},
        create: {
          userId: scienceTeacher.id,
          date: '2024-01-21',
          questionsGenerated: 12,
          textbooksUploaded: 1,
          searchesPerformed: 5,
          totalCostUsd: 0.63,
        },
      }),
    ]);

    // 13. ChromaDB 컬렉션 데이터 생성
    const chromaCollections = await Promise.all([
      prisma.chromaDBCollection.upsert({
        where: { collectionName: 'math_problems' },
        update: {},
        create: {
          collectionName: 'math_problems',
          description: '수학 문제 임베딩 컬렉션',
          persistDirectory: './chroma/math_problems',
          totalDocuments: 25,
          totalEmbeddings: 25,
          lastUpdated: new Date(),
        },
      }),
      prisma.chromaDBCollection.upsert({
        where: { collectionName: 'science_problems' },
        update: {},
        create: {
          collectionName: 'science_problems',
          description: '과학 문제 임베딩 컬렉션',
          persistDirectory: './chroma/science_problems',
          totalDocuments: 15,
          totalEmbeddings: 15,
          lastUpdated: new Date(),
        },
      }),
    ]);

    // 14. ChromaDB 임베딩 데이터 생성
    const chromaEmbeddings = await Promise.all([
      prisma.chromaDBEmbedding.create({
        data: {
          collectionId: chromaCollections[0].id,
          documentId: problems[0].id,
          content: '이차방정식 x² - 5x + 6 = 0의 해를 구하는 문제입니다.',
          embedding: JSON.stringify(new Array(1536).fill(0).map(() => Math.random())),
          metadata: JSON.stringify({
            subject: '수학',
            difficulty: 'MEDIUM',
            gradeLevel: '중3',
          }),
        },
      }),
      prisma.chromaDBEmbedding.create({
        data: {
          collectionId: chromaCollections[1].id,
          documentId: problems[3].id,
          content: '광합성에서 빛에너지가 화학에너지로 변환되는 과정을 설명하는 문제입니다.',
          embedding: JSON.stringify(new Array(1536).fill(0).map(() => Math.random())),
          metadata: JSON.stringify({
            subject: '과학',
            difficulty: 'MEDIUM',
            gradeLevel: '중2',
          }),
        },
      }),
    ]);

    // 15. 샘플 데이터 템플릿 생성
    const sampleTemplates = await Promise.all([
      prisma.sampleDataTemplate.create({
        data: {
          templateName: '중학교 수학 문제 템플릿',
          templateType: 'NORMAL',
          dataStructure: JSON.stringify({
            subject: '수학',
            gradeLevel: '중학교',
            difficulty: 'MEDIUM',
            type: 'MULTIPLE_CHOICE',
            options: 4,
          }),
          description: '중학교 수학 문제 생성용 템플릿',
          createdBy: mathTeacher1.id,
        },
      }),
      prisma.sampleDataTemplate.create({
        data: {
          templateName: '과학 실험 문제 템플릿',
          templateType: 'NORMAL',
          dataStructure: JSON.stringify({
            subject: '과학',
            gradeLevel: '중학교',
            difficulty: 'HARD',
            type: 'ESSAY',
            focus: '실험 과정',
          }),
          description: '과학 실험 관련 문제 생성용 템플릿',
          createdBy: scienceTeacher.id,
        },
      }),
    ]);

    // 16. 문제 생성 히스토리 데이터 생성
    const questionHistory = await Promise.all([
      prisma.questionHistory.create({
        data: {
          questionId: problems[5].id, // 실제 생성된 문제의 ID
          questionText: '이차방정식 x² - 5x + 6 = 0의 해를 구하시오.',
          subject: '수학',
          difficulty: 'MEDIUM',
          generatedAt: new Date(),
          modelUsed: 'gpt-4',
          tokensUsed: 1200,
          costUsd: 0.05,
          userId: mathTeacher1.id,
        },
      }),
      prisma.questionHistory.create({
        data: {
          questionId: problems[6].id, // 실제 생성된 문제의 ID
          questionText: '광합성 과정에서 빛에너지가 화학에너지로 변환되는 과정을 설명하시오.',
          subject: '과학',
          difficulty: 'HARD',
          generatedAt: new Date(),
          modelUsed: 'gpt-4',
          tokensUsed: 1500,
          costUsd: 0.07,
          userId: scienceTeacher.id,
        },
      }),
      prisma.questionHistory.create({
        data: {
          questionId: problems[0].id, // 실제 생성된 문제의 ID
          questionText: '일반 수학 문제',
          subject: '수학',
          difficulty: 'EASY',
          generatedAt: new Date(),
          modelUsed: 'manual',
          tokensUsed: 0,
          costUsd: 0,
          userId: mathTeacher1.id,
        },
      }),
    ]);

    // 17. 클래스 데이터 생성
    const classes = await Promise.all([
      prisma.class.create({
        data: {
          name: '중3 수학 A반',
          description: '중학교 3학년 수학 심화반',
          subject: '수학',
          gradeLevel: '중3',
          schoolYear: '2024',
          semester: '1학기',
          isActive: true,
          createdBy: mathTeacher1.id,
        },
      }),
      prisma.class.create({
        data: {
          name: '중2 과학 B반',
          description: '중학교 2학년 과학 일반반',
          subject: '과학',
          gradeLevel: '중2',
          schoolYear: '2024',
          semester: '1학기',
          isActive: true,
          createdBy: scienceTeacher.id,
        },
      }),
      prisma.class.create({
        data: {
          name: '고1 수학 C반',
          description: '고등학교 1학년 수학 기초반',
          subject: '수학',
          gradeLevel: '고1',
          schoolYear: '2024',
          semester: '1학기',
          isActive: true,
          createdBy: mathTeacher2.id,
        },
      }),
    ]);

    // 18. 클래스 멤버 데이터 생성
    const classMembers = await Promise.all([
      // 중3 수학 A반 멤버들
      prisma.classMember.create({
        data: {
          classId: classes[0].id,
          userId: users[5].id, // 김민수
          role: 'STUDENT',
          joinedAt: new Date(),
          isActive: true,
        },
      }),
      prisma.classMember.create({
        data: {
          classId: classes[0].id,
          userId: users[6].id, // 이지영
          role: 'STUDENT',
          joinedAt: new Date(),
          isActive: true,
        },
      }),
      // 중2 과학 B반 멤버들
      prisma.classMember.create({
        data: {
          classId: classes[1].id,
          userId: users[6].id, // 이지영
          role: 'STUDENT',
          joinedAt: new Date(),
          isActive: true,
        },
      }),
      // 고1 수학 C반 멤버들
      prisma.classMember.create({
        data: {
          classId: classes[2].id,
          userId: users[7].id, // 박준호
          role: 'STUDENT',
          joinedAt: new Date(),
          isActive: true,
        },
      }),
    ]);

    // 19. 사용자 설정 데이터 생성
    const userPreferences = await Promise.all([
      prisma.userPreferences.upsert({
        where: { userId: mathTeacher1.id },
        update: {},
        create: {
          userId: mathTeacher1.id,
          preferredDifficulty: 'MEDIUM',
          learningStyle: 'visual',
          studyTime: 60,
          interests: '수학,과학',
          emailNotifications: true,
          pushNotifications: true,
          weeklyReport: true,
        },
      }),
      prisma.userPreferences.upsert({
        where: { userId: users[5].id }, // 김민수
        update: {},
        create: {
          userId: users[5].id,
          preferredDifficulty: 'EASY',
          learningStyle: 'kinesthetic',
          studyTime: 45,
          interests: '체육,음악',
          emailNotifications: false,
          pushNotifications: true,
          weeklyReport: false,
        },
      }),
    ]);

    // 20. 학습 자료 데이터 생성
    const learningMaterials = await Promise.all([
      prisma.learningMaterial.create({
        data: {
          title: '이차방정식 학습 가이드',
          description: '이차방정식의 기본 개념과 풀이 방법을 설명하는 학습 자료',
          content: '이차방정식은 ax² + bx + c = 0 형태의 방정식입니다...',
          subject: '수학',
          difficulty: 'MEDIUM',
          estimatedTime: 30,
          files: JSON.stringify(['guide1.pdf', 'worksheet1.pdf']),
          status: 'PUBLISHED',
          isActive: true,
        },
      }),
      prisma.learningMaterial.create({
        data: {
          title: '광합성 실험 가이드',
          description: '광합성 과정을 이해하기 위한 실험 자료',
          content: '광합성 실험을 통해 식물이 빛에너지를 이용하는 과정을 관찰해보세요...',
          subject: '과학',
          difficulty: 'HARD',
          estimatedTime: 45,
          files: JSON.stringify(['experiment1.pdf', 'lab_sheet1.pdf']),
          status: 'PUBLISHED',
          isActive: true,
        },
      }),
    ]);

    // 21. 학습 자료-문제 연결 데이터 생성
    const learningMaterialProblems = await Promise.all([
      prisma.learningMaterialProblem.create({
        data: {
          learningMaterialId: learningMaterials[0].id,
          problemId: problems[0].id,
        },
      }),
      prisma.learningMaterialProblem.create({
        data: {
          learningMaterialId: learningMaterials[1].id,
          problemId: problems[3].id,
        },
      }),
    ]);

    // 22. 학생 진도 데이터 생성
    const studentProgress = await Promise.all([
      prisma.studentProgress.create({
        data: {
          studentId: users[5].id, // 김민수
          problemId: problems[0].id,
          status: 'COMPLETED',
          score: 85,
          timeSpent: 300,
          attempts: 2,
        },
      }),
      prisma.studentProgress.create({
        data: {
          studentId: users[6].id, // 이지영
          problemId: problems[0].id,
          status: 'COMPLETED',
          score: 95,
          timeSpent: 250,
          attempts: 1,
        },
      }),
      prisma.studentProgress.create({
        data: {
          studentId: users[5].id, // 김민수
          problemId: problems[3].id,
          status: 'IN_PROGRESS',
          score: null,
          timeSpent: 180,
          attempts: 1,
        },
      }),
    ]);

    // 23. 문제 할당 데이터 생성
    const problemAssignments = await Promise.all([
      prisma.problemAssignment.create({
        data: {
          classId: classes[0].id,
          problemId: problems[0].id,
          assignedBy: mathTeacher1.id,
          assignedAt: new Date(),
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7일 후
          isActive: true,
        },
      }),
      prisma.problemAssignment.create({
        data: {
          classId: classes[1].id,
          problemId: problems[3].id,
          assignedBy: scienceTeacher.id,
          assignedAt: new Date(),
          dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5일 후
          isActive: true,
        },
      }),
    ]);

    // 24. 시도 기록 데이터 생성
    const attempts = await Promise.all([
      prisma.attempt.create({
        data: {
          userId: users[5].id, // 김민수
          problemId: problems[0].id,
          classId: classes[0].id,
          isCorrect: true,
          timeSpent: 300,
          startedAt: new Date(Date.now() - 10 * 60 * 1000), // 10분 전
          completedAt: new Date(),
          selected: 'x = 2, 3',
        },
      }),
      prisma.attempt.create({
        data: {
          userId: users[6].id, // 이지영
          problemId: problems[0].id,
          classId: classes[0].id,
          isCorrect: true,
          timeSpent: 250,
          startedAt: new Date(Date.now() - 5 * 60 * 1000), // 5분 전
          completedAt: new Date(),
          selected: 'x = 2, 3',
        },
      }),
    ]);

    // 25. 분석 리포트 데이터 생성
    const analysisReports = await Promise.all([
      prisma.analysisReport.create({
        data: {
          studentId: users[5].id, // 김민수
          title: '김민수 학생 수학 성취도 분석',
          type: 'ACHIEVEMENT_DISTRIBUTION',
          status: 'COMPLETED',
          aiGenerationId: null,
          period: '2024-01',
        },
      }),
      prisma.analysisReport.create({
        data: {
          studentId: users[6].id, // 이지영
          title: '이지영 학생 우수 성취도 분석',
          type: 'TOP_PERFORMERS',
          status: 'COMPLETED',
          aiGenerationId: null,
          period: '2024-01',
        },
      }),
    ]);

    // 26. 진로 상담 데이터 생성
    const careerCounseling = await Promise.all([
      prisma.careerCounseling.create({
        data: {
          studentId: users[5].id, // 김민수
          title: '김민수 학생 진로 상담',
          type: 'ACADEMIC_GUIDANCE',
          status: 'COMPLETED',
          content: '김민수 학생의 수학 진로 상담 기록입니다.',
          aiGenerationId: null,
        },
      }),
    ]);

    // 27. AI 모델 데이터 생성
    const aiModels = await Promise.all([
      prisma.aIModel.create({
        data: {
          name: 'gpt-4',
          version: '4.0',
          provider: 'openai',
          isActive: true,
        },
      }),
      prisma.aIModel.create({
        data: {
          name: 'gpt-3.5-turbo',
          version: '3.5',
          provider: 'openai',
          isActive: true,
        },
      }),
    ]);

    // 28. AI 생성 데이터 생성
    const aiGenerations = await Promise.all([
      prisma.aIGeneration.create({
        data: {
          modelId: aiModels[0].id,
          prompt: '이차방정식 문제를 생성해주세요',
          response: '이차방정식 x² - 5x + 6 = 0의 해를 구하시오.',
          tokensUsed: 1200,
          duration: 2500,
        },
      }),
      prisma.aIGeneration.create({
        data: {
          modelId: aiModels[0].id,
          prompt: '광합성 과정을 설명하는 문제를 생성해주세요',
          response: '광합성에서 빛에너지가 화학에너지로 변환되는 과정을 설명하시오.',
          tokensUsed: 1500,
          duration: 3200,
        },
      }),
    ]);

    // 29. 리포트 인사이트 데이터 생성 (주석 처리 - 외래 키 제약 조건)
    // const reportInsights = await Promise.all([
    //   prisma.reportInsight.create({
    //     data: {
    //       reportId: teacherReports[0].id,
    //       category: 'PERFORMANCE_TREND',
    //       content: '학급 전체적으로 수학 성취도가 향상되고 있습니다.',
    //       priority: 'HIGH',
    //     },
    //   }),
    //   prisma.reportInsight.create({
    //     data: {
    //       reportId: teacherReports[1].id,
    //       category: 'STRUGGLING_AREA',
    //       content: '과학 실험 부분에서 학생들이 어려움을 겪고 있습니다.',
    //       priority: 'MEDIUM',
    //     },
    //   }),
    // ]);

    // 30. 리포트 추천 데이터 생성 (주석 처리 - 외래 키 제약 조건)
    // const reportRecommendations = await Promise.all([
    //   prisma.reportRecommendation.create({
    //     data: {
    //       reportId: teacherReports[0].id,
    //       content: '개별 맞춤형 학습 자료를 제공하여 학습 효과를 높이세요.',
    //       priority: 'HIGH',
    //       metadata: JSON.stringify({
    //         target_students: 'low_performers',
    //         expected_improvement: 15,
    //         resources_needed: ['additional_worksheets', 'tutoring_sessions'],
    //       }),
    //     },
    //   }),
    //   prisma.reportRecommendation.create({
    //     data: {
    //       reportId: teacherReports[1].id,
    //       content: '실험 시간을 늘리고 단계별 가이드를 제공하세요.',
    //       priority: 'MEDIUM',
    //       metadata: JSON.stringify({
    //         adjustment: 'increase_lab_time',
    //         additional_support: 'step_by_step_guides',
    //         timeline: 'next_semester',
    //       }),
    //     },
    //   }),
    // ]);

    // 31. 리포트 분석 데이터 생성 (주석 처리 - 외래 키 제약 조건)
    // const reportAnalyses = await Promise.all([
    //   prisma.reportAnalysis.create({
    //     data: {
    //       reportId: teacherReports[0].id,
    //       analysisType: 'ACHIEVEMENT_DISTRIBUTION',
    //       analysisData: JSON.stringify({
    //         excellent: 8,
    //         good: 12,
    //         average: 7,
    //         below_average: 3,
    //         total_students: 30,
    //       }),
    //     },
    //   }),
    //   prisma.reportAnalysis.create({
    //     data: {
    //       reportId: teacherReports[1].id,
    //       analysisType: 'SUBJECT_ANALYSIS',
    //       analysisData: JSON.stringify({
    //         physics: 85,
    //         chemistry: 78,
    //         biology: 92,
    //         earth_science: 88,
    //       }),
    //     },
    //   }),
    // ]);

    // 32. 학생 데이터 생성 (주석 처리 - 외래 키 제약 조건)
    // const studentData = await Promise.all([
    //   prisma.studentData.create({
    //     data: {
    //       reportId: teacherReports[0].id,
    //       studentId: 1, // 김민수
    //       data: JSON.stringify({
    //         math: 85,
    //         korean: 78,
    //         english: 72,
    //         science: 80,
    //         attendance: 95,
    //         behavior: 'excellent',
    //       }),
    //     },
    //   }),
    //   prisma.studentData.create({
    //     data: {
    //       reportId: teacherReports[0].id,
    //       studentId: 2, // 이지영
    //       data: JSON.stringify({
    //         math: 92,
    //         korean: 88,
    //         english: 85,
    //         science: 90,
    //         attendance: 98,
    //         behavior: 'excellent',
    //       }),
    //     },
    //   }),
    // ]);

    // 33. 클래스 정보 데이터 생성 (주석 처리 - 외래 키 제약 조건)
    // const classInfo = await Promise.all([
    //   prisma.classInfo.create({
    //     data: {
    //       reportId: teacherReports[0].id,
    //       info: JSON.stringify({
    //         class_name: '중3 수학 A반',
    //         teacher: '김수학',
    //         total_students: 30,
    //         average_score: 78.5,
    //         improvement_rate: 8.5,
    //       }),
    //     },
    //   }),
    //   prisma.classInfo.create({
    //     data: {
    //       reportId: teacherReports[1].id,
    //       info: JSON.stringify({
    //         class_name: '중2 과학 B반',
    //         teacher: '박과학',
    //         total_students: 28,
    //         average_score: 88.3,
    //         improvement_rate: 12.2,
    //       }),
    //     },
    //   }),
    // ]);

    // 34. AI 서버 상태 데이터 생성
    const aiServerStatus = await Promise.all([
      prisma.aIServerStatus.create({
        data: {
          serverName: 'openai-gpt4',
          serverUrl: 'https://api.openai.com/v1',
          status: 'HEALTHY',
          lastChecked: new Date(),
          responseTimeMs: 1200,
          version: '4.0',
          services: JSON.stringify({
            region: 'us-east-1',
            load: 0.65,
          }),
        },
      }),
      prisma.aIServerStatus.create({
        data: {
          serverName: 'openai-gpt35',
          serverUrl: 'https://api.openai.com/v1',
          status: 'HEALTHY',
          lastChecked: new Date(),
          responseTimeMs: 800,
          version: '3.5-turbo',
          services: JSON.stringify({
            region: 'us-west-2',
            load: 0.45,
          }),
        },
      }),
    ]);

    // 35. AI 서버 동기화 데이터 생성
    const aiServerSync = await Promise.all([
      prisma.aIServerSync.create({
        data: {
          serverName: 'openai-gpt4',
          syncType: 'data_sync',
          status: 'SUCCESS',
          startTime: new Date(Date.now() - 30 * 60 * 1000), // 30분 전
          endTime: new Date(Date.now() - 25 * 60 * 1000), // 25분 전
          durationMs: 5 * 60 * 1000, // 5분
          recordsProcessed: 150,
          recordsSynced: 150,
          metadata: JSON.stringify({
            sync_type: 'full',
            duration_minutes: 5,
            data_size_mb: 12.5,
          }),
        },
      }),
      prisma.aIServerSync.create({
        data: {
          serverName: 'openai-gpt35',
          syncType: 'health_check',
          status: 'SUCCESS',
          startTime: new Date(Date.now() - 20 * 60 * 1000), // 20분 전
          endTime: new Date(Date.now() - 18 * 60 * 1000), // 18분 전
          durationMs: 2 * 60 * 1000, // 2분
          recordsProcessed: 200,
          recordsSynced: 200,
          metadata: JSON.stringify({
            sync_type: 'incremental',
            duration_minutes: 2,
            data_size_mb: 8.3,
          }),
        },
      }),
    ]);

    logger.info('✅ 포괄적인 시드 데이터 생성 완료', {
      service: 'edubridge-api',
      users: users.length,
      textbooks: textbooks.length,
      documentChunks: documentChunks.length,
      problems: problems.length,
      questionOptions: questionOptions.length,
      questionTags: questionTags.length,
      searchQueries: searchQueries.length,
      searchResults: searchResults.length,
      teacherReports: teacherReports.length,
      aiApiUsage: aiApiUsage.length,
      aiPerformanceMetrics: aiPerformanceMetrics.length,
      aiUsageStatistics: aiUsageStatistics.length,
      chromaCollections: chromaCollections.length,
      chromaEmbeddings: chromaEmbeddings.length,
      sampleTemplates: sampleTemplates.length,
      questionHistory: questionHistory.length,
      classes: classes.length,
      classMembers: classMembers.length,
      userPreferences: userPreferences.length,
      learningMaterials: learningMaterials.length,
      learningMaterialProblems: learningMaterialProblems.length,
      studentProgress: studentProgress.length,
      problemAssignments: problemAssignments.length,
      attempts: attempts.length,
      analysisReports: analysisReports.length,
      careerCounseling: careerCounseling.length,
      aiModels: aiModels.length,
      aiGenerations: aiGenerations.length,
      // reportInsights: reportInsights.length, // 주석 처리됨
      // reportRecommendations: reportRecommendations.length, // 주석 처리됨
      // reportAnalyses: reportAnalyses.length, // 주석 처리됨
      // studentData: studentData.length, // 주석 처리됨
      // classInfo: classInfo.length, // 주석 처리됨
      aiServerStatus: aiServerStatus.length,
      aiServerSync: aiServerSync.length,
    });
  } catch (error) {
    logger.error('❌ 시드 데이터 생성 중 오류 발생', error instanceof Error ? error : undefined, {
      service: 'edubridge-api',
    });
    throw error;
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
