import { PrismaClient } from '@prisma/client';
import { logger } from '../src/lib/monitoring';

const prisma = new PrismaClient();

/**
 * API 테스트를 위한 더미 데이터 생성
 */
export class DummyDataGenerator {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = prisma;
  }

  /**
   * 랜덤 사용자 생성
   */
  async generateRandomUsers(count: number = 10) {
    const users = [];
    const roles = ['STUDENT', 'TEACHER', 'ADMIN'];
    const subjects = ['수학', '과학', '영어', '국어', '사회'];
    const grades = ['중1', '중2', '중3', '고1', '고2', '고3'];

    for (let i = 0; i < count; i++) {
      const role = roles[Math.floor(Math.random() * roles.length)];
      const user = await this.prisma.user.create({
        data: {
          name: `더미사용자${i + 1}`,
          email: `dummy${i + 1}@test.com`,
          role: role as any,
          status: 'ACTIVE',
          school: role === 'TEACHER' ? '테스트학교' : undefined,
          subject:
            role === 'TEACHER' ? subjects[Math.floor(Math.random() * subjects.length)] : undefined,
          grade: role === 'STUDENT' ? grades[Math.floor(Math.random() * grades.length)] : undefined,
        },
      });
      users.push(user);
    }

    logger.info(`✅ ${count}명의 랜덤 사용자 생성 완료`);
    return users;
  }

  /**
   * 랜덤 문제 생성
   */
  async generateRandomProblems(count: number = 20, teacherId?: string) {
    const problems = [];
    const subjects = ['수학', '과학', '영어', '국어', '사회'];
    const difficulties = ['EASY', 'MEDIUM', 'HARD'];
    const types = ['MULTIPLE_CHOICE', 'SHORT_ANSWER', 'ESSAY', 'TRUE_FALSE'];
    const grades = ['중1', '중2', '중3', '고1', '고2', '고3'];

    // 교사가 없으면 랜덤으로 선택
    if (!teacherId) {
      const teachers = await this.prisma.user.findMany({
        where: { role: 'TEACHER' },
        take: 1,
      });
      teacherId = teachers[0]?.id;
    }

    for (let i = 0; i < count; i++) {
      const subject = subjects[Math.floor(Math.random() * subjects.length)];
      const difficulty = difficulties[Math.floor(Math.random() * difficulties.length)];
      const type = types[Math.floor(Math.random() * types.length)];
      const grade = grades[Math.floor(Math.random() * grades.length)];

      const problem = await this.prisma.problem.create({
        data: {
          title: `${subject} 더미 문제 ${i + 1}`,
          description: `${subject} 과목의 ${difficulty} 난이도 문제입니다.`,
          content: `이것은 ${subject} 과목의 ${i + 1}번째 더미 문제입니다. ${difficulty} 난이도로 출제되었습니다.`,
          subject,
          gradeLevel: grade,
          type: type as any,
          difficulty: difficulty as any,
          options:
            type === 'MULTIPLE_CHOICE' || type === 'TRUE_FALSE'
              ? JSON.stringify(['선택지1', '선택지2', '선택지3', '선택지4'])
              : JSON.stringify([]),
          correctAnswer:
            type === 'MULTIPLE_CHOICE' || type === 'TRUE_FALSE' ? '선택지1' : `정답 ${i + 1}`,
          explanation: `문제 ${i + 1}의 해설입니다.`,
          hints: JSON.stringify([`힌트1: ${subject} 관련`, `힌트2: ${difficulty} 난이도`]),
          tags: JSON.stringify([subject, difficulty, `더미문제${i + 1}`]),
          points: Math.floor(Math.random() * 10) + 1,
          timeLimit: Math.floor(Math.random() * 600) + 60,
          isActive: true,
          isAIGenerated: Math.random() > 0.5,
          reviewStatus: 'APPROVED',
          reviewedBy: teacherId,
          reviewedAt: new Date(),
        },
      });
      problems.push(problem);
    }

    logger.info(`✅ ${count}개의 랜덤 문제 생성 완료`);
    return problems;
  }

  /**
   * 랜덤 교과서 생성
   */
  async generateRandomTextbooks(count: number = 5, teacherId?: string) {
    const textbooks = [];
    const subjects = ['수학', '과학', '영어', '국어', '사회'];
    const grades = ['중1', '중2', '중3', '고1', '고2', '고3'];
    const publishers = ['교육부', '비상교육', '천재교육', '지학사'];

    // 교사가 없으면 랜덤으로 선택
    if (!teacherId) {
      const teachers = await this.prisma.user.findMany({
        where: { role: 'TEACHER' },
        take: 1,
      });
      teacherId = teachers[0]?.id;
    }

    for (let i = 0; i < count; i++) {
      const subject = subjects[Math.floor(Math.random() * subjects.length)];
      const grade = grades[Math.floor(Math.random() * grades.length)];
      const publisher = publishers[Math.floor(Math.random() * publishers.length)];

      const textbook = await this.prisma.textbook.create({
        data: {
          title: `${grade} ${subject} 교과서`,
          subject,
          gradeLevel: grade,
          publisher,
          fileName: `${subject}_${grade}_${i + 1}.pdf`,
          filePath: `/uploads/${subject}_${grade}_${i + 1}.pdf`,
          fileSize: Math.floor(Math.random() * 2000000) + 500000,
          mimeType: 'application/pdf',
          totalChunks: Math.floor(Math.random() * 30) + 10,
          processingStatus: 'COMPLETED',
          uploadedBy: teacherId,
        },
      });
      textbooks.push(textbook);
    }

    logger.info(`✅ ${count}개의 랜덤 교과서 생성 완료`);
    return textbooks;
  }

  /**
   * 랜덤 검색 쿼리 생성
   */
  async generateRandomSearchQueries(count: number = 50) {
    const queries = [];
    const subjects = ['수학', '과학', '영어', '국어', '사회'];
    const grades = ['중1', '중2', '중3', '고1', '고2', '고3'];
    const searchTerms = [
      '문제',
      '해설',
      '풀이',
      '개념',
      '정리',
      '예제',
      '연습',
      '시험',
      '복습',
      '심화',
    ];

    const users = await this.prisma.user.findMany({
      where: { role: 'TEACHER' },
      take: 10,
    });

    for (let i = 0; i < count; i++) {
      const subject = subjects[Math.floor(Math.random() * subjects.length)];
      const grade = grades[Math.floor(Math.random() * grades.length)];
      const term = searchTerms[Math.floor(Math.random() * searchTerms.length)];
      const user = users[Math.floor(Math.random() * users.length)];

      const query = await this.prisma.searchQuery.create({
        data: {
          queryText: `${subject} ${term} ${grade}`,
          subject,
          gradeLevel: grade,
          unit: `단원${Math.floor(Math.random() * 10) + 1}`,
          resultsCount: Math.floor(Math.random() * 20) + 1,
          searchTimeMs: Math.floor(Math.random() * 1000) + 100,
          userId: user.id,
          sessionId: `session_${i + 1}`,
        },
      });
      queries.push(query);
    }

    logger.info(`✅ ${count}개의 랜덤 검색 쿼리 생성 완료`);
    return queries;
  }

  /**
   * 랜덤 AI 사용량 데이터 생성
   */
  async generateRandomAIUsage(count: number = 30) {
    const usages = [];
    const apiTypes = ['question_generation', 'context_search', 'text_analysis'];
    const models = ['gpt-4', 'gpt-3.5-turbo', 'claude-3'];

    const users = await this.prisma.user.findMany({
      where: { role: 'TEACHER' },
      take: 10,
    });

    for (let i = 0; i < count; i++) {
      const apiType = apiTypes[Math.floor(Math.random() * apiTypes.length)];
      const model = models[Math.floor(Math.random() * models.length)];
      const user = users[Math.floor(Math.random() * users.length)];

      const usage = await this.prisma.aIApiUsage.create({
        data: {
          userId: user.id,
          apiType: apiType as any,
          modelName: model,
          tokensUsed: Math.floor(Math.random() * 2000) + 100,
          costUsd: Math.random() * 0.1,
          requestCount: Math.floor(Math.random() * 5) + 1,
          responseTimeMs: Math.floor(Math.random() * 5000) + 500,
          success: Math.random() > 0.1,
          errorMessage: Math.random() > 0.9 ? '테스트 에러' : null,
        },
      });
      usages.push(usage);
    }

    logger.info(`✅ ${count}개의 랜덤 AI 사용량 데이터 생성 완료`);
    return usages;
  }

  /**
   * 모든 더미 데이터 생성
   */
  async generateAllDummyData() {
    logger.info('🎭 모든 더미 데이터 생성을 시작합니다...');

    try {
      const users = await this.generateRandomUsers(20);
      const teachers = users.filter((u) => u.role === 'TEACHER');
      const teacherId = teachers[0]?.id;

      const problems = await this.generateRandomProblems(50, teacherId);
      const textbooks = await this.generateRandomTextbooks(10, teacherId);
      const queries = await this.generateRandomSearchQueries(100);
      const aiUsages = await this.generateRandomAIUsage(50);

      logger.info('🎉 모든 더미 데이터 생성이 완료되었습니다!', {
        users: users.length,
        problems: problems.length,
        textbooks: textbooks.length,
        queries: queries.length,
        aiUsages: aiUsages.length,
      });

      return {
        users,
        problems,
        textbooks,
        queries,
        aiUsages,
      };
    } catch (error) {
      logger.error('❌ 더미 데이터 생성 실패', error instanceof Error ? error : undefined);
      throw error;
    }
  }

  /**
   * 데이터베이스 초기화 (모든 더미 데이터 삭제)
   */
  async clearAllDummyData() {
    logger.info('🧹 더미 데이터 삭제를 시작합니다...');

    try {
      // 외래키 제약조건 때문에 순서대로 삭제
      await this.prisma.aIApiUsage.deleteMany({
        where: { userId: { contains: 'dummy' } },
      });

      await this.prisma.searchQuery.deleteMany({
        where: { userId: { contains: 'dummy' } },
      });

      await this.prisma.problem.deleteMany({
        where: { title: { contains: '더미' } },
      });

      await this.prisma.textbook.deleteMany({
        where: { title: { contains: '교과서' } },
      });

      await this.prisma.user.deleteMany({
        where: { email: { contains: 'dummy' } },
      });

      logger.info('✅ 모든 더미 데이터가 삭제되었습니다.');
    } catch (error) {
      logger.error('❌ 더미 데이터 삭제 실패', error instanceof Error ? error : undefined);
      throw error;
    }
  }
}

