const PREFIX = "bai-sil-draft:";

export function saveDraft(key: string, data: Record<string, unknown>): void {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(data));
  } catch {
    // storage full/unavailable — drafts are best-effort
  }
}

export function loadDraft<T = Record<string, unknown>>(key: string): T | null {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

export function clearDraft(key: string): void {
  try {
    localStorage.removeItem(PREFIX + key);
  } catch {
    // ignore
  }
}
