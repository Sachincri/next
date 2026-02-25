"use client";

import React, { FC, useState, DragEvent, ChangeEvent, useId } from "react";
import { UploadCloud, Image as ImageIcon, X, FileImage } from "lucide-react";

interface ImageDropzoneProps {
    onChange?: (file: File | null, previewUrl: string | null) => void;
    value?: string | null;
    maxWidth?: number;
    maxHeight?: number;
}

const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
};

const ImageDropzone: FC<ImageDropzoneProps> = ({ onChange, value }) => {
    const inputId = useId();
    const [isDragging, setIsDragging] = useState(false);
    const [internalPreview, setInternalPreview] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [fileInfo, setFileInfo] = useState<{ name: string; size: number; type: string } | null>(null);

    const preview = internalPreview || value;

    const handleDragOver = (e: DragEvent<HTMLLabelElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    };

    const handleDragLeave = (e: DragEvent<HTMLLabelElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    };

    const processFile = async (file: File | null) => {
        if (!file) return;

        setError(null);

        if (!file.type.startsWith("image/")) {
            setError("Please upload a valid image file (SVG, PNG, JPG, GIF).");
            return;
        }

        const url = URL.createObjectURL(file);
        setInternalPreview(url);
        setFileInfo({ name: file.name, size: file.size, type: file.type });
        onChange?.(file, url);
    };

    const handleDrop = async (e: DragEvent<HTMLLabelElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        const file = e.dataTransfer.files?.[0] ?? null;
        await processFile(file);
    };

    const handleChange = async (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] ?? null;
        await processFile(file);
    };

    const handleRemove = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setInternalPreview(null);
        setFileInfo(null);
        onChange?.(null, null);
    };

    return (
        <div className="w-full space-y-2">
            <label
                htmlFor={inputId}
                className={`relative flex flex-col items-center justify-center w-full min-h-[12rem] cursor-pointer rounded-xl border-2 border-dashed transition-all duration-300 ease-in-out
                    ${isDragging
                        ? "border-blue-500 bg-blue-50/50 dark:bg-blue-900/10 dark:border-blue-400"
                        : "border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800"
                    }
                    ${error ? "border-red-500/50 bg-red-50/50 dark:bg-red-900/10 dark:border-red-500/50" : ""}
                `}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
            >
                {preview ? (
                    <div className="relative w-full h-auto min-h-[12rem] p-2 flex items-center justify-center overflow-hidden rounded-xl">
                        <img
                            src={preview}
                            alt="Preview"
                            className="w-full h-auto object-contain rounded-lg max-h-[300px]"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 text-white rounded-xl">
                            <UploadCloud className="w-8 h-8" />
                            <span className="text-sm font-medium">Click to change</span>
                        </div>
                        <button
                            onClick={handleRemove}
                            className="absolute top-3 right-3 p-1.5 bg-red-500/80 hover:bg-red-600 text-white rounded-full backdrop-blur-sm transition-all shadow-lg hover:scale-110 z-10"
                            title="Remove image"
                        >
                            <X size={16} />
                        </button>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-6 px-4 text-center">
                        <div className={`p-4 rounded-full mb-4 transition-colors ${isDragging
                            ? "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                            : "bg-slate-100 dark:bg-slate-700 text-slate-400 dark:text-slate-400"
                            }`}>
                            <ImageIcon className="w-8 h-8" />
                        </div>
                        <p className="mb-2 text-sm text-slate-700 dark:text-slate-300 font-medium">
                            <span className="font-semibold text-blue-600 dark:text-blue-400 hover:underline">Click to upload</span>{" "}
                            <span className="text-slate-500 dark:text-slate-400">or drag and drop</span>
                        </p>
                        <p className="text-xs text-slate-400 dark:text-slate-500">
                            SVG, PNG, JPG or GIF (max 5MB)
                        </p>
                    </div>
                )}
            </label>

            <input
                id={inputId}
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleChange}
            />

            {/* File info badge */}
            {fileInfo && (
                <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg">
                    <FileImage size={14} className="text-blue-500 dark:text-blue-400 flex-shrink-0" />
                    <span className="text-xs text-slate-600 dark:text-slate-300 font-medium truncate flex-1 min-w-0">
                        {fileInfo.name}
                    </span>
                    <span className="text-xs font-bold text-blue-600 dark:text-blue-400 flex-shrink-0 px-2 py-0.5 bg-blue-50 dark:bg-blue-900/30 rounded-md">
                        {formatFileSize(fileInfo.size)}
                    </span>
                </div>
            )}

            {error && (
                <div className="text-sm text-red-500 dark:text-red-400 flex items-center gap-1.5 animate-in fade-in slide-in-from-top-1 px-1">
                    <X size={14} />
                    <span>{error}</span>
                </div>
            )}
        </div>
    );
};

export default ImageDropzone;
