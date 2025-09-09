export function parseJsonArray(value?: string | null): string[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function serializeArray(value?: string[] | null): string | null {
  if (!value || value.length === 0) return null;
  try {
    return JSON.stringify(value);
  } catch {
    return null;
  }
}
