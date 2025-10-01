'use client';

import { Button } from '@/components/ui/button';
import { Bell, Search } from 'lucide-react';
import { memo } from 'react';

interface HeaderProps {
  onMenuClick: () => void;
}

export const Header = memo(function Header({ onMenuClick }: HeaderProps) {
  return (
    <header className="h-16 flex-shrink-0 border-b border-gray-200 bg-white shadow-sm">
      <div className="flex h-full items-center justify-between px-4 sm:px-6 lg:px-8">
        <Button variant="ghost" size="sm" onClick={onMenuClick} className="lg:hidden">
          ☰
        </Button>

        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
            <input
              type="text"
              placeholder="학습자료, 문제, 학생 검색..."
              className="rounded-md border border-gray-300 py-2 pl-10 pr-4 focus:border-transparent focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <Button variant="ghost" size="sm">
            <Bell className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
});
