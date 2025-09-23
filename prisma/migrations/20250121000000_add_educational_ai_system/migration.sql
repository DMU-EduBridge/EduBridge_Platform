-- Educational AI System 테이블 추가
-- 교과서 관리 시스템
CREATE TABLE "textbooks" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "grade_level" TEXT NOT NULL,
    "publisher" TEXT,
    "file_name" TEXT NOT NULL,
    "file_path" TEXT NOT NULL,
    "file_size" INTEGER NOT NULL,
    "mime_type" TEXT,
    "total_chunks" INTEGER DEFAULT 0,
    "processing_status" TEXT DEFAULT 'pending',
    "error_message" TEXT,
    "uploaded_by" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "textbooks_uploaded_by_fkey" FOREIGN KEY ("uploaded_by") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- 문서 청크 테이블
CREATE TABLE "document_chunks" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "textbook_id" TEXT NOT NULL,
    "chunk_index" INTEGER NOT NULL,
    "content" TEXT NOT NULL,
    "content_length" INTEGER NOT NULL,
    "embedding_id" TEXT,
    "metadata" TEXT DEFAULT '{}',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "document_chunks_textbook_id_fkey" FOREIGN KEY ("textbook_id") REFERENCES "textbooks" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- AI 생성 문제 테이블
CREATE TABLE "ai_generated_questions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "question_text" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "grade_level" TEXT NOT NULL,
    "unit" TEXT,
    "difficulty" TEXT NOT NULL,
    "correct_answer" INTEGER NOT NULL CHECK ("correct_answer" BETWEEN 1 AND 5),
    "explanation" TEXT NOT NULL,
    "generation_prompt" TEXT,
    "context_chunk_ids" TEXT DEFAULT '[]',
    "quality_score" REAL,
    "generation_time_ms" INTEGER,
    "model_name" TEXT,
    "tokens_used" INTEGER,
    "cost_usd" REAL,
    "created_by" TEXT NOT NULL,
    "textbook_id" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ai_generated_questions_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ai_generated_questions_textbook_id_fkey" FOREIGN KEY ("textbook_id") REFERENCES "textbooks" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- 문제 선택지 테이블
CREATE TABLE "question_options" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "question_id" TEXT NOT NULL,
    "option_number" INTEGER NOT NULL CHECK ("option_number" BETWEEN 1 AND 5),
    "option_text" TEXT NOT NULL,
    "is_correct" BOOLEAN NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "question_options_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "ai_generated_questions" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- 문제 태그 테이블
CREATE TABLE "question_tags" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "question_id" TEXT NOT NULL,
    "tag_name" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "question_tags_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "ai_generated_questions" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- 검색 쿼리 테이블
CREATE TABLE "search_queries" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "query_text" TEXT NOT NULL,
    "subject" TEXT,
    "grade_level" TEXT,
    "unit" TEXT,
    "results_count" INTEGER NOT NULL,
    "search_time_ms" INTEGER NOT NULL,
    "user_id" TEXT NOT NULL,
    "session_id" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "search_queries_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- 검색 결과 테이블
CREATE TABLE "search_results" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "query_id" TEXT NOT NULL,
    "chunk_id" TEXT NOT NULL,
    "similarity_score" REAL NOT NULL,
    "rank_position" INTEGER NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "search_results_query_id_fkey" FOREIGN KEY ("query_id") REFERENCES "search_queries" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "search_results_chunk_id_fkey" FOREIGN KEY ("chunk_id") REFERENCES "document_chunks" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- API 사용량 테이블
CREATE TABLE "ai_api_usage" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "api_type" TEXT NOT NULL,
    "model_name" TEXT NOT NULL,
    "tokens_used" INTEGER NOT NULL,
    "cost_usd" REAL NOT NULL,
    "request_count" INTEGER DEFAULT 1,
    "response_time_ms" INTEGER,
    "success" BOOLEAN DEFAULT true,
    "error_message" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ai_api_usage_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- 시스템 성능 테이블
CREATE TABLE "ai_performance_metrics" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "operation_type" TEXT NOT NULL,
    "duration_ms" INTEGER NOT NULL,
    "success" BOOLEAN NOT NULL,
    "error_message" TEXT,
    "metadata" TEXT DEFAULT '{}',
    "user_id" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ai_performance_metrics_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- 사용 통계 테이블
CREATE TABLE "ai_usage_statistics" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "questions_generated" INTEGER DEFAULT 0,
    "textbooks_uploaded" INTEGER DEFAULT 0,
    "searches_performed" INTEGER DEFAULT 0,
    "total_cost_usd" REAL DEFAULT 0,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ai_usage_statistics_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- 인덱스 생성
CREATE INDEX "idx_textbooks_subject_grade" ON "textbooks"("subject", "grade_level");
CREATE INDEX "idx_textbooks_status" ON "textbooks"("processing_status");
CREATE INDEX "idx_textbooks_uploaded_by" ON "textbooks"("uploaded_by");
CREATE INDEX "idx_chunks_textbook_id" ON "document_chunks"("textbook_id");
CREATE INDEX "idx_chunks_embedding_id" ON "document_chunks"("embedding_id");
CREATE INDEX "idx_questions_subject_grade" ON "ai_generated_questions"("subject", "grade_level");
CREATE INDEX "idx_questions_difficulty" ON "ai_generated_questions"("difficulty");
CREATE INDEX "idx_questions_created_by" ON "ai_generated_questions"("created_by");
CREATE INDEX "idx_questions_textbook_id" ON "ai_generated_questions"("textbook_id");
CREATE INDEX "idx_questions_created_at" ON "ai_generated_questions"("created_at");
CREATE INDEX "idx_options_question_id" ON "question_options"("question_id");
CREATE INDEX "idx_tags_question_id" ON "question_tags"("question_id");
CREATE INDEX "idx_search_queries_user_id" ON "search_queries"("user_id");
CREATE INDEX "idx_search_queries_created_at" ON "search_queries"("created_at");
CREATE INDEX "idx_search_results_query_id" ON "search_results"("query_id");
CREATE INDEX "idx_search_results_chunk_id" ON "search_results"("chunk_id");
CREATE INDEX "idx_api_usage_user_id" ON "ai_api_usage"("user_id");
CREATE INDEX "idx_api_usage_created_at" ON "ai_api_usage"("created_at");
CREATE INDEX "idx_performance_operation" ON "ai_performance_metrics"("operation_type");
CREATE INDEX "idx_performance_created_at" ON "ai_performance_metrics"("created_at");
CREATE INDEX "idx_statistics_user_date" ON "ai_usage_statistics"("user_id", "date");

-- 유니크 제약조건
CREATE UNIQUE INDEX "ai_usage_statistics_user_id_date_key" ON "ai_usage_statistics"("user_id", "date");
