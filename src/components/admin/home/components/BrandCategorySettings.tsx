"use client";

import React, { FC } from "react";
import { Plus, Tags, Loader2, Award, Box, ChevronRight, FolderTree } from "lucide-react";
import { CollapsibleSection, ImageUploadField } from "./CMSComponents";

interface CategoryOption {
    _id: string;
    name: string;
    slug: string;
    level: number;
    parent?: { _id: string; name: string } | null;
}

interface BrandCategorySettingsProps {
    brandName: string;
    setBrandName: (val: string) => void;
    brandPreview: string;
    brandLoading: boolean;
    handleCreateBrand: () => void;
    setBrandFile: (file: File | null) => void;
    setBrandPreview: (val: string) => void;
    categoryName: string;
    setCategoryName: (val: string) => void;
    categoryPreview: string;
    categoryLoading: boolean;
    handleCreateCategory: () => void;
    setCategoryFile: (file: File | null) => void;
    setCategoryPreview: (val: string) => void;
    categoryParent: string;
    setCategoryParent: (val: string) => void;
    categories: CategoryOption[];
    isOpen: boolean;
    onToggle: () => void;
}

export const BrandCategorySettings: FC<BrandCategorySettingsProps> = ({
    brandName,
    setBrandName,
    brandPreview,
    brandLoading,
    handleCreateBrand,
    setBrandFile,
    setBrandPreview,
    categoryName,
    setCategoryName,
    categoryPreview,
    categoryLoading,
    handleCreateCategory,
    setCategoryFile,
    setCategoryPreview,
    categoryParent,
    setCategoryParent,
    categories,
    isOpen,
    onToggle
}) => {
    // Build a tree-aware display for the dropdown
    // Sort: root first, then children indented
    const sortedCategories = [...categories].sort((a, b) => a.level - b.level || a.name.localeCompare(b.name));

    const getIndentLabel = (cat: CategoryOption) => {
        const indent = "— ".repeat(cat.level);
        return `${indent}${cat.name}`;
    };

    // Group by level for visual indicator
    const selectedCat = categories.find(c => c._id === categoryParent);

    return (
        <CollapsibleSection
            title="Quick Setup: Brands & Categories"
            icon={<Tags className="text-blue-600 dark:text-blue-400" size={20} />}
            badge="Add base data for your store"
            isOpen={isOpen}
            onToggle={onToggle}
        >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Brand Creation */}
                <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 hover:border-blue-200 dark:hover:border-blue-800 transition-colors">
                    <h3 className="font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-3">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400">
                            <Award size={20} />
                        </div>
                        Create New Brand
                    </h3>
                    <div className="space-y-5">
                        <div className="space-y-2">
                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">
                                Brand Name
                            </label>
                            <input
                                type="text"
                                placeholder="e.g. Nike, Apple"
                                value={brandName}
                                onChange={(e) => setBrandName(e.target.value)}
                                className="w-full px-4 py-3 bg-white dark:bg-slate-900 text-slate-900 dark:text-white border-2 border-slate-200 dark:border-slate-700 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all placeholder:text-slate-400 font-medium"
                            />
                        </div>
                        <ImageUploadField
                            label="Brand Logo"
                            value={brandPreview}
                            onChange={(preview, file) => {
                                setBrandPreview(preview);
                                setBrandFile(file || null);
                            }}
                        />
                        <button
                            onClick={handleCreateBrand}
                            disabled={brandLoading}
                            className="w-full py-3.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 hover:shadow-lg hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:hover:translate-y-0 shadow-md shadow-blue-600/20 flex items-center justify-center gap-2"
                        >
                            {brandLoading ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />}
                            Create Brand
                        </button>
                    </div>
                </div>

                {/* Category Creation */}
                <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 hover:border-indigo-200 dark:hover:border-indigo-800 transition-colors">
                    <h3 className="font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-3">
                        <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg text-indigo-600 dark:text-indigo-400">
                            <Box size={20} />
                        </div>
                        Create New Category
                    </h3>
                    <div className="space-y-5">
                        <div className="space-y-2">
                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">
                                Category Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                placeholder="e.g. Electronics, Clothing"
                                value={categoryName}
                                onChange={(e) => setCategoryName(e.target.value)}
                                className="w-full px-4 py-3 bg-white dark:bg-slate-900 text-slate-900 dark:text-white border-2 border-slate-200 dark:border-slate-700 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-400 font-medium"
                            />
                        </div>

                        {/* Parent Category Selector */}
                        <div className="space-y-2">
                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1 flex items-center gap-2">
                                <FolderTree size={14} className="text-indigo-500" />
                                Parent Category
                                <span className="text-xs font-normal text-slate-400 dark:text-slate-500">(optional – leave empty for root)</span>
                            </label>

                            <div className="relative">
                                <select
                                    value={categoryParent}
                                    onChange={(e) => setCategoryParent(e.target.value)}
                                    className="w-full px-4 py-3 bg-white dark:bg-slate-900 text-slate-900 dark:text-white border-2 border-slate-200 dark:border-slate-700 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all appearance-none font-medium cursor-pointer"
                                >
                                    <option value="">— None (Root Category) —</option>
                                    {sortedCategories.map((cat) => (
                                        <option key={cat._id} value={cat._id}>
                                            {getIndentLabel(cat)}
                                        </option>
                                    ))}
                                </select>
                                <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500">
                                    <ChevronRight size={16} className="rotate-90" />
                                </div>
                            </div>

                            {/* Selected parent badge */}
                            {selectedCat && (
                                <div className="flex items-center gap-2 mt-2 px-3 py-2 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-lg">
                                    <FolderTree size={13} className="text-indigo-500 dark:text-indigo-400 flex-shrink-0" />
                                    <span className="text-xs text-indigo-700 dark:text-indigo-300 font-medium">
                                        Will be nested under:
                                    </span>
                                    <span className="text-xs font-bold text-indigo-800 dark:text-indigo-200 flex items-center gap-1">
                                        {selectedCat.parent && (
                                            <>
                                                <span className="text-indigo-400">{typeof selectedCat.parent === 'object' ? selectedCat.parent.name : ''}</span>
                                                <ChevronRight size={10} className="text-indigo-400" />
                                            </>
                                        )}
                                        {selectedCat.name}
                                    </span>
                                    <span className="ml-auto text-[10px] font-bold px-1.5 py-0.5 bg-indigo-200 dark:bg-indigo-800 text-indigo-700 dark:text-indigo-300 rounded-md">
                                        Level {(selectedCat.level || 0) + 1}
                                    </span>
                                </div>
                            )}

                            {/* Tree info when no parent */}
                            {!selectedCat && (
                                <p className="text-xs text-slate-400 dark:text-slate-500 ml-1 flex items-center gap-1.5">
                                    <FolderTree size={11} />
                                    This will be a top-level root category (Level 0)
                                </p>
                            )}
                        </div>

                        <ImageUploadField
                            label="Category Thumbnail"
                            value={categoryPreview}
                            onChange={(preview, file) => {
                                setCategoryPreview(preview);
                                setCategoryFile(file || null);
                            }}
                        />
                        <button
                            onClick={handleCreateCategory}
                            disabled={categoryLoading}
                            className="w-full py-3.5 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 hover:shadow-lg hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:hover:translate-y-0 shadow-md shadow-indigo-600/20 flex items-center justify-center gap-2"
                        >
                            {categoryLoading ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />}
                            {categoryParent ? `Create Sub-Category` : `Create Category`}
                        </button>
                    </div>
                </div>
            </div>
        </CollapsibleSection>
    );
};
