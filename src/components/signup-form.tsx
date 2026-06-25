"use client"

import { useState } from "react"
import { signIn, signUp } from "../lib/auth-client"
import { toast } from "sonner"
import { cn } from "../lib/utils"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { motion, AnimatePresence } from "framer-motion"
import { IconLoader2, IconEye, IconEyeOff } from "@tabler/icons-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

export function SignupForm({
    className,
    ...props
}: React.ComponentProps<"div">) {
    const [loading, setLoading] = useState(false)
    const [googleLoading, setGoogleLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [showPassword, setShowPassword] = useState(false)
    const router = useRouter()

    const handleCredentialsSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setLoading(true)
        setError(null)
        const formData = new FormData(e.currentTarget)
        const email = formData.get("email") as string
        const password = formData.get("password") as string
        const name = email.split("@")[0] || "User"

        await signUp.email({
            email,
            password,
            name,
            fetchOptions: {
                onError: (ctx) => {
                    setLoading(false)
                    setError(ctx.error.message)
                    toast.error(ctx.error.message)
                },
                onSuccess: () => {
                    setLoading(false)
                    localStorage.setItem("emailForVerification", email)
                    toast.success("Verification code sent to your email.")
                    router.push("/otp?flow=email-verification")
                }
            }
        })
    }

    const handleGoogleSignIn = async () => {
        setGoogleLoading(true)
        await signIn.social({
            provider: "google",
            callbackURL: "/dashboard",
            fetchOptions: {
                onError: (ctx) => {
                    setGoogleLoading(false)
                    toast.error(ctx.error.message)
                }
            }
        })
    }

    return (
        <div className={cn("", className)} {...props}>

            {/* ── Card ── */}
            <div
                className="rounded-xl border px-7 py-8 shadow-2xl"
                style={{
                    background: "var(--card)",
                    borderColor: "color-mix(in oklch, var(--border) 60%, transparent)",
                    boxShadow:
                        "0 0 0 1px color-mix(in oklch, var(--border) 40%, transparent), 0 24px 60px -12px oklch(0 0 0 / 0.45), 0 8px 20px -8px oklch(0 0 0 / 0.3)",
                }}
            >

                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-[1.375rem] font-bold tracking-tight text-foreground">
                        Create an account
                    </h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Start growing your channel with AI.
                    </p>
                </div>

                {/* Google — primary social action */}
                <button
                    type="button"
                    onClick={handleGoogleSignIn}
                    disabled={googleLoading || loading}
                    className={cn(
                        "flex w-full items-center justify-center gap-2.5 rounded-lg border px-4 h-10 text-sm font-medium transition-all duration-200",
                        "bg-muted/20 border-border/60 text-foreground hover:bg-muted/50 hover:border-border",
                        "disabled:pointer-events-none disabled:opacity-50"
                    )}
                >
                    {googleLoading ? (
                        <IconLoader2 className="h-4 w-4 animate-spin" />
                    ) : (
                        <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                        </svg>
                    )}
                    Continue with Google
                </button>

                {/* Divider */}
                <div className="relative my-5 flex items-center">
                    <div className="flex-1 border-t border-border/30" />
                    <span className="px-4 text-[11px] font-medium uppercase tracking-[0.15em] text-muted-foreground/40">
                        or
                    </span>
                    <div className="flex-1 border-t border-border/30" />
                </div>

                {/* Form */}
                <form onSubmit={handleCredentialsSignUp} className="flex flex-col gap-4">

                    {/* Email */}
                    <div className="flex flex-col gap-1.5">
                        <label htmlFor="email" className="text-[0.8125rem] font-medium text-foreground/60">
                            Email address
                        </label>
                        <Input
                            id="email"
                            name="email"
                            type="email"
                            placeholder="you@example.com"
                            required
                            autoComplete="email"
                            className="h-10 rounded-lg bg-muted/30 border-border/50 text-sm placeholder:text-muted-foreground/30 focus-visible:border-primary/50 focus-visible:ring-0 transition-colors"
                        />
                    </div>

                    {/* Password */}
                    <div className="flex flex-col gap-1.5">
                        <label htmlFor="password" className="text-[0.8125rem] font-medium text-foreground/60">
                            Password
                        </label>
                        <div className="relative">
                            <Input
                                id="password"
                                name="password"
                                type={showPassword ? "text" : "password"}
                                required
                                placeholder="Min. 8 characters"
                                autoComplete="new-password"
                                className="h-10 rounded-lg pr-9 bg-muted/30 border-border/50 text-sm placeholder:text-muted-foreground/30 focus-visible:border-primary/50 focus-visible:ring-0 transition-colors"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                tabIndex={-1}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/30 hover:text-muted-foreground/70 transition-colors"
                                aria-label={showPassword ? "Hide password" : "Show password"}
                            >
                                {showPassword
                                    ? <IconEyeOff className="h-3.5 w-3.5" />
                                    : <IconEye className="h-3.5 w-3.5" />
                                }
                            </button>
                        </div>
                    </div>

                    {/* Error */}
                    <AnimatePresence>
                        {error && (
                            <motion.p
                                key="error"
                                initial={{ opacity: 0, y: -6 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                className="text-[0.8125rem] text-destructive"
                            >
                                {error}
                            </motion.p>
                        )}
                    </AnimatePresence>

                    {/* CTA */}
                    <Button
                        type="submit"
                        variant="cta"
                        disabled={loading || googleLoading}
                        className="mt-1 w-full h-10 rounded-lg text-sm font-semibold tracking-wide"
                    >
                        {loading ? (
                            <>
                                <IconLoader2 className="h-3.5 w-3.5 animate-spin mr-2" />
                                Creating account…
                            </>
                        ) : (
                            "Create account"
                        )}
                    </Button>

                    {/* Terms */}
                    <p className="text-center text-[0.75rem] text-muted-foreground/50 leading-snug">
                        By creating an account, you agree to our{" "}
                        <Link href="/terms" className="underline underline-offset-2 hover:text-muted-foreground transition-colors">
                            Terms
                        </Link>{" "}
                        and{" "}
                        <Link href="/privacy" className="underline underline-offset-2 hover:text-muted-foreground transition-colors">
                            Privacy Policy
                        </Link>
                        .
                    </p>
                </form>
            </div>

            {/* Sign-in link — outside card */}
            <p className="mt-5 text-center text-[0.8125rem] text-muted-foreground">
                Already have an account?{" "}
                <Link
                    href="/login"
                    className="font-semibold text-foreground transition-colors hover:text-primary"
                >
                    Sign in
                </Link>
            </p>
        </div>
    )
}
