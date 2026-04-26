"use client";

import React, { FC } from "react";
import {
    LayoutList,
    Plus,
    Trash2,
    MoveUp,
    MoveDown,
    Package,
    GripVertical,
    Tags,
    CreditCard,
    Grid3X3,
    Eye,
    Film,
    Link,
    CheckCircle2,
} from "lucide-react";
import { CollapsibleSection, ImageUploadField, ErrorBadge } from "./CMSComponents";
import { IHomePageCMS, ProductsSection, Banner, CarouselItem } from "@/types/home";
import RedirectLinkBuilder from "./RedirectLinkBuilder";

interface SectionSettingsProps {
    sections: IHomePageCMS["sections"];
    addSection: (type: "products" | "banner" | "quad_grid" | "single_product" | "video_reels", count?: number) => void;
    removeSection: (id: number) => void;
    moveSection: (index: number, direction: "up" | "down") => void;
    updateBannerInSection: (sectionId: number, bannerIndex: number, field: keyof Banner, value: string, file?: File) => void;
    addProductToSection: (sectionId: number) => void;
    updateProductInSection: (sectionId: number, productIndex: number, field: keyof CarouselItem, value: string, file?: File) => void;
    removeProductFromSection: (sectionId: number, productIndex: number) => void;
    updateProductsInSection: (sectionId: number, products: ProductsSection["products"]) => void;
    validationErrors: Record<string, string>;
    openSectionId: number | null;
    setOpenSectionId: React.Dispatch<React.SetStateAction<number | null>>;
    updateQuadInSection?: (sectionId: number, quadIndex: number, field: string, value: string, file?: File) => void;
    updateQuadItemInSection?: (sectionId: number, quadIndex: number, itemIndex: number, field: string, value: string, file?: File) => void;
    onSaveSection?: (sectionId: number) => void;
    updateSectionProperty?: (sectionId: number, field: string, value: any) => void;
    addQuadColumn?: (sectionId: number) => void;
    removeQuadColumn?: (sectionId: number, quadIndex: number) => void;
    addReelToSection?: (sectionId: number) => void;
    removeReelFromSection?: (sectionId: number, reelIndex: number) => void;
    updateReelInSection?: (sectionId: number, reelIndex: number, field: string, value: string, file?: File) => void;
    resolveReelUrl?: (sectionId: number, reelIndex: number, url: string) => void;
}

