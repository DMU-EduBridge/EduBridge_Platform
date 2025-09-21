'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { BookOpen, Database, FileText, Loader2, Search } from 'lucide-react';
import { useState } from 'react';

interface SearchResult {
  id: string;
  title: string;
  content: string;
  type: 'problem' | 'learning_material';
  subject: string;
  difficulty: string;
  tags: string[];
  score: number;
  createdAt: string;
}

interface SearchResponse {
  query: string;
  type: string;
  results: SearchResult[];
  total: number;
}

export function VectorSearchCard() {
  const [query, setQuery] = useState('');
  const [searchType, setSearchType] = useState<'all' | 'problem' | 'learning_material'>('all');
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [lastQuery, setLastQuery] = useState('');
  const { toast } = useToast();

  const handleSearch = async () => {
    if (!query.trim()) {
      toast({
        title: '검색어를 입력해주세요',
        description: '의미적 검색을 위해 검색어가 필요합니다.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    setLastQuery(query);

    try {
      const response = await fetch('/api/vector/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query,
          type: searchType,
          limit: 20,
          threshold: 0.6,
        }),
      });

      if (!response.ok) {
        throw new Error('검색 요청이 실패했습니다.');
      }

      const data: SearchResponse = await response.json();
      setResults(data.results);

      toast({
        title: '검색 완료',
        description: `${data.total}개의 결과를 찾았습니다.`,
      });
    } catch (error) {
      console.error('벡터 검색 오류:', error);
      toast({
        title: '검색 실패',
        description: '의미적 검색 중 오류가 발생했습니다.',
        variant: 'destructive',
      });
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const getTypeIcon = (type: string) => {
    return type === 'problem' ? <FileText className="h-4 w-4" /> : <BookOpen className="h-4 w-4" />;
  };

  const getTypeLabel = (type: string) => {
    return type === 'problem' ? '문제' : '학습자료';
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'easy':
      case '쉬움':
        return 'bg-green-100 text-green-800';
      case 'medium':
      case '보통':
        return 'bg-yellow-100 text-yellow-800';
      case 'hard':
      case '어려움':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          의미적 검색
        </CardTitle>
        <CardDescription>
          AI 벡터 임베딩을 사용하여 문제와 학습자료를 의미적으로 검색합니다.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 검색 입력 */}
        <div className="space-y-2">
          <Label htmlFor="search-query">검색어</Label>
          <div className="flex gap-2">
            <Input
              id="search-query"
              placeholder="예: 이차방정식의 해를 구하는 방법"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={isLoading}
            />
            <Button onClick={handleSearch} disabled={isLoading || !query.trim()}>
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Search className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        {/* 검색 타입 선택 */}
        <div className="space-y-2">
          <Label htmlFor="search-type">검색 타입</Label>
          <Select value={searchType} onValueChange={(value: any) => setSearchType(value)}>
            <SelectTrigger>
              <SelectValue placeholder="검색 타입을 선택하세요" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">전체</SelectItem>
              <SelectItem value="problem">문제만</SelectItem>
              <SelectItem value="learning_material">학습자료만</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* 검색 결과 */}
        {lastQuery && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">"{lastQuery}" 검색 결과</h3>
              <Badge variant="outline">{results.length}개 결과</Badge>
            </div>

            {results.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground">
                <Database className="mx-auto mb-4 h-12 w-12 opacity-50" />
                <p>검색 결과가 없습니다.</p>
                <p className="text-sm">다른 검색어로 시도해보세요.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {results.map((result) => (
                  <Card key={result.id} className="border-l-4 border-l-blue-500">
                    <CardContent className="pt-4">
                      <div className="mb-2 flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          {getTypeIcon(result.type)}
                          <Badge variant="secondary">{getTypeLabel(result.type)}</Badge>
                          <Badge className={getDifficultyColor(result.difficulty)}>
                            {result.difficulty}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          유사도: {(result.score * 100).toFixed(1)}%
                        </div>
                      </div>

                      <h4 className="mb-2 font-semibold">{result.title}</h4>
                      <p className="mb-3 line-clamp-3 text-sm text-muted-foreground">
                        {result.content}
                      </p>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{result.subject}</Badge>
                          {result.tags.map((tag) => (
                            <Badge key={tag} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {new Date(result.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
