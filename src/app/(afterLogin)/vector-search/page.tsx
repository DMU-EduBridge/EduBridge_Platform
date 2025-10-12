import { VectorDatabaseMonitor } from '@/components/vector/vector-database-monitor';
import { VectorSearchCard } from '@/components/vector/vector-search-card';

export default function VectorSearchPage() {
  return (
    <div className="container mx-auto space-y-6 p-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">의미적 검색</h1>
        <p className="text-muted-foreground">
          AI 벡터 임베딩을 사용하여 문제와 학습자료를 의미적으로 검색합니다.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* 검색 카드 */}
        <div className="lg:col-span-2">
          <VectorSearchCard />
        </div>

        {/* 벡터 데이터베이스 모니터 */}
        <div className="lg:col-span-1">
          <VectorDatabaseMonitor />
        </div>
      </div>
    </div>
  );
}
