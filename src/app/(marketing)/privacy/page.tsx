import type { Metadata } from "next";
import Link from "next/link";
import { IconShieldCheck, IconLock, IconDatabase, IconBrandYoutube, IconCreditCard, IconUser, IconMail, IconChevronRight } from "@tabler/icons-react";

export const metadata: Metadata = {
    title: "Privacy Policy — Vidzara",
    description: "Learn how Vidzara collects, uses, and protects your personal data, including YouTube channel data and subscription information.",
};

const LAST_UPDATED = "June 11, 2026";
const CONTACT_EMAIL = "team@vidzara.com";

interface Section {
    id: string;
    icon: React.ReactNode;
    title: string;
    content: React.ReactNode;
}

const sections: Section[] = [
    {
        id: "information-we-collect",
        icon: <IconDatabase className="w-5 h-5" />,
        title: "Information We Collect",
        content: (
            <div className="space-y-4">
                <p>We collect information to provide, improve, and secure the Vidzara platform. The categories of data we collect include:</p>

                <div className="space-y-3">
                    <SubSection title="Account Information">
                        When you create an account, we collect your name, email address, and a hashed password. If you sign in via Google OAuth, we receive your Google profile name, email, and profile picture as provided by Google.
                    </SubSection>

                    <SubSection title="YouTube Channel Data (via YouTube API)">
                        <p>To power features like Competitor Analysis, Outlier Detection, Consistency Checker, and the Creator Growth Dashboard, Vidzara uses the <strong>YouTube Data API v3</strong>. When you connect your YouTube channel or analyze a public channel, we may access:</p>
                        <ul className="list-disc pl-5 mt-2 space-y-1 text-muted-foreground">
                            <li>Channel metadata (name, description, subscriber count, video count)</li>
                            <li>Public video metadata (titles, descriptions, tags, view counts, like counts, publish dates)</li>
                            <li>Channel upload activity and posting patterns</li>
                        </ul>
                        <p className="mt-2 text-sm border-l-2 border-primary/40 pl-3 text-muted-foreground">
                            We only access <strong>publicly available</strong> YouTube data. We do not access your private videos, watch history, or upload content on your behalf. YouTube data fetched is governed by the <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-primary underline underline-offset-4">Google Privacy Policy</a> and <a href="https://developers.google.com/youtube/terms/api-services-terms-of-service" target="_blank" rel="noopener noreferrer" className="text-primary underline underline-offset-4">YouTube API Terms of Service</a>.
                        </p>
                    </SubSection>

                    <SubSection title="Usage and Generation Data">
                        We log which AI tools you use, the inputs you provide (topics, scripts, channel links), and the outputs generated. This is used to enforce fair usage limits, improve AI quality, and detect abuse.
                    </SubSection>

                    <SubSection title="Payment Information">
                        Payments are processed by <strong>Razorpay</strong> (India) or <strong>Stripe</strong> (global). We do not store your full card number or CVV. We retain billing records such as plan type, subscription status, payment dates, and transaction IDs for accounting and support purposes.
                    </SubSection>

                    <SubSection title="Technical Data">
                        We collect IP addresses, browser type, operating system, device identifiers, and pages visited to ensure platform security, detect abuse, enforce rate limits, and determine location-based pricing.
                    </SubSection>
                </div>
            </div>
        ),
    },
    {
        id: "how-we-use",
        icon: <IconShieldCheck className="w-5 h-5" />,
        title: "How We Use Your Information",
        content: (
            <div className="space-y-3">
                <p>We use your data strictly to operate and improve Vidzara. Specifically:</p>
                <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
                    <li>To authenticate you and maintain your session securely.</li>
                    <li>To generate AI-powered content (titles, scripts, hooks, thumbnails) based on your inputs.</li>
                    <li>To analyze YouTube channels you submit and display insights in the dashboard.</li>
                    <li>To enforce subscription plan limits and fair usage policies.</li>
                    <li>To process payments and manage subscription billing via Razorpay and Stripe.</li>
                    <li>To send transactional emails (receipts, plan changes, security alerts). We do <strong>not</strong> send marketing emails without your explicit opt-in.</li>
                    <li>To detect and prevent fraud, abuse, bot activity, and policy violations.</li>
                    <li>To comply with applicable laws, tax obligations, and payment processor requirements.</li>
                    <li>To track referral commissions for our affiliate program.</li>
                </ul>
                <p className="text-sm text-muted-foreground mt-2">We do <strong>not</strong> sell, rent, or trade your personal data to third parties for marketing purposes.</p>
            </div>
        ),
    },
    {
        id: "youtube-api",
        icon: <IconBrandYoutube className="w-5 h-5" />,
        title: "YouTube API Services",
        content: (
            <div className="space-y-4">
                <p>Vidzara uses the YouTube Data API v3 to power several analytical features. This section explains our usage in detail.</p>

                <SubSection title="What We Access">
                    <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                        <li>Public channel statistics (subscribers, video count, total views)</li>
                        <li>Public video lists, titles, descriptions, tags, view counts, and publish timestamps</li>
                        <li>Channel upload patterns for consistency analysis</li>
                    </ul>
                </SubSection>

                <SubSection title="What We Do NOT Access">
                    <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                        <li>Private or unlisted videos</li>
                        <li>Your YouTube account's private analytics (unless explicitly granted via OAuth)</li>
                        <li>Your watch history, liked videos, or subscriptions</li>
                        <li>Comments or community posts</li>
                        <li>Your ability to upload, edit, or delete videos</li>
                    </ul>
                </SubSection>

                <SubSection title="Data Retention from YouTube API">
                    YouTube channel data fetched for analysis is cached temporarily (up to 24 hours) to reduce API calls and improve performance. After 24 hours, cached data is either refreshed or deleted. You may request deletion of your stored YouTube analysis data at any time by contacting us.
                </SubSection>

                <SubSection title="Revoking YouTube API Access">
                    If you have connected your Google account via OAuth, you can revoke Vidzara's access at any time by visiting your <a href="https://myaccount.google.com/permissions" target="_blank" rel="noopener noreferrer" className="text-primary underline underline-offset-4">Google Account Permissions</a> page and removing Vidzara. Revoking access will disable YouTube-connected features but will not delete your Vidzara account or other data.
                </SubSection>
            </div>
        ),
    },
    {
        id: "subscriptions-billing",
        icon: <IconCreditCard className="w-5 h-5" />,
        title: "Subscriptions & Billing",
        content: (
            <div className="space-y-3">
                <p>Vidzara offers subscription plans billed monthly or annually. Your plan determines your access tier and usage limits.</p>
                <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
                    <li><strong>India:</strong> Payments processed by Razorpay in INR.</li>
                    <li><strong>Global:</strong> Payments processed by Stripe in USD.</li>
                    <li>Your subscription status is driven by webhook notifications from our payment processors. We do not manually alter subscription states.</li>
                    <li>Coupon codes, if used, are validated server-side before being applied to your invoice.</li>
                    <li>We retain billing records (amount, date, plan, status) for a minimum of 7 years for tax and legal compliance.</li>
                    <li>Refund requests are handled per our <Link href="/terms" className="text-primary underline underline-offset-4">Terms of Service</Link>.</li>
                </ul>
            </div>
        ),
    },
    {
        id: "data-sharing",
        icon: <IconLock className="w-5 h-5" />,
        title: "Data Sharing & Third Parties",
        content: (
            <div className="space-y-3">
                <p>We share your data only as necessary to operate Vidzara:</p>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm mt-2 border-collapse">
                        <thead>
                            <tr className="border-b border-border">
                                <th className="text-left py-2 pr-4 font-semibold">Service</th>
                                <th className="text-left py-2 pr-4 font-semibold">Purpose</th>
                                <th className="text-left py-2 font-semibold">Data Shared</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/50 text-muted-foreground">
                            <tr>
                                <td className="py-2 pr-4 font-medium text-foreground">Google (YouTube API)</td>
                                <td className="py-2 pr-4">Channel analysis</td>
                                <td className="py-2">API queries for public channel data</td>
                            </tr>
                            <tr>
                                <td className="py-2 pr-4 font-medium text-foreground">Razorpay</td>
                                <td className="py-2 pr-4">India payment processing</td>
                                <td className="py-2">Email, billing amount, plan info</td>
                            </tr>
                            <tr>
                                <td className="py-2 pr-4 font-medium text-foreground">Stripe</td>
                                <td className="py-2 pr-4">Global payment processing</td>
                                <td className="py-2">Email, billing amount, plan info</td>
                            </tr>
                            <tr>
                                <td className="py-2 pr-4 font-medium text-foreground">Neon (PostgreSQL)</td>
                                <td className="py-2 pr-4">Database hosting</td>
                                <td className="py-2">All account and usage data</td>
                            </tr>
                            <tr>
                                <td className="py-2 pr-4 font-medium text-foreground">Supabase Storage</td>
                                <td className="py-2 pr-4">File storage</td>
                                <td className="py-2">Exported files (PDF, CSV)</td>
                            </tr>
                            <tr>
                                <td className="py-2 pr-4 font-medium text-foreground">AI Model Providers</td>
                                <td className="py-2 pr-4">AI generation</td>
                                <td className="py-2">Your input prompts (anonymized where possible)</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <p className="text-sm text-muted-foreground">All third-party services are contractually bound to protect your data and process it only for the stated purpose.</p>
            </div>
        ),
    },
    {
        id: "data-retention",
        icon: <IconDatabase className="w-5 h-5" />,
        title: "Data Retention & Deletion",
        content: (
            <div className="space-y-3">
                <p>We retain your data for as long as your account is active or as required by law.</p>
                <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
                    <li>Generation history is retained for up to 90 days for active accounts.</li>
                    <li>Billing records are retained for 7 years for tax compliance.</li>
                    <li>Cached YouTube API data is retained for up to 24 hours.</li>
                    <li>Upon account deletion, all personal data is purged within 30 days, except where retention is required by law.</li>
                </ul>
                <p>To delete your account and all associated data, go to <strong>Settings → Account → Delete Account</strong> in your dashboard, or email us at <a href={`mailto:${CONTACT_EMAIL}`} className="text-primary underline underline-offset-4">{CONTACT_EMAIL}</a>.</p>
            </div>
        ),
    },
    {
        id: "your-rights",
        icon: <IconUser className="w-5 h-5" />,
        title: "Your Rights",
        content: (
            <div className="space-y-3">
                <p>Depending on your jurisdiction, you have the following rights regarding your personal data:</p>
                <div className="grid sm:grid-cols-2 gap-3 mt-2">
                    {[
                        { title: "Access", desc: "Request a copy of all personal data we hold about you." },
                        { title: "Rectification", desc: "Correct inaccurate or incomplete data." },
                        { title: "Erasure", desc: "Request deletion of your data ('right to be forgotten')." },
                        { title: "Portability", desc: "Receive your data in a machine-readable format." },
                        { title: "Restriction", desc: "Restrict how we process your data in certain circumstances." },
                        { title: "Objection", desc: "Object to processing based on legitimate interests." },
                        { title: "Withdraw Consent", desc: "Revoke consent for optional data processing at any time." },
                        { title: "Non-Discrimination (CCPA)", desc: "We will never discriminate against you for exercising your rights." },
                    ].map((r) => (
                        <div key={r.title} className="rounded-xl border border-border/60 p-3 bg-muted/20">
                            <p className="font-semibold text-sm">{r.title}</p>
                            <p className="text-sm text-muted-foreground mt-0.5">{r.desc}</p>
                        </div>
                    ))}
                </div>
                <p className="text-sm text-muted-foreground">To exercise any of these rights, email us at <a href={`mailto:${CONTACT_EMAIL}`} className="text-primary underline underline-offset-4">{CONTACT_EMAIL}</a>. We will respond within 30 days.</p>
            </div>
        ),
    },
    {
        id: "cookies",
        icon: <IconShieldCheck className="w-5 h-5" />,
        title: "Cookies & Tracking",
        content: (
            <div className="space-y-3">
                <p>We use strictly necessary cookies and session tokens to keep you authenticated. We do <strong>not</strong> use third-party advertising cookies or tracking pixels.</p>
                <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
                    <li><strong>Session Cookies:</strong> Used to maintain your login state. Expire when you close your browser or after 30 days of inactivity.</li>
                    <li><strong>Referral Cookies:</strong> A short-lived cookie stores your referral code (from <code className="text-xs bg-muted px-1 py-0.5 rounded">?ref=</code> URL parameter) for up to 30 days to credit our affiliate partners.</li>
                    <li><strong>No Analytics Trackers:</strong> We do not use Google Analytics, Meta Pixel, or similar third-party trackers.</li>
                </ul>
            </div>
        ),
    },
    {
        id: "security",
        icon: <IconLock className="w-5 h-5" />,
        title: "Security",
        content: (
            <p className="text-muted-foreground">We apply industry-standard security measures including TLS encryption in transit, encrypted passwords (bcrypt), and access-controlled database environments. AI generation inputs are transmitted securely server-side — your data never passes through the browser to our AI providers. We conduct regular security reviews and respond to vulnerabilities promptly. If you believe you have found a security issue, please disclose it responsibly to <a href={`mailto:${CONTACT_EMAIL}`} className="text-primary underline underline-offset-4">{CONTACT_EMAIL}</a>.</p>
        ),
    },
    {
        id: "children",
        icon: <IconUser className="w-5 h-5" />,
        title: "Children's Privacy",
        content: (
            <p className="text-muted-foreground">Vidzara is not directed at children under the age of 13 (or 16 in the EU). We do not knowingly collect personal data from children. If you believe a child has created an account, please contact us and we will delete the account immediately.</p>
        ),
    },
    {
        id: "changes",
        icon: <IconMail className="w-5 h-5" />,
        title: "Changes to This Policy",
        content: (
            <p className="text-muted-foreground">We may update this Privacy Policy from time to time. When we make material changes, we will notify you via email or a prominent notice on the platform at least 7 days before the changes take effect. The "Last Updated" date at the top of this page always reflects the most recent version.</p>
        ),
    },
    {
        id: "contact",
        icon: <IconMail className="w-5 h-5" />,
        title: "Contact Us",
        content: (
            <div className="space-y-2 text-muted-foreground">
                <p>For any privacy-related questions, requests, or complaints, contact us at:</p>
                <div className="inline-flex flex-col gap-1 bg-muted/30 border border-border/60 rounded-xl p-4 text-sm">
                    <p><strong className="text-foreground">Vidzara</strong></p>
                    <p>Email: <a href={`mailto:${CONTACT_EMAIL}`} className="text-primary underline underline-offset-4">{CONTACT_EMAIL}</a></p>
                    <p>Support: <a href="mailto:team@vidzara.com" className="text-primary underline underline-offset-4">team@vidzara.com</a></p>
                </div>
            </div>
        ),
    },
];

