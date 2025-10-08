'use client';

import { Card } from '@/components/ui/card';
import { useMessagesData, useUpdateMessage } from '@/hooks/dashboard/use-messages';
import { memo } from 'react';

const MessageItem = memo(function MessageItem({
  id,
  sender,
  message,
  hasNotification,
  notificationCount,
  isRead,
}: {
  id: string;
  sender: string;
  message: string;
  hasNotification?: boolean | undefined;
  notificationCount?: number | undefined;
  isRead: boolean;
}) {
  const updateMessageMutation = useUpdateMessage();

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  const handleClick = () => {
    if (!isRead) {
      updateMessageMutation.mutate({
        id,
        isRead: true,
      });
    }
  };

  return (
    <div
      className="flex cursor-pointer items-start space-x-3 rounded-lg p-3 transition-colors hover:bg-gray-50"
      onClick={handleClick}
    >
      <div className="flex-shrink-0">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100">
          <span className="text-sm font-medium text-purple-600">{getInitials(sender)}</span>
        </div>
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between">
          <p className="truncate text-sm font-medium text-gray-900">{sender}</p>
          {hasNotification && !isRead && (
            <div className="flex-shrink-0">
              <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-blue-500 text-xs font-medium text-white">
                {notificationCount || 1}
              </span>
            </div>
          )}
        </div>
        <p className="mt-1 line-clamp-2 text-sm text-gray-600">{message}</p>
      </div>
    </div>
  );
});

export const MailboxCard = memo(function MailboxCard() {
  const { messages, isLoading, error } = useMessagesData();

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900">메일함</h2>
          <div className="flex items-center justify-center py-8">
            <div className="text-sm text-gray-500">로딩 중...</div>
          </div>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-6">
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900">메일함</h2>
          <div className="flex items-center justify-center py-8">
            <div className="text-sm text-red-500">데이터를 불러오는데 실패했습니다.</div>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900">메일함</h2>

        <div className="space-y-1">
          {messages.map((message) => (
            <MessageItem
              key={message.id}
              id={message.id}
              sender={message.sender}
              message={message.message}
              hasNotification={message.hasNotification}
              notificationCount={message.notificationCount}
              isRead={message.isRead}
            />
          ))}
        </div>
      </div>
    </Card>
  );
});
