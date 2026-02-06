import nodemailer from "nodemailer";

export async function sendEmail({
    to,
    subject,
    html,
}: {
    to: string;
    subject: string;
    html: string;
}) {
    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.GMAIL_USER,
            pass: process.env.GMAIL_PASS, // App Password
        },
    });

    try {
        console.log(`[NODEMAILER] Attempting to send email to ${to}`);
        await transporter.sendMail({
            from: process.env.GMAIL_USER,
            to,
            subject,
            html,
        });
        console.log(`[NODEMAILER] Email sent successfully to ${to}`);
    } catch (error) {
        console.error("[NODEMAILER] Failed to send email:", error);
    }
}
