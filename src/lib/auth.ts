import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { emailOTP } from "better-auth/plugins/email-otp";
import { prisma } from "./prisma";
import { sendEmail } from "./email";

console.log("[DEBUG] Initializing Better Auth with trustedProviders:", ["google"]);

export const auth = betterAuth({
    baseURL: process.env.BETTER_AUTH_URL,
    trustedOrigins: [
        "http://localhost:3000",
        "https://vidzara.vercel.app",
        "https://www.vidzara.vercel.app",
],
    database: prismaAdapter(prisma, {
        provider: "postgresql",
    }),
    emailAndPassword: {
        enabled: true,
        requireEmailVerification: false,
    },
    socialProviders: {
        google: {
            clientId: process.env.GOOGLE_CLIENT_ID as string,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
        },
    },
    account: {
        accountLinking: {
            trustedProviders: ["google"],
        },
    },
    plugins: [
        emailOTP({
            otpLength: 4,
            sendVerificationOnSignUp: true,
            async sendVerificationOTP({ email, otp, type }) {
                console.log(`[DEBUG] sendVerificationOTP triggered for ${email} with OTP: ${otp} (Type: ${type})`);
                try {
                    await sendEmail({
                        to: email,
                        subject: "Your Verification Code",
                        html: `<p>Your verification code is: <strong>${otp}</strong></p>`
                    });
                    console.log(`[DEBUG] sendEmail completed for ${email}`);
                } catch (e) {
                    console.error("[DEBUG] sendEmail failed:", e);
                }
            },
        }),
    ],
});
