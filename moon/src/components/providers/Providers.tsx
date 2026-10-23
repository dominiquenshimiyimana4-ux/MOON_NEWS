"use client";

import type { ReactNode } from "react";
import { ThemeProvider } from "@/lib/theme/ThemeProvider";
import { LanguageProvider } from "@/lib/i18n";
import { AuthProvider } from "@/lib/auth/AuthProvider";
import { BookmarkProvider } from "@/lib/bookmarks/BookmarkProvider";
import { NotificationProvider } from "@/lib/notifications/NotificationProvider";
import { AdminProvider } from "@/lib/admin/AdminProvider";
import { LiveRequestProvider } from "@/lib/live/LiveRequestProvider";
import { AdvertiserProvider } from "@/lib/advertiser/AdvertiserProvider";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <AdminProvider>
            <AdvertiserProvider>
              <BookmarkProvider>
                <NotificationProvider>
                  <LiveRequestProvider>{children}</LiveRequestProvider>
                </NotificationProvider>
              </BookmarkProvider>
            </AdvertiserProvider>
          </AdminProvider>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}
