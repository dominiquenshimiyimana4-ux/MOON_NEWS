import type { Metadata } from "next";
import { RegisterForm } from "@/components/auth/RegisterForm";

export const metadata: Metadata = {
  title: "Register",
  description: "Create your Moon News account.",
};

export default function RegisterPage() {
  return <RegisterForm />;
}
