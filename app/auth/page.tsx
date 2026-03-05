import type { Metadata } from "next"
import { AuthForm } from "@/components/auth-form"

export const metadata: Metadata = {
  title: "Sign In - Second Brain",
  description: "Sign in or create an account to access your personal knowledge base.",
}

export default function AuthPage() {
  return <AuthForm />
}
