import { useCallback, useState } from 'react';

export function useRefineReport() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refine = useCallback(
    async (reportId: string, scope: 'recommendations' | 'weakConcepts') => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/teacher-reports/${reportId}/refine`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ scope }),
        });
        if (!res.ok) throw new Error('보강 실패');
        const json = await res.json();
        setLoading(false);
        return json.data as { reportId: string; scope: string; updated: any };
      } catch (e: any) {
        setError(e?.message || '보강 실패');
        setLoading(false);
        throw e;
      }
    },
    [],
  );

  return { refine, loading, error };
}
