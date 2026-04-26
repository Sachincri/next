"use client";

import React, { FC } from "react";
import {
    Loader2,
    CheckCircle2,
    AlertCircle,
    ChevronDown,
    Map,
    Maximize2,
} from "lucide-react";
import ImageDropzone from "@/components/layout/ImageDrop";

export const SaveIndicator: FC<{ status: "idle" | "saving" | "saved" | "error" }> = ({ status }) => {
    if (status === "idle") return null;

    const configs = {
        saving: { icon: <Loader2 size={16} className="animate-spin" />, text: "Saving...", bg: "bg-blue-50 dark:bg-blue-900/20", color: "text-blue-700 dark:text-blue-400", border: "border-blue-200 dark:border-blue-800" },
        saved: { icon: <CheckCircle2 size={16} />, text: "Saved successfully", bg: "bg-green-50 dark:bg-green-900/20", color: "text-green-700 dark:text-green-400", border: "border-green-200 dark:border-green-800" },
        error: { icon: <AlertCircle size={16} />, text: "Failed to save", bg: "bg-red-50 dark:bg-red-900/20", color: "text-red-700 dark:text-red-400", border: "border-red-200 dark:border-red-800" },
    };

    const config = configs[status];

    return (
        <div className={`fixed bottom-6 right-6 ${config.bg} ${config.color} px-4 py-3 rounded-xl border ${config.border} flex items-center gap-3 shadow-xl backdrop-blur-sm z-50 animate-in slide-in-from-bottom-4`}>
            {config.icon}
            <span className="text-sm font-semibold">{config.text}</span>
        </div>
    );
};

export const CollapsibleSection: FC<{
    title: string;
    icon: React.ReactNode;
    badge?: string;
    children: React.ReactNode;
    isOpen: boolean;
    onToggle: () => void;
}> = ({ title, icon, badge, children, isOpen, onToggle }) => {
    return (
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden transition-all duration-300">
            <button
                onClick={onToggle}
                className="w-full p-4 sm:p-6 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors group"
            >
                <div className="flex items-center gap-4 min-w-0 flex-1 pr-4">
                    <div className="flex-shrink-0 w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform duration-300">
                        {icon}
                    </div>
                    <div className="text-left min-w-0 flex-1">
                        <h2 className="text-base sm:text-xl font-bold text-slate-900 dark:text-white truncate">{title}</h2>
                        {badge && <span className="text-xs text-slate-500 dark:text-slate-400 font-medium block truncate">{badge}</span>}
                    </div>
                </div>
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-slate-100 dark:bg-slate-700 transition-transform ${isOpen ? "rotate-180 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400" : "text-slate-500 dark:text-slate-400"}`}>
                    <ChevronDown size={20} />
                </div>
            </button>
            <div className={`grid transition-[grid-template-rows] duration-300 ease-out ${isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
                <div className="overflow-hidden">
                    <div className="p-4 sm:p-6 pt-0 border-t border-slate-100 dark:border-slate-700 mt-2">
                        <div className="pt-4">
                            {children}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export const ImageUploadField: FC<{
    value: string;
    onChange: (val: string, file?: File) => void;
    label: string;
    error?: string;
    required?: boolean;
    acceptType?: "image" | "video" | "both";
}> = ({ value, onChange, label, error, required = false, acceptType = "image" }) => {
    return (
        <div className="space-y-3">
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">
                {label} {required && <span className="text-red-500">*</span>}
            </label>
            <ImageDropzone
                value={value}
                onChange={(file, previewUrl) => onChange(previewUrl || "", file || undefined)}
                acceptType={acceptType}
            />
            {error && <ErrorBadge message={error} />}
        </div>
    );
};

export const ErrorBadge: FC<{ message: string }> = ({ message }) => (
    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 flex items-start gap-2.5 mt-2 animate-in fade-in slide-in-from-top-1">
        <AlertCircle size={16} className="text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
        <p className="text-sm text-red-700 dark:text-red-300 font-medium">{message}</p>
    </div>
);
