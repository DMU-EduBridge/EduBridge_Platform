import { env } from '@/lib/config/env';
import { logger } from '@/lib/monitoring';
import OpenAI from 'openai';
import { chromaClient, SearchResult } from './chromadb';

/**
 * 벡터 임베딩 서비스
 */
export class VectorEmbeddingService {
  private openai: OpenAI | null = null;

  constructor() {
    this.initializeOpenAI();
  }

  /**
   * OpenAI 클라이언트 초기화
   */
  private initializeOpenAI() {
    if (env.OPENAI_API_KEY) {
      this.openai = new OpenAI({
        apiKey: env.OPENAI_API_KEY,
      });
      logger.info('OpenAI 클라이언트 초기화 완료');
    } else {
      logger.warn('OpenAI API 키가 설정되지 않았습니다. 벡터 임베딩 기능이 제한됩니다.');
    }
  }

  /**
   * 텍스트를 벡터 임베딩으로 변환
   */
  async generateEmbedding(text: string): Promise<number[]> {
    if (!this.openai) {
      throw new Error('OpenAI 클라이언트가 초기화되지 않았습니다.');
    }

    try {
      const response = await this.openai.embeddings.create({
        model: env.EMBEDDING_MODEL,
        input: text,
      });

      return response.data[0].embedding;
    } catch (error) {
      logger.error('벡터 임베딩 생성 실패', undefined, {
        error: error instanceof Error ? error.message : String(error),
        text: text.substring(0, 100),
      });
      throw new Error('벡터 임베딩 생성에 실패했습니다.');
    }
  }

  /**
   * 문제 데이터를 벡터로 저장
   */
  async storeProblemVector(problem: {
    id: string;
    title: string;
    content: string;
    subject: string;
    difficulty: string;
    tags?: string[];
    createdAt: Date;
  }): Promise<void> {
    try {
      const collection = await chromaClient.getProblemsCollection();
      if (!collection) {
        throw new Error('문제 컬렉션을 찾을 수 없습니다.');
      }

      // 문제 텍스트 조합 (제목 + 내용 + 설명)
      const combinedText = `${problem.title}\n${problem.content}`;

      // 벡터 임베딩 생성
      const embedding = await this.generateEmbedding(combinedText);

      // 메타데이터 준비
      const metadata = {
        type: 'problem',
        subject: problem.subject,
        difficulty: problem.difficulty,
        tags: JSON.stringify(problem.tags || []), // 배열을 JSON 문자열로 변환
        createdAt: problem.createdAt.toISOString(),
        title: problem.title,
      };

      // ChromaDB에 저장
      await collection.add({
        ids: [problem.id],
        embeddings: [embedding],
        documents: [combinedText],
        metadatas: [metadata],
      });

      logger.info('문제 벡터 저장 완료', { problemId: problem.id });
    } catch (error) {
      logger.error('문제 벡터 저장 실패', undefined, {
        error: error instanceof Error ? error.message : String(error),
        problemId: problem.id,
      });
      throw error;
    }
  }

  /**
   * 학습자료 데이터를 벡터로 저장
   */
  async storeLearningMaterialVector(material: {
    id: string;
    title: string;
    content: string;
    subject: string;
    difficulty: string;
    tags?: string[];
    createdAt: Date;
  }): Promise<void> {
    try {
      const collection = await chromaClient.getLearningMaterialsCollection();
      if (!collection) {
        throw new Error('학습자료 컬렉션을 찾을 수 없습니다.');
      }

      // 학습자료 텍스트 조합
      const combinedText = `${material.title}\n${material.content}`;

      // 벡터 임베딩 생성
      const embedding = await this.generateEmbedding(combinedText);

      // 메타데이터 준비
      const metadata = {
        type: 'learning_material',
        subject: material.subject,
        difficulty: material.difficulty,
        tags: JSON.stringify(material.tags || []), // 배열을 JSON 문자열로 변환
        createdAt: material.createdAt.toISOString(),
        title: material.title,
      };

      // ChromaDB에 저장
      await collection.add({
        ids: [material.id],
        embeddings: [embedding],
        documents: [combinedText],
        metadatas: [metadata],
      });

      logger.info('학습자료 벡터 저장 완료', { materialId: material.id });
    } catch (error) {
      logger.error('학습자료 벡터 저장 실패', undefined, {
        error: error instanceof Error ? error.message : String(error),
        materialId: material.id,
      });
      throw error;
    }
  }

