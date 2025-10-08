'use client';

import { Card } from '@/components/ui/card';
import { useAIChat, useAIChatExamplesData } from '@/hooks/dashboard/use-ai-assistant';
import { Plus } from 'lucide-react';
import { memo, useState } from 'react';

const ChatExampleItem = memo(function ChatExampleItem({
  prompt,
  response,
  date,
}: {
  prompt: string;
  response: string;
  date: string;
}) {
  return (
    <div className="space-y-2 rounded-lg bg-gray-50 p-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-gray-900">{prompt}</p>
        <span className="text-xs text-gray-500">{date}</span>
      </div>
      <p className="rounded border-l-4 border-blue-500 bg-white p-2 text-sm text-gray-600">
        {response}
      </p>
    </div>
  );
});

export const AIAssistantCard = memo(function AIAssistantCard() {
  const [inputValue, setInputValue] = useState('');
  const { chatExamples, isLoading, error } = useAIChatExamplesData();
  const aiChatMutation = useAIChat();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim() && !aiChatMutation.isPending) {
      aiChatMutation.mutate({
        question: inputValue,
        messageType: 'question',
      });
      setInputValue('');
    }
  };

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900">무엇을 도와드릴까요?</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 transform">
              <Plus className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="질문을 입력하세요..."
              disabled={aiChatMutation.isPending}
              className="w-full rounded-lg border border-gray-300 py-3 pl-10 pr-4 outline-none focus:border-transparent focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            />
          </div>
        </form>

        <div className="space-y-3">
          <h3 className="text-sm font-medium text-gray-700">최근 대화</h3>
          {isLoading ? (
            <div className="flex items-center justify-center py-4">
              <div className="text-sm text-gray-500">로딩 중...</div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center py-4">
              <div className="text-sm text-red-500">데이터를 불러오는데 실패했습니다.</div>
            </div>
          ) : (
            chatExamples.map((example) => (
              <ChatExampleItem
                key={example.id}
                prompt={example.prompt}
                response={example.response}
                date={example.date}
              />
            ))
          )}
        </div>
      </div>
    </Card>
  );
});
