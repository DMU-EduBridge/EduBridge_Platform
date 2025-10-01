'use client';

import { memo, useEffect, useRef, useState } from 'react';

interface ProblemElapsedTimeProps {
  startTime: Date;
  isActive: boolean;
}

export const ProblemElapsedTime = memo(function ProblemElapsedTime({
  startTime,
  isActive,
}: ProblemElapsedTimeProps) {
  const [elapsedTime, setElapsedTime] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isActive) {
      intervalRef.current = setInterval(() => {
        setElapsedTime(Math.floor((new Date().getTime() - startTime.getTime()) / 1000));
      }, 1000);

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      return undefined;
    }
  }, [startTime, isActive]);

  if (!isActive) {
    return null;
  }

  return (
    <div className="mt-1 text-center text-xs text-blue-500">
      경과 시간: {Math.floor(elapsedTime / 60)}분 {elapsedTime % 60}초
    </div>
  );
});