  /**
   * 의미적 검색 수행
   */
  async semanticSearch(
    query: string,
    type: 'problem' | 'learning_material' | 'all' = 'all',
    limit: number = 10,
    threshold: number = 0.7,
  ): Promise<SearchResult[]> {
    try {
      if (!this.openai) {
        throw new Error('OpenAI 클라이언트가 초기화되지 않았습니다.');
      }

      // 쿼리 벡터 생성
      const queryEmbedding = await this.generateEmbedding(query);

      const results: SearchResult[] = [];

      // 문제 검색
      if (type === 'problem' || type === 'all') {
        const problemCollection = await chromaClient.getProblemsCollection();
        if (problemCollection) {
          const problemResults = await problemCollection.query({
            queryEmbeddings: [queryEmbedding],
            nResults: limit,
            where: type === 'problem' ? { type: 'problem' } : undefined,
          });

          results.push(
            ...problemResults.documents![0].map((doc: string | null, index: number) => ({
              id: problemResults.ids![0][index],
              content: doc || '',
              metadata: problemResults.metadatas![0][index] || {},
              distance: problemResults.distances![0][index] || 0,
              score: 1 - (problemResults.distances![0][index] || 0), // 거리를 점수로 변환
            })),
          );
        }
      }

      // 학습자료 검색
      if (type === 'learning_material' || type === 'all') {
        const materialCollection = await chromaClient.getLearningMaterialsCollection();
        if (materialCollection) {
          const materialResults = await materialCollection.query({
            queryEmbeddings: [queryEmbedding],
            nResults: limit,
            where: type === 'learning_material' ? { type: 'learning_material' } : undefined,
          });

          results.push(
            ...materialResults.documents![0].map((doc: string | null, index: number) => ({
              id: materialResults.ids![0][index],
              content: doc || '',
              metadata: materialResults.metadatas![0][index] || {},
              distance: materialResults.distances![0][index] || 0,
              score: 1 - (materialResults.distances![0][index] || 0),
            })),
          );
        }
      }

      // 점수순으로 정렬하고 임계값 필터링
      return results
        .filter((result) => result.score >= threshold)
        .sort((a, b) => b.score - a.score)
        .slice(0, limit);
    } catch (error) {
      logger.error('의미적 검색 실패', undefined, {
        error: error instanceof Error ? error.message : String(error),
        query,
      });
      throw error;
    }
  }

  /**
   * 벡터 업데이트
   */
  async updateVector(
    id: string,
    type: 'problem' | 'learning_material',
    content: string,
    metadata: Record<string, any>,
  ): Promise<void> {
    try {
      const collection =
        type === 'problem'
          ? await chromaClient.getProblemsCollection()
          : await chromaClient.getLearningMaterialsCollection();

      if (!collection) {
        throw new Error(`${type} 컬렉션을 찾을 수 없습니다.`);
      }

      // 새 벡터 생성
      const embedding = await this.generateEmbedding(content);

      // 기존 벡터 삭제 후 새로 추가
      await collection.delete({ ids: [id] });
      await collection.add({
        ids: [id],
        embeddings: [embedding],
        documents: [content],
        metadatas: [{ ...metadata, type }],
      });

      logger.info('벡터 업데이트 완료', { id, type });
    } catch (error) {
      logger.error('벡터 업데이트 실패', undefined, {
        error: error instanceof Error ? error.message : String(error),
        id,
        type,
      });
      throw error;
    }
  }

  /**
   * 벡터 삭제
   */
  async deleteVector(id: string, type: 'problem' | 'learning_material'): Promise<void> {
    try {
      const collection =
        type === 'problem'
          ? await chromaClient.getProblemsCollection()
          : await chromaClient.getLearningMaterialsCollection();

      if (!collection) {
        throw new Error(`${type} 컬렉션을 찾을 수 없습니다.`);
      }

      await collection.delete({ ids: [id] });
      logger.info('벡터 삭제 완료', { id, type });
    } catch (error) {
      logger.error('벡터 삭제 실패', undefined, {
        error: error instanceof Error ? error.message : String(error),
        id,
        type,
      });
      throw error;
    }
  }

  /**
   * 벡터 컬렉션 상태 확인
   */
  async getCollectionStats(): Promise<{
    problems: number;
    learningMaterials: number;
    total: number;
  }> {
    try {
      const problemsCollection = await chromaClient.getProblemsCollection();
      const materialsCollection = await chromaClient.getLearningMaterialsCollection();

      const problemsCount = problemsCollection ? await problemsCollection.count() : 0;
      const materialsCount = materialsCollection ? await materialsCollection.count() : 0;

      return {
        problems: problemsCount,
        learningMaterials: materialsCount,
        total: problemsCount + materialsCount,
      };
    } catch (error) {
      logger.error('컬렉션 통계 조회 실패', undefined, {
        error: error instanceof Error ? error.message : String(error),
      });
      return { problems: 0, learningMaterials: 0, total: 0 };
    }
  }
}

// 싱글톤 인스턴스
export const vectorService = new VectorEmbeddingService();
