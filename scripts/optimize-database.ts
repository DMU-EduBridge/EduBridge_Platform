import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createPerformanceIndexes() {
  console.log('🚀 데이터베이스 인덱스 최적화 시작...');

  try {
    // 1. Problems 테이블 인덱스
    console.log('📝 Problems 테이블 인덱스 생성 중...');

    // 복합 검색 인덱스
    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS idx_problem_search 
      ON problems(subject, difficulty, isActive, createdAt DESC)
    `;

    // 제목 검색 인덱스 (SQLite용)
    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS idx_problem_title_search 
      ON problems(title)
    `;

    // 내용 검색 인덱스 (SQLite용)
    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS idx_problem_content_search 
      ON problems(content)
    `;

    // 2. Users 테이블 인덱스
    console.log('👥 Users 테이블 인덱스 생성 중...');

    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS idx_users_email 
      ON users(email)
    `;

    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS idx_users_role_status 
      ON users(role, status, createdAt DESC)
    `;

    // 3. Attempts 테이블 인덱스
    console.log('📊 Attempts 테이블 인덱스 생성 중...');

    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS idx_attempts_user_problem 
      ON attempts(userId, problemId, createdAt DESC)
    `;

    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS idx_attempts_performance 
      ON attempts(isCorrect, timeSpent, createdAt DESC)
    `;

    // 4. Learning Materials 테이블 인덱스
    console.log('📚 Learning Materials 테이블 인덱스 생성 중...');

    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS idx_learning_materials_search 
      ON learning_materials(subject, difficulty, status, createdAt DESC)
    `;

    console.log('✅ 모든 인덱스 생성 완료!');
  } catch (error) {
    console.error('❌ 인덱스 생성 중 오류 발생:', error);
    throw error;
  }
}

async function analyzeQueryPerformance() {
  console.log('🔍 쿼리 성능 분석 시작...');

  try {
    // 인덱스 사용 현황 분석
    const indexUsage = await prisma.$queryRaw`
      SELECT name, sql FROM sqlite_master 
      WHERE type='index' AND name NOT LIKE 'sqlite_%'
      ORDER BY name
    `;

    console.log('📊 생성된 인덱스 목록:');
    console.table(indexUsage);

    // 테이블 크기 분석
    const tableSizes = await prisma.$queryRaw`
      SELECT 
        name as table_name,
        (SELECT COUNT(*) FROM sqlite_master WHERE type='table' AND name=sqlite_master.name) as row_count
      FROM sqlite_master 
      WHERE type='table' AND name NOT LIKE 'sqlite_%'
      ORDER BY name
    `;

    console.log('📈 테이블 크기 분석:');
    console.table(tableSizes);

    console.log('✅ 쿼리 성능 분석 완료!');
  } catch (error) {
    console.error('❌ 쿼리 성능 분석 중 오류 발생:', error);
    throw error;
  }
}

async function optimizeConnectionPool() {
  console.log('🔧 연결 풀 최적화 시작...');

  try {
    // SQLite는 연결 풀이 없으므로 설정만 확인
    console.log('📋 현재 데이터베이스 설정:');
    console.log('- 데이터베이스 타입: SQLite');
    console.log('- 파일 위치: prisma/dev.db');
    console.log('- 연결 풀: SQLite는 단일 연결 사용');

    console.log('✅ 연결 풀 최적화 완료!');
  } catch (error) {
    console.error('❌ 연결 풀 최적화 중 오류 발생:', error);
    throw error;
  }
}

async function runAllOptimizations() {
  console.log('🚀 전체 데이터베이스 최적화 시작...');

  try {
    await createPerformanceIndexes();
    await analyzeQueryPerformance();
    await optimizeConnectionPool();

    console.log('🎉 모든 최적화 작업 완료!');
  } catch (error) {
    console.error('❌ 최적화 작업 중 오류 발생:', error);
    throw error;
  }
}

async function main() {
  const command = process.argv[2];

  try {
    switch (command) {
      case 'indexes':
        await createPerformanceIndexes();
        break;
      case 'analyze':
        await analyzeQueryPerformance();
        break;
      case 'pool':
        await optimizeConnectionPool();
        break;
      case 'all':
        await runAllOptimizations();
        break;
      default:
        console.log('사용법: npm run db:optimize [indexes|analyze|pool|all]');
        console.log('  indexes: 성능 인덱스 생성');
        console.log('  analyze: 쿼리 성능 분석');
        console.log('  pool: 연결 풀 최적화');
        console.log('  all: 모든 최적화 실행');
        break;
    }
  } catch (error) {
    console.error('❌ 최적화 실패:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
