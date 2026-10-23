import type { Metadata } from "next";
import { PhotosBrowser } from "@/components/PhotosBrowser";

export const metadata: Metadata = {
  title: "Photo Stories",
  description: "Photo galleries and visual stories from Moon News.",
};

export default function PhotosPage() {
  return <PhotosBrowser />;
}
