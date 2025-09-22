import { PrismaClient } from '@prisma/client';
import { logger } from '../src/lib/monitoring';

const prisma = new PrismaClient();

/**
 * 성능 테스트를 위한 대량 데이터 생성
 */
async function generatePerformanceTestData() {
  logger.info('🚀 성능 테스트용 대량 데이터 생성을 시작합니다...');

  try {
    // 1. 대량 사용자 생성 (100명)
    const users = [];
    for (let i = 1; i <= 100; i++) {
      const role = i <= 10 ? 'ADMIN' : i <= 30 ? 'TEACHER' : 'STUDENT';
      const user = await prisma.user.create({
        data: {
          name: `테스트사용자${i}`,
          email: `testuser${i}@example.com`,
          role,
          status: 'ACTIVE',
          school: i <= 30 ? 'EduBridge 테스트학교' : undefined,
          subject: i <= 30 ? ['수학', '과학', '영어'][i % 3] : undefined,
          grade: role === 'STUDENT' ? `중${(i % 3) + 1}` : undefined,
        },
      });
      users.push(user);
    }

    // 2. 대량 문제 생성 (500개)
    const problems = [];
    const subjects = ['수학', '과학', '영어', '국어', '사회'];
    const difficulties = ['EASY', 'MEDIUM', 'HARD'];
    const types = ['MULTIPLE_CHOICE', 'SHORT_ANSWER', 'ESSAY'];

    for (let i = 1; i <= 500; i++) {
      const subject = subjects[i % subjects.length];
      const difficulty = difficulties[i % difficulties.length];
      const type = types[i % types.length];
      const teacher = users.find((u) => u.role === 'TEACHER' && u.subject === subject) || users[1];

      const problem = await prisma.problem.create({
        data: {
          title: `${subject} 테스트 문제 ${i}`,
          description: `${subject} 과목의 ${difficulty} 난이도 문제입니다.`,
          content: `이것은 ${subject} 과목의 ${i}번째 테스트 문제입니다. ${difficulty} 난이도로 출제되었습니다.`,
          subject,
          gradeLevel: `중${(i % 3) + 1}`,
          type: type as any,
          difficulty: difficulty as any,
          options:
            type === 'MULTIPLE_CHOICE'
              ? JSON.stringify(['선택지1', '선택지2', '선택지3', '선택지4'])
              : JSON.stringify([]),
          correctAnswer: type === 'MULTIPLE_CHOICE' ? '선택지1' : `정답 ${i}`,
          explanation: `문제 ${i}의 해설입니다.`,
          hints: JSON.stringify([`힌트1: ${subject} 관련`, `힌트2: ${difficulty} 난이도`]),
          tags: JSON.stringify([subject, difficulty, `문제${i}`]),
          points: Math.floor(Math.random() * 10) + 1,
          timeLimit: Math.floor(Math.random() * 600) + 60,
          isActive: true,
          isAIGenerated: Math.random() > 0.5,
          reviewStatus: 'APPROVED',
          reviewedBy: teacher.id,
          reviewedAt: new Date(),
        },
      });
      problems.push(problem);
    }

    // 3. 대량 검색 쿼리 생성 (1000개)
    const searchQueries = [];
    for (let i = 1; i <= 1000; i++) {
      const user = users[Math.floor(Math.random() * users.length)];
      const query = await prisma.searchQuery.create({
        data: {
          queryText: `테스트 검색 쿼리 ${i}`,
          subject: subjects[i % subjects.length],
          gradeLevel: `중${(i % 3) + 1}`,
          unit: `단원${(i % 10) + 1}`,
          resultsCount: Math.floor(Math.random() * 20) + 1,
          searchTimeMs: Math.floor(Math.random() * 1000) + 100,
          userId: user.id,
          sessionId: `session_${i}`,
        },
      });
      searchQueries.push(query);
    }

    // 4. 대량 AI 사용량 데이터 생성 (200개)
    const aiUsages = [];
    for (let i = 1; i <= 200; i++) {
      const user = users[Math.floor(Math.random() * users.length)];
      const usage = await prisma.aIApiUsage.create({
        data: {
          userId: user.id,
          apiType: ['question_generation', 'context_search', 'text_analysis'][i % 3] as any,
          modelName: ['gpt-4', 'gpt-3.5-turbo', 'claude-3'][i % 3],
          tokensUsed: Math.floor(Math.random() * 2000) + 100,
          costUsd: Math.random() * 0.1,
          requestCount: Math.floor(Math.random() * 5) + 1,
          responseTimeMs: Math.floor(Math.random() * 5000) + 500,
          success: Math.random() > 0.1, // 90% 성공률
          errorMessage: Math.random() > 0.9 ? '테스트 에러' : null,
        },
      });
      aiUsages.push(usage);
    }

    logger.info('✅ 성능 테스트용 대량 데이터 생성 완료', {
      users: users.length,
      problems: problems.length,
      searchQueries: searchQueries.length,
      aiUsages: aiUsages.length,
    });
  } catch (error) {
    logger.error(
      '❌ 성능 테스트 데이터 생성 중 오류 발생',
      error instanceof Error ? error : undefined,
    );
    throw error;
  }
}

