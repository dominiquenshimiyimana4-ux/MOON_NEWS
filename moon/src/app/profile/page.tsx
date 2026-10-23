import type { Metadata } from "next";
import { ProfileView } from "@/components/ProfileView";

export const metadata: Metadata = {
  title: "Profile",
  description: "Your Moon News profile, saved stories and reading history.",
};

export default function ProfilePage() {
  return <ProfileView />;
}
