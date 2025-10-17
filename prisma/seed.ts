import { PrismaClient } from '@prisma/client';
import { logger } from '../src/lib/monitoring';
import { hashPassword } from '../src/services/auth';

const prisma = new PrismaClient();

async function main() {
  logger.info('🌱 시드 데이터 생성을 시작합니다...', { service: 'edubridge-api' });

  try {
    // 1. 사용자 데이터 생성
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
          subject: 'MATH',
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
          subject: 'MATH',
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
          subject: 'SCIENCE',
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
          subject: 'ENGLISH',
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
          gradeLevel: 'GRADE_9',
          avatar: 'https://example.com/student1.jpg',
          bio: '중학교 3학년 학생입니다.',
          password: await hashPassword('password123'),
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
          gradeLevel: 'GRADE_8',
          avatar: 'https://example.com/student2.jpg',
          bio: '중학교 2학년 학생입니다.',
          password: await hashPassword('password123'),
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
          gradeLevel: 'GRADE_10',
          avatar: 'https://example.com/student3.jpg',
          bio: '고등학교 1학년 학생입니다.',
          password: await hashPassword('password123'),
        },
      }),
      // 추가 학생들
      prisma.user.upsert({
        where: { email: 'choi_mina@example.com' },
        update: {},
        create: {
          name: '최미나',
          email: 'choi_mina@example.com',
          role: 'STUDENT',
          status: 'ACTIVE',
          gradeLevel: 'GRADE_9',
          avatar: 'https://example.com/student4.jpg',
          bio: '중학교 3학년 학생입니다.',
          password: await hashPassword('password123'),
        },
      }),
      prisma.user.upsert({
        where: { email: 'jung_hyeon@example.com' },
        update: {},
        create: {
          name: '정현',
          email: 'jung_hyeon@example.com',
          role: 'STUDENT',
          status: 'ACTIVE',
          gradeLevel: 'GRADE_8',
          avatar: 'https://example.com/student5.jpg',
          bio: '중학교 2학년 학생입니다.',
          password: await hashPassword('password123'),
        },
      }),
    ]);

    const mathTeacher1 = users[1];
    const mathTeacher2 = users[2];
    const scienceTeacher = users[3];
    const englishTeacher = users[4];
    const student1 = users[5]; // 김민수
    const student2 = users[6]; // 이지영
    const student3 = users[7]; // 박준호

    //교사-학생 연결
    const teacherStudentRelations = await Promise.all([
      prisma.teacherStudent.upsert({
        where: {
          teacherId_studentId: {
            teacherId: mathTeacher1.id,
            studentId: student1.id,
          },
        },
        update: {},
        create: {
          teacherId: mathTeacher1.id,
          studentId: student1.id,
        },
      }),
      prisma.teacherStudent.upsert({
        where: {
          teacherId_studentId: {
            teacherId: mathTeacher1.id,
            studentId: student2.id,
          },
        },
        update: {},
        create: {
          teacherId: mathTeacher1.id,
          studentId: student2.id,
        },
      }),
      prisma.teacherStudent.upsert({
        where: {
          teacherId_studentId: {
            teacherId: mathTeacher2.id,
            studentId: student3.id,
          },
        },
        update: {},
        create: {
          teacherId: mathTeacher2.id,
          studentId: student3.id,
        },
      }),
      prisma.teacherStudent.upsert({
        where: {
          teacherId_studentId: {
            teacherId: scienceTeacher.id,
            studentId: student2.id,
          },
        },
        update: {},
        create: {
          teacherId: scienceTeacher.id,
          studentId: student2.id,
        },
      }),
      prisma.teacherStudent.upsert({
        where: {
          teacherId_studentId: {
            teacherId: englishTeacher.id,
            studentId: student1.id,
          },
        },
        update: {},
        create: {
          teacherId: englishTeacher.id,
          studentId: student1.id,
        },
      }),
    ]);

    // 2. 교과서 데이터 생성
    const textbooks = await Promise.all([
      prisma.textbook.create({
        data: {
          title: '중학교 수학 1학년',
          subject: 'MATH',
          gradeLevel: 'GRADE_7',
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
          title: '중학교 수학 3학년',
          subject: 'MATH',
          gradeLevel: 'GRADE_9',
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
      prisma.textbook.create({
        data: {
          title: '중학교 과학 2학년',
          subject: 'SCIENCE',
          gradeLevel: 'GRADE_8',
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
    ]);

    // 3. 문서 청크 데이터 생성
    const documentChunks = [];
    for (let i = 0; i < textbooks.length; i++) {
      const textbook = textbooks[i];
      const chunkCount = textbook?.totalChunks || 0;

      for (let j = 0; j < Math.min(chunkCount, 5); j++) {
        const chunk = await prisma.documentChunk.create({
          data: {
            textbookId: textbook?.id || '',
            chunkIndex: j,
            content: `${textbook?.title}의 ${j + 1}번째 청크입니다. ${textbook?.subject} 과목의 중요한 내용이 포함되어 있습니다.`,
            contentLength: 200 + j * 50,
            embeddingId: `embedding_${textbook?.id}_${j}`,
            metadata: {
              page: j + 1,
              section: `섹션 ${j + 1}`,
              topic: `${textbook?.subject} 주제 ${j + 1}`,
            },
          },
        });
        documentChunks.push(chunk);
      }
    }

    // 4. 문제 데이터 생성
    const problems = await Promise.all([
      // 수학 문제들
      prisma.problem.create({
        data: {
          title: '이차방정식의 해 구하기',
          description: '다음 이차방정식의 해를 구하세요: x² - 5x + 6 = 0',
          content:
            '이차방정식 x² - 5x + 6 = 0의 해를 구하는 문제입니다. 인수분해를 이용하여 풀어보세요.',
          subject: 'MATH',
          gradeLevel: 'GRADE_9',
          type: 'MULTIPLE_CHOICE',
          difficulty: 'MEDIUM',
          options: ['x = 2, 3', 'x = 1, 6', 'x = -2, -3', '해가 없음'],
          correctAnswer: 'x = 2, 3',
          explanation: '인수분해를 이용하여 (x-2)(x-3) = 0이므로 x = 2, 3입니다.',
          hints: ['인수분해를 사용해보세요', '두 수의 곱이 6이고 합이 5인 수를 찾아보세요'],
          tags: ['이차방정식', '인수분해', '수학'],
          points: 5,
          timeLimit: 300,
          isActive: true,
          isAIGenerated: false,
          reviewStatus: 'APPROVED',
          reviewedBy: mathTeacher1.id,
          reviewedAt: new Date(),
          createdBy: mathTeacher1.id,
        },
      }),
      prisma.problem.create({
        data: {
          title: '일차방정식의 해',
          description: '방정식 2x + 3 = 7의 해를 구하세요.',
          content: '방정식 2x + 3 = 7의 해를 구하는 문제입니다.',
          subject: 'MATH',
          gradeLevel: 'GRADE_7',
          type: 'MULTIPLE_CHOICE',
          difficulty: 'EASY',
          options: ['x = 2', 'x = 3', 'x = 4', 'x = 5'],
          correctAnswer: 'x = 2',
          explanation: '2x + 3 = 7에서 2x = 4이므로 x = 2입니다.',
          hints: ['양변에서 3을 빼보세요', '양변을 2로 나누어보세요'],
          tags: ['일차방정식', '수학'],
          points: 3,
          timeLimit: 180,
          isActive: true,
          isAIGenerated: false,
          reviewStatus: 'APPROVED',
          reviewedBy: mathTeacher1.id,
          reviewedAt: new Date(),
          createdBy: mathTeacher1.id,
        },
      }),
      prisma.problem.create({
        data: {
          title: '피타고라스 정리',
          description: '직각삼각형에서 빗변의 길이가 5, 한 변의 길이가 3일 때, 나머지 변의 길이는?',
          content:
            '직각삼각형에서 피타고라스 정리를 이용하여 나머지 변의 길이를 구하는 문제입니다.',
          subject: 'MATH',
          gradeLevel: 'GRADE_9',
          type: 'MULTIPLE_CHOICE',
          difficulty: 'MEDIUM',
          options: ['4', '6', '8', '10'],
          correctAnswer: '4',
          explanation: '피타고라스 정리에 의해 3² + x² = 5², 9 + x² = 25, x² = 16, x = 4입니다.',
          hints: ['피타고라스 정리를 사용해보세요', 'a² + b² = c²'],
          tags: ['피타고라스', '수학', '기하'],
          points: 5,
          timeLimit: 300,
          isActive: true,
          isAIGenerated: false,
          reviewStatus: 'APPROVED',
          reviewedBy: mathTeacher1.id,
          reviewedAt: new Date(),
          createdBy: mathTeacher1.id,
        },
      }),
      prisma.problem.create({
        data: {
          title: '원의 넓이',
          description: '반지름이 3cm인 원의 넓이는?',
          content: '반지름이 3cm인 원의 넓이를 구하는 문제입니다.',
          subject: 'MATH',
          gradeLevel: 'GRADE_8',
          type: 'MULTIPLE_CHOICE',
          difficulty: 'EASY',
          options: ['9π cm²', '6π cm²', '18π cm²', '12π cm²'],
          correctAnswer: '9π cm²',
          explanation: '원의 넓이 공식은 πr²이므로 π × 3² = 9π cm²입니다.',
          hints: ['원의 넓이 공식을 사용해보세요', 'πr²'],
          tags: ['원의 넓이', '수학', '기하'],
          points: 3,
          timeLimit: 180,
          isActive: true,
          isAIGenerated: false,
          reviewStatus: 'APPROVED',
          reviewedBy: mathTeacher1.id,
          reviewedAt: new Date(),
          createdBy: mathTeacher1.id,
        },
      }),
      // 과학 문제들
      prisma.problem.create({
        data: {
          title: '광합성의 과정',
          description: '광합성에서 빛에너지가 화학에너지로 변환되는 과정을 설명하세요.',
          content: '광합성에서 빛에너지가 화학에너지로 변환되는 과정을 설명하는 문제입니다.',
          subject: 'SCIENCE',
          gradeLevel: 'GRADE_8',
          type: 'MULTIPLE_CHOICE',
          difficulty: 'MEDIUM',
          options: [
            '빛에너지가 엽록소에 의해 흡수되어 ATP와 NADPH를 생성하고, 이를 이용해 포도당을 합성합니다.',
            '빛에너지가 직접 포도당을 생성합니다.',
            '화학에너지가 빛에너지로 변환됩니다.',
            '광합성은 빛과 관련이 없습니다.',
          ],
          correctAnswer:
            '빛에너지가 엽록소에 의해 흡수되어 ATP와 NADPH를 생성하고, 이를 이용해 포도당을 합성합니다.',
          explanation:
            '광합성은 빛에너지를 화학에너지로 변환하는 과정으로, 엽록소가 빛을 흡수하여 ATP와 NADPH를 만들고, 이를 이용해 포도당을 합성합니다.',
          hints: ['엽록소의 역할을 생각해보세요', 'ATP와 NADPH의 생성 과정을 설명해보세요'],
          tags: ['광합성', '과학', '생물'],
          points: 10,
          timeLimit: 900,
          isActive: true,
          isAIGenerated: false,
          reviewStatus: 'APPROVED',
          reviewedBy: scienceTeacher.id,
          reviewedAt: new Date(),
          createdBy: scienceTeacher.id,
        },
      }),
      prisma.problem.create({
        data: {
          title: '중력의 법칙',
          description: '뉴턴의 만유인력의 법칙에서 중력의 크기는 거리의 제곱에 반비례한다.',
          content: '뉴턴의 만유인력의 법칙에 대한 설명 중 옳은 것을 고르세요.',
          subject: 'SCIENCE',
          gradeLevel: 'GRADE_9',
          type: 'MULTIPLE_CHOICE',
          difficulty: 'MEDIUM',
          options: [
            '중력의 크기는 거리의 제곱에 반비례한다',
            '중력의 크기는 거리에 비례한다',
            '중력의 크기는 거리의 제곱에 비례한다',
            '중력의 크기는 거리와 무관하다',
          ],
          correctAnswer: '중력의 크기는 거리의 제곱에 반비례한다',
          explanation:
            '뉴턴의 만유인력의 법칙에 따르면 F = G(m₁m₂)/r²이므로 중력은 거리의 제곱에 반비례합니다.',
          hints: ['뉴턴의 만유인력의 법칙을 생각해보세요', 'F = G(m₁m₂)/r²'],
          tags: ['중력', '과학', '물리'],
          points: 5,
          timeLimit: 300,
          isActive: true,
          isAIGenerated: false,
          reviewStatus: 'APPROVED',
          reviewedBy: scienceTeacher.id,
          reviewedAt: new Date(),
          createdBy: scienceTeacher.id,
        },
      }),
      // 영어 문제들
      prisma.problem.create({
        data: {
          title: '영어 문법 - 현재완료',
          description: '다음 문장을 현재완료 시제로 바꾸세요: "I study English"',
          content: '다음 문장을 현재완료 시제로 바꾸는 문제입니다.',
          subject: 'ENGLISH',
          gradeLevel: 'GRADE_7',
          type: 'MULTIPLE_CHOICE',
          difficulty: 'EASY',
          options: [
            'I have studied English',
            'I had studied English',
            'I will have studied English',
            'I am studying English',
          ],
          correctAnswer: 'I have studied English',
          explanation: '현재완료 시제는 have/has + 과거분사 형태로 만듭니다.',
          hints: ['현재완료 시제의 구조를 생각해보세요', 'have/has + 과거분사'],
          tags: ['영어', '문법', '현재완료'],
          points: 4,
          timeLimit: 240,
          isActive: true,
          isAIGenerated: false,
          reviewStatus: 'APPROVED',
          reviewedBy: englishTeacher.id,
          reviewedAt: new Date(),
          createdBy: englishTeacher.id,
        },
      }),
      prisma.problem.create({
        data: {
          title: '영어 단어의 의미',
          description: '다음 중 "beautiful"의 의미는?',
          content: '영어 단어 "beautiful"의 의미를 고르는 문제입니다.',
          subject: 'ENGLISH',
          gradeLevel: 'GRADE_7',
          type: 'MULTIPLE_CHOICE',
          difficulty: 'EASY',
          options: ['아름다운', '추한', '큰', '작은'],
          correctAnswer: '아름다운',
          explanation: '"beautiful"은 "아름다운"이라는 의미의 형용사입니다.',
          hints: ['형용사의 의미를 생각해보세요'],
          tags: ['영어', '단어', '형용사'],
          points: 2,
          timeLimit: 120,
          isActive: true,
          isAIGenerated: false,
          reviewStatus: 'APPROVED',
          reviewedBy: englishTeacher.id,
          reviewedAt: new Date(),
          createdBy: englishTeacher.id,
        },
      }),
      // AI 생성 문제들
      prisma.problem.create({
        data: {
          title: 'AI 생성 이차방정식 문제',
          description: 'AI가 생성한 이차방정식 문제입니다.',
          content: '다음 중 이차방정식 x² - 5x + 6 = 0의 해는?',
          subject: 'MATH',
          gradeLevel: 'GRADE_9',
          unit: '이차방정식',
          type: 'MULTIPLE_CHOICE',
          difficulty: 'MEDIUM',
          options: ['x = 2, 3', 'x = 1, 6', 'x = -2, -3', '해가 없음'],
          correctAnswer: 'x = 2, 3',
          explanation: '인수분해를 이용하여 (x-2)(x-3) = 0이므로 x = 2, 3입니다.',
          generationPrompt: '이차방정식의 해를 구하는 문제를 생성해주세요.',
          contextChunkIds: [documentChunks[0]?.id || '', documentChunks[1]?.id || ''],
          qualityScore: 0.85,
          generationTimeMs: 2500,
          modelName: 'gpt-4',
          tokensUsed: 1200,
          costUsd: 0.05,
          textbookId: textbooks[1].id, // 중3 수학 교과서
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
          subject: 'SCIENCE',
          gradeLevel: 'GRADE_8',
          unit: '광합성',
          type: 'MULTIPLE_CHOICE',
          difficulty: 'HARD',
          options: [
            '빛에너지가 엽록소에 의해 흡수되어 ATP와 NADPH를 생성하고, 이를 이용해 포도당을 합성합니다.',
            '빛에너지가 직접 포도당을 생성합니다.',
            '화학에너지가 빛에너지로 변환됩니다.',
            '광합성은 빛과 관련이 없습니다.',
          ],
          correctAnswer:
            '빛에너지가 엽록소에 의해 흡수되어 ATP와 NADPH를 생성하고, 이를 이용해 포도당을 합성합니다.',
          explanation:
            '빛에너지가 엽록소에 의해 흡수되어 ATP와 NADPH를 생성하고, 이를 이용해 포도당을 합성합니다.',
          generationPrompt: '광합성 과정에 대한 설명 문제를 생성해주세요.',
          contextChunkIds: [documentChunks[4]?.id || ''],
          qualityScore: 0.92,
          generationTimeMs: 3200,
          modelName: 'gpt-4',
          tokensUsed: 1500,
          costUsd: 0.07,
          textbookId: textbooks[2].id, // 중2 과학 교과서
          createdBy: scienceTeacher.id,
          isAIGenerated: true,
          isActive: true,
          reviewStatus: 'PENDING',
        },
      }),
    ]);

    // 5. 검색 쿼리 데이터 생성
    const searchQueries = await Promise.all([
      prisma.searchQuery.create({
        data: {
          queryText: '이차방정식 해 구하기',
          subject: 'MATH',
          gradeLevel: 'GRADE_9',
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
          subject: 'SCIENCE',
          gradeLevel: 'GRADE_8',
          unit: '광합성',
          resultsCount: 2,
          searchTimeMs: 200,
          userId: scienceTeacher.id,
          sessionId: 'session_2',
        },
      }),
    ]);

    // 6. 검색 결과 데이터 생성
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

    // 7. 교사 리포트 데이터 생성
    const teacherReports = await Promise.all([
      prisma.teacherReport.create({
        data: {
          title: '1학년 1반 수학 과목 리포트',
          content:
            '학급 전체 학습 현황 분석 리포트입니다. 학생들의 수학 성취도를 종합적으로 분석했습니다.',
          reportType: 'PROGRESS_REPORT',
          classInfo: {
            gradeLevel: 1,
            class: 1,
            subject: 'MATH',
            teacher: '김수학',
            totalStudents: 30,
            semester: '1학기',
            year: 2024,
          },
          students: [
            { id: 1, name: '김민수', math: 85, korean: 78, english: 72, science: 80 },
            { id: 2, name: '이지영', math: 92, korean: 88, english: 85, science: 90 },
            { id: 3, name: '박준호', math: 78, korean: 82, english: 75, science: 85 },
            { id: 4, name: '최수진', math: 95, korean: 90, english: 88, science: 92 },
            { id: 5, name: '정민호', math: 70, korean: 75, english: 68, science: 72 },
          ],
          analysisData: {
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
          },
          status: 'COMPLETED',
          createdBy: mathTeacher1.id,
        },
      }),
      prisma.teacherReport.create({
        data: {
          title: '2학년 3반 과학 과목 리포트',
          content: '과학 과목 학습 현황 및 개선 방안을 제시한 리포트입니다.',
          reportType: 'PERFORMANCE_ANALYSIS',
          classInfo: {
            gradeLevel: 2,
            class: 3,
            subject: 'SCIENCE',
            teacher: '박과학',
            totalStudents: 28,
            semester: '1학기',
            year: 2024,
          },
          students: [
            { id: 1, name: '김과학', science: 88, math: 85, korean: 80, english: 75 },
            { id: 2, name: '이실험', science: 92, math: 90, korean: 85, english: 82 },
            { id: 3, name: '박연구', science: 85, math: 88, korean: 78, english: 80 },
          ],
          analysisData: {
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
          },
          status: 'COMPLETED',
          createdBy: scienceTeacher.id,
        },
      }),
    ]);

    // 8. 클래스 데이터 생성
    const classes = await Promise.all([
      prisma.class.create({
        data: {
          name: '중3 수학 A반',
          description: '중학교 3학년 수학 심화반',
          subject: 'MATH',
          gradeLevel: 'GRADE_9',
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
          subject: 'SCIENCE',
          gradeLevel: 'GRADE_8',
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
          subject: 'MATH',
          gradeLevel: 'GRADE_10',
          schoolYear: '2024',
          semester: '1학기',
          isActive: true,
          createdBy: mathTeacher2.id,
        },
      }),
    ]);

    // 9. 클래스 멤버 데이터 생성
    const classMembers = await Promise.all([
      // 중3 수학 A반 멤버들
      prisma.classMember.create({
        data: {
          classId: classes[0].id,
          userId: student1.id, // 김민수
          role: 'STUDENT',
          joinedAt: new Date(),
          isActive: true,
        },
      }),
      prisma.classMember.create({
        data: {
          classId: classes[0].id,
          userId: student2.id, // 이지영
          role: 'STUDENT',
          joinedAt: new Date(),
          isActive: true,
        },
      }),
      // 중2 과학 B반 멤버들
      prisma.classMember.create({
        data: {
          classId: classes[1].id,
          userId: student2.id, // 이지영
          role: 'STUDENT',
          joinedAt: new Date(),
          isActive: true,
        },
      }),
      // 고1 수학 C반 멤버들
      prisma.classMember.create({
        data: {
          classId: classes[2].id,
          userId: student3.id, // 박준호
          role: 'STUDENT',
          joinedAt: new Date(),
          isActive: true,
        },
      }),
    ]);

    // 10. 할 일 목록 데이터 생성
    const todos = await Promise.all([
      prisma.todo.create({
        data: {
          userId: student1.id, // 김민수
          text: '이차방정식 문제 풀이 완료하기',
          completed: false,
          priority: 'HIGH',
          category: 'STUDY',
          description: '수학 과제 완료',
          dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3일 후
        },
      }),
      prisma.todo.create({
        data: {
          userId: student1.id, // 김민수
          text: '수학 시험 준비하기',
          completed: false,
          priority: 'MEDIUM',
          category: 'STUDY',
          description: '중간고사 준비',
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7일 후
        },
      }),
      prisma.todo.create({
        data: {
          userId: student2.id, // 이지영
          text: '과학 실험 보고서 작성하기',
          completed: true,
          priority: 'HIGH',
          category: 'STUDY',
          description: '광합성 실험 보고서',
          dueDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1일 전
        },
      }),
      prisma.todo.create({
        data: {
          userId: student3.id, // 박준호
          text: '영어 단어 암기하기',
          completed: false,
          priority: 'LOW',
          category: 'STUDY',
          description: '영어 단어장 정리',
          dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5일 후
        },
      }),
    ]);

    // 11. 사용자 설정 데이터 생성
    const userPreferences = await Promise.all([
      prisma.userPreferences.upsert({
        where: { userId: mathTeacher1.id },
        update: {},
        create: {
          userId: mathTeacher1.id,
          preferredDifficulty: 'MEDIUM',
          learningStyle: 'VISUAL',
          studyTime: 60,
          interests: '수학,과학',
          emailNotifications: true,
          pushNotifications: true,
          weeklyReport: true,
        },
      }),
      prisma.userPreferences.upsert({
        where: { userId: student1.id }, // 김민수
        update: {},
        create: {
          userId: student1.id,
          preferredDifficulty: 'EASY',
          learningStyle: 'KINESTHETIC',
          studyTime: 45,
          interests: '체육,음악',
          emailNotifications: false,
          pushNotifications: true,
          weeklyReport: false,
        },
      }),
    ]);

    // 12. 학습 자료 데이터 생성
    const learningMaterials = await Promise.all([
      prisma.learningMaterial.create({
        data: {
          title: '이차방정식 학습 가이드',
          description: '이차방정식의 기본 개념과 풀이 방법을 설명하는 학습 자료',
          content:
            '이차방정식은 ax² + bx + c = 0 형태의 방정식입니다. 인수분해를 이용하여 해를 구할 수 있습니다.',
          subject: 'MATH',
          difficulty: 'MEDIUM',
          estimatedTime: 30,
          files: ['guide1.pdf', 'worksheet1.pdf'],
          status: 'PUBLISHED',
          isActive: true,
        },
      }),
      prisma.learningMaterial.create({
        data: {
          title: '광합성 실험 가이드',
          description: '광합성 과정을 이해하기 위한 실험 자료',
          content: '광합성 실험을 통해 식물이 빛에너지를 이용하는 과정을 관찰해보세요.',
          subject: 'SCIENCE',
          difficulty: 'HARD',
          estimatedTime: 45,
          files: ['experiment1.pdf', 'lab_sheet1.pdf'],
          status: 'PUBLISHED',
          isActive: true,
        },
      }),
      prisma.learningMaterial.create({
        data: {
          title: '영어 문법 기초',
          description: '영어 문법의 기본 개념을 학습하는 자료',
          content: '영어 문법의 기본 개념과 활용법을 배워보세요.',
          subject: 'ENGLISH',
          difficulty: 'EASY',
          estimatedTime: 20,
          files: ['grammar_basics.pdf'],
          status: 'PUBLISHED',
          isActive: true,
        },
      }),
    ]);

    // 13. 학습 자료-문제 연결 데이터 생성
    const learningMaterialProblems = await Promise.all([
      prisma.learningMaterialProblem.create({
        data: {
          learningMaterialId: learningMaterials[0].id,
          problemId: problems[0].id,
          order: 1,
        },
      }),
      prisma.learningMaterialProblem.create({
        data: {
          learningMaterialId: learningMaterials[0].id,
          problemId: problems[1].id,
          order: 2,
        },
      }),
      prisma.learningMaterialProblem.create({
        data: {
          learningMaterialId: learningMaterials[0].id,
          problemId: problems[2].id,
          order: 3,
        },
      }),
      prisma.learningMaterialProblem.create({
        data: {
          learningMaterialId: learningMaterials[0].id,
          problemId: problems[3].id,
          order: 4,
        },
      }),
      prisma.learningMaterialProblem.create({
        data: {
          learningMaterialId: learningMaterials[1].id,
          problemId: problems[4].id,
          order: 1,
        },
      }),
      prisma.learningMaterialProblem.create({
        data: {
          learningMaterialId: learningMaterials[1].id,
          problemId: problems[5].id,
          order: 2,
        },
      }),
      prisma.learningMaterialProblem.create({
        data: {
          learningMaterialId: learningMaterials[2].id,
          problemId: problems[6].id,
          order: 1,
        },
      }),
      prisma.learningMaterialProblem.create({
        data: {
          learningMaterialId: learningMaterials[2].id,
          problemId: problems[7].id,
          order: 2,
        },
      }),
    ]);

    // 14. 문제 할당 데이터 생성
    const problemAssignments = await Promise.all([
      prisma.problemAssignment.create({
        data: {
          title: '이차방정식 과제',
          description: '이차방정식 문제 풀이 과제입니다.',
          assignmentType: 'HOMEWORK',
          status: 'ACTIVE',
          classId: classes[0].id,
          problemIds: [problems[0].id, problems[1].id],
          assignedBy: mathTeacher1.id,
          assignedAt: new Date(),
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7일 후
          instructions: '이차방정식을 인수분해하여 해를 구하세요.',
        },
      }),
      prisma.problemAssignment.create({
        data: {
          title: '광합성 실험 과제',
          description: '광합성 과정에 대한 과학 실험 과제입니다.',
          assignmentType: 'PROJECT',
          status: 'ACTIVE',
          classId: classes[1].id,
          problemIds: [problems[4].id],
          assignedBy: scienceTeacher.id,
          assignedAt: new Date(),
          dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5일 후
          instructions: '광합성 과정을 실험을 통해 관찰하고 보고서를 작성하세요.',
        },
      }),
    ]);

    // 15. 문제 진행 상태 데이터 생성
    const problemProgress = await Promise.all([
      prisma.problemProgress.create({
        data: {
          userId: student1.id, // 김민수
          studyId: learningMaterials[0].id,
          problemId: problems[0].id,
          attemptNumber: 1,
          selectedAnswer: 'x = 2, 3',
          isCorrect: true,
          startedAt: new Date(Date.now() - 15 * 60 * 1000), // 15분 전 시작
          completedAt: new Date(Date.now() - 10 * 60 * 1000), // 10분 전 완료
          timeSpent: 300, // 5분 소요
          lastAccessed: new Date(Date.now() - 10 * 60 * 1000),
        },
      }),
      prisma.problemProgress.create({
        data: {
          userId: student1.id, // 김민수
          studyId: learningMaterials[0].id,
          problemId: problems[1].id,
          attemptNumber: 1,
          selectedAnswer: 'x = 2',
          isCorrect: true,
          startedAt: new Date(Date.now() - 20 * 60 * 1000), // 20분 전 시작
          completedAt: new Date(Date.now() - 18 * 60 * 1000), // 18분 전 완료
          timeSpent: 120, // 2분 소요
          lastAccessed: new Date(Date.now() - 18 * 60 * 1000),
        },
      }),
      prisma.problemProgress.create({
        data: {
          userId: student2.id, // 이지영
          studyId: learningMaterials[0].id,
          problemId: problems[0].id,
          attemptNumber: 1,
          selectedAnswer: 'x = 2, 3',
          isCorrect: true,
          startedAt: new Date(Date.now() - 10 * 60 * 1000), // 10분 전 시작
          completedAt: new Date(Date.now() - 5 * 60 * 1000), // 5분 전 완료
          timeSpent: 300, // 5분 소요
          lastAccessed: new Date(Date.now() - 5 * 60 * 1000),
        },
      }),
      prisma.problemProgress.create({
        data: {
          userId: student2.id, // 이지영
          studyId: learningMaterials[1].id, // 과학 학습 자료
          problemId: problems[4].id, // 광합성 문제
          attemptNumber: 1,
          selectedAnswer:
            '빛에너지가 엽록소에 의해 흡수되어 ATP와 NADPH를 생성하고, 이를 이용해 포도당을 합성합니다.',
          isCorrect: true,
          startedAt: new Date(Date.now() - 30 * 60 * 1000), // 30분 전 시작
          completedAt: new Date(Date.now() - 25 * 60 * 1000), // 25분 전 완료
          timeSpent: 300, // 5분 소요
          lastAccessed: new Date(Date.now() - 25 * 60 * 1000),
        },
      }),
      // 재시도 시나리오 (2번째 시도)
      prisma.problemProgress.create({
        data: {
          userId: student3.id, // 박준호
          studyId: learningMaterials[0].id,
          problemId: problems[2].id, // 피타고라스 문제
          attemptNumber: 2,
          selectedAnswer: '4',
          isCorrect: true,
          startedAt: new Date(Date.now() - 40 * 60 * 1000), // 40분 전 시작
          completedAt: new Date(Date.now() - 35 * 60 * 1000), // 35분 전 완료
          timeSpent: 300, // 5분 소요
          lastAccessed: new Date(Date.now() - 35 * 60 * 1000),
        },
      }),
      // 오답 시나리오
      prisma.problemProgress.create({
        data: {
          userId: student3.id, // 박준호
          studyId: learningMaterials[0].id,
          problemId: problems[2].id, // 피타고라스 문제
          attemptNumber: 1,
          selectedAnswer: '6',
          isCorrect: false,
          startedAt: new Date(Date.now() - 50 * 60 * 1000), // 50분 전 시작
          completedAt: new Date(Date.now() - 45 * 60 * 1000), // 45분 전 완료
          timeSpent: 300, // 5분 소요
          lastAccessed: new Date(Date.now() - 45 * 60 * 1000),
        },
      }),
    ]);

    // 16. 시도 기록 데이터 생성
    const attempts = await Promise.all([
      prisma.attempt.create({
        data: {
          userId: student1.id, // 김민수
          studyId: learningMaterials[0].id,
          problemId: problems[0].id,
          attemptNumber: 1,
          selected: 'x = 2, 3',
          isCorrect: true,
          startedAt: new Date(Date.now() - 15 * 60 * 1000), // 15분 전 시작
          completedAt: new Date(Date.now() - 10 * 60 * 1000), // 10분 전 완료
          timeSpent: 300, // 5분 소요
        },
      }),
      prisma.attempt.create({
        data: {
          userId: student2.id, // 이지영
          studyId: learningMaterials[0].id,
          problemId: problems[0].id,
          attemptNumber: 1,
          selected: 'x = 2, 3',
          isCorrect: true,
          startedAt: new Date(Date.now() - 10 * 60 * 1000), // 10분 전 시작
          completedAt: new Date(Date.now() - 5 * 60 * 1000), // 5분 전 완료
          timeSpent: 300, // 5분 소요
        },
      }),
      prisma.attempt.create({
        data: {
          userId: student1.id, // 김민수
          studyId: learningMaterials[0].id,
          problemId: problems[1].id, // 일차방정식 문제
          attemptNumber: 1,
          selected: 'x = 2',
          isCorrect: true,
          startedAt: new Date(Date.now() - 20 * 60 * 1000), // 20분 전 시작
          completedAt: new Date(Date.now() - 18 * 60 * 1000), // 18분 전 완료
          timeSpent: 120, // 2분 소요
        },
      }),
      prisma.attempt.create({
        data: {
          userId: student2.id, // 이지영
          studyId: learningMaterials[1].id, // 과학 학습 자료
          problemId: problems[4].id, // 광합성 문제
          attemptNumber: 1,
          selected:
            '빛에너지가 엽록소에 의해 흡수되어 ATP와 NADPH를 생성하고, 이를 이용해 포도당을 합성합니다.',
          isCorrect: true,
          startedAt: new Date(Date.now() - 30 * 60 * 1000), // 30분 전 시작
          completedAt: new Date(Date.now() - 25 * 60 * 1000), // 25분 전 완료
          timeSpent: 300, // 5분 소요
        },
      }),
      // 재시도 시나리오 (2번째 시도)
      prisma.attempt.create({
        data: {
          userId: student3.id, // 박준호
          studyId: learningMaterials[0].id,
          problemId: problems[2].id, // 피타고라스 문제
          attemptNumber: 2,
          selected: '4',
          isCorrect: true,
          startedAt: new Date(Date.now() - 40 * 60 * 1000), // 40분 전 시작
          completedAt: new Date(Date.now() - 35 * 60 * 1000), // 35분 전 완료
          timeSpent: 300, // 5분 소요
        },
      }),
      // 오답 시나리오
      prisma.attempt.create({
        data: {
          userId: student3.id, // 박준호
          studyId: learningMaterials[0].id,
          problemId: problems[2].id, // 피타고라스 문제
          attemptNumber: 1,
          selected: '6',
          isCorrect: false,
          startedAt: new Date(Date.now() - 50 * 60 * 1000), // 50분 전 시작
          completedAt: new Date(Date.now() - 45 * 60 * 1000), // 45분 전 완료
          timeSpent: 300, // 5분 소요
        },
      }),
    ]);

    // 17. 리포트 분석 데이터 생성
    const reportAnalyses = await Promise.all([
      prisma.reportAnalysis.create({
        data: {
          reportId: teacherReports[0].id,
          analysisType: 'ACHIEVEMENT_DISTRIBUTION',
          analysisData: {
            excellent: 8,
            good: 12,
            average: 7,
            below_average: 3,
            total_students: 30,
          },
        },
      }),
      prisma.reportAnalysis.create({
        data: {
          reportId: teacherReports[1].id,
          analysisType: 'SUBJECT_ANALYSIS',
          analysisData: {
            physics: 85,
            chemistry: 78,
            biology: 92,
            earth_science: 88,
          },
        },
      }),
    ]);

    // 18. AI 서버 상태 데이터 생성
    const aiServerStatus = await Promise.all([
      prisma.aIServerStatus.create({
        data: {
          serverName: 'openai-gpt4',
          serverUrl: 'https://api.openai.com/v1',
          status: 'HEALTHY',
          lastChecked: new Date(),
          responseTimeMs: 1200,
          version: '4.0',
          services: {
            region: 'us-east-1',
            load: 0.65,
          },
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
          services: {
            region: 'us-west-2',
            load: 0.45,
          },
        },
      }),
    ]);

    // 19. AI 서버 동기화 데이터 생성
    const aiServerSync = await Promise.all([
      prisma.aIServerSync.create({
        data: {
          serverName: 'openai-gpt4',
          syncType: 'FULL_SYNC',
          status: 'SUCCESS',
          startTime: new Date(Date.now() - 30 * 60 * 1000), // 30분 전
          endTime: new Date(Date.now() - 25 * 60 * 1000), // 25분 전
          durationMs: 5 * 60 * 1000, // 5분
          recordsProcessed: 150,
          recordsSynced: 150,
          metadata: {
            sync_type: 'full',
            duration_minutes: 5,
            data_size_mb: 12.5,
          },
          userId: mathTeacher1.id,
        },
      }),
      prisma.aIServerSync.create({
        data: {
          serverName: 'openai-gpt35',
          syncType: 'INCREMENTAL_SYNC',
          status: 'SUCCESS',
          startTime: new Date(Date.now() - 20 * 60 * 1000), // 20분 전
          endTime: new Date(Date.now() - 18 * 60 * 1000), // 18분 전
          durationMs: 2 * 60 * 1000, // 2분
          recordsProcessed: 200,
          recordsSynced: 200,
          metadata: {
            sync_type: 'incremental',
            duration_minutes: 2,
            data_size_mb: 8.3,
          },
          userId: scienceTeacher.id,
        },
      }),
    ]);

    logger.info('✅ 시드 데이터 생성 완료', {
      service: 'edubridge-api',
      users: users.length,
      textbooks: textbooks.length,
      documentChunks: documentChunks.length,
      problems: problems.length,
      searchQueries: searchQueries.length,
      searchResults: searchResults.length,
      teacherReports: teacherReports.length,
      classes: classes.length,
      classMembers: classMembers.length,
      todos: todos.length,
      userPreferences: userPreferences.length,
      learningMaterials: learningMaterials.length,
      learningMaterialProblems: learningMaterialProblems.length,
      problemAssignments: problemAssignments.length,
      problemProgress: problemProgress.length,
      attempts: attempts.length,
      reportAnalyses: reportAnalyses.length,
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
