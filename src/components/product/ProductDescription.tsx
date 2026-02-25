"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";

interface ProductDescriptionProps {
    html: string;
    maxLength?: number;
}

export const ProductDescription: React.FC<ProductDescriptionProps> = ({ html, maxLength = 300 }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    // Simple check if content is long enough to need truncation
    // Since it's HTML, we can only estimate based on text length
    const isLong = html.length > maxLength;

    return (
        <div className="relative">
            <div
                className={cn(
                    "prose prose-sm max-w-none text-gray-600 transition-all duration-300 overflow-hidden",
                    !isExpanded && isLong && "max-h-[200px] mask-gradient-bottom"
                )}
                dangerouslySetInnerHTML={{ __html: html }}
            />
            {isLong && (
                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="mt-4 text-blue-600 font-semibold hover:underline flex items-center gap-1 text-sm"
                >
                    {isExpanded ? "Read Less" : "Read More"}
                </button>
            )}

            <style jsx>{`
                .mask-gradient-bottom {
                    mask-image: linear-gradient(to bottom, black 60%, transparent 100%);
                    -webkit-mask-image: linear-gradient(to bottom, black 60%, transparent 100%);
                }
            `}</style>
        </div>
    );
};
