"use client";

import React from "react";
import { motion } from "framer-motion";
import { Wrapper } from "@/components/marketing/wrapper";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Zap, ChevronRight } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface Testimonial {
    name: string;
    handle?: string;
    subscribers: string;
    avatar: string;
    content: string;
}

const testimonials: Testimonial[] = [
    {
        name: "Rahul Verma",
        subscribers: "150K Subs",
        avatar: "RV",
        content: "Vidzara’s improved my view duration by 40%. The SEO tools are actually useful, not just buzzwords."
    },
    {
        name: "Priya Sharma",
        subscribers: "1.2M Subs",
        avatar: "PS",
        content: "I went from 0 to 10k subs in 2 months using the hook generator. It’s insane how accurate it is for Indian audiences."
    },
    {
        name: "Arjun Tech",
        subscribers: "85K Subs",
        avatar: "AT",
        content: "Finally a tool that understands Hindi/English mixed content. My titles are way more clickable now."
    },
    {
        name: "Sneha Vlogs",
        subscribers: "450K Followers",
        avatar: "SV",
        content: "The thumbnail emotions feature is a game changer. I stopped guessing what works."
    },
    {
        name: "Vikram Gaming",
        subscribers: "320K Subs",
        avatar: "VG",
        content: "Great for staying consistent. The growth dashboard keeps me accountable every single day."
    },
    {
        name: "Zara Fashion",
        subscribers: "2.5M Subs",
        avatar: "ZF",
        content: "The script writer saves me hours. I just edit a bit and shoot. Consistency is easy now."
    }
];

export function Testimonials() {
    return (
        <section className="bg-background relative overflow-hidden" id="testimonials">
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 right-0 w-[400px] h-[400px] bg-primary/5 rounded-full blur-3xl translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-blue-500/5 rounded-full blur-3xl -translate-x-1/2" />
            </div>

            <Wrapper className="relative z-10">
                <div className="text-center mx-auto mb-16">
                    <h2 className="text-3xl md:text-5xl font-semibold mb-4 tracking-tight">
                        Creators are already growing with Vidzara
                    </h2>
                    <p className="text-muted-foreground text-lg md:text-xl">
                        Real creators. Real results. Here’s what people are saying after using Vidzara.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                    {testimonials.map((testimonial, index) => (
                        <TestimonialCard key={index} testimonial={testimonial} index={index} />
                    ))}
                </div>

                <div className="flex justify-center">
                    <Button
                        size="lg"
                        variant="cta"
                        className="group h-12 px-6 text-lg font-semibold shadow-2xl hover:shadow-primary/25 transition-all duration-300"
                        asChild
                    >
                        <Link href="/login" className="flex items-center gap-2">
                            <Zap className="group-hover:rotate-12 transition-transform" fill="currentColor" />
                            Start Free with Vidzara
                            <ChevronRight className="group-hover:translate-x-1 transition-transform" strokeWidth={4} stroke="currentColor" />
                        </Link>
                    </Button>
                </div>
            </Wrapper>
        </section>
    );
}

function TestimonialCard({ testimonial, index }: { testimonial: Testimonial, index: number }) {

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            whileHover={{ y: -5 }}
            className="h-full"
        >
            <Card className="h-full border-border/50 bg-card/40 backdrop-blur-sm hover:border-primary/20 hover:shadow-md transition-all duration-300">
                <CardHeader className="flex flex-row items-center gap-4 pb-2">
                    <Avatar className="h-10 w-10 border border-border/50">
                        <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${testimonial.name}`} alt={testimonial.name} />
                        <AvatarFallback>{testimonial.avatar}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                        <span className="text-sm font-semibold">{testimonial.name}</span>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            {testimonial.subscribers}
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                        "{testimonial.content}"
                    </p>
                </CardContent>
            </Card>
        </motion.div>
    );
}
