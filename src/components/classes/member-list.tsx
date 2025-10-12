'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ClassMember } from '@/types/domain/class';
import { Crown, Mail, Shield, User, UserX } from 'lucide-react';
import { useState } from 'react';

interface MemberListProps {
  members: ClassMember[];
  onRemoveMember?: (userId: string) => void;
  canManage?: boolean;
}

export function MemberList({ members, onRemoveMember, canManage = false }: MemberListProps) {
  const [removingUserId, setRemovingUserId] = useState<string | null>(null);

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'TEACHER':
        return <Crown className="h-4 w-4 text-yellow-600" />;
      case 'ASSISTANT':
        return <Shield className="h-4 w-4 text-blue-600" />;
      default:
        return <User className="h-4 w-4 text-gray-600" />;
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'TEACHER':
        return '교사';
      case 'ASSISTANT':
        return '조교';
      default:
        return '학생';
    }
  };

  const getRoleVariant = (role: string) => {
    switch (role) {
      case 'TEACHER':
        return 'default';
      case 'ASSISTANT':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const handleRemoveMember = async (userId: string) => {
    if (!onRemoveMember) return;

    if (confirm('정말로 이 멤버를 클래스에서 제거하시겠습니까?')) {
      setRemovingUserId(userId);
      try {
        await onRemoveMember(userId);
      } finally {
        setRemovingUserId(null);
      }
    }
  };

  if (members.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <User className="mx-auto mb-4 h-12 w-12 text-gray-400" />
          <h3 className="mb-2 text-lg font-semibold text-gray-900">멤버가 없습니다</h3>
          <p className="text-gray-600">아직 클래스에 멤버가 없습니다.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>클래스 멤버 ({members.length}명)</CardTitle>
        <CardDescription>클래스에 참여한 모든 멤버 목록입니다</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {members.map((member) => (
            <div
              key={member.id}
              className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-gray-50"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100">
                  {member.user?.avatar ? (
                    <img
                      src={member.user.avatar}
                      alt={member.user.name}
                      className="h-10 w-10 rounded-full object-cover"
                    />
                  ) : (
                    <User className="h-5 w-5 text-gray-600" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium">{member.user?.name}</h4>
                    <Badge variant={getRoleVariant(member.role)} className="text-xs">
                      {getRoleIcon(member.role)}
                      <span className="ml-1">{getRoleLabel(member.role)}</span>
                    </Badge>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-gray-500">
                    <Mail className="h-3 w-3" />
                    <span>{member.user?.email}</span>
                  </div>
                  <div className="text-xs text-gray-400">
                    가입일: {new Date(member.joinedAt).toLocaleDateString()}
                  </div>
                </div>
              </div>

              {canManage && member.role !== 'TEACHER' && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleRemoveMember(member.userId)}
                  disabled={removingUserId === member.userId}
                  className="text-red-600 hover:text-red-700"
                >
                  {removingUserId === member.userId ? (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-red-600 border-t-transparent" />
                  ) : (
                    <UserX className="h-4 w-4" />
                  )}
                </Button>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