export const SectionSettings: FC<SectionSettingsProps> = ({
    sections,
    addSection,
    removeSection,
    moveSection,
    updateBannerInSection,
    addProductToSection,
    updateProductInSection,
    removeProductFromSection,
    updateProductsInSection,
    updateQuadInSection,
    updateQuadItemInSection,
    validationErrors,
    openSectionId,
    setOpenSectionId,
    onSaveSection,
    updateSectionProperty,
    addQuadColumn,
    removeQuadColumn,
    addReelToSection,
    removeReelFromSection,
    updateReelInSection,
    resolveReelUrl
}) => {
    return (
        <div className="space-y-8">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-4 sm:p-6">
                <div className="flex items-center gap-3 mb-4 sm:mb-6">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400">
                        <LayoutList size={24} />
                    </div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">Add New Section</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <button
                        onClick={() => addSection("products")}
                        className="flex flex-col items-center justify-center gap-2 sm:gap-3 p-4 sm:p-6 bg-slate-50 dark:bg-slate-700/50 text-slate-700 dark:text-slate-200 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400 transition-all border-2 border-transparent hover:border-blue-100 dark:hover:border-blue-800 group"
                    >
                        <div className="p-3 bg-white dark:bg-slate-800 rounded-full shadow-sm group-hover:scale-110 transition-transform">
                            <Package size={24} />
                        </div>
                        <span className="font-bold text-sm">Products Slider</span>
                    </button>
                    <button
                        onClick={() => addSection("banner", 1)}
                        className="flex flex-col items-center justify-center gap-2 sm:gap-3 p-4 sm:p-6 bg-slate-50 dark:bg-slate-700/50 text-slate-700 dark:text-slate-200 rounded-xl hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all border-2 border-transparent hover:border-indigo-100 dark:hover:border-indigo-800 group"
                    >
                        <div className="p-3 bg-white dark:bg-slate-800 rounded-full shadow-sm group-hover:scale-110 transition-transform">
                            <CreditCard size={24} />
                        </div>
                        <span className="font-bold text-sm">Single Banner</span>
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">1920 × 480 px</span>
                    </button>
                    <button
                        onClick={() => addSection("banner", 2)}
                        className="flex flex-col items-center justify-center gap-2 sm:gap-3 p-4 sm:p-6 bg-slate-50 dark:bg-slate-700/50 text-slate-700 dark:text-slate-200 rounded-xl hover:bg-purple-50 dark:hover:bg-purple-900/20 hover:text-purple-600 dark:hover:text-purple-400 transition-all border-2 border-transparent hover:border-purple-100 dark:hover:border-purple-800 group"
                    >
                        <div className="p-3 bg-white dark:bg-slate-800 rounded-full shadow-sm group-hover:scale-110 transition-transform">
                            <Tags size={24} />
                        </div>
                        <span className="font-bold text-sm">Two Banners</span>
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">960 × 400 px each</span>
                    </button>
                    <button
                        onClick={() => addSection("banner", 3)}
                        className="flex flex-col items-center justify-center gap-2 sm:gap-3 p-4 sm:p-6 bg-slate-50 dark:bg-slate-700/50 text-slate-700 dark:text-slate-200 rounded-xl hover:bg-cyan-50 dark:hover:bg-cyan-900/20 hover:text-cyan-600 dark:hover:text-cyan-400 transition-all border-2 border-transparent hover:border-cyan-100 dark:hover:border-cyan-800 group"
                    >
                        <div className="p-3 bg-white dark:bg-slate-800 rounded-full shadow-sm group-hover:scale-110 transition-transform">
                            <LayoutList size={24} />
                        </div>
                        <span className="font-bold text-sm">Three Banners</span>
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">640 × 360 px each</span>
                    </button>
                    <button
                        onClick={() => addSection("quad_grid")}
                        className="flex flex-col items-center justify-center gap-2 sm:gap-3 p-4 sm:p-6 bg-slate-50 dark:bg-slate-700/50 text-slate-700 dark:text-slate-200 rounded-xl hover:bg-orange-50 dark:hover:bg-orange-900/20 hover:text-orange-600 dark:hover:text-orange-400 transition-all border-2 border-transparent hover:border-orange-100 dark:hover:border-orange-800 group"
                    >
                        <div className="p-3 bg-white dark:bg-slate-800 rounded-full shadow-sm group-hover:scale-110 transition-transform">
                            <Grid3X3 size={24} />
                        </div>
                        <span className="font-bold text-sm">Collection Grid</span>
                    </button>
                    <button
                        onClick={() => addSection("single_product")}
                        className="flex flex-col items-center justify-center gap-2 sm:gap-3 p-4 sm:p-6 bg-slate-50 dark:bg-slate-700/50 text-slate-700 dark:text-slate-200 rounded-xl hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all border-2 border-transparent hover:border-emerald-100 dark:hover:border-emerald-800 group"
                    >
                        <div className="p-3 bg-white dark:bg-slate-800 rounded-full shadow-sm group-hover:scale-110 transition-transform">
                            <LayoutList size={24} />
                        </div>
                        <span className="font-bold text-sm">Featured Product</span>
                    </button>
                    <button
                        onClick={() => addSection("video_reels")}
                        className="flex flex-col items-center justify-center gap-2 sm:gap-3 p-4 sm:p-6 bg-slate-50 dark:bg-slate-700/50 text-slate-700 dark:text-slate-200 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-900/20 hover:text-rose-600 dark:hover:text-rose-400 transition-all border-2 border-transparent hover:border-rose-100 dark:hover:border-rose-800 group"
                    >
                        <div className="p-3 bg-white dark:bg-slate-800 rounded-full shadow-sm group-hover:scale-110 transition-transform">
                            <Film size={24} />
                        </div>
                        <span className="font-bold text-sm">Video Reels</span>
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">Instagram-style</span>
                    </button>
                </div>
            </div>

            <div className="space-y-4">
                {sections.map((section, sIdx) => (
                    <CollapsibleSection
                        key={section.id}
                        title={`Section ${sIdx + 1}: ${section.type === "products" ? "Products Slider" : section.type === "quad_grid" ? " Collection Grid" : section.type === "single_product_carousel" ? "Featured Product" : section.type === "video_reels" ? "Video Reels" : "Banner Grid"}`}
                        icon={section.type === "products" ? <Package className="text-blue-600 dark:text-blue-400" /> : section.type === "quad_grid" ? <Grid3X3 className="text-orange-600 dark:text-orange-400" /> : section.type === "single_product_carousel" ? <LayoutList className="text-indigo-600 dark:text-indigo-400" /> : section.type === "video_reels" ? <Film className="text-rose-600 dark:text-rose-400" /> : <Tags className="text-purple-600 dark:text-purple-400" />}
                        badge={`Order: ${section.order}`}
                        isOpen={openSectionId === section.id}
                        onToggle={() => setOpenSectionId(openSectionId === section.id ? null : section.id)}
                    >
                        <div className="space-y-6 pt-2">
                            {/* Section Header */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-100 dark:border-slate-700/50">
                                <div className="flex items-center gap-4">
                                    <div className="flex flex-col gap-1">
                                        <button
                                            onClick={() => moveSection(sIdx, "up")}
                                            disabled={sIdx === 0}
                                            className="p-1.5 hover:bg-white dark:hover:bg-slate-700 rounded-lg transition-colors disabled:opacity-30 text-slate-500 dark:text-slate-400"
                                        >
                                            <MoveUp size={16} />
                                        </button>
                                        <button
                                            onClick={() => moveSection(sIdx, "down")}
                                            disabled={sIdx === sections.length - 1}
                                            className="p-1.5 hover:bg-white dark:hover:bg-slate-700 rounded-lg transition-colors disabled:opacity-30 text-slate-500 dark:text-slate-400"
                                        >
                                            <MoveDown size={16} />
                                        </button>
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-0.5">Placement</p>
                                        <p className="font-bold text-blue-600 dark:text-blue-400">Position {sIdx + 1}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => removeSection(section.id)}
                                    className="flex items-center gap-2 px-4 py-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors font-bold text-sm"
                                >
                                    <Trash2 size={16} />
                                    Remove Section
                                </button>
                            </div>

                            {/* Global Section Settings */}
                            <div className="p-4 bg-slate-50 dark:bg-slate-900/30 rounded-xl border border-slate-100 dark:border-slate-700/50 space-y-3">
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">Section Background Style</label>
                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400">Select Gradient Theme</label>
                                        <span className="text-[10px] text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full font-medium">
                                            {sections[sIdx].bgGradient ? "Active" : "None"}
                                        </span>
                                    </div>
                                    <div className="flex flex-wrap gap-3 mb-4">
                                        {[
                                            { name: "None", value: "", style: { background: "#ffffff" }, className: "border-slate-200" },
                                            { name: "Ocean", value: "linear-gradient(135deg, #00c6ff 0%, #0072ff 100%)", style: { background: "linear-gradient(135deg, #00c6ff 0%, #0072ff 100%)" } },
                                            { name: "Sunset", value: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)", style: { background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)" } },
                                            { name: "Purple", value: "linear-gradient(135deg, #5ee7df 0%, #b490ca 100%)", style: { background: "linear-gradient(135deg, #5ee7df 0%, #b490ca 100%)" } },
                                            { name: "Peach", value: "linear-gradient(to top, #c471f5 0%, #fa71cd 100%)", style: { background: "linear-gradient(to top, #c471f5 0%, #fa71cd 100%)" } },
                                            { name: "Night", value: "linear-gradient(to top, #09203f 0%, #537895 100%)", style: { background: "linear-gradient(to top, #09203f 0%, #537895 100%)" } },
                                            { name: "Morning", value: "linear-gradient(120deg, #f6d365 0%, #fda085 100%)", style: { background: "linear-gradient(120deg, #f6d365 0%, #fda085 100%)" } },
                                            { name: "Midnight", value: "linear-gradient(to right, #434343 0%, black 100%)", style: { background: "linear-gradient(to right, #434343 0%, black 100%)" } },
                                        ].map((option) => (
                                            <button
                                                key={option.name}
                                                onClick={() => updateSectionProperty?.(section.id, "bgGradient", option.value)}
                                                style={option.style}
                                                title={option.name}
                                                className={`
                                                    relative w-10 h-10 rounded-full border-2 transition-all shadow-sm hover:scale-110 hover:shadow-md
                                                    ${section.bgGradient === option.value ? 'border-blue-600 ring-2 ring-blue-500/30 scale-110 shadow-md' : 'border-transparent dark:border-slate-600'}
                                                    ${option.className || ''}
                                                `}
                                            >
                                                {option.value === "" && <div className="absolute inset-0 flex items-center justify-center text-[10px] text-slate-400 font-bold">/</div>}
                                                {section.bgGradient === option.value && option.value !== "" && (
                                                    <div className="absolute inset-0 flex items-center justify-center">
                                                        <div className="w-2 h-2 bg-white rounded-full shadow-sm" />
                                                    </div>
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                    <div className="mt-3">
                                        <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">Custom Class</label>
                                        <input
                                            type="text"
                                            placeholder="e.g. from-red-500 to-yellow-500"
                                            value={section.bgGradient || ""}
                                            onChange={(e) => updateSectionProperty?.(section.id, "bgGradient", e.target.value)}
                                            className="w-full px-3 py-2 bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-lg text-xs outline-none focus:border-blue-500 transition-colors"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Section Content */}
                            {section.type === "products" || section.type === "single_product_carousel" ? (
                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                                            Section Heading <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="e.g. Best Sellers, New Arrivals"
                                            value={section.products.heading}
                                            onChange={(e) => updateProductsInSection(section.id, { ...section.products, heading: e.target.value })}
                                            className="w-full px-4 py-3 bg-white dark:bg-slate-900 text-slate-900 dark:text-white border-2 border-slate-200 dark:border-slate-700 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all placeholder:text-slate-400 font-medium"
                                        />
                                    </div>

                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                                <Package size={18} className="text-blue-500" />
                                                {section.type === "products" ? "Products in Slider" : "Dynamic Product Carousel"}
                                            </h4>
                                            <span className="px-3 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-full text-[10px] font-black uppercase tracking-tighter">
                                                {section.type === "products" ? `${section.products.items.length} Products` : "Dynamic Sync Active"}
                                            </span>
                                        </div>

                                        {section.type === "products" ? (
                                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                                {section.products.items.map((item, pIdx) => (
                                                    <div key={pIdx} className="bg-white dark:bg-slate-800/50 border-2 border-slate-100 dark:border-slate-700 rounded-2xl p-4 sm:p-5 shadow-sm group hover:border-blue-200 dark:hover:border-blue-800 transition-colors relative">
                                                        <div className="flex justify-between items-center mb-4">
                                                            <span className="bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold">
                                                                {pIdx + 1}
                                                            </span>
                                                            <button
                                                                onClick={() => removeProductFromSection(section.id, pIdx)}
                                                                className="text-red-400 hover:text-red-600 dark:hover:text-red-400 transition-colors p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                                                            >
                                                                <Trash2 size={16} />
                                                            </button>
                                                        </div>

                                                        <div className="space-y-4">
                                                            <ImageUploadField
                                                                label="Product Image"
                                                                value={typeof item.image === 'object' ? item.image.url : item.image}
                                                                onChange={(val, file) => updateProductInSection(section.id, pIdx, "image", val, file)}
                                                                required
                                                            />
                                                            <div className="grid grid-cols-2 gap-4">
                                                                <div className="col-span-2">
                                                                    <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">Product Name</label>
                                                                    <input
                                                                        type="text"
                                                                        placeholder="e.g. Wireless Headphones"
                                                                        value={item.title}
                                                                        onChange={(e) => updateProductInSection(section.id, pIdx, "title", e.target.value)}
                                                                        className="w-full px-3 py-2.5 bg-white dark:bg-slate-900 text-slate-900 dark:text-white border-2 border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:border-blue-500 transition-colors"
                                                                    />
                                                                </div>
                                                                <div className="col-span-2">
                                                                    <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">Subtitle / Price</label>
                                                                    <input
                                                                        type="text"
                                                                        placeholder="e.g. $299.00"
                                                                        value={item.subtitle}
                                                                        onChange={(e) => updateProductInSection(section.id, pIdx, "subtitle", e.target.value)}
                                                                        className="w-full px-3 py-2.5 bg-white dark:bg-slate-900 text-slate-900 dark:text-white border-2 border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:border-blue-500 transition-colors"
                                                                    />
                                                                </div>
                                                                <div className="col-span-2">
                                                                    <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">Link</label>
                                                                    <RedirectLinkBuilder
                                                                        value={item.redirectLink || ""}
                                                                        onChange={(val) => updateProductInSection(section.id, pIdx, "redirectLink", val)}
                                                                        onSelectDetailed={(data) => {
                                                                            if (data.name && !item.title) updateProductInSection(section.id, pIdx, "title", data.name);
                                                                            if (data.image && !item.image) updateProductInSection(section.id, pIdx, "image", data.image);
                                                                        }}
                                                                    />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                                <div className="bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm">
                                                    <div className="flex flex-col lg:flex-row gap-10">
                                                        {/* CMS Product Detail Stage */}
                                                        <div className="w-full lg:w-1/2 space-y-6">
                                                            <div className="relative group rounded-2xl overflow-hidden border-2 border-slate-50 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20 aspect-square shadow-inner p-4">
                                                                <ImageUploadField
                                                                    label="Main Product Stage"
                                                                    value={typeof section.products.items[0]?.image === 'object' ? section.products.items[0]?.image.url : section.products.items[0]?.image}
                                                                    onChange={(val, file) => updateProductInSection(section.id, 0, "image", val, file)}
                                                                    required
                                                                />
                                                            </div>
                                                            
                                                            <div className="space-y-3">
                                                                <div className="flex items-center justify-between">
                                                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                                                        <Eye size={12} className="text-blue-500" />
                                                                        Sync Gallery ({section.products.items.length})
                                                                    </label>
                                                                    <span className="text-[9px] font-bold text-green-500 bg-green-500/10 px-2 py-0.5 rounded-full">ACTIVE</span>
                                                                </div>
                                                                <div className="flex flex-wrap gap-2.5">
                                                                    {section.products.items.map((imgItem: any, idx: number) => (
                                                                        <div key={idx} className={`relative w-14 h-14 rounded-xl overflow-hidden border-2 transition-all ${idx === 0 ? "border-blue-500 shadow-md ring-2 ring-blue-500/10" : "border-slate-100 dark:border-slate-800"}`}>
                                                                            <img
                                                                                src={typeof imgItem.image === 'object' ? imgItem.image.url : imgItem.image}
                                                                                className="w-full h-full object-cover"
                                                                                alt={`Gallery ${idx + 1}`}
                                                                            />
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* CMS Product Metadata Side */}
                                                        <div className="flex-1 flex flex-col justify-center space-y-6">
                                                            <div className="space-y-6 p-6 rounded-2xl bg-slate-50/50 dark:bg-slate-800/10 border border-slate-100 dark:border-slate-800">
                                                                <div>
                                                                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2">Display Heading</label>
                                                                    <input
                                                                        type="text"
                                                                        value={section.products.items[0]?.title || ""}
                                                                        onChange={(e) => updateProductInSection(section.id, 0, "title", e.target.value)}
                                                                        className="w-full px-4 py-3 bg-white dark:bg-slate-950 text-slate-900 dark:text-white border-2 border-slate-200 dark:border-slate-800 rounded-xl font-black text-lg focus:border-blue-500 outline-none shadow-sm transition-all"
                                                                    />
                                                                </div>
                                                                <div>
                                                                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2">Redirect URL</label>
                                                                    <RedirectLinkBuilder
                                                                        value={section.products.items[0]?.redirectLink || ""}
                                                                        onChange={(val) => updateProductInSection(section.id, 0, "redirectLink", val)}
                                                                        onSelectDetailed={(data) => {
                                                                            if (data.name && !section.products.items[0]?.title) updateProductInSection(section.id, 0, "title", data.name);
                                                                            if (data.image && !section.products.items[0]?.image) updateProductInSection(section.id, 0, "image", data.image);
                                                                        }}
                                                                    />
                                                                </div>
                                                            </div>
                                                            <div className="p-4 rounded-xl border border-blue-100/50 dark:border-blue-900/20 bg-blue-50/20 dark:bg-blue-900/10">
                                                                <p className="text-[10px] text-blue-600/70 dark:text-blue-400/70 font-medium text-center">
                                                                    Design mimics the <b>Product Detail</b> layout on the store front.
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                        )}

                                        {section.type === "products" && (
                                            <button
                                                onClick={() => addProductToSection(section.id)}
                                                className="w-full py-4 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl text-slate-500 dark:text-slate-400 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-900/20 dark:hover:text-blue-400 hover:border-blue-300 dark:hover:border-blue-700 transition-all font-bold flex items-center justify-center gap-3 group"
                                            >
                                                <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full group-hover:bg-blue-100 dark:group-hover:bg-blue-900/50 transition-colors">
                                                    <Plus size={20} className="group-hover:scale-110 transition-transform" />
                                                </div>
                                                Add Another Product
                                            </button>
                                        )}
                                        {section.type === "single_product_carousel" && (
                                            <div className="p-6 border-2 border-dashed border-indigo-200 dark:border-indigo-900/30 rounded-2xl bg-indigo-50/30 dark:bg-indigo-900/10 flex flex-col items-center text-center gap-2">
                                                <div className="p-2 bg-indigo-100 dark:bg-indigo-900/50 rounded-full text-indigo-600 dark:text-indigo-400 mb-2">
                                                    <Package size={20} />
                                                </div>
                                                <p className="text-sm font-bold text-indigo-900 dark:text-indigo-100">Dynamic Section</p>
                                                <p className="text-xs text-indigo-700/70 dark:text-indigo-400/70 max-w-sm">
                                                    This carousel is managed via the <strong>Products Table</strong>. Move a product to this section to automatically sync all its images.
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ) : section.type === "quad_grid" ? (
                                <div className="space-y-8">
                                    <div className="p-4 bg-slate-50 dark:bg-slate-900/30 rounded-xl border border-slate-100 dark:border-slate-700/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                        <div>
                                            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">Mobile Columns</h4>
                                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Control how many columns are displayed per row on mobile devices.</p>
                                        </div>
                                        <select
                                            value={section.mobileColumns || (section.quads?.every(q => q.layout === 'carousel') ? 1 : 2)}
                                            onChange={(e) => updateSectionProperty?.(section.id, "mobileColumns", Number(e.target.value))}
                                            className="px-3 py-2 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-lg text-sm font-bold text-slate-900 dark:text-slate-100 outline-none focus:border-blue-500 min-w-[140px]"
                                        >
                                            <option value={1}>1 Column</option>
                                            <option value={2}>2 Columns</option>
                                        </select>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {(section as any).quads.map((quad: any, qIdx: number) => (
                                            <div key={qIdx} className="bg-white dark:bg-slate-800/50 border-2 border-slate-100 dark:border-slate-700 rounded-2xl p-4 sm:p-5 shadow-sm hover:border-orange-200 dark:hover:border-orange-800 transition-colors space-y-4">
                                                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-3">
                                                    <h5 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                                        <span className="w-6 h-6 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-lg flex items-center justify-center text-xs">
                                                            {qIdx + 1}
                                                        </span>
                                                        Column {qIdx + 1}
                                                    </h5>
                                                    <div className="flex items-center gap-2">
                                                        <select
                                                            value={quad.layout || 'grid'}
                                                            onChange={(e) => updateQuadInSection?.(section.id, qIdx, "layout", e.target.value)}
                                                            className="text-[10px] font-bold bg-slate-100 dark:bg-slate-700 border-none rounded-md px-2 py-1 outline-none text-slate-600 dark:text-slate-300"
                                                        >
                                                            <option value="grid">Grid (2x2)</option>
                                                            <option value="single">Single (Amazon Style)</option>
                                                            <option value="carousel">Single Product Carousel</option>
                                                        </select>
                                                        <button
                                                            onClick={() => removeQuadColumn?.(section.id, qIdx)}
                                                            className="p-1 text-red-400 hover:text-red-600 transition-colors"
                                                        >
                                                            <Trash2 size={14} />
                                                        </button>
                                                    </div>
                                                </div>

                                                <div className="space-y-4">
                                                    <div>
                                                        <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">Column Title</label>
                                                        <input
                                                            type="text"
                                                            placeholder="Card Title"
                                                            value={quad.title}
                                                            onChange={(e) => updateQuadInSection?.(section.id, qIdx, "title", e.target.value)}
                                                            className="w-full px-3 py-2.5 bg-white dark:bg-slate-900 text-slate-900 dark:text-white border-2 border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:border-orange-500 transition-colors"
                                                        />
                                                    </div>

                                                    <div className="space-y-4">
                                                        {/* ─── LAYOUT: GRID 2×2 ─── */}
                                                        {quad.layout === 'grid' ? (
                                                            <div className="space-y-3">
                                                                {/* Mini Preview */}
                                                                <div className="p-3 bg-slate-50 dark:bg-slate-900/30 rounded-xl border border-slate-100 dark:border-slate-700/50">
                                                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 text-center">2×2 Grid Preview</p>
                                                                    <div className="grid grid-cols-2 gap-1.5">
                                                                        {quad.items.slice(0, 4).map((item: any, iIdx: number) => (
                                                                            <div key={iIdx} className="aspect-square bg-white dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 overflow-hidden flex items-center justify-center">
                                                                                {(typeof item.image === 'object' ? item.image?.url : item.image) ? (
                                                                                    <img src={typeof item.image === 'object' ? item.image.url : item.image} className="w-full h-full object-contain p-1" alt="" />
                                                                                ) : (
                                                                                    <span className="text-[8px] text-slate-300 font-bold">{iIdx + 1}</span>
                                                                                )}
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                                {/* Edit Fields */}
                                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                                    {quad.items.slice(0, 4).map((item: any, iIdx: number) => {
                                                                        const isSynced = item?.redirectLink?.includes('/product/');
                                                                        return (
                                                                        <div key={iIdx} className={`p-3 rounded-xl border space-y-3 ${isSynced ? 'bg-emerald-50/30 dark:bg-emerald-900/5 border-emerald-100 dark:border-emerald-800/50' : 'bg-slate-50 dark:bg-slate-900/30 border-slate-100 dark:border-slate-700/50'}`}>
                                                                            <div className="flex items-center gap-2 mb-1">
                                                                                <span className={`w-5 h-5 ${isSynced ? 'bg-emerald-100 text-emerald-600' : 'bg-orange-100 text-orange-600'} rounded flex items-center justify-center text-[9px] font-black`}>{iIdx + 1}</span>
                                                                                <span className="text-[10px] font-bold text-slate-500">Slot {iIdx + 1}</span>
                                                                                {isSynced && <span className="ml-auto text-[8px] bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 px-1.5 py-0.5 rounded font-black uppercase tracking-wider flex items-center gap-1"><span className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" /> Synced</span>}
                                                                            </div>
                                                                            
                                                                            {isSynced ? (
                                                                                <div className="relative aspect-[2/1] rounded-lg border-2 border-dashed border-emerald-200 dark:border-emerald-800/50 bg-white dark:bg-slate-950 flex items-center justify-center p-2">
                                                                                    <img src={typeof item.image === 'object' ? item.image.url : item.image} className="max-w-full max-h-full object-contain opacity-90" alt="" />
                                                                                    <button type="button" onClick={() => {
                                                                                        updateQuadItemInSection?.(section.id, qIdx, iIdx, "redirectLink", "");
                                                                                        updateQuadItemInSection?.(section.id, qIdx, iIdx, "title", "");
                                                                                        updateQuadItemInSection?.(section.id, qIdx, iIdx, "image", "");
                                                                                    }} className="absolute top-1 right-1 bg-white/90 dark:bg-slate-800/90 hover:bg-red-50 text-red-500 p-1.5 rounded-md shadow-sm border border-slate-100 dark:border-slate-700 text-[10px] transition-colors"><Trash2 className="w-3 h-3" /></button>
                                                                                </div>
                                                                            ) : (
                                                                                <ImageUploadField
                                                                                    label={`Grid Slot ${iIdx + 1}`}
                                                                                    value={typeof item.image === 'object' ? item.image.url : item.image}
                                                                                    onChange={(val, file) => updateQuadItemInSection?.(section.id, qIdx, iIdx, "image", val, file)}
                                                                                    required={iIdx === 0}
                                                                                />
                                                                            )}
                                                                            <input
                                                                                type="text"
                                                                                placeholder="Label"
                                                                                value={item.title || ""}
                                                                                readOnly={isSynced}
                                                                                onChange={(e) => updateQuadItemInSection?.(section.id, qIdx, iIdx, "title", e.target.value)}
                                                                                className={`w-full px-2 py-1.5 bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-lg text-[10px] outline-none focus:border-orange-500 transition-colors ${isSynced ? 'opacity-60 bg-slate-50 cursor-not-allowed pointer-events-none' : ''}`}
                                                                            />
                                                                            <RedirectLinkBuilder
                                                                                value={item.redirectLink || ""}
                                                                                onChange={(val) => updateQuadItemInSection?.(section.id, qIdx, iIdx, "redirectLink", val)}
                                                                                onSelectDetailed={(data) => {
                                                                                    if (data.name && !item.title) updateQuadItemInSection?.(section.id, qIdx, iIdx, "title", data.name);
                                                                                    if (data.image && !item.image) updateQuadItemInSection?.(section.id, qIdx, iIdx, "image", data.image);
                                                                                }}
                                                                            />
                                                                        </div>
                                                                    )})}
                                                                </div>
                                                                <div className="p-1.5 bg-orange-600/5 dark:bg-orange-900/10 rounded flex items-center justify-center gap-2">
                                                                    <div className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                                                                    <p className="text-[8px] text-orange-700/70 dark:text-orange-400/70 font-bold uppercase tracking-tighter">4 Products • 2×2 Grid Layout</p>
                                                                </div>
                                                            </div>

                                                        ) : quad.layout === 'single' ? (
                                                            /* ─── LAYOUT: SINGLE PRODUCT ─── */
                                                            <div className="space-y-3">
                                                                {/* Mini Preview */}
                                                                <div className="p-3 bg-slate-50 dark:bg-slate-900/30 rounded-xl border border-slate-100 dark:border-slate-700/50">
                                                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 text-center">Single Product Preview</p>
                                                                    <div className="max-w-[140px] mx-auto">
                                                                        <div className="aspect-square bg-white dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 overflow-hidden flex items-center justify-center">
                                                                            {(typeof quad.items[0]?.image === 'object' ? quad.items[0]?.image?.url : quad.items[0]?.image) ? (
                                                                                <img src={typeof quad.items[0]?.image === 'object' ? quad.items[0]?.image.url : quad.items[0]?.image} className="w-full h-full object-contain p-2" alt="" />
                                                                            ) : (
                                                                                <span className="text-xs text-slate-300 font-bold">No Image</span>
                                                                            )}
                                                                        </div>
                                                                        {quad.items[0]?.title && (
                                                                            <p className="text-[9px] text-center font-bold text-slate-600 dark:text-slate-300 mt-1 truncate">{quad.items[0]?.title}</p>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                                {/* Edit Fields - Only 1 product */}
                                                                {(() => {
                                                                    const item = quad.items[0] || {};
                                                                    const isSynced = item?.redirectLink?.includes('/product/');
                                                                    return (
                                                                    <div className={`p-4 rounded-xl border space-y-3 ${isSynced ? 'bg-emerald-50/50 dark:bg-emerald-900/10 border-emerald-200 dark:border-emerald-800' : 'bg-orange-50/50 dark:bg-orange-900/10 border-orange-200 dark:border-orange-800'}`}>
                                                                        <div className="flex items-center gap-2 mb-1">
                                                                            <span className={`w-5 h-5 ${isSynced ? 'bg-emerald-100 text-emerald-600' : 'bg-orange-100 text-orange-600'} rounded flex items-center justify-center text-[9px] font-black`}>1</span>
                                                                            <span className="text-[10px] font-bold text-slate-500">Single Product</span>
                                                                            {isSynced && <span className="ml-auto text-[8px] bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 px-1.5 py-0.5 rounded font-black uppercase tracking-wider flex items-center gap-1"><span className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" /> Synced from DB</span>}
                                                                        </div>
                                                                        
                                                                        {isSynced ? (
                                                                             <div className="relative aspect-[2/1] rounded-xl border-2 border-dashed border-emerald-200 dark:border-emerald-800 bg-white dark:bg-slate-950 flex items-center justify-center p-4">
                                                                             <img src={typeof item.image === 'object' ? item.image.url : item.image} className="max-w-full max-h-full object-contain" alt="" />
                                                                             <button type="button" onClick={() => {
                                                                                 updateQuadItemInSection?.(section.id, qIdx, 0, "redirectLink", "");
                                                                                 updateQuadItemInSection?.(section.id, qIdx, 0, "title", "");
                                                                                 updateQuadItemInSection?.(section.id, qIdx, 0, "image", "");
                                                                             }} className="absolute top-2 right-2 bg-white dark:bg-slate-800 hover:bg-red-50 text-red-500 p-1.5 rounded-md shadow border border-slate-100 dark:border-slate-700 text-[10px] transition-colors"><Trash2 className="w-4 h-4" /></button>
                                                                         </div>
                                                                        ) : (
                                                                            <ImageUploadField
                                                                                label="Product Image"
                                                                                value={typeof item.image === 'object' ? item.image.url : item.image}
                                                                                onChange={(val, file) => updateQuadItemInSection?.(section.id, qIdx, 0, "image", val, file)}
                                                                                required
                                                                            />
                                                                        )}
                                                                        <input
                                                                            type="text"
                                                                            placeholder="Product Title"
                                                                            value={item.title || ""}
                                                                            readOnly={isSynced}
                                                                            onChange={(e) => updateQuadItemInSection?.(section.id, qIdx, 0, "title", e.target.value)}
                                                                            className={`w-full px-2 py-1.5 bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-lg text-[10px] outline-none focus:border-orange-500 transition-colors ${isSynced ? 'opacity-60 bg-slate-50 cursor-not-allowed pointer-events-none' : ''}`}
                                                                        />
                                                                        <RedirectLinkBuilder
                                                                            value={item.redirectLink || ""}
                                                                            onChange={(val) => updateQuadItemInSection?.(section.id, qIdx, 0, "redirectLink", val)}
                                                                            onSelectDetailed={(data) => {
                                                                                if (data.name && !item.title) updateQuadItemInSection?.(section.id, qIdx, 0, "title", data.name);
                                                                                if (data.image && !item.image) updateQuadItemInSection?.(section.id, qIdx, 0, "image", data.image);
                                                                            }}
                                                                        />
                                                                    </div>
                                                                    );
                                                                })()}
                                                                <div className="p-1.5 bg-orange-600/5 dark:bg-orange-900/10 rounded flex items-center justify-center gap-2">
                                                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                                                    <p className="text-[8px] text-orange-700/70 dark:text-orange-400/70 font-bold uppercase tracking-tighter">1 Product • Single Layout</p>
                                                                </div>
                                                            </div>

                                                        ) : (
                                                            /* ─── LAYOUT: CAROUSEL ─── */
                                                            <div className="p-5 bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm space-y-4">
                                                                {/* Mini Preview: First image on top, thumbnails below */}
                                                                <div className="p-3 bg-slate-50 dark:bg-slate-900/30 rounded-xl border border-slate-100 dark:border-slate-700/50">
                                                                    <div className="flex justify-between items-center mb-2">
                                                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest text-center flex-1">Carousel Preview</p>
                                                                        {quad.items[0]?.redirectLink?.includes('/product/') && <span className="text-[8px] bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 px-1.5 py-0.5 rounded font-black uppercase tracking-wider flex items-center gap-1"><span className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" /> SYNCED</span>}
                                                                    </div>
                                                                    {/* Hero Image */}
                                                                    <div className="aspect-square bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden flex items-center justify-center mb-2">
                                                                        {(typeof quad.items[0]?.image === 'object' ? quad.items[0]?.image?.url : quad.items[0]?.image) ? (
                                                                            <img src={typeof quad.items[0]?.image === 'object' ? quad.items[0]?.image.url : quad.items[0]?.image} className="w-full h-full object-contain p-3" alt="" />
                                                                        ) : (
                                                                            <span className="text-xs text-slate-300 font-bold">Hero Image</span>
                                                                        )}
                                                                    </div>
                                                                    {/* Thumbnail Strip */}
                                                                    {quad.items.length > 1 && (
                                                                        <div className="grid grid-cols-4 gap-1">
                                                                            {quad.items.map((item: any, iIdx: number) => (
                                                                                <div key={iIdx} className={`aspect-square bg-white dark:bg-slate-800 rounded border-2 overflow-hidden flex items-center justify-center ${iIdx === 0 ? 'border-orange-500' : 'border-slate-200 dark:border-slate-700'}`}>
                                                                                    {(typeof item.image === 'object' ? item.image?.url : item.image) ? (
                                                                                        <img src={typeof item.image === 'object' ? item.image.url : item.image} className="w-full h-full object-contain p-0.5" alt="" />
                                                                                    ) : (
                                                                                        <span className="text-[7px] text-slate-300 font-bold">{iIdx + 1}</span>
                                                                                    )}
                                                                                </div>
                                                                            ))}
                                                                        </div>
                                                                    )}
                                                                    {quad.items[0]?.title && (
                                                                        <p className="text-[9px] text-center font-bold text-slate-600 dark:text-slate-300 mt-1.5 truncate">{quad.items[0]?.title}</p>
                                                                    )}
                                                                </div>

                                                                {/* Carousel Editor */}
                                                                {(() => {
                                                                    const isSynced = quad.items[0]?.redirectLink?.includes('/product/');
                                                                    return (
                                                                <div className="space-y-3 relative">
                                                                    {isSynced && (
                                                                        <button type="button" onClick={() => {
                                                                            updateQuadItemInSection?.(section.id, qIdx, 0, "redirectLink", "");
                                                                            updateQuadItemInSection?.(section.id, qIdx, 0, "title", "");
                                                                            // clear out everything
                                                                            if (section?.quads && section.quads[qIdx]) {
                                                                                // Ideally we want to clear the items array out via state update, but here we can just clear first item
                                                                                updateQuadItemInSection?.(section.id, qIdx, 0, "image", "");
                                                                            }
                                                                        }} className="absolute -top-12 z-10 right-2 bg-white dark:bg-slate-800 hover:bg-red-50 text-red-500 px-2 py-1 rounded shadow border border-slate-200 dark:border-slate-700 text-[9px] font-bold uppercase transition-colors"><Trash2 className="w-3 h-3 inline mr-1" /> Unlink Product</button>
                                                                    )}
                                                                    
                                                                    {!isSynced && (
                                                                        <div className="relative group rounded-xl overflow-hidden border-2 border-slate-50 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20 aspect-square p-2">
                                                                            <ImageUploadField
                                                                                label="Hero Stage (1st Image)"
                                                                                value={typeof quad.items[0]?.image === 'object' ? quad.items[0]?.image.url : quad.items[0]?.image}
                                                                                onChange={(val, file) => updateQuadItemInSection?.(section.id, qIdx, 0, "image", val, file)}
                                                                            />
                                                                        </div>
                                                                    )}

                                                                    <div className={`space-y-3 p-4 rounded-xl border border-slate-100 dark:border-slate-800 ${isSynced ? 'bg-emerald-50/20 dark:bg-emerald-900/5' : 'bg-slate-50/50 dark:bg-slate-800/10'}`}>
                                                                        <div>
                                                                            <label className="block text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Product Title</label>
                                                                            <input
                                                                                type="text"
                                                                                placeholder="Product Title"
                                                                                value={quad.items[0]?.title || ""}
                                                                                readOnly={isSynced}
                                                                                onChange={(e) => updateQuadItemInSection?.(section.id, qIdx, 0, "title", e.target.value)}
                                                                                className={`w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-[10px] font-bold outline-none focus:border-orange-500 ${isSynced ? 'opacity-60 bg-slate-50 cursor-not-allowed pointer-events-none' : ''}`}
                                                                            />
                                                                        </div>
                                                                        <div>
                                                                            <label className="block text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Target Link</label>
                                                                            <div className={isSynced ? 'opacity-60 cursor-not-allowed pointer-events-none' : ''}>
                                                                                <RedirectLinkBuilder
                                                                                    value={quad.items[0]?.redirectLink || ""}
                                                                                    onChange={(val) => updateQuadItemInSection?.(section.id, qIdx, 0, "redirectLink", val)}
                                                                                />
                                                                            </div>
                                                                        </div>
                                                                    </div>

                                                                    <div className="pt-3">
                                                                        <div className="flex items-center justify-between mb-2">
                                                                            <label className="block text-[8px] font-black text-slate-400 uppercase tracking-widest">Gallery ({quad.items.length})</label>
                                                                            {isSynced && <span className="text-[8px] text-emerald-500 font-black">SYNCED FROM DB</span>}
                                                                        </div>
                                                                        <div className="flex flex-wrap gap-2">
                                                                            {quad.items.map((item: any, iIdx: number) => (
                                                                                <div key={iIdx} className={`w-8 h-8 rounded-lg border-2 transition-all ${iIdx === 0 ? "border-orange-500 shadow-sm" : "border-slate-100 dark:border-slate-800"} overflow-hidden`}>
                                                                                    {item.image ? (
                                                                                        <img src={typeof item.image === 'object' ? item.image.url : item.image} className="w-full h-full object-cover" />
                                                                                    ) : (
                                                                                        <div className="bg-slate-100 w-full h-full"></div>
                                                                                    )}
                                                                                </div>
                                                                            ))}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                ) })()}

                                                                <div className="p-1.5 bg-orange-600/5 dark:bg-orange-900/10 rounded flex items-center justify-center gap-2">
                                                                    <div className="w-1 h-1 rounded-full bg-orange-500 animate-pulse" />
                                                                    <p className="text-[8px] text-orange-700/70 dark:text-orange-400/70 font-bold uppercase tracking-tighter">Carousel • 1st Image Top, Rest as Thumbnails</p>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>

                                                    <div className="pt-2 space-y-3">
                                                        <div>
                                                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Footer Link Text</label>
                                                            <input
                                                                type="text"
                                                                placeholder="e.g. Shop all"
                                                                value={quad.redirectText}
                                                                onChange={(e) => updateQuadInSection?.(section.id, qIdx, "redirectText", e.target.value)}
                                                                className="w-full px-3 py-2 bg-white dark:bg-slate-900 text-slate-900 dark:text-white border-2 border-slate-200 dark:border-slate-700 rounded-xl text-xs outline-none focus:border-orange-500 transition-colors"
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Footer Redirect URL</label>
                                                            <RedirectLinkBuilder
                                                                value={quad.redirectLink || ""}
                                                                onChange={(val) => updateQuadInSection?.(section.id, qIdx, "redirectLink", val)}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}

                                        {/* Add New Column Button */}
                                        {(section as any).quads?.length < 4 && (
                                            <button
                                                onClick={() => addQuadColumn?.(section.id)}
                                                className="h-full min-h-[300px] flex flex-col items-center justify-center gap-3 p-6 bg-slate-50 dark:bg-slate-900/30 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl text-slate-400 hover:text-orange-500 hover:border-orange-500/50 hover:bg-orange-50/30 dark:hover:bg-orange-900/10 transition-all group"
                                            >
                                                <div className="p-3 bg-white dark:bg-slate-800 rounded-full shadow-sm group-hover:scale-110 transition-transform">
                                                    <Plus size={24} />
                                                </div>
                                                <span className="font-bold text-sm tracking-tight">Add New Column</span>
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ) : (section.type === 'banner1' || section.type === 'banner2' || section.type === 'banner3') ? (
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                    {section.banners.map((banner, bIdx) => (
                                        <div key={bIdx} className="bg-white dark:bg-slate-800/50 border-2 border-slate-100 dark:border-slate-700 rounded-2xl p-4 sm:p-5 shadow-sm hover:border-indigo-200 dark:hover:border-indigo-800 transition-colors">
                                            <div className="flex items-center gap-2 mb-4 font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-700 pb-3">
                                                <Tags size={16} className="text-indigo-500" />
                                                Banner {bIdx + 1}
                                            </div>
                                            <div className="space-y-4">
                                                <div className="flex items-center gap-2 px-3 py-2 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800 rounded-lg mb-2">
                                                    <Tags size={12} className="text-indigo-500 flex-shrink-0" />
                                                    <p className="text-[10px] text-indigo-700 dark:text-indigo-300 font-medium">
                                                        {section.type === 'banner1' ? 'Recommended: 1920 × 480 px (21:9 ratio)' : section.type === 'banner2' ? 'Recommended: 960 × 400 px each (21:9 ratio)' : 'Recommended: 640 × 360 px each (16:9 ratio)'}
                                                    </p>
                                                </div>
                                                <ImageUploadField
                                                    label="Banner Image"
                                                    value={typeof banner.image === 'object' ? banner.image.url : banner.image}
                                                    onChange={(val, file) => updateBannerInSection(section.id, bIdx, "image", val, file)}
                                                    required
                                                />
                                                <div>
                                                    <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">Title</label>
                                                    <input
                                                        type="text"
                                                        placeholder="Banner Title"
                                                        value={banner.title}
                                                        onChange={(e) => updateBannerInSection(section.id, bIdx, "title", e.target.value)}
                                                        className="w-full px-3 py-2.5 bg-white dark:bg-slate-900 text-slate-900 dark:text-white border-2 border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:border-indigo-500 transition-colors"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">Link</label>
                                                    <RedirectLinkBuilder
                                                        value={banner.redirectLink || ""}
                                                        onChange={(val) => updateBannerInSection(section.id, bIdx, "redirectLink", val)}
                                                        onSelectDetailed={(data) => {
                                                            if (data.name && !banner.title) updateBannerInSection(section.id, bIdx, "title", data.name);
                                                            if (data.image && !banner.image) updateBannerInSection(section.id, bIdx, "image", data.image);
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : section.type === 'video_reels' ? (
                                <div className="space-y-6">
                                    <div className="flex items-center justify-between">
                                        <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                            <Film size={18} className="text-rose-500" />
                                            Video Reels List
                                        </h4>
                                        <span className="px-3 py-1 bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 rounded-full text-[10px] font-black uppercase tracking-tighter">
                                            {(section as any).videoReels?.length || 0} Reels
                                        </span>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                        {((section as any).videoReels || []).map((reel: any, rIdx: number) => (
                                            <div key={rIdx} className="bg-white dark:bg-slate-800/50 border-2 border-slate-100 dark:border-slate-700 rounded-2xl p-4 sm:p-5 shadow-sm hover:border-rose-200 dark:hover:border-rose-800 transition-colors relative group">
                                                <div className="flex justify-between items-center mb-4 border-b border-slate-100 dark:border-slate-700 pb-3">
                                                    <span className="bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold">
                                                        {rIdx + 1}
                                                    </span>
                                                    <button
                                                        onClick={() => removeReelFromSection?.(section.id, rIdx)}
                                                        className="text-red-400 hover:text-red-600 dark:hover:text-red-400 transition-colors p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>

                                                <div className="space-y-4">




                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div>
                                                            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">Video Upload</label>
                                                            <ImageUploadField
                                                                label="Video File"
                                                                value={typeof reel.video === 'object' ? reel.video.url : reel.video}
                                                                onChange={(val, file) => updateReelInSection?.(section.id, rIdx, "video", val, file)}
                                                                acceptType="video"
                                                                required
                                                            />
                                                            <p className="text-[9px] text-slate-400 mt-1">MP4 format recommended</p>
                                                        </div>
                                                        <div>
                                                            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">Thumbnail (Cover)</label>
                                                            <ImageUploadField
                                                                label="Cover Image"
                                                                value={typeof reel.thumbnail === 'object' ? reel.thumbnail.url : reel.thumbnail}
                                                                onChange={(val, file) => updateReelInSection?.(section.id, rIdx, "thumbnail", val, file)}
                                                            />
                                                        </div>
                                                    </div>

                                                    <div className="space-y-3">
                                                        <div>
                                                            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">Title / Username</label>
                                                            <input
                                                                type="text"
                                                                placeholder="e.g. @coolcreator"
                                                                value={reel.title || ""}
                                                                onChange={(e) => updateReelInSection?.(section.id, rIdx, "title", e.target.value)}
                                                                className="w-full px-3 py-2.5 bg-white dark:bg-slate-900 text-slate-900 dark:text-white border-2 border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:border-rose-500 transition-colors"
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">Description (Caption)</label>
                                                            <input
                                                                type="text"
                                                                placeholder="Check out this product!"
                                                                value={reel.subtitle || ""}
                                                                onChange={(e) => updateReelInSection?.(section.id, rIdx, "subtitle", e.target.value)}
                                                                className="w-full px-3 py-2.5 bg-white dark:bg-slate-900 text-slate-900 dark:text-white border-2 border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:border-rose-500 transition-colors"
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">Attached Product Link</label>
                                                            <RedirectLinkBuilder
                                                                value={reel.redirectLink || ""}
                                                                onChange={(val) => updateReelInSection?.(section.id, rIdx, "redirectLink", val)}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}

                                        <button
                                            onClick={() => addReelToSection?.(section.id)}
                                            className="h-full min-h-[300px] flex flex-col items-center justify-center gap-3 p-6 bg-slate-50 dark:bg-slate-900/30 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl text-slate-400 hover:text-rose-500 hover:border-rose-500/50 hover:bg-rose-50/30 dark:hover:bg-rose-900/10 transition-all group"
                                        >
                                            <div className="p-3 bg-white dark:bg-slate-800 rounded-full shadow-sm group-hover:scale-110 transition-transform">
                                                <Plus size={24} />
                                            </div>
                                            <span className="font-bold text-sm tracking-tight">Add New Video Reel</span>
                                        </button>
                                    </div>
                                </div>
                            ) : null}
                            <div className="flex justify-end mt-6 pt-6 border-t border-slate-100 dark:border-slate-700">
                                <button
                                    onClick={() => onSaveSection?.(section.id)}
                                    className="px-6 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 hover:shadow-lg hover:-translate-y-0.5 transition-all font-bold text-sm shadow-md active:translate-y-0"
                                >
                                    Save Section Changes
                                </button>
                            </div>
                        </div>
                    </CollapsibleSection>
                ))}

                {sections.length === 0 && (
                    <div className="text-center py-16 bg-white dark:bg-slate-800/50 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700">
                        <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400 dark:text-slate-500">
                            <LayoutList size={32} />
                        </div>
                        <p className="text-slate-900 dark:text-white font-bold text-lg mb-1">No custom sections added</p>
                        <p className="text-slate-500 dark:text-slate-400 text-sm">Add product sliders or banners above to build your page</p>
                    </div>
                )}
            </div>
        </div>
    );
};
