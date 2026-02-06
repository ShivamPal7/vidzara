"use client"

import { useState, useEffect } from "react"
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
            <Card>
                <CardHeader>
                    <CardTitle>Set new password</CardTitle>
                    <CardDescription>
                        Enter your new password below.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit}>
                        <FieldGroup>
                            <Field>
                                <FieldLabel htmlFor="password">New Password</FieldLabel>
                                <Input id="password" name="password" type="password" required />
                            </Field>
                            <Field>
                                <FieldLabel htmlFor="confirmPassword">Confirm Password</FieldLabel>
                                <Input id="confirmPassword" name="confirmPassword" type="password" required />
                            </Field>
                            <Field>
                                <Button type="submit" variant={"cta"} disabled={loading}>
                                    {loading ? "Resetting..." : "Reset Password"}
                                </Button>
                            </Field>
                        </FieldGroup>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
