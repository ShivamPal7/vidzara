import { Suspense } from "react"
import { AuthLayout } from "../../../components/auth-layout"
import { OtpForm } from "../../../components/otp-form"

export default function Page() {
    return (
        <AuthLayout>
            <Suspense fallback={<div className="text-muted-foreground text-center py-8">Loading...</div>}>
                <OtpForm />
            </Suspense>
        </AuthLayout>
    )
}
