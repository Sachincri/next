"use client";

import React, { FC, useState } from "react";
import {
    Globe,
    Lock,
    ChevronDown,
    Share2,
    EyeOff,
    Eye,
    Link2,
    Loader2,
    CheckCircle2,
} from "lucide-react";
import { CollapsibleSection, ImageUploadField, ErrorBadge } from "./CMSComponents";
import { Switch } from "@/ui/switch";
import { IHomePageCMS } from "@/types/home";
import { optimizeOgImageUrl } from "@/lib/seo-utils";

interface SEOSettingsProps {
    seo: IHomePageCMS["seo"];
    setSeo: React.Dispatch<React.SetStateAction<IHomePageCMS["seo"]>>;
    validationErrors: Record<string, string>;
    isOpen: boolean;
    onToggle: () => void;
    onSave?: () => void;
    onFileChange: (file: File, url: string) => void;
    isLiveHomePage?: boolean;
    isSaving?: boolean;
}

export const SEOSettings: FC<SEOSettingsProps> = ({
    seo,
    setSeo,
    validationErrors,
    isOpen,
    onToggle,
    onSave,
    onFileChange,
    isLiveHomePage = false,
    isSaving = false,
}) => {
    const [showSocialOverrides, setShowSocialOverrides] = useState(
        Boolean(seo.ogTitle || seo.ogDescription)
    );

    const descriptionValue = seo.description ?? seo.metaDescription ?? "";
    const rawOgUrl =
        typeof seo.ogImage === "object" ? seo.ogImage?.url || "" : seo.ogImage || "";
    const previewOgImage = rawOgUrl.startsWith("blob:")
        ? rawOgUrl
        : optimizeOgImageUrl(rawOgUrl) || rawOgUrl;
    const isIndexed = !Boolean(seo.noIndex);

    return (
        <CollapsibleSection
            title="SEO Settings"
            icon={<Globe className="text-blue-600 dark:text-blue-400" size={20} />}
            badge="Optimize for Google, WhatsApp, Facebook & X previews"
            isOpen={isOpen}
            onToggle={onToggle}
        >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Page Title */}
                <div data-error={!!validationErrors["seo.title"]}>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                        Page Title <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        placeholder="Enter page title"
                        value={seo.title || ""}
                        onChange={(e) =>
                            setSeo((prev) => ({ ...prev, title: e.target.value }))
                        }
                        className={`w-full px-4 py-3 bg-white dark:bg-slate-900 text-slate-900 dark:text-white border-2 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all placeholder:text-slate-400 font-medium ${
                            validationErrors["seo.title"]
                                ? "border-red-500 bg-red-50 dark:bg-red-900/10"
                                : "border-slate-200 dark:border-slate-700"
                        }`}
                        maxLength={60}
                    />
                    <div className="flex justify-between items-center mt-1.5">
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                            Recommended: 50–60 characters
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                            {(seo.title || "").length}/60 chars
                        </p>
                    </div>
                    {validationErrors["seo.title"] && (
                        <ErrorBadge message={validationErrors["seo.title"]} />
                    )}
                </div>

                {/* URL Slug (Locked to / for Live Home Page) */}
                <div data-error={!!validationErrors["seo.slug"]}>
                    <div className="flex items-center justify-between mb-2">
                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                            URL Slug {!isLiveHomePage && <span className="text-red-500">*</span>}
                        </label>
                        {isLiveHomePage && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
                                <Lock size={11} />
                                Live Home Root (/)
                            </span>
                        )}
                    </div>

                    <div className="relative">
                        <input
                            type="text"
                            placeholder={isLiveHomePage ? "/" : "summer-sale-landing"}
                            value={isLiveHomePage ? "/" : seo.slug || ""}
                            disabled={isLiveHomePage}
                            onChange={(e) => {
                                if (!isLiveHomePage) {
                                    setSeo((prev) => ({
                                        ...prev,
                                        slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"),
                                    }));
                                }
                            }}
                            className={`w-full px-4 py-3 border-2 rounded-xl outline-none transition-all font-medium ${
                                isLiveHomePage
                                    ? "bg-slate-100 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 cursor-not-allowed pr-10"
                                    : `bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 placeholder:text-slate-400 ${
                                          validationErrors["seo.slug"]
                                              ? "border-red-500 bg-red-50 dark:bg-red-900/10"
                                              : "border-slate-200 dark:border-slate-700"
                                      }`
                            }`}
                        />
                        {isLiveHomePage && (
                            <Lock
                                size={16}
                                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                            />
                        )}
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5">
                        {isLiveHomePage
                            ? "Root URL (/) is locked while this page is active. Create or select a draft to set a custom slug."
                            : "Lowercase letters, numbers, and hyphens only (e.g., festive-offers)"}
                    </p>
                    {validationErrors["seo.slug"] && !isLiveHomePage && (
                        <ErrorBadge message={validationErrors["seo.slug"]} />
                    )}
                </div>

                {/* Meta Description */}
                <div className="lg:col-span-2">
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                        Meta Description
                    </label>
                    <textarea
                        rows={3}
                        maxLength={160}
                        placeholder="Briefly describe your store/page for Google search results and social previews"
                        value={descriptionValue}
                        onChange={(e) => {
                            const val = e.target.value;
                            setSeo((prev) => ({
                                ...prev,
                                description: val,
                                metaDescription: val,
                            }));
                        }}
                        className={`w-full px-4 py-3 bg-white dark:bg-slate-900 text-slate-900 dark:text-white border-2 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all placeholder:text-slate-400 font-medium resize-none ${
                            validationErrors["seo.metaDescription"] ||
                            validationErrors["seo.description"]
                                ? "border-red-500 bg-red-50 dark:bg-red-900/10"
                                : "border-slate-200 dark:border-slate-700"
                        }`}
                    />
                    <div className="flex justify-between items-center mt-1.5">
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                            Used in search snippets and default social share card
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                            {descriptionValue.length}/160 chars
                        </p>
                    </div>
                </div>

                {/* Canonical URL (Optional) & Indexing Toggle */}
                <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-1.5">
                        <Link2 size={15} className="text-slate-500" />
                        Canonical URL <span className="text-xs font-normal text-slate-400">(Optional)</span>
                    </label>
                    <input
                        type="url"
                        placeholder="https://yourdomain.com/"
                        value={seo.canonicalUrl || ""}
                        onChange={(e) =>
                            setSeo((prev) => ({ ...prev, canonicalUrl: e.target.value }))
                        }
                        className={`w-full px-4 py-3 bg-white dark:bg-slate-900 text-slate-900 dark:text-white border-2 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all placeholder:text-slate-400 font-medium ${
                            validationErrors["seo.canonicalUrl"]
                                ? "border-red-500 bg-red-50 dark:bg-red-900/10"
                                : "border-slate-200 dark:border-slate-700"
                        }`}
                    />
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5">
                        Leave empty to automatically default to this page&apos;s clean URL.
                    </p>
                    {validationErrors["seo.canonicalUrl"] && (
                        <ErrorBadge message={validationErrors["seo.canonicalUrl"]} />
                    )}
                </div>

                {/* Search Engine Indexing Toggle */}
                <div className="flex flex-col justify-between p-4 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-900/50">
                    <div className="flex items-start justify-between gap-4">
                        <div className="space-y-1">
                            <div className="flex items-center gap-2">
                                {isIndexed ? (
                                    <Eye size={16} className="text-emerald-600 dark:text-emerald-400" />
                                ) : (
                                    <EyeOff size={16} className="text-amber-600 dark:text-amber-400" />
                                )}
                                <label
                                    htmlFor="allow-indexing-switch"
                                    className="text-sm font-semibold text-slate-800 dark:text-slate-200 cursor-pointer"
                                >
                                    Allow Search Engine Indexing
                                </label>
                            </div>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                {isIndexed
                                    ? "Search engines can crawl and index this page (index, follow)."
                                    : "Hidden from search engines via robots meta (noindex, nofollow)."}
                            </p>
                        </div>
                        <Switch
                            id="allow-indexing-switch"
                            checked={isIndexed}
                            onCheckedChange={(checked) =>
                                setSeo((prev) => ({ ...prev, noIndex: !checked }))
                            }
                            className="mt-1"
                        />
                    </div>
                    <div className="mt-3 pt-2.5 border-t border-slate-200/70 dark:border-slate-700/70 flex items-center justify-between text-xs">
                        <span className="text-slate-500 dark:text-slate-400">Robots Directive:</span>
                        <code
                            className={`px-2 py-0.5 rounded font-mono font-semibold ${
                                isIndexed
                                    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"
                                    : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300"
                            }`}
                        >
                            {isIndexed ? "index, follow" : "noindex, nofollow"}
                        </code>
                    </div>
                </div>

                {/* OG Image Uploader */}
                <div className="space-y-2">
                    <ImageUploadField
                        label="OG Image (Social Share Image)"
                        value={rawOgUrl}
                        onChange={(val, file) => {
                            setSeo((prev) => ({ ...prev, ogImage: val }));
                            if (file) onFileChange(file, val);
                        }}
                        error={validationErrors["seo.ogImage"]}
                    />
                    <p className="text-xs text-slate-500 dark:text-slate-400 ml-1 leading-relaxed">
                        Recommended: 1200 × 630 px, JPG/PNG format, under 300 KB (required for WhatsApp/Social previews)
                    </p>
                    {previewOgImage && !rawOgUrl.startsWith("blob:") && (
                        <div className="flex items-center gap-1.5 text-[11px] text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-2.5 py-1.5 rounded-lg border border-emerald-200 dark:border-emerald-800/50">
                            <CheckCircle2 size={13} className="shrink-0" />
                            <span className="truncate">WhatsApp-ready JPG (1200×630): {previewOgImage}</span>
                        </div>
                    )}
                </div>

                {/* Live WhatsApp / Social Share Card Preview */}
                <div className="space-y-2">
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">
                        Social Share Card Preview (WhatsApp / Facebook / X)
                    </label>
                    <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 overflow-hidden shadow-sm">
                        <div className="aspect-[1200/630] w-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center overflow-hidden">
                            {previewOgImage ? (
                                <img
                                    src={previewOgImage}
                                    alt="OG Preview"
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="text-center p-4">
                                    <Share2 className="w-8 h-8 mx-auto text-slate-400 mb-1.5" />
                                    <p className="text-xs text-slate-500 dark:text-slate-400">
                                        Upload an OG Image to preview social link cards
                                    </p>
                                </div>
                            )}
                        </div>
                        <div className="p-3.5 space-y-1 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
                            <p className="text-[11px] uppercase tracking-wider text-slate-400 truncate">
                                {seo.canonicalUrl || "yourdomain.com"}
                            </p>
                            <p className="text-sm font-bold text-slate-900 dark:text-white line-clamp-1">
                                {seo.ogTitle?.trim() || seo.title || "Page Title"}
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                                {seo.ogDescription?.trim() ||
                                    descriptionValue ||
                                    "Your meta description will appear here when shared on WhatsApp, Facebook, or X."}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Optional Collapsible Social Overrides */}
                <div className="lg:col-span-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-900/40 overflow-hidden">
                    <button
                        type="button"
                        onClick={() => setShowSocialOverrides((prev) => !prev)}
                        className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-slate-100/70 dark:hover:bg-slate-800/60 transition-colors"
                    >
                        <div className="flex items-center gap-2.5">
                            <Share2 size={16} className="text-blue-600 dark:text-blue-400" />
                            <div>
                                <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                                    Social Share Overrides
                                </span>
                                <span className="ml-2 text-xs text-slate-500 dark:text-slate-400">
                                    (Optional — defaults to Page Title &amp; Meta Description)
                                </span>
                            </div>
                        </div>
                        <ChevronDown
                            size={18}
                            className={`text-slate-500 transition-transform duration-200 ${
                                showSocialOverrides ? "rotate-180" : ""
                            }`}
                        />
                    </button>

                    {showSocialOverrides && (
                        <div className="p-4 pt-2 border-t border-slate-200 dark:border-slate-700 grid grid-cols-1 lg:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                                    OG Title (Social Share Title)
                                </label>
                                <input
                                    type="text"
                                    maxLength={100}
                                    placeholder={seo.title || "Defaults to Page Title if empty"}
                                    value={seo.ogTitle || ""}
                                    onChange={(e) =>
                                        setSeo((prev) => ({
                                            ...prev,
                                            ogTitle: e.target.value,
                                        }))
                                    }
                                    className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none text-sm"
                                />
                                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 text-right">
                                    {(seo.ogTitle || "").length}/100 chars
                                </p>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                                    OG Description (Social Share Description)
                                </label>
                                <textarea
                                    rows={2}
                                    maxLength={300}
                                    placeholder={
                                        descriptionValue ||
                                        "Defaults to Meta Description if empty"
                                    }
                                    value={seo.ogDescription || ""}
                                    onChange={(e) =>
                                        setSeo((prev) => ({
                                            ...prev,
                                            ogDescription: e.target.value,
                                        }))
                                    }
                                    className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none text-sm resize-none"
                                />
                                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 text-right">
                                    {(seo.ogDescription || "").length}/300 chars
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Save Button */}
                <div className="lg:col-span-2 flex justify-end mt-2 pt-6 border-t border-slate-100 dark:border-slate-700">
                    <button
                        type="button"
                        onClick={() => onSave?.()}
                        disabled={isSaving}
                        className="flex items-center gap-2 px-8 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 hover:shadow-lg hover:-translate-y-0.5 transition-all font-bold text-sm shadow-md active:translate-y-0 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                        {isSaving && <Loader2 size={16} className="animate-spin" />}
                        <span>{isSaving ? "Saving SEO..." : "Save SEO Settings"}</span>
                    </button>
                </div>
            </div>
        </CollapsibleSection>
    );
};
