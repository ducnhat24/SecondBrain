"use client"

import { useState } from "react"
import { useRouter } from "next/navigation" // Thêm thư viện điều hướng của Next.js
import { Mail, Lock, User, Github, Eye, EyeOff, Brain, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { cn } from "@/lib/utils"

// Import 2 hàm Server Actions mình vừa viết
import { signInWithEmail, signUpWithEmail, signInWithOAuth } from "@/actions/auth.actions"

type AuthMode = "login" | "register"

// (Đoạn SVG GoogleIcon tui thu gọn lại cho bớt dài nha)
function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1Z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23Z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A10.96 10.96 0 0 0 1 12c0 1.77.42 3.45 1.18 4.93l3.66-2.84Z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53Z" fill="#EA4335" />
    </svg>
  )
}

export function AuthForm() {
  const router = useRouter() // Khởi tạo router

  const [mode, setMode] = useState<AuthMode>("login")
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState("") // Thêm state lưu lỗi hiển thị lên UI

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setErrorMsg("")

    if (mode === "login") {
      const res = await signInWithEmail(email, password)
      if (res?.error) {
        setErrorMsg(res.error)
        setIsLoading(false)
      } else {
        router.push("/") // Đăng nhập thành công -> đá về Dashboard
      }
    } else {
      const res = await signUpWithEmail(email, password, name)
      if (res?.error) {
        setErrorMsg(res.error)
        setIsLoading(false)
      } else {
        router.push("/") // Đăng ký thành công -> đá về Dashboard
      }
    }
  }

  const switchMode = (newMode: AuthMode) => {
    setMode(newMode)
    setShowPassword(false)
    setEmail("")
    setPassword("")
    setName("")
    setErrorMsg("") // Xóa lỗi khi chuyển tab
  }

  const handleOAuthLogin = async (provider: 'google' | 'github') => {
    await signInWithOAuth(provider)
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_at_top,var(--color-muted)_0%,transparent_50%)] opacity-50" />

      <div className="relative z-10 flex w-full max-w-[420px] flex-col items-center gap-8">
        <div className="flex flex-col items-center gap-3">
          <div className="flex size-12 items-center justify-center rounded-xl bg-foreground text-background">
            <Brain className="size-6" />
          </div>
          <div className="text-center">
            <h1 className="text-xl font-semibold tracking-tight text-foreground">Second Brain</h1>
            <p className="mt-1 text-sm text-muted-foreground">Your personal knowledge base</p>
          </div>
        </div>

        <Card className="w-full border-border/60 shadow-lg">
          <CardHeader className="pb-0">
            <div className="flex rounded-lg bg-muted p-1">
              <button type="button" onClick={() => switchMode("login")} className={cn("flex-1 rounded-md px-4 py-2 text-sm font-medium transition-all", mode === "login" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground")}>Login</button>
              <button type="button" onClick={() => switchMode("register")} className={cn("flex-1 rounded-md px-4 py-2 text-sm font-medium transition-all", mode === "register" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground")}>Register</button>
            </div>
            <div className="mt-4">
              <CardTitle className="text-lg">{mode === "login" ? "Welcome back" : "Create your account"}</CardTitle>
              <CardDescription className="mt-1">{mode === "login" ? "Sign in to access your knowledge base" : "Start building your second brain today"}</CardDescription>
            </div>
          </CardHeader>

          <CardContent className="pt-2">
            <div className="mt-4 flex flex-col gap-2">

              <Button variant="outline" type="button" onClick={() => handleOAuthLogin('google')}>
                Sign in with Google
              </Button>
              <Button variant="outline" type="button" onClick={() => handleOAuthLogin('github')}>
                Sign in with GitHub
              </Button>
            </div>
            <div className="relative my-6 flex items-center">
              <div className="flex-1 border-t border-border" />
              <span className="mx-4 text-xs text-muted-foreground">or</span>
              <div className="flex-1 border-t border-border" />
            </div>

            {/* Khung hiển thị lỗi báo đỏ */}
            {errorMsg && (
              <div className="mb-4 rounded-md bg-destructive/15 p-3 text-sm text-destructive text-center font-medium">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {mode === "register" && (
                <div className="flex flex-col gap-2">
                  <Label htmlFor="name">Full name</Label>
                  <div className="relative">
                    <User className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input id="name" type="text" placeholder="John Doe" value={name} onChange={(e) => setName(e.target.value)} className="h-10 pl-9" required />
                  </div>
                </div>
              )}

              <div className="flex flex-col gap-2">
                <Label htmlFor="email">Email address</Label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input id="email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} className="h-10 pl-9" required />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                </div>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input id="password" type={showPassword ? "text" : "password"} placeholder={mode === "register" ? "Min. 6 characters" : "Enter your password"} value={password} onChange={(e) => setPassword(e.target.value)} className="h-10 pl-9 pr-10" required minLength={6} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground" >
                    {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              </div>

              <Button type="submit" className="mt-2 h-10 w-full gap-2" disabled={isLoading}>
                {isLoading ? (
                  <span className="flex items-center gap-2">Processing...</span>
                ) : (
                  <>{mode === "login" ? "Sign in" : "Create account"} <ArrowRight className="size-4" /></>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}