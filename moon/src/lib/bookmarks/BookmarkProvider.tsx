"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { userService } from "@/lib/services/userService";

interface BookmarkContextValue {
  saved: string[];
  hydrated: boolean;
  isSaved: (slug: string) => boolean;
  toggle: (slug: string) => boolean;
}

const BookmarkContext = createContext<BookmarkContextValue | undefined>(undefined);

export function BookmarkProvider({ children }: { children: ReactNode }) {
  const [saved, setSaved] = useState<string[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setSaved(userService.getBookmarks());
    setHydrated(true);
  }, []);

  const toggle = useCallback((slug: string) => {
    const nowSaved = userService.toggleBookmark(slug);
    setSaved(userService.getBookmarks());
    return nowSaved;
  }, []);

  const isSaved = useCallback((slug: string) => saved.includes(slug), [saved]);

  const value = useMemo(
    () => ({ saved, hydrated, isSaved, toggle }),
    [saved, hydrated, isSaved, toggle]
  );

  return <BookmarkContext.Provider value={value}>{children}</BookmarkContext.Provider>;
}

export function useBookmarks(): BookmarkContextValue {
  const ctx = useContext(BookmarkContext);
  if (!ctx) throw new Error("useBookmarks must be used within BookmarkProvider");
  return ctx;
}
