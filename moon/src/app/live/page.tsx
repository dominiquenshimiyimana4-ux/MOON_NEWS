import type { Metadata } from "next";
import { LiveBrowser } from "@/components/LiveBrowser";

export const metadata: Metadata = {
  title: "Live",
  description: "Live coverage and real-time updates from Moon News.",
};

export default function LivePage() {
  return <LiveBrowser />;
}
