import React, { FC, useState } from "react";
import { Plus, Check, Monitor, LayoutTemplate, Settings2, Trash2 } from "lucide-react";
import {
    useGetAllHomePagesQuery,
    useCreateDraftPageMutation,
    useUpdatePageStatusMutation,
    useDeleteDraftPageMutation
} from "@/redux/api/homeApi";
import toast from "react-hot-toast";

interface HomePageSelectorProps {
    selectedPageId: string | null;
    onSelectPage: (id: string | null) => void;
}

export const HomePageSelector: FC<HomePageSelectorProps> = ({ selectedPageId, onSelectPage }) => {
    const { data: response, isLoading, refetch } = useGetAllHomePagesQuery();
    const [createDraft, { isLoading: isCreating }] = useCreateDraftPageMutation();
    const [updateStatus, { isLoading: isUpdating }] = useUpdatePageStatusMutation();
    const [deleteDraft, { isLoading: isDeleting }] = useDeleteDraftPageMutation();

    const homePages = response?.data || [];
    
    // Find active page
    const activePage = homePages.find((p: any) => p.isActive);

    const handleCreateDraft = async () => {
        try {
            const newSlug = `draft-${Date.now()}`;
            const formData = new FormData();
            formData.append("payload", JSON.stringify({
                seo: { title: "New Draft Page", slug: newSlug }
            }));
            const res = await createDraft(formData).unwrap();
            toast.success("New draft created!");
            onSelectPage(res.data._id);
        } catch (error: any) {
            toast.error(error?.data?.message || "Failed to create draft");
        }
    };

    const handleSetAsActive = async () => {
        if (!selectedPageId) return;
        try {
            await updateStatus(selectedPageId).unwrap();
            toast.success("Page set as Active!");
            refetch();
        } catch (error: any) {
            toast.error(error?.data?.message || "Failed to update status");
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this page? This cannot be undone.")) return;
        try {
            await deleteDraft(id).unwrap();
            toast.success("Page deleted successfully");
            if (selectedPageId === id) {
                onSelectPage(null); // Reset selection
            }
        } catch (error: any) {
            toast.error(error?.data?.message || "Failed to delete page");
        }
    };

    return (
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-4 sm:p-6 mb-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex-1 w-full">
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
                        <LayoutTemplate className="w-4 h-4 text-orange-500" />
                        Select Home Page Version
                    </label>
                    <div className="relative">
                        <select
                            value={selectedPageId || activePage?._id || ""}
                            onChange={(e) => onSelectPage(e.target.value)}
                            disabled={isLoading}
                            className="w-full pl-4 pr-10 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl appearance-none font-medium text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all disabled:opacity-50"
                        >
                            {!selectedPageId && !activePage && <option value="">Select a page to edit...</option>}
                            {homePages.map((page: any) => (
                                <option key={page._id} value={page._id}>
                                    {page.seo?.title || page.seo?.slug || "Untitled Page"} {page.isActive ? " (LIVE)" : " (Draft)"}
                                </option>
                            ))}
                        </select>
                        <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                            <Settings2 className="w-5 h-5 text-slate-400" />
                        </div>
                    </div>
                </div>

                <div className="flex gap-3 w-full sm:w-auto mt-2 sm:mt-6">
                    <button
                        onClick={handleCreateDraft}
                        disabled={isCreating}
                        className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-3 bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-500 border border-orange-200 dark:border-orange-500/20 rounded-xl hover:bg-orange-100 dark:hover:bg-orange-500/20 transition-colors font-bold whitespace-nowrap"
                    >
                        <Plus size={18} />
                        New Draft
                    </button>
                    
                    {selectedPageId && homePages.find((p:any) => p._id === selectedPageId) && !homePages.find((p:any) => p._id === selectedPageId)?.isActive && (
                        <button
                            onClick={handleSetAsActive}
                            disabled={isUpdating}
                            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-3 bg-emerald-500 text-white border border-emerald-600 rounded-xl hover:bg-emerald-600 transition-colors font-bold whitespace-nowrap shadow-sm shadow-emerald-500/20"
                        >
                            <Monitor size={18} />
                            Set Active
                        </button>
                    )}

                    {selectedPageId && homePages.find((p:any) => p._id === selectedPageId) && !homePages.find((p:any) => p._id === selectedPageId)?.isActive && (
                        <button
                            onClick={() => handleDelete(selectedPageId)}
                            disabled={isDeleting}
                            className="flex items-center justify-center px-4 py-3 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-500 border border-red-200 dark:border-red-500/20 rounded-xl hover:bg-red-100 dark:hover:bg-red-500/20 transition-colors"
                            title="Delete Draft"
                        >
                            <Trash2 size={18} />
                        </button>
                    )}
                </div>
            </div>
            
            {selectedPageId && homePages.find((p:any) => p._id === selectedPageId)?.isActive && (
                <div className="mt-4 p-3 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 rounded-lg flex items-center gap-2 text-emerald-700 dark:text-emerald-400 text-sm font-semibold">
                    <Check className="w-5 h-5 text-emerald-500" />
                    You are editing the Live Home Page. Changes will be visible to users immediately after saving.
                </div>
            )}
        </div>
    );
};
