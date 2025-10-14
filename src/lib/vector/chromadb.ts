import { logger } from '@/lib/monitoring';
import { ChromaClient } from 'chromadb';

// ChromaDB 3.x 타입 정의 - 실제 사용하는 매개변수만 포함
interface ChromaCollection {
  name: string;
  metadata?: Record<string, any>;
  count(): Promise<number>;
  add(args: {
    ids: string[];
    embeddings?: number[][];
    metadatas?: Record<string, any>[];
    documents?: string[];
    uris?: string[];
  }): Promise<void>;
  query(args: {
    queryEmbeddings?: number[][];
    queryTexts?: string[];
    queryURIs?: string[];
    ids?: string[];
    nResults?: number;
    where?: Record<string, any>;
    whereDocument?: Record<string, any>;
    include?: string[];
  }): Promise<{
    ids: string[][];
    documents: (string | null)[][];
    metadatas: (Record<string, any> | null)[][];
    distances: (number | null)[][];
  }>;
  delete(args: {
    ids?: string[];
    where?: Record<string, any>;
    whereDocument?: Record<string, any>;
  }): Promise<void>;
}

type Collection = ChromaCollection;

/**
 * ChromaDB 클라이언트 설정
 */
class ChromaDBClient {
  private client: ChromaClient | null = null;
  private collections: Map<string, Collection> = new Map();
  private initializationPromise: Promise<void> | null = null;

  constructor() {
    // 지연 초기화 - 실제 사용할 때만 초기화
  }

  /**
   * ChromaDB 클라이언트 초기화 (지연 초기화)
   */
  private async initializeClient(): Promise<void> {
    if (this.initializationPromise) {
      return this.initializationPromise;
    }

    this.initializationPromise = this._doInitialize();
    return this.initializationPromise;
  }

  private async _doInitialize(): Promise<void> {
    try {
      // 환경별 ChromaDB URL 설정
      const chromaUrl = this.getChromaUrl();

      this.client = new ChromaClient({
        path: chromaUrl,
      });

      // 연결 테스트 (타임아웃 설정)
      await Promise.race([
        this.client.heartbeat(),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Connection timeout')), 5000)),
      ]);

      logger.info('ChromaDB 클라이언트 초기화 완료', { url: chromaUrl });

      // 컬렉션 초기화
      await this.initializeCollections();
    } catch (error) {
      logger.error('ChromaDB 클라이언트 초기화 실패', error instanceof Error ? error : undefined, {
        error: error instanceof Error ? error.message : String(error),
      });
      // 초기화 실패 시 재시도 가능하도록 promise 초기화
      this.initializationPromise = null;
      throw new Error('ChromaDB 연결에 실패했습니다.');
    }
  }

  private getChromaUrl(): string {
    // 환경별 URL 설정
    if (process.env.NODE_ENV === 'production') {
      return process.env.CHROMA_URL || process.env.CHROMA_PRODUCTION_URL || 'http://chromadb:8000';
    }
    return process.env.CHROMA_URL || 'http://localhost:8000';
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
          collection = (await this.client.getCollection({
            name: collectionConfig.name,
          })) as ChromaCollection & { metadata: Record<string, any> };
          logger.info(`기존 컬렉션 사용: ${collectionConfig.name}`);
        } catch {
          // 컬렉션이 없으면 새로 생성
          collection = (await this.client.createCollection({
            name: collectionConfig.name,
            metadata: collectionConfig.metadata,
          })) as ChromaCollection & { metadata: Record<string, any> };
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
   * 컬렉션 가져오기 (지연 초기화)
   */
  async getCollection(name: string): Promise<Collection | null> {
    await this.initializeClient();
    return this.collections.get(name) || null;
  }

  /**
   * 문제 컬렉션 가져오기 (지연 초기화)
   */
  async getProblemsCollection(): Promise<Collection | null> {
    return this.getCollection('problems');
  }

  /**
   * 학습자료 컬렉션 가져오기 (지연 초기화)
   */
  async getLearningMaterialsCollection(): Promise<Collection | null> {
    return this.getCollection('learning_materials');
  }

  /**
   * 클라이언트 상태 확인 (지연 초기화)
   */
  async isHealthy(): Promise<boolean> {
    try {
      await this.initializeClient();
      if (!this.client) return false;

      // 타임아웃과 함께 heartbeat 확인
      await Promise.race([
        this.client.heartbeat(),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Health check timeout')), 3000),
        ),
      ]);
      return true;
    } catch (error) {
      logger.warn('ChromaDB health check failed', error instanceof Error ? error : undefined);
      return false;
    }
  }

  /**
   * 모든 컬렉션 정보 가져오기 (지연 초기화)
   */
  async getCollectionsInfo() {
    try {
      await this.initializeClient();
      if (!this.client) return [];

      const collections = await this.client.listCollections();
      return collections.map((collection) => ({
        name: collection.name,
        metadata: collection.metadata,
        count: collection.count(),
      }));
    } catch (error) {
      logger.error('컬렉션 정보 조회 실패', error instanceof Error ? error : undefined, {
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
