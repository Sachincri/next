"use client";
import React from "react";
import Image from "next/image";
import Link from "next/link";
import { QuadCard } from "@/types/home";
import { ChevronRight } from "lucide-react";

interface QuadGridProps {
    quads: QuadCard[];
}

const QuadGrid: React.FC<QuadGridProps> = ({ quads }) => {
    if (!quads || quads.length === 0) return null;

    return (
        <div className="w-full px-2 lg:px-4 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5">
                {quads.map((quad, idx) => (
                    <div key={idx} className="bg-white dark:bg-slate-800 p-3 lg:p-4 flex flex-col h-full shadow-sm hover:shadow-md transition-shadow rounded-lg md:rounded-none">
                        <h2 className="text-base lg:text-lg font-bold text-gray-900 dark:text-white mb-2 line-clamp-2 leading-snug h-[2.8rem] lg:h-[3rem] overflow-hidden">
                            {quad.title}
                        </h2>

                        <div className="grid grid-cols-2 gap-x-3 gap-y-2 flex-1">
                            {quad.items.slice(0, 4).map((item, iIdx) => (
                                <Link
                                    key={iIdx}
                                    href={item.redirectLink || "#"}
                                    className="group flex flex-col text-center"
                                >
                                    <div className="relative aspect-square overflow-hidden bg-gray-100 dark:bg-slate-900/40 sm:rounded-sm mb-1">
                                        {item.image && (
                                            <Image
                                                src={typeof item.image === 'string' ? item.image : item.image.url}
                                                alt={item.title}
                                                fill
                                                className="object-contain p-2 group-hover:scale-105 transition-transform duration-500"
                                                sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 15vw"
                                            />
                                        )}
                                    </div>
                                    <span className="text-[10px] lg:text-[11px] text-gray-700 dark:text-slate-300 line-clamp-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                        {item.title}
                                    </span>
                                </Link>
                            ))}
                        </div>

                        <div className="mt-3 pt-1">
                            <Link
                                href={quad.redirectLink || "#"}
                                className="text-blue-600 hover:text-orange-600 dark:text-blue-400 dark:hover:text-orange-400 text-xs font-medium transition-colors"
                            >
                                {quad.redirectText || "See more"}
                            </Link>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default QuadGrid;
