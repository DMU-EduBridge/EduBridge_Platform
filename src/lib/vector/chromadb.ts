import { logger } from '@/lib/monitoring';
import { ChromaClient, Collection } from 'chromadb';

/**
 * ChromaDB 클라이언트 설정
 */
class ChromaDBClient {
  private client: ChromaClient | null = null;
  private collections: Map<string, Collection> = new Map();

  constructor() {
    this.initializeClient();
  }

  /**
   * ChromaDB 클라이언트 초기화
   */
  private async initializeClient() {
    try {
      // 개발 환경에서는 로컬 ChromaDB 사용
      // 프로덕션에서는 외부 ChromaDB 서버 사용
      const chromaUrl = process.env.CHROMA_URL || 'http://localhost:8000';

      this.client = new ChromaClient({
        path: chromaUrl,
      });

      // 연결 테스트
      await this.client.heartbeat();
      logger.info('ChromaDB 클라이언트 초기화 완료', { url: chromaUrl });

      // 컬렉션 초기화
      await this.initializeCollections();
    } catch (error) {
      logger.error('ChromaDB 클라이언트 초기화 실패', undefined, {
        error: error instanceof Error ? error.message : String(error),
      });
      throw new Error('ChromaDB 연결에 실패했습니다.');
    }
  }

  /**
   * 컬렉션 초기화
   */
  private async initializeCollections() {
    if (!this.client) return;

    const collections = [
      {
        name: 'problems',
        metadata: {
          description: '문제 데이터의 벡터 임베딩',
          type: 'problem',
        },
      },
      {
        name: 'learning_materials',
        metadata: {
          description: '학습자료 데이터의 벡터 임베딩',
          type: 'learning_material',
        },
      },
    ];

    for (const collectionConfig of collections) {
      try {
        let collection: Collection;

        // 기존 컬렉션이 있는지 확인
        try {
          collection = await this.client.getCollection({
            name: collectionConfig.name,
          });
          logger.info(`기존 컬렉션 사용: ${collectionConfig.name}`);
        } catch {
          // 컬렉션이 없으면 새로 생성
          collection = await this.client.createCollection({
            name: collectionConfig.name,
            metadata: collectionConfig.metadata,
          });
          logger.info(`새 컬렉션 생성: ${collectionConfig.name}`);
        }

        this.collections.set(collectionConfig.name, collection);
      } catch (error) {
        logger.error(`컬렉션 초기화 실패: ${collectionConfig.name}`, undefined, {
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }
  }

  /**
   * 컬렉션 가져오기
   */
  getCollection(name: string): Collection | null {
    return this.collections.get(name) || null;
  }

  /**
   * 문제 컬렉션 가져오기
   */
  getProblemsCollection(): Collection | null {
    return this.getCollection('problems');
  }

  /**
   * 학습자료 컬렉션 가져오기
   */
  getLearningMaterialsCollection(): Collection | null {
    return this.getCollection('learning_materials');
  }

  /**
   * 클라이언트 상태 확인
   */
  async isHealthy(): Promise<boolean> {
    try {
      if (!this.client) return false;
      await this.client.heartbeat();
      return true;
    } catch {
      return false;
    }
  }

  /**
   * 모든 컬렉션 정보 가져오기
   */
  async getCollectionsInfo() {
    if (!this.client) return [];

    try {
      const collections = await this.client.listCollections();
      return collections.map((collection) => ({
        name: collection.name,
        metadata: collection.metadata,
        count: collection.count(),
      }));
    } catch (error) {
      logger.error('컬렉션 정보 조회 실패', undefined, {
        error: error instanceof Error ? error.message : String(error),
      });
      return [];
    }
  }
}

// 싱글톤 인스턴스
export const chromaClient = new ChromaDBClient();

// 타입 정의
export interface VectorDocument {
  id: string;
  content: string;
  metadata: {
    type: 'problem' | 'learning_material';
    subject?: string;
    difficulty?: string;
    tags?: string[];
    createdAt?: string;
    [key: string]: any;
  };
}

export interface SearchResult {
  id: string;
  content: string;
  metadata: Record<string, any>;
  distance: number;
  score: number;
}
