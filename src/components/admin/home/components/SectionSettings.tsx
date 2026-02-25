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
} from "lucide-react";
import { CollapsibleSection, ImageUploadField, ErrorBadge } from "./CMSComponents";
import { IHomePageCMS, ProductsSection, Banner, CarouselItem } from "@/types/home";
import RedirectLinkBuilder from "./RedirectLinkBuilder";

interface SectionSettingsProps {
    sections: IHomePageCMS["sections"];
    addSection: (type: "products" | "banner" | "quad_grid", count?: number) => void;
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
    updateSectionProperty?: (sectionId: number, field: string, value: string) => void;
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
    updateSectionProperty
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
                    </button>
                    <button
                        onClick={() => addSection("banner", 2)}
                        className="flex flex-col items-center justify-center gap-2 sm:gap-3 p-4 sm:p-6 bg-slate-50 dark:bg-slate-700/50 text-slate-700 dark:text-slate-200 rounded-xl hover:bg-purple-50 dark:hover:bg-purple-900/20 hover:text-purple-600 dark:hover:text-purple-400 transition-all border-2 border-transparent hover:border-purple-100 dark:hover:border-purple-800 group"
                    >
                        <div className="p-3 bg-white dark:bg-slate-800 rounded-full shadow-sm group-hover:scale-110 transition-transform">
                            <Tags size={24} />
                        </div>
                        <span className="font-bold text-sm">Two Banners</span>
                    </button>
                    <button
                        onClick={() => addSection("banner", 3)}
                        className="flex flex-col items-center justify-center gap-2 sm:gap-3 p-4 sm:p-6 bg-slate-50 dark:bg-slate-700/50 text-slate-700 dark:text-slate-200 rounded-xl hover:bg-cyan-50 dark:hover:bg-cyan-900/20 hover:text-cyan-600 dark:hover:text-cyan-400 transition-all border-2 border-transparent hover:border-cyan-100 dark:hover:border-cyan-800 group"
                    >
                        <div className="p-3 bg-white dark:bg-slate-800 rounded-full shadow-sm group-hover:scale-110 transition-transform">
                            <LayoutList size={24} />
                        </div>
                        <span className="font-bold text-sm">Three Banners</span>
                    </button>
                    <button
                        onClick={() => addSection("quad_grid")}
                        className="flex flex-col items-center justify-center gap-2 sm:gap-3 p-4 sm:p-6 bg-slate-50 dark:bg-slate-700/50 text-slate-700 dark:text-slate-200 rounded-xl hover:bg-orange-50 dark:hover:bg-orange-900/20 hover:text-orange-600 dark:hover:text-orange-400 transition-all border-2 border-transparent hover:border-orange-100 dark:hover:border-orange-800 group"
                    >
                        <div className="p-3 bg-white dark:bg-slate-800 rounded-full shadow-sm group-hover:scale-110 transition-transform">
                            <Grid3X3 size={24} />
                        </div>
                        <span className="font-bold text-sm">Grid</span>
                    </button>
                </div>
            </div>

            <div className="space-y-4">
                {sections.map((section, sIdx) => (
                    <CollapsibleSection
                        key={section.id}
                        title={`Section ${sIdx + 1}: ${section.type === "products" ? "Products Slider" : section.type === "quad_grid" ? " Quad Grid" : "Banner Grid"}`}
                        icon={section.type === "products" ? <Package className="text-blue-600 dark:text-blue-400" /> : section.type === "quad_grid" ? <Grid3X3 className="text-orange-600 dark:text-orange-400" /> : <Tags className="text-purple-600 dark:text-purple-400" />}
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
                            {section.type === "products" ? (
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
                                                Products in Slider
                                            </h4>
                                            <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-full text-xs font-bold">
                                                {section.products.items.length} Products
                                            </span>
                                        </div>

                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                            {section.products.items.map((item, pIdx) => (
                                                <div key={pIdx} className="bg-white dark:bg-slate-800/50 border-2 border-slate-100 dark:border-slate-700 rounded-2xl p-4 sm:p-5 shadow-sm group hover:border-blue-200 dark:hover:border-blue-800 transition-colors">
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
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        <button
                                            onClick={() => addProductToSection(section.id)}
                                            className="w-full py-4 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl text-slate-500 dark:text-slate-400 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-900/20 dark:hover:text-blue-400 hover:border-blue-300 dark:hover:border-blue-700 transition-all font-bold flex items-center justify-center gap-3 group"
                                        >
                                            <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full group-hover:bg-blue-100 dark:group-hover:bg-blue-900/50 transition-colors">
                                                <Plus size={20} className="group-hover:scale-110 transition-transform" />
                                            </div>
                                            Add Another Product
                                        </button>
                                    </div>
                                </div>
                            ) : section.type === "quad_grid" ? (
                                <div className="space-y-8">
                                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                                        {(section as any).quads.map((quad: any, qIdx: number) => (
                                            <div key={qIdx} className="bg-white dark:bg-slate-800/50 border-2 border-slate-100 dark:border-slate-700 rounded-2xl p-4 sm:p-5 shadow-sm hover:border-orange-200 dark:hover:border-orange-800 transition-colors space-y-4">
                                                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-3">
                                                    <h5 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                                        <span className="w-6 h-6 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-lg flex items-center justify-center text-xs">
                                                            {qIdx + 1}
                                                        </span>
                                                        Column {qIdx + 1}
                                                    </h5>
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

                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                        {quad.items.map((item: any, iIdx: number) => (
                                                            <div key={iIdx} className="p-3 bg-slate-50 dark:bg-slate-900/30 rounded-xl border border-slate-100 dark:border-slate-700/50 space-y-3">
                                                                <ImageUploadField
                                                                    label={`Item ${iIdx + 1}`}
                                                                    value={typeof item.image === 'object' ? item.image.url : item.image}
                                                                    onChange={(val, file) => updateQuadItemInSection?.(section.id, qIdx, iIdx, "image", val, file)}
                                                                    required
                                                                />
                                                                <input
                                                                    type="text"
                                                                    placeholder="Label"
                                                                    value={item.title}
                                                                    onChange={(e) => updateQuadItemInSection?.(section.id, qIdx, iIdx, "title", e.target.value)}
                                                                    className="w-full px-2 py-1.5 bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-lg text-[10px] outline-none focus:border-orange-500 transition-colors"
                                                                />
                                                                <input
                                                                    type="text"
                                                                    placeholder="Link"
                                                                    value={item.redirectLink}
                                                                    onChange={(e) => updateQuadItemInSection?.(section.id, qIdx, iIdx, "redirectLink", e.target.value)}
                                                                    className="w-full px-2 py-1.5 bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-lg text-[10px] outline-none focus:border-orange-500 transition-colors"
                                                                />
                                                            </div>
                                                        ))}
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
                                    </div>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                    {section.banners.map((banner, bIdx) => (
                                        <div key={bIdx} className="bg-white dark:bg-slate-800/50 border-2 border-slate-100 dark:border-slate-700 rounded-2xl p-4 sm:p-5 shadow-sm hover:border-indigo-200 dark:hover:border-indigo-800 transition-colors">
                                            <div className="flex items-center gap-2 mb-4 font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-700 pb-3">
                                                <Tags size={16} className="text-indigo-500" />
                                                Banner {bIdx + 1}
                                            </div>
                                            <div className="space-y-4">
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
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
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
