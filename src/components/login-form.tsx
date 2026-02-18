"use client";

import { useState } from "react"
import { signIn } from "../lib/auth-client"
import { toast } from "sonner"
import { cn } from "../lib/utils"
import { Button } from "./ui/button"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "./ui/field"
import { Input } from "./ui/input"

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleCredentialsSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const formData = new FormData(e.currentTarget)
    const email = formData.get("email") as string
    const password = formData.get("password") as string

    await signIn.email({
      email,
      password,
      fetchOptions: {
        onError: (ctx) => {
          setLoading(false)
          setError(ctx.error.message)
          toast.error(ctx.error.message)
        },
        onSuccess: () => {
          setLoading(false)
          window.location.href = "/dashboard"
        }
      }
    })
  }

  const handleGoogleSignIn = async () => {
    await signIn.social({
      provider: "google",
      callbackURL: "/dashboard",
      fetchOptions: {
        onError: (ctx) => {
          toast.error(ctx.error.message)
        }
      }
    })
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      {/* Card with glassmorphism */}
      <div className="relative bg-card/60 backdrop-blur-xl border border-border/50 glass-2 rounded-2xl shadow-xl overflow-hidden">
        {/* Top glow bar */}
        <div className="absolute top-0 left-1/4 right-1/4 h-px bg-linear-to-r from-transparent via-primary/60 to-transparent" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-8 bg-primary/15 blur-2xl rounded-full" />

        {/* Header */}
        <div className="px-5 pt-6 pb-1 md:px-7 md:pt-7">
          <h2 className="text-xl md:text-2xl font-bold tracking-tight">Welcome back</h2>
          <p className="text-muted-foreground text-sm mt-1">
            Enter your credentials to access your account
          </p>
        </div>

        {/* Content */}
        <div className="px-5 pb-6 pt-3 md:px-7 md:pb-7">
          <form onSubmit={handleCredentialsSignIn}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  required
                  className="bg-background/50 border-border/50 focus:border-primary/50 transition-colors"
                />
              </Field>
              <Field>
                <div className="flex items-center">
                  <FieldLabel htmlFor="password">Password</FieldLabel>
                  <a
                    href="/forgot-password"
                    className="ml-auto inline-block text-xs text-primary hover:text-primary/80 underline-offset-4 hover:underline transition-colors"
                  >
                    Forgot password?
                  </a>
                </div>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="bg-background/50 border-border/50 focus:border-primary/50 transition-colors"
                />
              </Field>

              {error && (
                <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3 text-destructive text-sm">
                  {error}
                </div>
              )}

              <Field>
                <Button type="submit" variant={"cta"} disabled={loading} className="w-full h-10 md:h-11 text-sm md:text-base font-semibold mt-1">
                  {loading ? "Logging in..." : "Login"}
                </Button>
              </Field>

              {/* Divider */}
              <div className="relative my-0">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border/50" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-card/60 backdrop-blur-sm px-3 text-muted-foreground">or continue with</span>
                </div>
              </div>

              <Field>
                <Button variant="outline" type="button" onClick={handleGoogleSignIn} className="w-full glass-1 bg-background/30 hover:bg-background/50 transition-all py-4">
                  <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
                    <path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path>
                  </svg>
                  Continue with Google
                </Button>
              </Field>

              <FieldDescription className="text-center text-sm">
                Don&apos;t have an account?{" "}
                <a href="/signup" className="text-primary font-medium hover:text-primary/80 underline-offset-4 hover:underline transition-colors">
                  Sign up
                </a>
              </FieldDescription>
            </FieldGroup>
          </form>
        </div>
      </div>
    </div>
  )
}
