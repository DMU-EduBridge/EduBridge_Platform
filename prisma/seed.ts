import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

import { logger } from '@/lib/monitoring';

async function main() {
  logger.info('🌱 시드 데이터 생성을 시작합니다...');

  // 사용자 생성 (더 많은 사용자)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      name: '관리자',
      email: 'admin@example.com',
      role: 'ADMIN',
      status: 'ACTIVE',
      school: 'EduBridge 중학교',
      subject: '전체',
    },
  });

  const teachers = await Promise.all([
    prisma.user.upsert({
      where: { email: 'teacher1@example.com' },
      update: {},
      create: {
        name: '김수학',
        email: 'teacher1@example.com',
        role: 'TEACHER',
        status: 'ACTIVE',
        school: 'EduBridge 중학교',
        subject: '수학',
      },
    }),
    prisma.user.upsert({
      where: { email: 'teacher2@example.com' },
      update: {},
      create: {
        name: '이과학',
        email: 'teacher2@example.com',
        role: 'TEACHER',
        status: 'ACTIVE',
        school: 'EduBridge 중학교',
        subject: '과학',
      },
    }),
    prisma.user.upsert({
      where: { email: 'teacher3@example.com' },
      update: {},
      create: {
        name: '박국어',
        email: 'teacher3@example.com',
        role: 'TEACHER',
        status: 'ACTIVE',
        school: 'EduBridge 중학교',
        subject: '국어',
      },
    }),
    prisma.user.upsert({
      where: { email: 'teacher4@example.com' },
      update: {},
      create: {
        name: '최영어',
        email: 'teacher4@example.com',
        role: 'TEACHER',
        status: 'ACTIVE',
        school: 'EduBridge 중학교',
        subject: '영어',
      },
    }),
  ]);

  const students = await Promise.all([
    // 1학년 학생들
    prisma.user.upsert({
      where: { email: 'student1@example.com' },
      update: {},
      create: {
        name: '김민수',
        email: 'student1@example.com',
        role: 'STUDENT',
        status: 'ACTIVE',
        grade: '1학년',
        preferences: {
          create: {
            learningStyle: JSON.stringify(['visual', 'kinesthetic']),
            interests: JSON.stringify(['수학', '과학']),
            preferredDifficulty: 'MEDIUM',
          },
        },
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
        grade: '1학년',
        preferences: {
          create: {
            learningStyle: JSON.stringify(['auditory']),
            interests: JSON.stringify(['국어', '영어']),
            preferredDifficulty: 'HARD',
          },
        },
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
        grade: '1학년',
        preferences: {
          create: {
            learningStyle: JSON.stringify(['visual']),
            interests: JSON.stringify(['사회', '역사']),
            preferredDifficulty: 'EASY',
          },
        },
      },
    }),
    // 2학년 학생들
    prisma.user.upsert({
      where: { email: 'student4@example.com' },
      update: {},
      create: {
        name: '최서연',
        email: 'student4@example.com',
        role: 'STUDENT',
        status: 'ACTIVE',
        grade: '2학년',
        preferences: {
          create: {
            learningStyle: JSON.stringify(['visual', 'auditory']),
            interests: JSON.stringify(['수학', '영어']),
            preferredDifficulty: 'MEDIUM',
          },
        },
      },
    }),
    prisma.user.upsert({
      where: { email: 'student5@example.com' },
      update: {},
      create: {
        name: '정현우',
        email: 'student5@example.com',
        role: 'STUDENT',
        status: 'ACTIVE',
        grade: '2학년',
        preferences: {
          create: {
            learningStyle: JSON.stringify(['kinesthetic']),
            interests: JSON.stringify(['과학', '체육']),
            preferredDifficulty: 'HARD',
          },
        },
      },
    }),
    prisma.user.upsert({
      where: { email: 'student6@example.com' },
      update: {},
      create: {
        name: '한소영',
        email: 'student6@example.com',
        role: 'STUDENT',
        status: 'INACTIVE',
        grade: '2학년',
        preferences: {
          create: {
            learningStyle: JSON.stringify(['visual']),
            interests: JSON.stringify(['국어', '사회']),
            preferredDifficulty: 'EASY',
          },
        },
      },
    }),
    // 3학년 학생들
    prisma.user.upsert({
      where: { email: 'student7@example.com' },
      update: {},
      create: {
        name: '강동현',
        email: 'student7@example.com',
        role: 'STUDENT',
        status: 'ACTIVE',
        grade: '3학년',
        preferences: {
          create: {
            learningStyle: JSON.stringify(['auditory', 'kinesthetic']),
            interests: JSON.stringify(['수학', '과학']),
            preferredDifficulty: 'HARD',
          },
        },
      },
    }),
    prisma.user.upsert({
      where: { email: 'student8@example.com' },
      update: {},
      create: {
        name: '윤미래',
        email: 'student8@example.com',
        role: 'STUDENT',
        status: 'ACTIVE',
        grade: '3학년',
        preferences: {
          create: {
            learningStyle: JSON.stringify(['visual']),
            interests: JSON.stringify(['영어', '국어']),
            preferredDifficulty: 'MEDIUM',
          },
        },
      },
    }),
    prisma.user.upsert({
      where: { email: 'student9@example.com' },
      update: {},
      create: {
        name: '임태호',
        email: 'student9@example.com',
        role: 'STUDENT',
        status: 'ACTIVE',
        grade: '3학년',
        preferences: {
          create: {
            learningStyle: JSON.stringify(['kinesthetic']),
            interests: JSON.stringify(['사회', '역사']),
            preferredDifficulty: 'EASY',
          },
        },
      },
    }),
  ]);

  // 문제 생성 (더 많은 문제들)
  const problems = await Promise.all([
    // 수학 문제들
    prisma.problem.create({
      data: {
        title: '이차방정식의 해 구하기',
        description: '다음 이차방정식의 해를 구하세요: x² - 5x + 6 = 0',
        content:
          '이차방정식 x² - 5x + 6 = 0의 해를 구하는 문제입니다. 인수분해를 이용하여 풀어보세요.',
        subject: '수학',
        type: 'MULTIPLE_CHOICE',
        difficulty: 'MEDIUM',
        options: JSON.stringify(['x = 2, 3', 'x = 1, 6', 'x = -2, -3', '해가 없음']),
        correctAnswer: 'x = 2, 3',
        hints: JSON.stringify([
          '인수분해를 사용해보세요',
          '두 수의 곱이 6이고 합이 5인 수를 찾아보세요',
        ]),
        tags: JSON.stringify(['이차방정식', '인수분해', '수학']),
        isActive: true,
      },
    }),
    prisma.problem.create({
      data: {
        title: '삼각함수의 기본값',
        description: 'sin 30°의 값을 구하세요.',
        content: '삼각함수 sin 30°의 값을 구하는 문제입니다.',
        subject: '수학',
        type: 'MULTIPLE_CHOICE',
        difficulty: 'EASY',
        options: JSON.stringify(['1/2', '√3/2', '1', '0']),
        correctAnswer: '1/2',
        hints: JSON.stringify(['30-60-90 삼각형을 생각해보세요']),
        tags: JSON.stringify(['삼각함수', '수학']),
        isActive: true,
      },
    }),
    prisma.problem.create({
      data: {
        title: '미분의 정의',
        description: '함수 f(x) = x²의 x = 2에서의 미분계수를 구하세요.',
        content: '함수 f(x) = x²의 x = 2에서의 미분계수를 구하는 문제입니다.',
        subject: '수학',
        type: 'SHORT_ANSWER',
        difficulty: 'HARD',
        options: JSON.stringify([]),
        correctAnswer: '4',
        hints: JSON.stringify(['미분의 정의를 사용해보세요', "f'(x) = 2x"]),
        tags: JSON.stringify(['미분', '수학']),
        isActive: true,
      },
    }),
    // 과학 문제들
    prisma.problem.create({
      data: {
        title: '광합성의 과정',
        description: '광합성에서 빛에너지가 화학에너지로 변환되는 과정을 설명하세요.',
        content:
          '광합성은 식물이 빛에너지를 이용하여 포도당을 만드는 과정입니다. 이 과정에서 일어나는 화학 반응을 설명해보세요.',
        subject: '과학',
        type: 'SHORT_ANSWER',
        difficulty: 'HARD',
        options: JSON.stringify([]),
        correctAnswer:
          '빛에너지가 엽록소에 의해 흡수되어 ATP와 NADPH를 생성하고, 이를 이용해 포도당을 합성한다.',
        hints: JSON.stringify([
          '엽록소의 역할을 생각해보세요',
          'ATP와 NADPH의 생성 과정을 설명해보세요',
        ]),
        tags: JSON.stringify(['광합성', '생물', '과학']),
        isActive: true,
      },
    }),
    prisma.problem.create({
      data: {
        title: '화학 반응식 균형 맞추기',
        description: '다음 화학 반응식의 계수를 맞춰보세요: H₂ + O₂ → H₂O',
        content: '수소와 산소가 반응하여 물이 생성되는 반응식의 계수를 맞춰보세요.',
        subject: '과학',
        type: 'MULTIPLE_CHOICE',
        difficulty: 'MEDIUM',
        options: JSON.stringify([
          '2H₂ + O₂ → 2H₂O',
          'H₂ + O₂ → H₂O',
          '4H₂ + 2O₂ → 4H₂O',
          'H₂ + 2O₂ → H₂O',
        ]),
        correctAnswer: '2H₂ + O₂ → 2H₂O',
        hints: JSON.stringify([
          '원자 수가 보존되어야 합니다',
          '양쪽의 수소와 산소 원자 수를 세어보세요',
        ]),
        tags: JSON.stringify(['화학반응식', '화학', '과학']),
        isActive: true,
      },
    }),
    prisma.problem.create({
      data: {
        title: '뉴턴의 운동법칙',
        description: '뉴턴의 제1법칙(관성의 법칙)을 설명하세요.',
        content: '뉴턴의 제1법칙인 관성의 법칙에 대해 설명해보세요.',
        subject: '과학',
        type: 'SHORT_ANSWER',
        difficulty: 'MEDIUM',
        options: JSON.stringify([]),
        correctAnswer:
          '외부에서 힘이 작용하지 않으면 정지한 물체는 계속 정지하고, 운동하는 물체는 등속직선운동을 계속한다.',
        hints: JSON.stringify([
          '관성의 의미를 생각해보세요',
          '외부 힘이 없을 때의 물체의 상태를 설명해보세요',
        ]),
        tags: JSON.stringify(['뉴턴법칙', '물리', '과학']),
        isActive: true,
      },
    }),
    // 국어 문제들
    prisma.problem.create({
      data: {
        title: '한글 맞춤법',
        description: '다음 중 맞춤법이 올바른 것은?',
        content: '한글 맞춤법이 올바른 것을 선택하세요.',
        subject: '국어',
        type: 'MULTIPLE_CHOICE',
        difficulty: 'EASY',
        options: JSON.stringify(['안녕하세요', '안녕하세요', '안녕하시요', '안녕하세요']),
        correctAnswer: '안녕하세요',
        hints: JSON.stringify(['한글 맞춤법 규칙을 생각해보세요']),
        tags: JSON.stringify(['맞춤법', '국어']),
        isActive: true,
      },
    }),
    prisma.problem.create({
      data: {
        title: '문학 작품 분석',
        description: '김소월의 시 "진달래꽃"의 주제를 설명하세요.',
        content: '김소월의 시 "진달래꽃"의 주제와 시적 화자의 감정을 분석해보세요.',
        subject: '국어',
        type: 'SHORT_ANSWER',
        difficulty: 'MEDIUM',
        options: JSON.stringify([]),
        correctAnswer: '이별의 아픔과 그리움을 진달래꽃을 통해 표현한 시',
        hints: JSON.stringify([
          '시적 화자의 감정을 파악해보세요',
          '진달래꽃의 상징적 의미를 생각해보세요',
        ]),
        tags: JSON.stringify(['문학', '시', '국어']),
        isActive: true,
      },
    }),
    // 영어 문제들
    prisma.problem.create({
      data: {
        title: '영어 문법 - 시제',
        description: '다음 중 현재완료시제가 올바르게 사용된 문장은?',
        content: '현재완료시제가 올바르게 사용된 문장을 선택하세요.',
        subject: '영어',
        type: 'MULTIPLE_CHOICE',
        difficulty: 'MEDIUM',
        options: JSON.stringify([
          'I have went to school',
          'I have gone to school',
          'I went to school',
          'I go to school',
        ]),
        correctAnswer: 'I have gone to school',
        hints: JSON.stringify(['현재완료시제의 구조를 생각해보세요', 'have + 과거분사']),
        tags: JSON.stringify(['시제', '문법', '영어']),
        isActive: true,
      },
    }),
    prisma.problem.create({
      data: {
        title: '영어 어휘',
        description: '다음 중 "beautiful"의 반의어는?',
        content: 'beautiful의 반의어를 선택하세요.',
        subject: '영어',
        type: 'MULTIPLE_CHOICE',
        difficulty: 'EASY',
        options: JSON.stringify(['ugly', 'pretty', 'handsome', 'lovely']),
        correctAnswer: 'ugly',
        hints: JSON.stringify(['반의어의 의미를 생각해보세요']),
        tags: JSON.stringify(['어휘', '영어']),
        isActive: true,
      },
    }),
    // 사회 문제들
    prisma.problem.create({
      data: {
        title: '한국의 역사',
        description: '조선왕조의 건국 연도는 언제인가요?',
        content: '조선왕조는 이성계에 의해 건국되었습니다. 조선이 건국된 연도를 선택하세요.',
        subject: '사회',
        type: 'MULTIPLE_CHOICE',
        difficulty: 'EASY',
        options: JSON.stringify(['1392년', '1443년', '1592년', '1636년']),
        correctAnswer: '1392년',
        hints: JSON.stringify(['이성계가 조선을 건국한 연도를 생각해보세요']),
        tags: JSON.stringify(['조선', '역사', '사회']),
        isActive: true,
      },
    }),
    prisma.problem.create({
      data: {
        title: '경제 기본 개념',
        description: '다음 중 수요와 공급의 법칙에 대한 설명으로 올바른 것은?',
        content: '수요와 공급의 법칙에 대한 설명을 선택하세요.',
        subject: '사회',
        type: 'MULTIPLE_CHOICE',
        difficulty: 'MEDIUM',
        options: JSON.stringify([
          '가격이 오르면 수요가 증가한다',
          '가격이 오르면 공급이 감소한다',
          '가격이 오르면 수요가 감소한다',
          '가격과 수요는 무관하다',
        ]),
        correctAnswer: '가격이 오르면 수요가 감소한다',
        hints: JSON.stringify(['수요의 법칙을 생각해보세요', '가격과 수요의 관계를 생각해보세요']),
        tags: JSON.stringify(['경제', '수요공급', '사회']),
        isActive: true,
      },
    }),
  ]);

  // 학습 진도 생성 (더 많은 진도 데이터)
  const progressData = [];
  for (let i = 0; i < students.length; i++) {
    for (let j = 0; j < problems.length; j++) {
      const statuses = ['COMPLETED', 'IN_PROGRESS', 'NOT_STARTED'];
      const status = statuses[Math.floor(Math.random() * 3)];
      const score =
        status === 'COMPLETED'
          ? Math.floor(Math.random() * 40) + 60
          : status === 'IN_PROGRESS'
            ? Math.floor(Math.random() * 30)
            : 0;
      const timeSpent =
        status === 'COMPLETED'
          ? Math.floor(Math.random() * 300) + 120
          : status === 'IN_PROGRESS'
            ? Math.floor(Math.random() * 120)
            : 0;
      const attempts =
        status === 'COMPLETED'
          ? Math.floor(Math.random() * 3) + 1
          : status === 'IN_PROGRESS'
            ? Math.floor(Math.random() * 2) + 1
            : 0;

      progressData.push({
        studentId: students[i].id,
        problemId: problems[j].id,
        status,
        score,
        timeSpent,
        attempts,
      });
    }
  }

  await Promise.all(
    progressData.map((progress) =>
      prisma.studentProgress.create({
        data: progress,
      }),
    ),
  );

  // 분석 리포트 생성 (더 많은 리포트)
  const reportData = [];
  for (let i = 0; i < students.length; i++) {
    const student = students[i];
    const types = ['INDIVIDUAL', 'WEEKLY', 'MONTHLY', 'QUARTERLY'];
    const statuses = ['COMPLETED', 'IN_PROGRESS', 'PENDING'];

    for (let j = 0; j < 3; j++) {
      const type = types[Math.floor(Math.random() * types.length)];
      const status = statuses[Math.floor(Math.random() * statuses.length)];

      reportData.push({
        studentId: student.id,
        type,
        title: `${student.name}님의 ${type === 'INDIVIDUAL' ? '개인' : type === 'WEEKLY' ? '주간' : type === 'MONTHLY' ? '월간' : '분기'} 학습 분석 리포트`,
        period: '2024년 1월',
        insights: JSON.stringify([
          '수학 문제 해결 능력이 우수합니다',
          '과학 개념 이해에 어려움을 보입니다',
          '학습 집중도가 높습니다',
          '영어 어휘력이 향상되었습니다',
          '사회 과목에 대한 관심이 높습니다',
        ]),
        recommendations: JSON.stringify([
          '과학 개념을 단계별로 학습해보세요',
          '실험을 통한 체험 학습을 권장합니다',
          '복습 시간을 늘려보세요',
          '영어 회화 연습을 권장합니다',
          '사회 현상에 대한 관심을 기르세요',
        ]),
        strengths: JSON.stringify(['논리적 사고', '집중력', '성실함', '호기심', '협력정신']),
        weaknesses: JSON.stringify([
          '과학 개념 이해',
          '추상적 사고',
          '영어 발음',
          '사회 현상 이해',
        ]),
        status,
      });
    }
  }

  await Promise.all(
    reportData.map((report) =>
      prisma.analysisReport.create({
        data: report,
      }),
    ),
  );

  // 진로 상담 생성 (더 많은 상담 데이터)
  const counselingData = [];
  for (let i = 0; i < students.length; i++) {
    const student = students[i];
    const types = ['ACADEMIC', 'CAREER', 'UNIVERSITY_GUIDANCE', 'PERSONAL'];
    const statuses = ['COMPLETED', 'IN_PROGRESS', 'SCHEDULED'];

    for (let j = 0; j < 2; j++) {
      const type = types[Math.floor(Math.random() * types.length)];
      const status = statuses[Math.floor(Math.random() * statuses.length)];

      counselingData.push({
        studentId: student.id,
        type,
        title: `${student.name}님의 ${type === 'ACADEMIC' ? '학업' : type === 'CAREER' ? '진로' : type === 'UNIVERSITY_GUIDANCE' ? '대학진학' : '개인'} 상담`,
        content: '학생의 관심사와 성향을 바탕으로 한 상담 내용입니다.',
        careerSuggestions: JSON.stringify([
          '수학 관련 전공 추천',
          '공학 분야 진출 고려',
          '연구직 진로 탐색',
          '교육 분야 진출 고려',
          '의료 분야 진출 고려',
        ]),
        universityRecommendations: JSON.stringify([
          '서울대학교 공과대학',
          'KAIST 전산학부',
          '포스텍 컴퓨터공학과',
          '연세대학교 의과대학',
          '고려대학교 경영대학',
        ]),
        skillGaps: JSON.stringify([
          '프로그래밍 기초',
          '영어 회화 능력',
          '프레젠테이션 스킬',
          '리더십',
          '창의적 사고',
        ]),
        status,
      });
    }
  }

  await Promise.all(
    counselingData.map((counseling) =>
      prisma.careerCounseling.create({
        data: counseling,
      }),
    ),
  );

  // 교사 리포트 생성 (새로운 기능 테스트용)
  const teacherReportData = [];
  for (let i = 0; i < teachers.length; i++) {
    const teacher = teachers[i];
    const statuses = ['COMPLETED', 'IN_PROGRESS', 'PENDING'];

    for (let j = 0; j < 2; j++) {
      const status = statuses[Math.floor(Math.random() * statuses.length)];

      teacherReportData.push({
        title: `${teacher.name} 선생님의 ${teacher.subject} 과목 리포트`,
        content: `${teacher.subject} 과목에 대한 상세한 분석 리포트입니다.`,
        reportType: 'CLASS_ANALYSIS',
        classInfo: JSON.stringify({
          grade: '1학년',
          classNum: '1반',
          subject: teacher.subject,
          semester: '1학기',
          year: 2024,
          teacher: teacher.name,
          totalStudents: 30,
        }),
        students: JSON.stringify([
          { name: '김민수', math: 85, korean: 78, english: 72 },
          { name: '이지영', math: 92, korean: 88, english: 85 },
          { name: '박준호', math: 78, korean: 82, english: 79 },
        ]),
        analysisData: JSON.stringify({
          basicStatistics: {
            average: 78.5,
            median: 80.0,
            std: 12.3,
            min: 45.0,
            max: 95.0,
            count: 30,
          },
          achievementDistribution: {
            high: 8,
            medium: 15,
            low: 7,
            total: 30,
          },
          strugglingStudents: [
            { name: '최지혜', score: 45.0, gap: -33.5 },
            { name: '강동현', score: 58.0, gap: -20.5 },
          ],
          subjectWeaknesses: [
            {
              subject: teacher.subject,
              average: 78.5,
              difficultyLevel: 'medium',
              studentCount: 30,
              strugglingCount: 7,
            },
          ],
          assignmentAnalysis: {
            averageRate: 87.3,
            totalStudents: 30,
            lateSubmissionCount: 3,
            lateStudents: [{ name: '박민수', rate: 65.0 }],
          },
          totalStudents: 30,
        }),
        metadata: JSON.stringify({
          generatedBy: 'AI',
          modelVersion: '1.0.0',
          processingTime: '2.5초',
        }),
        tokenUsage: 1500,
        generationTimeMs: 2500,
        modelName: 'gpt-4',
        costUsd: 0.06,
        status,
        createdBy: teacher.id,
      });
    }
  }

  await Promise.all(
    teacherReportData.map((report) =>
      prisma.teacherReport.create({
        data: report,
      }),
    ),
  );

  // Educational AI System 더미 데이터 생성

  // 교과서 데이터 생성
  const textbooks = await Promise.all([
    prisma.textbook.create({
      data: {
        title: '중학교 수학 1학년',
        subject: '수학',
        gradeLevel: '중1',
        publisher: '교육부',
        fileName: 'math_1.pdf',
        filePath: '/uploads/math_1.pdf',
        fileSize: 1024000,
        mimeType: 'application/pdf',
        totalChunks: 15,
        processingStatus: 'completed',
        uploadedBy: teachers[0].id, // 김수학 선생님
      },
    }),
    prisma.textbook.create({
      data: {
        title: '중학교 과학 2학년',
        subject: '과학',
        gradeLevel: '중2',
        publisher: '교육부',
        fileName: 'science_2.pdf',
        filePath: '/uploads/science_2.pdf',
        fileSize: 2048000,
        mimeType: 'application/pdf',
        totalChunks: 20,
        processingStatus: 'completed',
        uploadedBy: teachers[1].id, // 이과학 선생님
      },
    }),
    prisma.textbook.create({
      data: {
        title: '중학교 국어 3학년',
        subject: '국어',
        gradeLevel: '중3',
        publisher: '교육부',
        fileName: 'korean_3.pdf',
        filePath: '/uploads/korean_3.pdf',
        fileSize: 1536000,
        mimeType: 'application/pdf',
        totalChunks: 12,
        processingStatus: 'processing',
        uploadedBy: teachers[2].id, // 박국어 선생님
      },
    }),
    prisma.textbook.create({
      data: {
        title: '중학교 영어 1학년',
        subject: '영어',
        gradeLevel: '중1',
        publisher: '교육부',
        fileName: 'english_1.pdf',
        filePath: '/uploads/english_1.pdf',
        fileSize: 1800000,
        mimeType: 'application/pdf',
        totalChunks: 18,
        processingStatus: 'failed',
        errorMessage: '파일 형식 오류',
        uploadedBy: teachers[3].id, // 최영어 선생님
      },
    }),
  ]);

  // 문서 청크 데이터 생성
  const documentChunks = [];
  for (const textbook of textbooks) {
    for (let i = 0; i < textbook.totalChunks; i++) {
      const chunk = await prisma.documentChunk.create({
        data: {
          textbookId: textbook.id,
          chunkIndex: i,
          content: `${textbook.title}의 ${i + 1}번째 청크입니다. 이 부분에서는 ${textbook.subject}의 중요한 개념들을 다룹니다.`,
          contentLength: 200 + Math.floor(Math.random() * 300),
          embeddingId: `embedding_${textbook.id}_${i}`,
          metadata: JSON.stringify({
            subject: textbook.subject,
            gradeLevel: textbook.gradeLevel,
            chunkIndex: i,
            keywords: ['개념', '이론', '예제', '문제'],
          }),
        },
      });
      documentChunks.push(chunk);
    }
  }

  // AI 생성 문제 데이터 (documentChunks가 생성된 후)
  const aiQuestions = await Promise.all([
    prisma.aIGeneratedQuestion.create({
      data: {
        questionText: '다음 중 이차방정식 x² - 5x + 6 = 0의 해는?',
        subject: '수학',
        gradeLevel: '중3',
        unit: '이차방정식',
        difficulty: 'medium',
        correctAnswer: 1,
        explanation: '인수분해를 이용하여 (x-2)(x-3) = 0이므로 x = 2, 3입니다.',
        generationPrompt: '이차방정식의 해를 구하는 문제를 생성해주세요.',
        contextChunkIds: JSON.stringify([documentChunks[0]?.id || '', documentChunks[1]?.id || '']),
        qualityScore: 0.85,
        generationTimeMs: 2500,
        modelName: 'gpt-4',
        tokensUsed: 1200,
        costUsd: 0.05,
        createdBy: teachers[0].id,
        textbookId: textbooks[0].id,
      },
    }),
    prisma.aIGeneratedQuestion.create({
      data: {
        questionText: '광합성에서 빛에너지가 화학에너지로 변환되는 과정을 설명하세요.',
        subject: '과학',
        gradeLevel: '중2',
        unit: '광합성',
        difficulty: 'hard',
        correctAnswer: 1,
        explanation:
          '빛에너지가 엽록소에 의해 흡수되어 ATP와 NADPH를 생성하고, 이를 이용해 포도당을 합성합니다.',
        generationPrompt: '광합성 과정에 대한 설명 문제를 생성해주세요.',
        contextChunkIds: JSON.stringify([
          documentChunks[15]?.id || '',
          documentChunks[16]?.id || '',
        ]),
        qualityScore: 0.92,
        generationTimeMs: 3200,
        modelName: 'gpt-4',
        tokensUsed: 1500,
        costUsd: 0.07,
        createdBy: teachers[1].id,
        textbookId: textbooks[1].id,
      },
    }),
    prisma.aIGeneratedQuestion.create({
      data: {
        questionText: '다음 중 현재완료시제가 올바르게 사용된 문장은?',
        subject: '영어',
        gradeLevel: '중1',
        unit: '시제',
        difficulty: 'medium',
        correctAnswer: 2,
        explanation: '현재완료시제는 have + 과거분사 형태로 사용됩니다.',
        generationPrompt: '영어 시제에 대한 문제를 생성해주세요.',
        contextChunkIds: JSON.stringify([documentChunks[50]?.id || '']),
        qualityScore: 0.78,
        generationTimeMs: 1800,
        modelName: 'gpt-4',
        tokensUsed: 900,
        costUsd: 0.04,
        createdBy: teachers[3].id,
        textbookId: textbooks[3].id,
      },
    }),
  ]);

  // 문제 선택지 생성
  const questionOptions = [];
  for (const question of aiQuestions) {
    const options = [
      { optionNumber: 1, optionText: 'x = 2, 3', isCorrect: question.id === aiQuestions[0].id },
      { optionNumber: 2, optionText: 'x = 1, 6', isCorrect: false },
      { optionNumber: 3, optionText: 'x = -2, -3', isCorrect: false },
      { optionNumber: 4, optionText: '해가 없음', isCorrect: false },
      { optionNumber: 5, optionText: '모르겠음', isCorrect: false },
    ];

    if (question.subject === '과학') {
      options[0] = {
        optionNumber: 1,
        optionText: '빛에너지 → ATP/NADPH → 포도당',
        isCorrect: true,
      };
      options[1] = {
        optionNumber: 2,
        optionText: '화학에너지 → 빛에너지 → 포도당',
        isCorrect: false,
      };
      options[2] = { optionNumber: 3, optionText: '포도당 → ATP → 빛에너지', isCorrect: false };
      options[3] = { optionNumber: 4, optionText: 'ATP → 빛에너지 → 포도당', isCorrect: false };
      options[4] = { optionNumber: 5, optionText: '모르겠음', isCorrect: false };
    } else if (question.subject === '영어') {
      options[0] = { optionNumber: 1, optionText: 'I have went to school', isCorrect: false };
      options[1] = { optionNumber: 2, optionText: 'I have gone to school', isCorrect: true };
      options[2] = { optionNumber: 3, optionText: 'I went to school', isCorrect: false };
      options[3] = { optionNumber: 4, optionText: 'I go to school', isCorrect: false };
      options[4] = { optionNumber: 5, optionText: '모르겠음', isCorrect: false };
    }

    for (const option of options) {
      questionOptions.push({
        questionId: question.id,
        optionNumber: option.optionNumber,
        optionText: option.optionText,
        isCorrect: option.isCorrect,
      });
    }
  }

  await Promise.all(
    questionOptions.map((option) =>
      prisma.questionOption.create({
        data: option,
      }),
    ),
  );

  // 문제 태그 생성
  const questionTags = [];
  for (const question of aiQuestions) {
    const tags = ['AI생성', question.difficulty, question.subject];
    for (const tag of tags) {
      questionTags.push({
        questionId: question.id,
        tagName: tag,
      });
    }
  }

  await Promise.all(
    questionTags.map((tag) =>
      prisma.questionTag.create({
        data: tag,
      }),
    ),
  );

  // 검색 쿼리 데이터 생성
  const searchQueries = await Promise.all([
    prisma.searchQuery.create({
      data: {
        queryText: '이차방정식 해 구하기',
        subject: '수학',
        gradeLevel: '중3',
        resultsCount: 5,
        searchTimeMs: 150,
        userId: teachers[0].id,
        sessionId: 'session_001',
      },
    }),
    prisma.searchQuery.create({
      data: {
        queryText: '광합성 과정',
        subject: '과학',
        gradeLevel: '중2',
        resultsCount: 8,
        searchTimeMs: 200,
        userId: teachers[1].id,
        sessionId: 'session_002',
      },
    }),
    prisma.searchQuery.create({
      data: {
        queryText: '영어 시제',
        subject: '영어',
        gradeLevel: '중1',
        resultsCount: 3,
        searchTimeMs: 120,
        userId: teachers[3].id,
        sessionId: 'session_003',
      },
    }),
  ]);

  // 검색 결과 데이터 생성 (간단한 버전)
  const searchResults = [];
  for (const query of searchQueries) {
    for (let i = 0; i < Math.min(query.resultsCount, 3); i++) {
      // 첫 번째 문서 청크를 사용 (안전하게)
      const chunkId = documentChunks.length > 0 ? documentChunks[0]?.id : null;
      if (chunkId) {
        searchResults.push({
          queryId: query.id,
          chunkId: chunkId,
          similarityScore: 0.9 - i * 0.1,
          rankPosition: i + 1,
        });
      }
    }
  }

  if (searchResults.length > 0) {
    await Promise.all(
      searchResults.map((result) =>
        prisma.searchResult.create({
          data: {
            queryId: result.queryId,
            chunkId: result.chunkId,
            similarityScore: result.similarityScore,
            rankPosition: result.rankPosition,
          },
        }),
      ),
    );
  }

  // AI 서버 상태 데이터 생성
  const aiServerStatuses = await Promise.all([
    prisma.aIServerStatus.create({
      data: {
        serverName: 'educational_ai',
        serverUrl: 'http://localhost:8000',
        status: 'healthy',
        responseTimeMs: 150,
        version: '1.0.0',
        lastChecked: new Date(),
        services: JSON.stringify({
          embedding: 'healthy',
          questionGeneration: 'healthy',
          vectorSearch: 'healthy',
        }),
      },
    }),
    prisma.aIServerStatus.create({
      data: {
        serverName: 'teacher_report',
        serverUrl: 'http://localhost:8001',
        status: 'healthy',
        responseTimeMs: 200,
        version: '1.0.0',
        lastChecked: new Date(),
        services: JSON.stringify({
          reportGeneration: 'healthy',
          dataAnalysis: 'healthy',
          visualization: 'healthy',
        }),
      },
    }),
  ]);

  // AI 서버 동기화 기록 생성
  const aiServerSyncs = await Promise.all([
    prisma.aIServerSync.create({
      data: {
        serverName: 'educational_ai',
        syncType: 'data_sync',
        status: 'success',
        startTime: new Date(Date.now() - 3600000), // 1시간 전
        endTime: new Date(Date.now() - 3500000), // 10분 후
        durationMs: 600000, // 10분
        recordsProcessed: 100,
        recordsSynced: 95,
        metadata: JSON.stringify({
          textbooksProcessed: 4,
          chunksProcessed: 65,
          questionsGenerated: 3,
        }),
        userId: admin.id,
      },
    }),
    prisma.aIServerSync.create({
      data: {
        serverName: 'teacher_report',
        syncType: 'health_check',
        status: 'success',
        startTime: new Date(Date.now() - 1800000), // 30분 전
        endTime: new Date(Date.now() - 1790000), // 1분 후
        durationMs: 10000, // 10초
        recordsProcessed: 1,
        recordsSynced: 1,
        metadata: JSON.stringify({
          healthCheck: 'passed',
          services: ['reportGeneration', 'dataAnalysis'],
        }),
        userId: admin.id,
      },
    }),
  ]);

  // API 사용량 데이터 생성
  const apiUsages = await Promise.all([
    prisma.aIApiUsage.create({
      data: {
        userId: teachers[0].id,
        apiType: 'question_generation',
        modelName: 'gpt-4',
        tokensUsed: 1200,
        costUsd: 0.05,
        requestCount: 1,
        responseTimeMs: 2500,
        success: true,
      },
    }),
    prisma.aIApiUsage.create({
      data: {
        userId: teachers[1].id,
        apiType: 'vector_search',
        modelName: 'text-embedding-ada-002',
        tokensUsed: 500,
        costUsd: 0.02,
        requestCount: 1,
        responseTimeMs: 200,
        success: true,
      },
    }),
    prisma.aIApiUsage.create({
      data: {
        userId: teachers[2].id,
        apiType: 'teacher_report_generation',
        modelName: 'gpt-4',
        tokensUsed: 2000,
        costUsd: 0.08,
        requestCount: 1,
        responseTimeMs: 5000,
        success: true,
      },
    }),
  ]);

  // 성능 지표 데이터 생성
  const performanceMetrics = await Promise.all([
    prisma.aIPerformanceMetric.create({
      data: {
        operationType: 'question_generation',
        durationMs: 2500,
        success: true,
        metadata: JSON.stringify({
          questionsGenerated: 3,
          averageQualityScore: 0.85,
          subjects: ['수학', '과학', '영어'],
        }),
        userId: admin.id,
      },
    }),
    prisma.aIPerformanceMetric.create({
      data: {
        operationType: 'vector_search',
        durationMs: 200,
        success: true,
        metadata: JSON.stringify({
          queriesProcessed: 3,
          averageResultsCount: 5,
          averageSimilarityScore: 0.85,
        }),
        userId: admin.id,
      },
    }),
    prisma.aIPerformanceMetric.create({
      data: {
        operationType: 'teacher_report_generation',
        durationMs: 5000,
        success: true,
        metadata: JSON.stringify({
          reportsGenerated: 2,
          averageStudentCount: 30,
          reportTypes: ['full', 'summary'],
        }),
        userId: admin.id,
      },
    }),
  ]);

  // 사용 통계 데이터 생성 (upsert 사용)
  const usageStatistics = await Promise.all([
    prisma.aIUsageStatistics.upsert({
      where: {
        userId_date: {
          userId: teachers[0].id,
          date: new Date().toISOString().split('T')[0],
        },
      },
      update: {},
      create: {
        userId: teachers[0].id,
        date: new Date().toISOString().split('T')[0],
        questionsGenerated: 1,
        textbooksUploaded: 1,
        searchesPerformed: 1,
        totalCostUsd: 0.05,
      },
    }),
    prisma.aIUsageStatistics.upsert({
      where: {
        userId_date: {
          userId: teachers[1].id,
          date: new Date().toISOString().split('T')[0],
        },
      },
      update: {},
      create: {
        userId: teachers[1].id,
        date: new Date().toISOString().split('T')[0],
        questionsGenerated: 1,
        textbooksUploaded: 1,
        searchesPerformed: 1,
        totalCostUsd: 0.07,
      },
    }),
    prisma.aIUsageStatistics.upsert({
      where: {
        userId_date: {
          userId: teachers[2].id,
          date: new Date().toISOString().split('T')[0],
        },
      },
      update: {},
      create: {
        userId: teachers[2].id,
        date: new Date().toISOString().split('T')[0],
        questionsGenerated: 0,
        textbooksUploaded: 1,
        searchesPerformed: 0,
        totalCostUsd: 0.08,
      },
    }),
  ]);

  // ChromaDB 컬렉션 데이터 생성 (upsert 사용)
  const chromaCollections = await Promise.all([
    prisma.chromaDBCollection.upsert({
      where: { collectionName: 'textbook_embeddings' },
      update: {},
      create: {
        collectionName: 'textbook_embeddings',
        description: '교과서 텍스트의 벡터 임베딩 컬렉션',
        persistDirectory: './data/vector_db',
        totalDocuments: 65,
        totalEmbeddings: 65,
        lastUpdated: new Date(),
      },
    }),
    prisma.chromaDBCollection.upsert({
      where: { collectionName: 'question_embeddings' },
      update: {},
      create: {
        collectionName: 'question_embeddings',
        description: '생성된 문제의 벡터 임베딩 컬렉션',
        persistDirectory: './data/vector_db',
        totalDocuments: 3,
        totalEmbeddings: 3,
        lastUpdated: new Date(),
      },
    }),
  ]);

  // ChromaDB 임베딩 데이터 생성
  const chromaEmbeddings = [];
  for (let i = 0; i < 10; i++) {
    chromaEmbeddings.push({
      collectionId: chromaCollections[0].id,
      documentId: `doc_${i}`,
      content: `교과서 내용 ${i + 1}번째 청크입니다.`,
      embedding: JSON.stringify(Array.from({ length: 1536 }, () => Math.random())),
      metadata: JSON.stringify({
        subject: ['수학', '과학', '국어', '영어'][i % 4],
        gradeLevel: ['중1', '중2', '중3'][i % 3],
        chunkIndex: i,
      }),
      similarityScore: 0.9 - i * 0.05,
      distance: 0.1 + i * 0.02,
    });
  }

  await Promise.all(
    chromaEmbeddings.map((embedding) =>
      prisma.chromaDBEmbedding.create({
        data: embedding,
      }),
    ),
  );

  // 샘플 데이터 템플릿 생성
  const sampleTemplates = await Promise.all([
    prisma.sampleDataTemplate.create({
      data: {
        templateName: 'excellent_class',
        templateType: 'excellent',
        description: '우수한 학급 샘플 데이터',
        dataStructure: JSON.stringify({
          students: [
            { id: 1, name: '김우수', math: 95, korean: 92, english: 88 },
            { id: 2, name: '이영재', math: 98, korean: 95, english: 90 },
          ],
          classInfo: { grade: 2, classNum: 1, totalStudents: 30 },
        }),
        isActive: true,
        createdBy: admin.id,
      },
    }),
    prisma.sampleDataTemplate.create({
      data: {
        templateName: 'normal_class',
        templateType: 'normal',
        description: '일반적인 학급 샘플 데이터',
        dataStructure: JSON.stringify({
          students: [
            { id: 1, name: '김보통', math: 75, korean: 78, english: 72 },
            { id: 2, name: '이평균', math: 80, korean: 82, english: 76 },
          ],
          classInfo: { grade: 2, classNum: 2, totalStudents: 30 },
        }),
        isActive: true,
        createdBy: admin.id,
      },
    }),
    prisma.sampleDataTemplate.create({
      data: {
        templateName: 'problematic_class',
        templateType: 'problematic',
        description: '학습 부진 학급 샘플 데이터',
        dataStructure: JSON.stringify({
          students: [
            { id: 1, name: '김부진', math: 45, korean: 52, english: 48 },
            { id: 2, name: '이어려움', math: 58, korean: 62, english: 55 },
          ],
          classInfo: { grade: 2, classNum: 3, totalStudents: 30 },
        }),
        isActive: true,
        createdBy: admin.id,
      },
    }),
  ]);

  // 문제 생성 히스토리 데이터
  const questionHistories = await Promise.all([
    prisma.questionHistory.create({
      data: {
        questionId: aiQuestions[0].id,
        questionText: aiQuestions[0].questionText,
        subject: aiQuestions[0].subject,
        difficulty: aiQuestions[0].difficulty,
        generatedAt: new Date(),
        modelUsed: 'gpt-4',
        tokensUsed: 1200,
        costUsd: 0.05,
        userId: teachers[0].id,
      },
    }),
    prisma.questionHistory.create({
      data: {
        questionId: aiQuestions[1].id,
        questionText: aiQuestions[1].questionText,
        subject: aiQuestions[1].subject,
        difficulty: aiQuestions[1].difficulty,
        generatedAt: new Date(),
        modelUsed: 'gpt-4',
        tokensUsed: 1500,
        costUsd: 0.07,
        userId: teachers[1].id,
      },
    }),
  ]);

  logger.info('✅ 시드 데이터 생성이 완료되었습니다!');
  logger.info(`👨‍💼 관리자: ${admin.name} (${admin.email})`);
  logger.info(`👨‍🏫 교사: ${teachers.length}명`);
  logger.info(`👨‍🎓 학생: ${students.length}명`);
  logger.info(`📝 문제: ${problems.length}개`);
  logger.info(`📊 학습 진도: ${progressData.length}개`);
  logger.info(`📈 분석 리포트: ${reportData.length}개`);
  logger.info(`🎯 진로 상담: ${counselingData.length}개`);
  logger.info(`📋 교사 리포트: ${teacherReportData.length}개`);
  logger.info(`📚 교과서: ${textbooks.length}개`);
  logger.info(`📄 문서 청크: ${documentChunks.length}개`);
  logger.info(`🤖 AI 생성 문제: ${aiQuestions.length}개`);
  logger.info(`🔍 검색 쿼리: ${searchQueries.length}개`);
  logger.info(`🔗 검색 결과: ${searchResults.length}개`);
  logger.info(`🖥️ AI 서버 상태: ${aiServerStatuses.length}개`);
  logger.info(`🔄 AI 서버 동기화: ${aiServerSyncs.length}개`);
  logger.info(`📊 API 사용량: ${apiUsages.length}개`);
  logger.info(`⚡ 성능 지표: ${performanceMetrics.length}개`);
  logger.info(`📈 사용 통계: ${usageStatistics.length}개`);
  logger.info(`🗄️ ChromaDB 컬렉션: ${chromaCollections.length}개`);
  logger.info(`🔢 ChromaDB 임베딩: ${chromaEmbeddings.length}개`);
  logger.info(`📋 샘플 템플릿: ${sampleTemplates.length}개`);
  logger.info(`📝 문제 히스토리: ${questionHistories.length}개`);
}

main()
  .catch((e) => {
    console.error('❌ 시드 데이터 생성 중 오류 발생:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
