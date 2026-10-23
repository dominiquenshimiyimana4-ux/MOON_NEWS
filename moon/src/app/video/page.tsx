import type { Metadata } from "next";
import { VideoBrowser } from "@/components/VideoBrowser";

export const metadata: Metadata = {
  title: "Moon News TV — Video",
  description: "Watch the latest video news, reports and features on Moon News TV.",
};

export default function VideoPage() {
  return <VideoBrowser />;
}
