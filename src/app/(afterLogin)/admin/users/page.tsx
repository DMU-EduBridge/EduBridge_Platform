import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { authOptions } from '@/lib/core/auth';
import { MoreHorizontal, Users } from 'lucide-react';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';

export default async function AdminUsersPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login');
  }

  if (session.user.role !== 'ADMIN') {
    redirect('/dashboard');
  }

  // 임시 데이터 (실제로는 API에서 가져와야 함)
  const users = [
    {
      id: '1',
      name: '김선생',
      email: 'teacher@example.com',
      role: 'TEACHER',
      status: 'ACTIVE',
      grade: null,
      createdAt: '2024-01-15',
      lastLogin: '2024-01-20',
    },
    {
      id: '2',
      name: '김학생',
      email: 'student1@example.com',
      role: 'STUDENT',
      status: 'ACTIVE',
      grade: '1학년',
      createdAt: '2024-01-16',
      lastLogin: '2024-01-20',
    },
    {
      id: '3',
      name: '이학생',
      email: 'student2@example.com',
      role: 'STUDENT',
      status: 'ACTIVE',
      grade: '2학년',
      createdAt: '2024-01-17',
      lastLogin: '2024-01-19',
    },
    {
      id: '4',
      name: '박학생',
      email: 'student3@example.com',
      role: 'STUDENT',
      status: 'INACTIVE',
      grade: '3학년',
      createdAt: '2024-01-18',
      lastLogin: '2024-01-18',
    },
  ];

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'bg-red-100 text-red-800';
      case 'TEACHER':
        return 'bg-blue-100 text-blue-800';
      case 'STUDENT':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-800';
      case 'INACTIVE':
        return 'bg-gray-100 text-gray-800';
      case 'SUSPENDED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">사용자 관리</h1>
          <p className="mt-2 text-gray-600">시스템의 모든 사용자를 관리하고 권한을 설정하세요.</p>
        </div>
        <Button>새 사용자 추가</Button>
      </div>

      {/* 통계 요약 */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
        <Card className="p-6">
          <div className="flex items-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">전체 사용자</p>
              <p className="text-2xl font-bold text-gray-900">{users.length}</p>
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100">
              <Users className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">활성 사용자</p>
              <p className="text-2xl font-bold text-gray-900">
                {users.filter((u) => u.status === 'ACTIVE').length}
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100">
              <Users className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">교사</p>
              <p className="text-2xl font-bold text-gray-900">
                {users.filter((u) => u.role === 'TEACHER').length}
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-orange-100">
              <Users className="h-6 w-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">학생</p>
              <p className="text-2xl font-bold text-gray-900">
                {users.filter((u) => u.role === 'STUDENT').length}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* 사용자 목록 */}
      <Card className="p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">사용자 목록</h3>
          <div className="flex items-center space-x-2">
            <input
              type="text"
              placeholder="사용자 검색..."
              className="rounded-md border border-gray-300 px-3 py-2 text-sm"
            />
            <select className="rounded-md border border-gray-300 px-3 py-2 text-sm">
              <option value="">모든 역할</option>
              <option value="ADMIN">관리자</option>
              <option value="TEACHER">교사</option>
              <option value="STUDENT">학생</option>
            </select>
            <select className="rounded-md border border-gray-300 px-3 py-2 text-sm">
              <option value="">모든 상태</option>
              <option value="ACTIVE">활성</option>
              <option value="INACTIVE">비활성</option>
              <option value="SUSPENDED">정지</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  사용자
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  역할
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  상태
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  학년
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  가입일
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  마지막 로그인
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  작업
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="flex items-center">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-300">
                        <span className="text-sm font-medium text-gray-700">
                          {user.name.charAt(0)}
                        </span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{user.name}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <Badge className={getRoleBadgeColor(user.role)}>
                      {user.role === 'ADMIN' ? '관리자' : user.role === 'TEACHER' ? '교사' : '학생'}
                    </Badge>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <Badge className={getStatusBadgeColor(user.status)}>
                      {user.status === 'ACTIVE'
                        ? '활성'
                        : user.status === 'INACTIVE'
                          ? '비활성'
                          : '정지'}
                    </Badge>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                    {user.grade || '-'}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                    {user.createdAt}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                    {user.lastLogin}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm font-medium">
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
