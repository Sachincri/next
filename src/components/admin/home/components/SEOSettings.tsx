"use client";

import React, { FC } from "react";
import { LayoutGrid, Globe } from "lucide-react";
import { CollapsibleSection, ImageUploadField, ErrorBadge } from "./CMSComponents";
import { IHomePageCMS } from "@/types/home";

interface SEOSettingsProps {
    seo: IHomePageCMS["seo"];
    setSeo: React.Dispatch<React.SetStateAction<IHomePageCMS["seo"]>>;
    validationErrors: Record<string, string>;
    isOpen: boolean;
    onToggle: () => void;
    onSave?: () => void;
    onFileChange: (file: File, url: string) => void;
}

export const SEOSettings: FC<SEOSettingsProps> = ({
    seo,
    setSeo,
    validationErrors,
    isOpen,
    onToggle,
    onSave,
    onFileChange
}) => {
    return (
        <CollapsibleSection
            title="SEO Settings"
            icon={<Globe className="text-blue-600 dark:text-blue-400" size={20} />}
            badge="Optimize for search engines"
            isOpen={isOpen}
            onToggle={onToggle}
        >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div data-error={!!validationErrors["seo.title"]}>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                        Page Title <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        placeholder="Enter page title"
                        value={seo.title}
                        onChange={(e) => setSeo((prev) => ({ ...prev, title: e.target.value }))}
                        className={`w-full px-4 py-3 bg-white dark:bg-slate-900 text-slate-900 dark:text-white border-2 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all placeholder:text-slate-400 font-medium ${validationErrors["seo.title"]
                            ? "border-red-500 bg-red-50 dark:bg-red-900/10"
                            : "border-slate-200 dark:border-slate-700"
                            }`}
                        maxLength={60}
                    />
                    <div className="flex justify-between items-center mt-1.5">
                        <p className="text-xs text-slate-500 dark:text-slate-400">{seo.title.length}/60 chars</p>
                    </div>
                    {validationErrors["seo.title"] && (
                        <ErrorBadge message={validationErrors["seo.title"]} />
                    )}
                </div>

                <div data-error={!!validationErrors["seo.slug"]}>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                        URL Slug <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        placeholder="home-page"
                        value={seo.slug}
                        onChange={(e) => setSeo((prev) => ({ ...prev, slug: e.target.value }))}
                        className={`w-full px-4 py-3 bg-white dark:bg-slate-900 text-slate-900 dark:text-white border-2 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all placeholder:text-slate-400 font-medium ${validationErrors["seo.slug"]
                            ? "border-red-500 bg-red-50 dark:bg-red-900/10"
                            : "border-slate-200 dark:border-slate-700"
                            }`}
                    />
                    {validationErrors["seo.slug"] && (
                        <ErrorBadge message={validationErrors["seo.slug"]} />
                    )}
                </div>

                <div className="lg:col-span-2">
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                        Meta Description
                    </label>
                    <textarea
                        rows={3}
                        placeholder="Briefly describe your page for search results"
                        value={seo.metaDescription}
                        onChange={(e) => setSeo((prev) => ({ ...prev, metaDescription: e.target.value }))}
                        className="w-full px-4 py-3 bg-white dark:bg-slate-900 text-slate-900 dark:text-white border-2 border-slate-200 dark:border-slate-700 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all placeholder:text-slate-400 font-medium resize-none"
                    />
                    <p className="text-xs text-slate-500 dark:text-slate-400 text-right mt-1.5">{seo.metaDescription?.length || 0}/160 chars</p>
                </div>

                <ImageUploadField
                    label="OG Image (Social Share Image)"
                    value={typeof seo.ogImage === 'object' ? seo.ogImage.url : seo.ogImage || ""}
                    onChange={(val, file) => {
                        setSeo((prev) => ({ ...prev, ogImage: val }));
                        if (file) onFileChange(file, val);
                    }}
                    error={validationErrors["seo.ogImage"]}
                />
                <div className="lg:col-span-2 flex justify-end mt-6 pt-6 border-t border-slate-100 dark:border-slate-700">
                    <button
                        onClick={() => onSave?.()}
                        className="px-8 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 hover:shadow-lg hover:-translate-y-0.5 transition-all font-bold text-sm shadow-md active:translate-y-0"
                    >
                        Save SEO Settings
                    </button>
                </div>
            </div>
        </CollapsibleSection>
    );
};
