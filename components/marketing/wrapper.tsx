import React from "react";
import { cn } from "@/lib/utils";

interface WrapperProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
    className?: string;
}

export function Wrapper({ children, className, ...props }: WrapperProps) {
    return (
        <div
            className={cn(
                "w-full max-w-7xl mx-auto px-4 md:px-8 py-12 md:py-24",
                className
            )}
            {...props}
        >
            {children}
        </div>
    );
}
