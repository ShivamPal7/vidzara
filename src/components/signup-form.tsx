"use client"

import { useState } from "react"
import { signIn, signUp } from "../lib/auth-client"
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

import { useRouter } from "next/navigation"

export function SignupForm({
    className,
    ...props
}: React.ComponentProps<"div">) {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const router = useRouter()

    const handleCredentialsSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setLoading(true)
        setError(null)
        const formData = new FormData(e.currentTarget)
        const email = formData.get("email") as string
        const password = formData.get("password") as string
        const name = formData.get("name") as string

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
                    toast.success("Account created. Please verify your email.")
                    router.push("/otp")
                }
            }
        })
    }
    // ... rest of the file (handleGoogleSignIn, return)
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
            <Card>
                <CardHeader>
                    <CardTitle>Sign up for an account</CardTitle>
                    <CardDescription>
                        Enter your email below to create your account
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleCredentialsSignUp}>
                        <FieldGroup>
                            <Field>
                                <FieldLabel htmlFor="name">Name</FieldLabel>
                                <Input
                                    id="name"
                                    name="name"
                                    type="text"
                                    placeholder="John Doe"
                                    required
                                />
                            </Field>
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
                            <Field>
                                <FieldLabel htmlFor="password">Password</FieldLabel>
                                <Input id="password" name="password" type="password" required />
                            </Field>
                            {error && <div className="text-red-500 text-sm">{error}</div>}
                            <Field>
                                <Button type="submit" variant={"cta"} disabled={loading}>
                                    {loading ? "Signing up..." : "Sign up"}
                                </Button>
                                <Button variant="outline" type="button" onClick={handleGoogleSignIn}>
                                    <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
                                        <path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path>
                                    </svg>
                                    Sign up with Google
                                </Button>
                                <FieldDescription className="text-center">
                                    Already have an account? <a href="/login">Login</a>
                                </FieldDescription>
                            </Field>
                        </FieldGroup>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
