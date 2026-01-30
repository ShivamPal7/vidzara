import { OtpForm } from "@/components/otp-form"
import Image from "next/image"
import Link from "next/link"

export default function Page() {
    return (
        <div className="relative flex min-h-svh w-full items-center justify-center p-6 md:p-10 overflow-hidden bg-background">
            {/* Logo */}
            <div className="flex items-center flex-1 lg:flex-none absolute top-8 md:left-8">
                <Link href="/" className="relative z-50 flex items-center gap-2 group">
                    <div className="relative h-8 w-8 sm:h-10 sm:w-10">
                        <Image
                            src="/logo.png"
                            alt="Vidzara Logo"
                            fill
                            className="object-contain transition-all group-hover:drop-shadow-[0_0_8px_rgba(99,102,241,0.6)]"
                            priority
                        />
                    </div>
                    <span className="text-lg sm:text-xl font-bold tracking-tight flex items-center">
                        Vidzara
                    </span>
                </Link>
            </div>

            <div className="w-full max-w-sm relative z-10">
                <OtpForm />
            </div>
        </div>
    )
}
