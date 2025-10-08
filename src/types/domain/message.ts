export type MessageCategory = '학습 질문' | '과제' | '일반' | '공지사항';

export interface Message {
  id: string;
  senderId: string;
  sender: string;
  messageType: 'text' | 'system' | 'notification';
  subject: string;
  message: string;
  category: MessageCategory;
  isRead: boolean;
  hasNotification?: boolean;
  notificationCount?: number;
  createdAt: string;
}

export interface MarkMessageReadRequest {
  id: string;
  isRead: boolean;
}

export interface MessagesStats {
  total: number;
  unread: number;
  read: number;
  fromTeachers: number;
  fromStudents: number;
}
