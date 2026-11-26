import React, { FC, useState, useEffect } from "react";
import {
    Plus,
    Check,
    Monitor,
    LayoutTemplate,
    Settings2,
    Trash2,
    Pencil,
    X,
    Loader2,
    AlertTriangle,
} from "lucide-react";
import {
    useGetAllHomePagesQuery,
    useCreateDraftPageMutation,
    useUpdatePageStatusMutation,
    useDeleteDraftPageMutation,
    useUpdateSeoMutation,
} from "@/redux/api/homeApi";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/ui/alert-dialog";
import toast from "react-hot-toast";
import { triggerHomeSeoRevalidate } from "@/lib/seo-utils";

interface HomePageSelectorProps {
    selectedPageId: string | null;
    onSelectPage: (id: string | null) => void;
}

export const HomePageSelector: FC<HomePageSelectorProps> = ({ selectedPageId, onSelectPage }) => {
    const { data: response, isLoading, refetch } = useGetAllHomePagesQuery();
    const [createDraft, { isLoading: isCreating }] = useCreateDraftPageMutation();
    const [updateStatus, { isLoading: isUpdating }] = useUpdatePageStatusMutation();
    const [deleteDraft, { isLoading: isDeleting }] = useDeleteDraftPageMutation();
    const [updateSeo, { isLoading: isRenaming }] = useUpdateSeoMutation();

    const homePages = response?.data || [];

    // Find active & currently selected page
    const activePage = homePages.find((p: any) => p.isActive);
    const currentId = selectedPageId || activePage?._id || "";
    const selectedPage = homePages.find((p: any) => p._id === currentId);

    // Inline Rename State
    const [isEditingName, setIsEditingName] = useState(false);
    const [editNameValue, setEditNameValue] = useState("");

    // Delete Confirmation Popup State
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [pageToDelete, setPageToDelete] = useState<any>(null);

    // Close rename input if selected page changes
    useEffect(() => {
        setIsEditingName(false);
        setEditNameValue(selectedPage?.seo?.title || selectedPage?.seo?.slug || "");
    }, [currentId, selectedPage?.seo?.title, selectedPage?.seo?.slug]);

    const handleStartRename = () => {
        if (!selectedPage) return;
        setEditNameValue(selectedPage.seo?.title || selectedPage.seo?.slug || "");
        setIsEditingName(true);
    };

    const handleSaveRename = async () => {
        if (!selectedPage) return;
        const trimmed = editNameValue.trim();
        if (!trimmed) {
            toast.error("Version name cannot be empty");
            return;
        }
        if (trimmed.length > 60) {
            toast.error("Version name must be 60 characters or less");
            return;
        }

        try {
            const formData = new FormData();
            formData.append("payload", JSON.stringify({ title: trimmed }));
            await updateSeo({ id: selectedPage._id, body: formData }).unwrap();
            setIsEditingName(false);
            toast.success("Home page version renamed!");
            refetch();
            if (selectedPage.isActive) {
                await triggerHomeSeoRevalidate();
            }
        } catch (error: any) {
            toast.error(error?.data?.message || "Failed to rename version");
        }
    };

    const handleCreateDraft = async () => {
        try {
            const newSlug = `draft-${Date.now()}`;
            const formData = new FormData();
            formData.append("payload", JSON.stringify({
                seo: { title: "New Draft Page", slug: newSlug }
            }));
            const res = await createDraft(formData).unwrap();
            toast.success("New draft created! You can rename it anytime.");
            onSelectPage(res.data._id);
        } catch (error: any) {
            toast.error(error?.data?.message || "Failed to create draft");
        }
    };

    const handleSetAsActive = async () => {
        if (!selectedPageId) return;
        try {
            await updateStatus(selectedPageId).unwrap();
            await triggerHomeSeoRevalidate();
            toast.success("Page set as Live Active Home Page!");
            refetch();
        } catch (error: any) {
            toast.error(error?.data?.message || "Failed to update status");
        }
    };

    const openDeleteDialog = () => {
        if (!selectedPage) return;
        setPageToDelete(selectedPage);
        setDeleteDialogOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!pageToDelete?._id) return;
        const idToDelete = pageToDelete._id;
        try {
            await deleteDraft(idToDelete).unwrap();
            toast.success(`"${pageToDelete.seo?.title || pageToDelete.seo?.slug || "Draft"}" deleted successfully`);
            setDeleteDialogOpen(false);
            setPageToDelete(null);
            if (selectedPageId === idToDelete) {
                onSelectPage(null);
            }
        } catch (error: any) {
            toast.error(error?.data?.message || "Failed to delete page");
        }
    };

    return (
        <>
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-4 sm:p-6 mb-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex-1 w-full">
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
                            <LayoutTemplate className="w-4 h-4 text-orange-500" />
                            Select Home Page Version
                        </label>

                        {isEditingName && selectedPage ? (
                            <div className="flex items-center gap-2">
                                <input
                                    type="text"
                                    value={editNameValue}
                                    onChange={(e) => setEditNameValue(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") handleSaveRename();
                                        if (e.key === "Escape") setIsEditingName(false);
                                    }}
                                    maxLength={60}
                                    autoFocus
                                    placeholder="Enter version name (max 60 chars)"
                                    className="flex-1 px-4 py-2.5 bg-white dark:bg-slate-950 border-2 border-blue-500 rounded-xl font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                />
                                <button
                                    type="button"
                                    onClick={handleSaveRename}
                                    disabled={isRenaming}
                                    className="flex items-center justify-center gap-1.5 px-3.5 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-semibold text-sm disabled:opacity-50"
                                    title="Save Name"
                                >
                                    {isRenaming ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                                    <span className="hidden sm:inline">Save</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setIsEditingName(false)}
                                    disabled={isRenaming}
                                    className="flex items-center justify-center px-3 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                                    title="Cancel"
                                >
                                    <X size={16} />
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2">
                                <div className="relative flex-1">
                                    <select
                                        value={currentId}
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

                                {selectedPage && (
                                    <button
                                        type="button"
                                        onClick={handleStartRename}
                                        className="flex items-center justify-center px-3.5 py-3 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                                        title="Rename selected page version"
                                    >
                                        <Pencil size={17} />
                                    </button>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="flex gap-3 w-full sm:w-auto mt-2 sm:mt-6">
                        <button
                            type="button"
                            onClick={handleCreateDraft}
                            disabled={isCreating}
                            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-3 bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-500 border border-orange-200 dark:border-orange-500/20 rounded-xl hover:bg-orange-100 dark:hover:bg-orange-500/20 transition-colors font-bold whitespace-nowrap"
                        >
                            {isCreating ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />}
                            New Draft
                        </button>

                        {selectedPage && !selectedPage.isActive && (
                            <button
                                type="button"
                                onClick={handleSetAsActive}
                                disabled={isUpdating}
                                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-3 bg-emerald-500 text-white border border-emerald-600 rounded-xl hover:bg-emerald-600 transition-colors font-bold whitespace-nowrap shadow-sm shadow-emerald-500/20"
                            >
                                {isUpdating ? <Loader2 size={18} className="animate-spin" /> : <Monitor size={18} />}
                                Set Active
                            </button>
                        )}

                        {selectedPage && !selectedPage.isActive && (
                            <button
                                type="button"
                                onClick={openDeleteDialog}
                                disabled={isDeleting}
                                className="flex items-center justify-center px-4 py-3 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-500 border border-red-200 dark:border-red-500/20 rounded-xl hover:bg-red-100 dark:hover:bg-red-500/20 transition-colors"
                                title="Delete Draft"
                            >
                                <Trash2 size={18} />
                            </button>
                        )}
                    </div>
                </div>

                {selectedPage?.isActive && (
                    <div className="mt-4 p-3 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 rounded-lg flex items-center gap-2 text-emerald-700 dark:text-emerald-400 text-sm font-semibold">
                        <Check className="w-5 h-5 text-emerald-500" />
                        You are editing the Live Home Page. Changes will be visible to users immediately after saving.
                    </div>
                )}
            </div>

            {/* Proper Delete Confirmation Popup */}
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2 text-red-600 dark:text-red-400">
                            <AlertTriangle className="w-5 h-5 shrink-0" />
                            Delete Home Page Version?
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-slate-600 dark:text-slate-300 pt-1">
                            Are you sure you want to permanently delete{" "}
                            <span className="font-semibold text-slate-900 dark:text-white">
                                &ldquo;{pageToDelete?.seo?.title || pageToDelete?.seo?.slug || "Untitled Page"}&rdquo;
                            </span>
                            ? All banners, sections, and uploaded media belonging to this draft will be removed. This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={(e) => {
                                e.preventDefault();
                                handleConfirmDelete();
                            }}
                            disabled={isDeleting}
                            className="bg-red-600 hover:bg-red-700 text-white focus:ring-red-600"
                        >
                            {isDeleting ? (
                                <span className="flex items-center gap-2">
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Deleting...
                                </span>
                            ) : (
                                "Delete Permanently"
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
};
