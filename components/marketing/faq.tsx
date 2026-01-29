"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Wrapper } from "@/components/marketing/wrapper";
import { Button } from "@/components/ui/button";
import { Plus, Minus, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface FAQItem {
    question: string;
    answer: string;
}

const leftColumnFaqs: FAQItem[] = [
    {
        question: "Can I cancel my plan anytime?",
        answer: "Yes. You can cancel your plan anytime from your account settings. Your plan will remain active until the end of the billing cycle."
    },
    {
        question: "How do I view my usage?",
        answer: "You can track your usage directly from the dashboard, including tool usage and limits."
    },
    {
        question: "What is a fair usage policy?",
        answer: "Unlimited plans are designed for genuine creator usage. Excessive or automated abuse may be restricted."
    },
    {
        question: "Can I generate content in multiple languages?",
        answer: "Yes. Vidzara supports multi-language content generation across most tools."
    }
];

const rightColumnFaqs: FAQItem[] = [
    {
        question: "Is there a free trial?",
        answer: "Yes. Vidzara offers a free trial so you can explore the platform before upgrading."
    },
    {
        question: "Do you offer refunds?",
        answer: "Currently, Vidzara does not offer refunds once a subscription has started."
    },
    {
        question: "Can I monetize content created with Vidzara?",
        answer: "Yes. All content generated using Vidzara is yours and can be monetized freely."
    },
    {
        question: "Does Vidzara work for Shorts & long videos?",
        answer: "Absolutely. Vidzara is built for both long-form videos and Shorts/Reels."
    }
];

export function FAQ() {
    const [openItem, setOpenItem] = useState<string | null>(null);

    const toggleItem = (item: string) => {
        setOpenItem(openItem === item ? null : item);
    };

    return (
        <section className="bg-background" id="faq">
            <Wrapper>
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <h2 className="text-3xl md:text-5xl font-semibold mb-4">
                        Frequently Asked Questions
                    </h2>
                    <p className="text-muted-foreground text-lg md:text-xl">
                        Everything you need to know about Vidzara, pricing, and usage.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                    <div className="space-y-4">
                        {leftColumnFaqs.map((faq, index) => (
                            <FAQCard
                                key={`left-${index}`}
                                faq={faq}
                                isOpen={openItem === faq.question}
                                onToggle={() => toggleItem(faq.question)}
                            />
                        ))}
                    </div>
                    <div className="space-y-4">
                        {rightColumnFaqs.map((faq, index) => (
                            <FAQCard
                                key={`right-${index}`}
                                faq={faq}
                                isOpen={openItem === faq.question}
                                onToggle={() => toggleItem(faq.question)}
                            />
                        ))}
                    </div>
                </div>

                <div className="">
                    <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl px-8 py-6 md:py-10 md:px-12 text-center relative overflow-hidden flex flex-col items-center justify-center md:flex-row md:justify-between gap-4">
                        <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-primary/5 rounded-full blur-3xl translate-x-1/3 -translate-y-1/3 pointer-events-none" />
                        <div className="flex flex-col items-center justify-center md:items-start md:justify-start">
                            <h3 className="text-2xl font-bold mb-2 relative z-10">Still have questions?</h3>
                            <p className="text-muted-foreground relative z-10">
                                Contact our support team anytime and we’ll be happy to help.
                            </p>
                        </div>
                        <div className="flex justify-center">
                            <Button
                                size="lg"
                                variant="cta"
                                className="group h-12 px-6 text-lg font-semibold shadow-2xl hover:shadow-primary/25 transition-all duration-300"
                                asChild
                            >
                                <Link href="/login" className="flex items-center gap-2">
                                    <MessageCircle className="group-hover:rotate-12 transition-transform" fill="currentColor" />
                                    Get in Touch
                                </Link>
                            </Button>
                        </div>
                    </div>
                </div>
            </Wrapper>
        </section>
    );
}

function FAQCard({ faq, isOpen, onToggle }: { faq: FAQItem, isOpen: boolean, onToggle: () => void }) {
    return (
        <div
            className={cn(
                "bg-card/30 border rounded-xl overflow-hidden transition-all duration-300",
                isOpen ? "border-primary/20 shadow-sm bg-card/60" : "border-border/50 hover:border-border"
            )}
        >
            <button
                onClick={onToggle}
                className="flex items-center justify-between w-full p-5 text-left"
            >
                <span className="font-medium text-lg pr-4 tracking-wide">{faq.question}</span>
                <span className={cn(
                    "p-1 rounded-full bg-muted/50 text-muted-foreground transition-all duration-300 shrink-0",
                    isOpen && "bg-primary/10 text-primary rotate-180"
                )}>
                    {isOpen ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                </span>
            </button>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                    >
                        <div className="px-5 pb-5 text-muted-foreground leading-relaxed">
                            {faq.answer}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
