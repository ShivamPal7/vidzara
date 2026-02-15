"use client"

import { useState, useEffect } from "react"
import { authClient } from "../lib/auth-client"
import { toast } from "sonner"
import { cn } from "../lib/utils"
import { Button } from "./ui/button"
import {
    Field,
    FieldGroup,
    FieldLabel,
} from "./ui/field"
import { Input } from "./ui/input"
import {
    InputOTP,
    InputOTPGroup,
    InputOTPSlot,
} from "./ui/input-otp"
import { useRouter } from "next/navigation"

export function ResetPasswordForm({
    className,
    ...props
}: React.ComponentProps<"div">) {
    const [loading, setLoading] = useState(false)
    const [email, setEmail] = useState("")
    const [otp, setOtp] = useState("")
    const router = useRouter()

    useEffect(() => {
        const storedEmail = localStorage.getItem("emailForReset")
        const storedOtp = localStorage.getItem("otpForReset")
        if (storedEmail) setEmail(storedEmail)
        if (storedOtp) setOtp(storedOtp)
    }, [])

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setLoading(true)
        const formData = new FormData(e.currentTarget)
        const password = formData.get("password") as string
        const confirmPassword = formData.get("confirmPassword") as string

        if (password !== confirmPassword) {
            toast.error("Passwords do not match")
            setLoading(false)
            return
        }

        console.log("[DEBUG] Resetting password with:", { email, otp, password });
        if (!email || !otp) {
            toast.error("Missing email or OTP. Please restart the flow.");
            setLoading(false);
            return;
        }

        await authClient.emailOtp.resetPassword({
            email,
            otp,
            password,
            fetchOptions: {
                onError: (ctx) => {
                    setLoading(false)
                    toast.error(ctx.error.message)
                },
                onSuccess: () => {
                    setLoading(false)
                    toast.success("Password reset successfully. Please login.")
                    router.push("/login")
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
                    <h2 className="text-xl md:text-2xl font-bold tracking-tight">Set new password</h2>
                    <p className="text-muted-foreground text-sm mt-1">
                        Choose a strong password for your account
                    </p>
                </div>

                {/* Content */}
                <div className="px-5 pb-6 pt-3 md:px-7 md:pb-7">
                    <form onSubmit={handleSubmit}>
                        <FieldGroup>
                            <Field>
                                <FieldLabel htmlFor="password">New Password</FieldLabel>
                                <Input
                                    id="password"
                                    name="password"
                                    type="password"
                                    required
                                    className="bg-background/50 border-border/50 focus:border-primary/50 transition-colors"
                                />
                            </Field>
                            <Field>
                                <FieldLabel htmlFor="confirmPassword">Confirm Password</FieldLabel>
                                <Input
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    type="password"
                                    required
                                    className="bg-background/50 border-border/50 focus:border-primary/50 transition-colors"
                                />
                            </Field>
                            <Field>
                                <Button type="submit" variant={"cta"} disabled={loading} className="w-full h-10 md:h-11 text-sm md:text-base font-semibold mt-1">
                                    {loading ? "Resetting..." : "Reset Password"}
                                </Button>
                            </Field>
                        </FieldGroup>
                    </form>
                </div>
            </div>
        </div>
    )
}
