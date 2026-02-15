"use client"

import * as React from "react"
import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
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
import {
    InputOTP,
    InputOTPGroup,
    InputOTPSlot,
} from "./ui/input-otp"

export function OtpForm({
    className,
    ...props
}: React.ComponentProps<"div">) {
    const [timeLeft, setTimeLeft] = React.useState(59)
    const [isActive, setIsActive] = React.useState(true)
    const [loading, setLoading] = useState(false)
    const [otp, setOtp] = useState("")
    const router = useRouter()
    const searchParams = useSearchParams()
    const flow = searchParams.get("flow")

    React.useEffect(() => {
        let interval: NodeJS.Timeout | null = null
        if (isActive && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft((seconds) => seconds - 1)
            }, 1000)
        } else if (timeLeft === 0) {
            setIsActive(false)
        }
        return () => {
            if (interval) clearInterval(interval)
        }
    }, [isActive, timeLeft])

    const handleResend = async (e: React.MouseEvent<HTMLAnchorElement>) => {
        e.preventDefault()
        const emailKey = flow === "reset-password" ? "emailForReset" : "emailForVerification"
        const email = localStorage.getItem(emailKey)
        if (!email) {
            toast.error("Email not found. Please start over.")
            return;
        }

        try {
            await authClient.emailOtp.sendVerificationOtp({
                email,
                type: flow === "reset-password" ? "forget-password" : "email-verification"
            })
            setTimeLeft(59)
            setIsActive(true)
            toast.success("OTP resent successfully")
        } catch (error: any) {
            toast.error(error.message || "Failed to resend OTP")
        }
    }

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60)
        const s = seconds % 60
        return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`
    }

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        const emailKey = flow === "reset-password" ? "emailForReset" : "emailForVerification"
        const email = localStorage.getItem(emailKey)

        if (!email) {
            toast.error("Email not found. Please start over.")
            setLoading(false)
            return
        }

        if (flow === "reset-password") {
            try {
                localStorage.setItem("otpForReset", otp)
                router.push("/reset-password")
                toast.success("Code verified")
            } catch (error: any) {
                toast.error(error.message || "Invalid OTP")
                setLoading(false)
            }
        } else {
            await authClient.emailOtp.verifyEmail({
                email,
                otp,
                fetchOptions: {
                    onError: (ctx: any) => {
                        setLoading(false)
                        toast.error(ctx.error.message)
                    },
                    onSuccess: () => {
                        setLoading(false)
                        toast.success("Email verified successfully")
                        window.location.href = "/dashboard"
                    }
                }
            })
        }
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
                    <h2 className="text-xl md:text-2xl font-bold tracking-tight">
                        {flow === "reset-password" ? "Verify code" : "Verify your email"}
                    </h2>
                    <p className="text-muted-foreground text-sm mt-1">
                        Enter the 4-digit code sent to your email
                    </p>
                </div>

                {/* Content */}
                <div className="px-5 pb-6 pt-3 md:px-7 md:pb-7">
                    <form onSubmit={handleVerify}>
                        <FieldGroup>
                            <Field>
                                <div className="flex items-center justify-between">
                                    <FieldLabel htmlFor="otp">One-Time Password</FieldLabel>
                                    <span className="text-xs text-muted-foreground font-mono bg-muted/50 px-2 py-0.5 rounded-md">
                                        {formatTime(timeLeft)}
                                    </span>
                                </div>
                                <div className="flex justify-center py-4">
                                    <InputOTP maxLength={4} value={otp} onChange={(value) => setOtp(value)}>
                                        <InputOTPGroup className="gap-3 md:gap-4">
                                            <InputOTPSlot index={0} className="rounded-lg! border! border-border/50 bg-background/50 shadow-sm size-14 text-lg font-semibold" />
                                            <InputOTPSlot index={1} className="rounded-lg! border! border-border/50 bg-background/50 shadow-sm size-14 text-lg font-semibold" />
                                            <InputOTPSlot index={2} className="rounded-lg! border! border-border/50 bg-background/50 shadow-sm size-14 text-lg font-semibold" />
                                            <InputOTPSlot index={3} className="rounded-lg! border! border-border/50 bg-background/50 shadow-sm size-14 text-lg font-semibold" />
                                        </InputOTPGroup>
                                    </InputOTP>
                                </div>
                            </Field>
                            <Field>
                                <Button type="submit" variant={"cta"} className="w-full h-10 md:h-11 text-sm md:text-base font-semibold" disabled={loading}>
                                    {loading ? "Verifying..." : "Verify Code"}
                                </Button>
                                <FieldDescription className="text-center text-sm mt-4">
                                    Didn&apos;t receive the code?{" "}
                                    {isActive ? (
                                        <span className="text-muted-foreground cursor-not-allowed">Resend in {formatTime(timeLeft)}</span>
                                    ) : (
                                        <a href="#" onClick={handleResend} className="text-primary font-medium hover:text-primary/80 underline-offset-4 hover:underline transition-colors">
                                            Resend
                                        </a>
                                    )}
                                </FieldDescription>
                            </Field>
                        </FieldGroup>
                    </form>
                </div>
            </div>
        </div>
    )
}
