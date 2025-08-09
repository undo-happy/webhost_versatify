import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { Draft } from '../lib/types';

type DraftItem = Draft & { id: string; createdAt: number };

type DraftsState = {
  drafts: DraftItem[];
  addDraft: (draft: Draft) => DraftItem;
  removeDraft: (id: string) => void;
  clearDrafts: () => void;
};

const DraftsContext = createContext<DraftsState | null>(null);

function uid() { return Math.random().toString(36).slice(2) + Date.now().toString(36); }

export function DraftsProvider({ children }: { children: React.ReactNode }) {
  const [drafts, setDrafts] = useState<DraftItem[]>(() => {
    try {
      const raw = localStorage.getItem('drafts');
      return raw ? JSON.parse(raw) : [];
    } catch { return []; }
  });
  useEffect(() => {
    try { localStorage.setItem('drafts', JSON.stringify(drafts)); } catch {}
  }, [drafts]);

  const addDraft = (draft: Draft): DraftItem => {
    const item: DraftItem = { ...draft, id: uid(), createdAt: Date.now() };
    setDrafts((prev) => [item, ...prev]);
    return item;
  };
  const removeDraft = (id: string) => setDrafts((prev) => prev.filter((d) => d.id !== id));
  const clearDrafts = () => setDrafts([]);

  const value = useMemo(() => ({ drafts, addDraft, removeDraft, clearDrafts }), [drafts]);
  return <DraftsContext.Provider value={value}>{children}</DraftsContext.Provider>;
}

export function useDrafts() {
  const ctx = useContext(DraftsContext);
  if (!ctx) throw new Error('useDrafts must be used within DraftsProvider');
  return ctx;
}