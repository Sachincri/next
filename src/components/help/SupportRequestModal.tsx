"use client"
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { X, Send, Loader2 } from "lucide-react"
import { useSubmitSupportRequestMutation } from "@/redux/api/supportApi"
import toast from "react-hot-toast"

interface SupportRequestModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialCategory?: string;
}

const SupportRequestModal: React.FC<SupportRequestModalProps> = ({ isOpen, onClose, initialCategory }) => {
    const [subject, setSubject] = useState("");
    const [category, setCategory] = useState(initialCategory || "General Queries");
    const [description, setDescription] = useState("");
    const [priority, setPriority] = useState("Medium");
    const [mounted, setMounted] = useState(false);

    const [submitRequest, { isLoading }] = useSubmitSupportRequestMutation();

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (initialCategory) {
            setCategory(initialCategory);
        }
    }, [initialCategory]);

    // Body scroll lock is handled by Dialog component automatically

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (!subject.trim() || !description.trim()) {
            toast.error("Please fill in all required fields");
            return;
        }

        try {
            await submitRequest({ subject, category, description, priority }).unwrap();
            toast.success("Support request submitted successfully!");
            onClose();
            setSubject("");
            setDescription("");
        } catch (err: any) {
            toast.error(err?.data?.message || "Failed to submit request");
        }
    };

    if (!mounted) return null;

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-lg p-0 overflow-hidden bg-white dark:bg-slate-900 rounded-3xl border-none shadow-2xl transition-colors duration-300">
                <div className="bg-blue-600 dark:bg-blue-700 p-6 text-white flex justify-between items-center">
                    <div>
                        <DialogTitle className="text-xl font-bold text-white">Submit a Request</DialogTitle>
                        <DialogDescription className="text-blue-100 dark:text-blue-200 text-sm mt-1">We'll get back to you as soon as possible.</DialogDescription>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700 dark:text-slate-300">Subject</label>
                        <input
                            type="text"
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                            placeholder="Briefly describe your issue"
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-800 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900/20 outline-none transition-all text-black dark:text-white dark:bg-slate-800"
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-700 dark:text-slate-300">Category</label>
                            <select
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-800 focus:border-blue-500 dark:focus:border-blue-400 outline-none transition-all bg-gray-50 dark:bg-slate-800 text-black dark:text-white"
                            >
                                <option>Order Issues</option>
                                <option>Payment Issues</option>
                                <option>Account & Login</option>
                                <option>General Queries</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-700 dark:text-slate-300">Priority (Internal)</label>
                            <select
                                value={priority}
                                onChange={(e) => setPriority(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-800 focus:border-blue-500 dark:focus:border-blue-400 outline-none transition-all bg-gray-50 dark:bg-slate-800 text-black dark:text-white"
                            >
                                <option>Low</option>
                                <option>Medium</option>
                                <option>High</option>
                                <option>Urgent</option>
                            </select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700 dark:text-slate-300">Detailed Description</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={4}
                            placeholder="Provide as much detail as possible..."
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-800 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900/20 outline-none transition-all resize-none text-black dark:text-white dark:bg-slate-800"
                            required
                        />
                    </div>

                    <div className="flex gap-4 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-3 text-gray-600 dark:text-slate-400 font-bold hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="flex-1 py-3 bg-blue-600 dark:bg-blue-500 text-white font-bold rounded-xl shadow-lg shadow-blue-200 dark:shadow-blue-950/20 hover:bg-blue-700 dark:hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                        >
                            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                            Send Request
                        </button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default SupportRequestModal;