function SubSection({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div>
            <p className="font-semibold text-foreground mb-1">{title}</p>
            <div className="text-muted-foreground text-sm leading-relaxed">{children}</div>
        </div>
    );
}

export default function PrivacyPage() {
    return (
        <div className="min-h-screen bg-background">
            {/* Hero */}
            <div className="relative border-b border-border/50 overflow-hidden">
                <div
                    aria-hidden="true"
                    className="absolute inset-0 -z-10 opacity-30 dark:opacity-20"
                    style={{
                        background: "radial-gradient(ellipse 80% 50% at 50% -20%, oklch(0.54 0.27 287) 0%, transparent 70%)",
                    }}
                />
                <div className="w-full max-w-7xl mx-auto px-6 md:px-12 lg:px-16 pt-36 pb-12">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
                        <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
                        <IconChevronRight className="w-3.5 h-3.5" />
                        <span className="text-foreground">Privacy Policy</span>
                    </div>
                    <div className="flex items-start gap-4">
                        <div className="shrink-0 w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mt-1">
                            <IconShieldCheck className="w-6 h-6" />
                        </div>
                        <div>
                            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Privacy Policy</h1>
                            <p className="text-muted-foreground mt-2 text-base leading-relaxed max-w-2xl">
                                We believe privacy is a right, not an afterthought. This policy explains exactly what data Vidzara collects, why, and how it is protected.
                            </p>
                            <p className="text-xs text-muted-foreground/60 mt-3">Last updated: {LAST_UPDATED}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="w-full max-w-7xl mx-auto px-6 md:px-12 lg:px-16 py-12 md:py-16">
                <div className="flex flex-col lg:flex-row gap-12">
                    {/* Table of Contents - sticky sidebar */}
                    <aside className="hidden lg:block w-56 shrink-0">
                        <div className="sticky top-28 space-y-1">
                            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground/60 mb-3">Contents</p>
                            {sections.map((s) => (
                                <a
                                    key={s.id}
                                    href={`#${s.id}`}
                                    className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors py-1 group"
                                >
                                    <span className="opacity-0 group-hover:opacity-100 transition-opacity text-primary">
                                        <IconChevronRight className="w-3 h-3" />
                                    </span>
                                    {s.title}
                                </a>
                            ))}
                        </div>
                    </aside>

                    {/* Sections */}
                    <div className="flex-1 space-y-10">
                        {sections.map((section, i) => (
                            <section
                                key={section.id}
                                id={section.id}
                                className="scroll-mt-28"
                            >
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
                                        {section.icon}
                                    </div>
                                    <h2 className="text-xl font-semibold tracking-tight">
                                        {i + 1}. {section.title}
                                    </h2>
                                </div>
                                <div className="pl-11 text-sm leading-relaxed">
                                    {section.content}
                                </div>
                                {i < sections.length - 1 && (
                                    <div className="mt-10 h-px bg-border/40" />
                                )}
                            </section>
                        ))}
                    </div>
                </div>

                {/* Bottom CTA */}
                <div className="mt-16 rounded-2xl border border-border/60 bg-muted/20 p-8 text-center">
                    <p className="text-muted-foreground text-sm">
                        Have questions about this policy or want to review your data?
                    </p>
                    <a
                        href={`mailto:${CONTACT_EMAIL}`}
                        className="inline-flex items-center gap-2 mt-3 text-sm font-semibold text-primary hover:underline underline-offset-4"
                    >
                        <IconMail className="w-4 h-4" />
                        {CONTACT_EMAIL}
                    </a>
                    <p className="text-xs text-muted-foreground/60 mt-6">
                        Also read our{" "}
                        <Link href="/terms" className="text-primary hover:underline underline-offset-4">Terms of Service</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
