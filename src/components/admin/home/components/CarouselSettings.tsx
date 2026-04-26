"use client";
import React, { FC } from "react";
import { ImageIcon, Plus, Trash2, GripVertical } from "lucide-react";
import { CollapsibleSection, ImageUploadField, ErrorBadge } from "./CMSComponents";
import RedirectLinkBuilder from "./RedirectLinkBuilder";
import { IHomePageCMS, CarouselItem } from "@/types/home";

interface CarouselSettingsProps {
    carousel: IHomePageCMS["carousel"];
    addCarouselItem: () => void;
    updateCarouselItem: (index: number, field: keyof CarouselItem, value: string, file?: File) => void;
    removeCarouselItem: (index: number) => void;
    validationErrors: Record<string, string>;
    isOpen: boolean;
    onToggle: () => void;
    onSave?: () => void;
}

export const CarouselSettings: FC<CarouselSettingsProps> = ({
    carousel,
    addCarouselItem,
    updateCarouselItem,
    removeCarouselItem,
    validationErrors,
    isOpen,
    onToggle,
    onSave
}) => {
    return (
        <CollapsibleSection
            title="Main Carousel"
            icon={<ImageIcon className="text-blue-600 dark:text-blue-400" size={20} />}
            badge={`${carousel.items.length} slides`}
            isOpen={isOpen}
            onToggle={onToggle}
        >
            <div className="space-y-6">
                <div className="flex items-center gap-2 px-4 py-2.5 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-xl">
                    <ImageIcon size={14} className="text-blue-500 flex-shrink-0" />
                    <p className="text-xs text-blue-700 dark:text-blue-300 font-medium">
                        Recommended size: <strong>1920 × 600 px</strong> (ratio 3.2:1). Mobile: 160px height, Desktop: 288px height. Use full-width landscape images.
                    </p>
                </div>
                {carousel.items.map((item, idx) => (
                    <div
                        key={idx}
                        className="group relative bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-3 sm:p-6 border-2 border-transparent hover:border-blue-200 dark:hover:border-blue-800 transition-all shadow-sm"
                        data-error={!!Object.keys(validationErrors).find(k => k.startsWith(`carousel.items.${idx} `))}
                    >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                            <div className="flex items-center gap-3">
                                <div className="p-1.5 rounded-lg bg-white dark:bg-slate-700 shadow-sm cursor-move hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                                    <GripVertical size={20} />
                                </div>
                                <span className="bg-blue-600 text-white w-7 h-7 rounded-lg flex items-center justify-center text-sm font-bold shadow-sm">
                                    {idx + 1}
                                </span>
                                <h3 className="font-bold text-slate-900 dark:text-white text-lg">Slide {idx + 1}</h3>
                            </div>
                            <button
                                onClick={() => removeCarouselItem(idx)}
                                className="self-end sm:self-auto p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                title="Remove slide"
                            >
                                <Trash2 size={20} />
                            </button>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
                            <ImageUploadField
                                label="Slide Image"
                                value={typeof item.image === 'object' ? item.image.url : item.image}
                                onChange={(val, file) => updateCarouselItem(idx, "image", val, file)}
                                error={validationErrors[`carousel.items.${idx}.image`]}
                                required
                            />

                            <div className="space-y-5">
                                <div data-error={!!validationErrors[`carousel.items.${idx}.title`]}>
                                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                                        Title <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Headline for this slide"
                                        value={item.title}
                                        onChange={(e) => updateCarouselItem(idx, "title", e.target.value)}
                                        className={`w-full px-4 py-3 bg-white dark:bg-slate-900 text-slate-900 dark:text-white border-2 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all placeholder:text-slate-400 font-medium ${validationErrors[`carousel.items.${idx}.title`]
                                            ? "border-red-500 bg-red-50 dark:bg-red-900/10"
                                            : "border-slate-200 dark:border-slate-700"
                                            }`}
                                    />
                                    {validationErrors[`carousel.items.${idx}.title`] && (
                                        <ErrorBadge message={validationErrors[`carousel.items.${idx}.title`]} />
                                    )}
                                </div>

                                <div data-error={!!validationErrors[`carousel.items.${idx}.subtitle`]}>
                                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                                        Subtitle
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Supporting text"
                                        value={item.subtitle}
                                        onChange={(e) => updateCarouselItem(idx, "subtitle", e.target.value)}
                                        className="w-full px-4 py-3 bg-white dark:bg-slate-900 text-slate-900 dark:text-white border-2 border-slate-200 dark:border-slate-700 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all placeholder:text-slate-400 font-medium"
                                    />
                                </div>

                                <div data-error={!!validationErrors[`carousel.items.${idx}.redirectLink`]}>
                                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                                        Redirect Link
                                    </label>
                                    <RedirectLinkBuilder
                                        value={item.redirectLink || ""}
                                        onChange={(val) => updateCarouselItem(idx, "redirectLink", val)}
                                        onSelectDetailed={(data) => {
                                            if (data.name && !item.title) updateCarouselItem(idx, "title", data.name);
                                            if (data.image && !item.image) updateCarouselItem(idx, "image", data.image);
                                        }}
                                    />
                                    {validationErrors[`carousel.items.${idx}.redirectLink`] && (
                                        <ErrorBadge message={validationErrors[`carousel.items.${idx}.redirectLink`]} />
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}

                <button
                    onClick={addCarouselItem}
                    className="w-full py-5 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl text-slate-500 dark:text-slate-400 hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50/50 dark:hover:bg-blue-900/20 transition-all font-bold flex items-center justify-center gap-3 group bg-white dark:bg-slate-800/30"
                >
                    <div className="p-2 rounded-full bg-slate-100 dark:bg-slate-800 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/50 transition-colors">
                        <Plus size={20} className="group-hover:scale-110 transition-transform" />
                    </div>
                    <span>Add Another Slide</span>
                </button>
                <div className="flex justify-end mt-6 pt-6 border-t border-slate-100 dark:border-slate-700">
                    <button
                        onClick={() => onSave?.()}
                        className="px-8 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 hover:shadow-lg hover:-translate-y-0.5 transition-all font-bold text-sm shadow-md active:translate-y-0"
                    >
                        Save Carousel Changes
                    </button>
                </div>
            </div>
        </CollapsibleSection>
    );
};
