"use client"

import { useState } from "react"
import { authClient } from "../lib/auth-client"
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

export function ForgotPasswordForm({
    className,
    ...props
}: React.ComponentProps<"div">) {
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setLoading(true)
        setError(null)
        setSuccess(false)
        const formData = new FormData(e.currentTarget)
        const email = formData.get("email") as string

        await authClient.emailOtp.sendVerificationOtp({
            email,
            type: "forget-password",
            fetchOptions: {
                onError: (ctx) => {
                    setLoading(false)
                    setError(ctx.error.message)
                    toast.error(ctx.error.message)
                },
                onSuccess: () => {
                    setLoading(false)
                    setSuccess(true)
                    toast.success("Reset OTP sent to your email")
                    localStorage.setItem("emailForReset", email)
                    window.location.href = "/otp?flow=reset-password"
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
                    <h2 className="text-xl md:text-2xl font-bold tracking-tight">Reset your password</h2>
                    <p className="text-muted-foreground text-sm mt-1">
                        Enter your email and we&apos;ll send you a reset code
                    </p>
                </div>

                {/* Content */}
                <div className="px-5 pb-6 pt-3 md:px-7 md:pb-7">
                    <form onSubmit={handleSubmit}>
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

                            {error && (
                                <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3 text-destructive text-sm">
                                    {error}
                                </div>
                            )}
                            {success && (
                                <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3 text-green-600 dark:text-green-400 text-sm">
                                    Check your email for the reset code.
                                </div>
                            )}

                            <Field>
                                <Button type="submit" variant={"cta"} disabled={loading} className="w-full h-10 md:h-11 text-sm md:text-base font-semibold mt-1">
                                    {loading ? "Sending..." : "Send Reset Code"}
                                </Button>
                                <FieldDescription className="text-center text-sm mt-4">
                                    Remember your password?{" "}
                                    <a href="/login" className="text-primary font-medium hover:text-primary/80 underline-offset-4 hover:underline transition-colors">
                                        Login
                                    </a>
                                </FieldDescription>
                            </Field>
                        </FieldGroup>
                    </form>
                </div>
            </div>
        </div>
    )
}
