"use client"

import { useState } from "react"
import { authClient } from "../lib/auth-client"
import { toast } from "sonner"
import { cn } from "../lib/utils"
import { Button } from "./ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "./ui/card"
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
                    // Store email for the reset step
                    localStorage.setItem("emailForReset", email)
                    window.location.href = "/otp?flow=reset-password"
                }
            }
        })
    }

    return (
        <div className={cn("flex flex-col gap-6", className)} {...props}>
            <Card>
                <CardHeader>
                    <CardTitle>Reset your password</CardTitle>
                    <CardDescription>
                        Enter your email address to receive a password reset link
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit}>
                        <FieldGroup>
                            <Field>
                                <FieldLabel htmlFor="email">Email</FieldLabel>
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    placeholder="m@example.com"
                                    required
                                />
                            </Field>
                            {error && <div className="text-red-500 text-sm">{error}</div>}
                            {success && <div className="text-green-500 text-sm">Check your email for the reset link.</div>}
                            <Field>
                                <Button type="submit" variant={"cta"} disabled={loading}>
                                    {loading ? "Sending..." : "Send Reset OTP"}
                                </Button>
                                <FieldDescription className="text-center">
                                    Remember your password? <a href="/login">Login</a>
                                </FieldDescription>
                            </Field>
                        </FieldGroup>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
