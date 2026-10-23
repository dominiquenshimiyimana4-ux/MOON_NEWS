import type { Metadata } from "next";
import { SavedView } from "@/components/SavedView";

export const metadata: Metadata = {
  title: "Saved stories",
  description: "Your saved Moon News stories.",
};

export default function SavedPage() {
  return <SavedView />;
}
