"use client";

import React, { FC } from "react";
import { ImageUploadField } from "./CMSComponents";
import { Layout, Save, Loader2 } from "lucide-react";
import { CollapsibleSection } from "./CMSComponents";

interface HeaderSettingsProps {
    headerLogo: string | { url: string; public_id: string } | undefined;
    setHeaderLogo: (val: string | { url: string; public_id: string }) => void;
    onSave: () => void;
    isLoading: boolean;
    isOpen: boolean;
    onToggle: () => void;
    onFileChange: (file: File, url: string) => void;
}

export const HeaderSettings: FC<HeaderSettingsProps> = ({
    headerLogo,
    setHeaderLogo,
    onSave,
    isLoading,
    isOpen,
    onToggle,
    onFileChange
}) => {
    const logoUrl = typeof headerLogo === 'object' ? headerLogo.url : headerLogo;

    return (
        <CollapsibleSection
            title="Header Settings"
            icon={<Layout size={24} />}
            isOpen={isOpen}
            onToggle={onToggle}
        >
            <div className="space-y-6">
                <div className="bg-slate-50 dark:bg-slate-900/50 p-6 rounded-2xl border border-slate-100 dark:border-slate-800">
                    <ImageUploadField
                        label="Header Logo"
                        value={logoUrl || ""}
                        onChange={(val, file) => {
                            if (file) onFileChange(file, val);
                            setHeaderLogo(val);
                        }}
                        required
                    />
                    <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                        Recommended: 250x70px (Desktop), Scale for Mobile
                    </p>
                </div>

                <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-700">
                    <button
                        onClick={onSave}
                        disabled={isLoading}
                        className="flex items-center gap-2 px-6 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl hover:bg-slate-800 dark:hover:bg-slate-100 transition-all font-bold text-sm shadow-md disabled:opacity-50"
                    >
                        {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                        Save Header Settings
                    </button>
                </div>
            </div>
        </CollapsibleSection>
    );
};