/**
 * 벡터 검색 테스트를 위한 데이터 생성
 */
async function generateVectorSearchTestData() {
  logger.info('🔍 벡터 검색 테스트용 데이터 생성을 시작합니다...');

  try {
    // ChromaDB 컬렉션 생성
    const collections = await Promise.all([
      prisma.chromaDBCollection.upsert({
        where: { collectionName: 'test_problems' },
        update: {},
        create: {
          collectionName: 'test_problems',
          description: '테스트용 문제 임베딩 컬렉션',
          persistDirectory: './chroma/test_problems',
          totalDocuments: 0,
          totalEmbeddings: 0,
          lastUpdated: new Date(),
        },
      }),
      prisma.chromaDBCollection.upsert({
        where: { collectionName: 'test_materials' },
        update: {},
        create: {
          collectionName: 'test_materials',
          description: '테스트용 학습자료 임베딩 컬렉션',
          persistDirectory: './chroma/test_materials',
          totalDocuments: 0,
          totalEmbeddings: 0,
          lastUpdated: new Date(),
        },
      }),
    ]);

    // 벡터 임베딩 데이터 생성 (50개)
    const embeddings = [];
    for (let i = 1; i <= 50; i++) {
      const collection = collections[i % 2];
      const embedding = await prisma.chromaDBEmbedding.create({
        data: {
          collectionId: collection.id,
          documentId: `test_doc_${i}`,
          content: `테스트 문서 ${i}의 내용입니다. 이 문서는 벡터 검색 테스트를 위해 생성되었습니다.`,
          embedding: JSON.stringify(new Array(1536).fill(0).map(() => Math.random() - 0.5)),
          metadata: JSON.stringify({
            subject: ['수학', '과학', '영어'][i % 3],
            difficulty: ['EASY', 'MEDIUM', 'HARD'][i % 3],
            gradeLevel: `중${(i % 3) + 1}`,
            testData: true,
          }),
        },
      });
      embeddings.push(embedding);
    }

    logger.info('✅ 벡터 검색 테스트용 데이터 생성 완료', {
      collections: collections.length,
      embeddings: embeddings.length,
    });
  } catch (error) {
    logger.error(
      '❌ 벡터 검색 테스트 데이터 생성 중 오류 발생',
      error instanceof Error ? error : undefined,
    );
    throw error;
  }
}

/**
 * 스트레스 테스트를 위한 데이터 생성
 */
async function generateStressTestData() {
  logger.info('⚡ 스트레스 테스트용 데이터 생성을 시작합니다...');

  try {
    // 동시 요청 시뮬레이션을 위한 대량 세션 데이터
    const sessions = [];
    for (let i = 1; i <= 1000; i++) {
      const session = await prisma.searchQuery.create({
        data: {
          queryText: `스트레스 테스트 쿼리 ${i}`,
          subject: '수학',
          gradeLevel: '중1',
          unit: '스트레스테스트',
          resultsCount: 0,
          searchTimeMs: Math.floor(Math.random() * 100) + 10,
          userId: 'test_user_id',
          sessionId: `stress_session_${i}`,
        },
      });
      sessions.push(session);
    }

    logger.info('✅ 스트레스 테스트용 데이터 생성 완료', {
      sessions: sessions.length,
    });
  } catch (error) {
    logger.error(
      '❌ 스트레스 테스트 데이터 생성 중 오류 발생',
      error instanceof Error ? error : undefined,
    );
    throw error;
  }
}

/**
 * 메인 실행 함수
 */
async function main() {
  const args = process.argv.slice(2);
  const testType = args[0] || 'all';

  try {
    switch (testType) {
      case 'performance':
        await generatePerformanceTestData();
        break;
      case 'vector':
        await generateVectorSearchTestData();
        break;
      case 'stress':
        await generateStressTestData();
        break;
      case 'all':
        await generatePerformanceTestData();
        await generateVectorSearchTestData();
        await generateStressTestData();
        break;
      default:
        console.log('사용법: npm run test-data [performance|vector|stress|all]');
        process.exit(1);
    }

    logger.info('🎉 모든 테스트 데이터 생성이 완료되었습니다!');
  } catch (error) {
    logger.error('❌ 테스트 데이터 생성 실패', error instanceof Error ? error : undefined);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
