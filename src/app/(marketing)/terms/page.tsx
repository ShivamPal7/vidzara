import type { Metadata } from "next";
import Link from "next/link";
import {
    IconFileText,
    IconChevronRight,
    IconCreditCard,
    IconAlertTriangle,
    IconBrandYoutube,
    IconUsers,
    IconShieldCheck,
    IconScale,
    IconMail,
    IconCircleX,
    IconRefresh,
} from "@tabler/icons-react";

export const metadata: Metadata = {
    title: "Terms of Service — Vidzara",
    description: "Read Vidzara's Terms of Service including subscription plans, usage policies, YouTube API usage, affiliate program rules, and more.",
};

const LAST_UPDATED = "June 11, 2026";
const CONTACT_EMAIL = "team@vidzara.com";
const SUPPORT_EMAIL = "team@vidzara.com";

interface Section {
    id: string;
    icon: React.ReactNode;
    title: string;
    content: React.ReactNode;
}

function Highlight({ children }: { children: React.ReactNode }) {
    return (
        <div className="my-4 rounded-xl border border-amber-500/20 bg-amber-500/5 px-4 py-3 text-sm text-amber-600 dark:text-amber-400 flex gap-2.5">
            <IconAlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{children}</span>
        </div>
    );
}

const sections: Section[] = [
    {
        id: "acceptance",
        icon: <IconFileText className="w-5 h-5" />,
        title: "Acceptance of Terms",
        content: (
            <div className="space-y-3 text-muted-foreground">
                <p>
                    By accessing or using Vidzara (<strong className="text-foreground">vidzara.com</strong>), you agree to be bound by these Terms of Service (&quot;Terms&quot;) and our{" "}
                    <Link href="/privacy" className="text-primary underline underline-offset-4">Privacy Policy</Link>. If you do not agree, you may not use the platform.
                </p>
                <p>
                    These Terms constitute a legally binding agreement between you and Vidzara. We may update these Terms at any time, with material changes communicated via email or in-app notice at least 7 days in advance.
                </p>
            </div>
        ),
    },
    {
        id: "eligibility",
        icon: <IconUsers className="w-5 h-5" />,
        title: "Eligibility",
        content: (
            <div className="space-y-3 text-muted-foreground">
                <p>You must be at least <strong className="text-foreground">13 years old</strong> (or 16 in the EU) to use Vidzara. By creating an account, you confirm that:</p>
                <ul className="list-disc pl-5 space-y-1">
                    <li>You meet the minimum age requirement in your jurisdiction.</li>
                    <li>You have the legal capacity to enter into binding agreements.</li>
                    <li>If you are creating an account on behalf of a company, you have the authority to bind that company to these Terms.</li>
                </ul>
            </div>
        ),
    },
    {
        id: "accounts",
        icon: <IconShieldCheck className="w-5 h-5" />,
        title: "Accounts & Security",
        content: (
            <div className="space-y-3 text-muted-foreground">
                <p>You are responsible for maintaining the security of your Vidzara account. This includes:</p>
                <ul className="list-disc pl-5 space-y-1">
                    <li>Keeping your password confidential and not sharing it with anyone.</li>
                    <li>Notifying us immediately at <a href={`mailto:${SUPPORT_EMAIL}`} className="text-primary underline underline-offset-4">{SUPPORT_EMAIL}</a> if you suspect unauthorized access.</li>
                    <li>All activity that occurs under your account is your responsibility.</li>
                </ul>
                <p>One person or entity may not maintain more than one free account. Creating multiple accounts to circumvent usage limits is a violation of these Terms and may result in termination of all associated accounts.</p>
            </div>
        ),
    },
    {
        id: "subscriptions",
        icon: <IconCreditCard className="w-5 h-5" />,
        title: "Subscriptions & Billing",
        content: (
            <div className="space-y-4 text-muted-foreground">
                <p>Vidzara offers subscription plans billed <strong className="text-foreground">monthly or annually</strong>. Pricing is location-based:</p>

                <div className="grid sm:grid-cols-2 gap-4 mt-2">
                    <div className="rounded-xl border border-border/60 bg-muted/20 p-4">
                        <p className="font-semibold text-foreground mb-2 text-sm">🇮🇳 India Pricing (INR)</p>
                        <ul className="space-y-1 text-sm">
                            <li>Free — 1 month trial</li>
                            <li>Limited Pro — ₹599/month</li>
                            <li>Unlimited Pro — ₹899/month</li>
                            <li>Yearly Unlimited — ₹8,999/year</li>
                        </ul>
                    </div>
                    <div className="rounded-xl border border-border/60 bg-muted/20 p-4">
                        <p className="font-semibold text-foreground mb-2 text-sm">🌍 Global Pricing (USD)</p>
                        <ul className="space-y-1 text-sm">
                            <li>Free — 48-hour trial</li>
                            <li>Limited Pro — $9/month</li>
                            <li>Unlimited Pro — $15/month</li>
                            <li>Yearly Unlimited — $149/year</li>
                        </ul>
                    </div>
                </div>

                <div className="space-y-3 mt-2">
                    <p><strong className="text-foreground">Billing:</strong> Subscriptions auto-renew at the end of each billing period. You will be charged the applicable rate unless you cancel before your renewal date.</p>
                    <p><strong className="text-foreground">Payment Processors:</strong> India payments are processed by Razorpay. Global payments are processed by Stripe. By subscribing, you agree to their respective terms and authorize recurring charges.</p>
                    <p><strong className="text-foreground">Coupons:</strong> Discount codes may be applied at checkout. Coupons are subject to expiry dates, usage limits, and country restrictions. Only one coupon may be applied per purchase. Coupons are non-transferable and have no cash value.</p>
                    <p><strong className="text-foreground">Plan Changes:</strong> Upgrades take effect immediately. Downgrades take effect at the end of the current billing period.</p>
                </div>

                <Highlight>
                    Subscriptions are <strong>not automatically paused</strong>. If you do not use the service, your subscription continues unless you cancel it.
                </Highlight>
            </div>
        ),
    },
    {
        id: "refunds",
        icon: <IconRefresh className="w-5 h-5" />,
        title: "Cancellations & Refunds",
        content: (
            <div className="space-y-3 text-muted-foreground">
                <p>You may cancel your subscription at any time from your dashboard. Cancellations take effect at the end of your current billing period — you retain access to your paid plan until then.</p>

                <p><strong className="text-foreground">Refund Policy:</strong></p>
                <ul className="list-disc pl-5 space-y-1">
                    <li>Monthly plans: Refunds are not issued for partial months of service already consumed.</li>
                    <li>Annual plans: A pro-rated refund may be issued within 7 days of the annual renewal date, at our discretion.</li>
                    <li>Refund requests due to technical failures on our part will be reviewed and resolved within 5 business days.</li>
                    <li>No refunds are issued if your account was suspended for violating these Terms.</li>
                </ul>

                <p>To request a refund, email <a href={`mailto:${SUPPORT_EMAIL}`} className="text-primary underline underline-offset-4">{SUPPORT_EMAIL}</a> with your account email and reason.</p>
            </div>
        ),
    },
    {
        id: "fair-usage",
        icon: <IconAlertTriangle className="w-5 h-5" />,
        title: "Fair Usage Policy",
        content: (
            <div className="space-y-3 text-muted-foreground">
                <p>Vidzara's &quot;Unlimited&quot; plans are subject to a <strong className="text-foreground">Fair Usage Policy</strong> designed to prevent abuse and ensure platform reliability for all users.</p>

                <p>The following activities are <strong className="text-foreground">strictly prohibited</strong> regardless of plan:</p>
                <ul className="list-disc pl-5 space-y-1">
                    <li>Automated scripting, bot activity, or programmatic API access beyond normal human use</li>
                    <li>Bulk generation for resale or distribution without our written consent</li>
                    <li>Circumventing rate limits through technical means</li>
                    <li>Using multiple accounts to multiply usage limits</li>
                    <li>Generating content that violates YouTube's Terms of Service or community guidelines</li>
                </ul>

                <p>We monitor for:</p>
                <ul className="list-disc pl-5 space-y-1">
                    <li>Abnormally high generation frequency</li>
                    <li>IP anomalies and suspicious usage bursts</li>
                    <li>Patterns consistent with automated or shared account usage</li>
                </ul>

                <Highlight>
                    Violations of the Fair Usage Policy may result in rate limiting, temporary restrictions, or permanent suspension without refund.
                </Highlight>
            </div>
        ),
    },
    {
        id: "youtube-api",
        icon: <IconBrandYoutube className="w-5 h-5" />,
        title: "YouTube API & Third-Party Services",
        content: (
            <div className="space-y-3 text-muted-foreground">
                <p>
                    Vidzara uses the <strong className="text-foreground">YouTube Data API v3</strong> to power analysis features. By using these features, you agree to be bound by the{" "}
                    <a href="https://developers.google.com/youtube/terms/api-services-terms-of-service" target="_blank" rel="noopener noreferrer" className="text-primary underline underline-offset-4">YouTube API Terms of Service</a>.
                </p>

                <ul className="list-disc pl-5 space-y-1">
                    <li>You must not use Vidzara to analyze channels in ways that violate YouTube&apos;s Terms of Service.</li>
                    <li>You must not use analysis outputs to engage in harassment, targeted attacks, or manipulation of YouTube&apos;s recommendation system.</li>
                    <li>Vidzara does not guarantee the accuracy or completeness of YouTube API data. Public channel data may be delayed or subject to YouTube API quotas.</li>
                </ul>

                <p>Similarly, by using Vidzara, you also agree to the terms of our payment processors, cloud providers, and AI model providers where applicable.</p>
            </div>
        ),
    },
    {
        id: "acceptable-use",
        icon: <IconShieldCheck className="w-5 h-5" />,
        title: "Acceptable Use",
        content: (
            <div className="space-y-3 text-muted-foreground">
                <p>You agree not to use Vidzara to:</p>
                <ul className="list-disc pl-5 space-y-1">
                    <li>Generate, promote, or distribute hate speech, violence, or content that sexually exploits minors</li>
                    <li>Generate spam content at scale for mass distribution</li>
                    <li>Impersonate other creators, brands, or individuals</li>
                    <li>Generate content designed to manipulate elections, spread medical misinformation, or engage in financial fraud</li>
                    <li>Interfere with, disrupt, or attempt to gain unauthorized access to our platform or infrastructure</li>
                    <li>Reverse engineer, scrape, or extract our AI models, prompts, or internal data</li>
                    <li>Violate any applicable law or regulation</li>
                </ul>
                <p>We reserve the right to investigate and take action — including account suspension — in response to violations.</p>
            </div>
        ),
    },
    {
        id: "intellectual-property",
        icon: <IconScale className="w-5 h-5" />,
        title: "Intellectual Property",
        content: (
            <div className="space-y-3 text-muted-foreground">
                <p><strong className="text-foreground">Your Content:</strong> You retain ownership of all content you input into Vidzara (topics, scripts, channel information). By using the service, you grant Vidzara a limited, non-exclusive license to process your inputs solely for the purpose of generating outputs for you.</p>

                <p><strong className="text-foreground">Generated Outputs:</strong> The AI-generated titles, descriptions, scripts, and other outputs are provided for your use. You own the outputs you generate on the platform. However, Vidzara does not warrant that generated content is unique, original, or free from third-party intellectual property claims. You are responsible for reviewing and clearing any AI-generated content before publication.</p>

                <p><strong className="text-foreground">Platform IP:</strong> The Vidzara name, logo, platform design, AI prompt templates, and underlying technology are the exclusive intellectual property of Vidzara. You may not copy, replicate, or build competing products using our proprietary systems.</p>
            </div>
        ),
    },
    {
        id: "affiliate",
        icon: <IconUsers className="w-5 h-5" />,
        title: "Affiliate Program",
        content: (
            <div className="space-y-3 text-muted-foreground">
                <p>Vidzara operates an affiliate program that allows users to earn commissions by referring new subscribers. The following rules apply:</p>
                <ul className="list-disc pl-5 space-y-1">
                    <li>Commissions are earned <strong className="text-foreground">only when a referred user subscribes to a paid plan</strong>. No commission is earned on free signups.</li>
                    <li>Referral links are personal and non-transferable. You may not purchase your own subscription through your referral link.</li>
                    <li>Commissions are subject to a minimum payout threshold: ₹1,000 (India) or $20 (Global).</li>
                    <li>Vidzara reserves the right to adjust commission rates with 30 days&apos; notice.</li>
                    <li>Commissions earned through fraudulent activity (fake accounts, self-referrals, chargebacks) will be reversed and may result in account suspension.</li>
                    <li>Payouts are processed manually on a monthly basis after admin approval.</li>
                </ul>
                <p>Affiliate participation is subject to additional terms that may be provided in the dashboard.</p>
            </div>
        ),
    },
    {
        id: "termination",
        icon: <IconCircleX className="w-5 h-5" />,
        title: "Termination",
        content: (
            <div className="space-y-3 text-muted-foreground">
                <p><strong className="text-foreground">By You:</strong> You may close your account at any time from <strong>Settings → Account → Delete Account</strong>. Cancellation of your subscription does not automatically delete your account.</p>

                <p><strong className="text-foreground">By Vidzara:</strong> We reserve the right to suspend or terminate your account, with or without notice, if you:</p>
                <ul className="list-disc pl-5 space-y-1">
                    <li>Violate these Terms of Service</li>
                    <li>Engage in fraudulent, abusive, or illegal activity</li>
                    <li>Create a security or legal risk to the platform or its users</li>
                    <li>Engage in activity that harms other users or third parties</li>
                </ul>

                <p>Upon termination:</p>
                <ul className="list-disc pl-5 space-y-1">
                    <li>Your access to the platform ceases immediately.</li>
                    <li>No refunds are issued for the remaining subscription period if termination is due to a Terms violation.</li>
                    <li>Data deletion follows our <Link href="/privacy" className="text-primary underline underline-offset-4">Privacy Policy</Link>.</li>
                </ul>
            </div>
        ),
    },
    {
        id: "disclaimers",
        icon: <IconAlertTriangle className="w-5 h-5" />,
        title: "Disclaimers & Limitations",
        content: (
            <div className="space-y-3 text-muted-foreground">
                <Highlight>
                    Vidzara is provided &quot;as is&quot; without warranties of any kind, express or implied.
                </Highlight>

                <p>We do not guarantee:</p>
                <ul className="list-disc pl-5 space-y-1">
                    <li>That AI-generated content will achieve any specific result on YouTube or other platforms.</li>
                    <li>That generated content will be accurate, unique, or free from errors.</li>
                    <li>Uninterrupted, error-free access to the platform at all times.</li>
                    <li>That your channel will grow, gain views, or monetize as a result of using Vidzara.</li>
                </ul>

                <p><strong className="text-foreground">Limitation of Liability:</strong> To the maximum extent permitted by law, Vidzara&apos;s total liability to you for any claim arising from these Terms or your use of the platform shall not exceed the greater of (a) the amount you paid us in the 3 months preceding the claim, or (b) $50 USD.</p>

                <p>Vidzara is not liable for indirect, incidental, consequential, or punitive damages including lost revenue, lost profits, or lost data.</p>
            </div>
        ),
    },
    {
        id: "governing-law",
        icon: <IconScale className="w-5 h-5" />,
        title: "Governing Law & Disputes",
        content: (
            <div className="space-y-3 text-muted-foreground">
                <p>These Terms are governed by the laws of <strong className="text-foreground">India</strong>. Any dispute arising from these Terms shall be subject to the exclusive jurisdiction of the courts located in India.</p>
                <p>Before initiating formal legal proceedings, you agree to first contact us at <a href={`mailto:${CONTACT_EMAIL}`} className="text-primary underline underline-offset-4">{CONTACT_EMAIL}</a> and attempt to resolve the dispute informally for a period of 30 days.</p>
            </div>
        ),
    },
    {
        id: "contact",
        icon: <IconMail className="w-5 h-5" />,
        title: "Contact",
        content: (
            <div className="space-y-2 text-muted-foreground">
                <p>For legal or account questions, contact us at:</p>
                <div className="inline-flex flex-col gap-1 bg-muted/30 border border-border/60 rounded-xl p-4 text-sm">
                    <p><strong className="text-foreground">Vidzara</strong></p>
                    <p>Legal: <a href={`mailto:${CONTACT_EMAIL}`} className="text-primary underline underline-offset-4">{CONTACT_EMAIL}</a></p>
                    <p>Support: <a href={`mailto:${SUPPORT_EMAIL}`} className="text-primary underline underline-offset-4">{SUPPORT_EMAIL}</a></p>
                </div>
            </div>
        ),
    },
];

export default function TermsPage() {
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
                        <span className="text-foreground">Terms of Service</span>
                    </div>
                    <div className="flex items-start gap-4">
                        <div className="shrink-0 w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mt-1">
                            <IconFileText className="w-6 h-6" />
                        </div>
                        <div>
                            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Terms of Service</h1>
                            <p className="text-muted-foreground mt-2 text-base leading-relaxed max-w-2xl">
                                Please read these terms carefully before using Vidzara. They define your rights, our responsibilities, and the rules of the platform.
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
                        Questions about our terms or your account?
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
                        <Link href="/privacy" className="text-primary hover:underline underline-offset-4">Privacy Policy</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