// CLI 실행을 위한 메인 함수
async function main() {
  const args = process.argv.slice(2);
  const command = args[0] || 'generate';

  const generator = new DummyDataGenerator();

  try {
    switch (command) {
      case 'generate':
        await generator.generateAllDummyData();
        break;
      case 'clear':
        await generator.clearAllDummyData();
        break;
      case 'users':
        await generator.generateRandomUsers(parseInt(args[1]) || 10);
        break;
      case 'problems':
        await generator.generateRandomProblems(parseInt(args[1]) || 20);
        break;
      case 'textbooks':
        await generator.generateRandomTextbooks(parseInt(args[1]) || 5);
        break;
      case 'queries':
        await generator.generateRandomSearchQueries(parseInt(args[1]) || 50);
        break;
      case 'ai-usage':
        await generator.generateRandomAIUsage(parseInt(args[1]) || 30);
        break;
      default:
        console.log(`
사용법: npm run dummy-data [command] [count]

Commands:
  generate    - 모든 더미 데이터 생성 (기본값)
  clear       - 모든 더미 데이터 삭제
  users       - 사용자 생성 [count]
  problems    - 문제 생성 [count]
  textbooks   - 교과서 생성 [count]
  queries     - 검색 쿼리 생성 [count]
  ai-usage    - AI 사용량 데이터 생성 [count]

Examples:
  npm run dummy-data generate
  npm run dummy-data users 20
  npm run dummy-data problems 50
  npm run dummy-data clear
        `);
        process.exit(1);
    }
  } catch (error) {
    logger.error('❌ 더미 데이터 작업 실패', error instanceof Error ? error : undefined);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// 직접 실행된 경우에만 main 함수 호출
if (require.main === module) {
  main();
}

export default DummyDataGenerator;
