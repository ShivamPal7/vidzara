"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    Field,
    FieldDescription,
    FieldGroup,
    FieldLabel,
} from "@/components/ui/field"
import {
    InputOTP,
    InputOTPGroup,
    InputOTPSlot,
} from "@/components/ui/input-otp"

export function OtpForm({
    className,
    ...props
}: React.ComponentProps<"div">) {
    const [timeLeft, setTimeLeft] = React.useState(59)
    const [isActive, setIsActive] = React.useState(true)

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

    const handleResend = (e: React.MouseEvent<HTMLAnchorElement>) => {
        e.preventDefault()
        setTimeLeft(59)
        setIsActive(true)
    }

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60)
        const s = seconds % 60
        return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`
    }

    return (
        <div className={cn("flex flex-col gap-6", className)} {...props}>
            <Card>
                <CardHeader>
                    <CardTitle>Verify your email</CardTitle>
                    <CardDescription>
                        Enter the 4-digit code sent to your email address
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form>
                        <FieldGroup>
                            <Field>
                                <div className="flex items-center justify-between">
                                    <FieldLabel htmlFor="otp">One-Time Password</FieldLabel>
                                    <span className="text-sm text-muted-foreground">{formatTime(timeLeft)}</span>
                                </div>
                                <div className="flex justify-center py-4">
                                    <InputOTP maxLength={4}>
                                        <InputOTPGroup className="gap-4">
                                            <InputOTPSlot index={0} className="rounded-sm border shadow-sm size-12" />
                                            <InputOTPSlot index={1} className="rounded-sm border shadow-sm size-12" />
                                            <InputOTPSlot index={2} className="rounded-sm border shadow-sm size-12" />
                                            <InputOTPSlot index={3} className="rounded-sm border shadow-sm size-12" />
                                        </InputOTPGroup>
                                    </InputOTP>
                                </div>
                            </Field>
                            <Field>
                                <Button type="submit" variant={"cta"} className="w-full">Verify Email</Button>
                                <FieldDescription className="text-center mt-2">
                                    Otp didn't arrive?{" "}
                                    {isActive ? (
                                        <span className="text-muted-foreground cursor-not-allowed">Resend in {formatTime(timeLeft)}</span>
                                    ) : (
                                        <a href="#" onClick={handleResend} className="font-medium text-primary hover:underline underline-offset-4">Resend</a>
                                    )}
                                </FieldDescription>
                            </Field>
                        </FieldGroup>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
