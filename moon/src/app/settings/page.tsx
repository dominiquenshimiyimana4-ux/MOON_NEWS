import type { Metadata } from "next";
import { SettingsView } from "@/components/SettingsView";

export const metadata: Metadata = {
  title: "Settings",
  description: "Manage your Moon News preferences.",
};

export default function SettingsPage() {
  return <SettingsView />;
}
