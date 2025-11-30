'use client';

import React, { useCallback, useState } from 'react';
import { Upload, FileSpreadsheet, X } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface FileUploadProps {
    onFilesSelected: (files: File[]) => void;
}

export function FileUpload({ onFilesSelected }: FileUploadProps) {
    const [isDragging, setIsDragging] = useState(false);
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);

        const files = Array.from(e.dataTransfer.files).filter(
            file => file.name.endsWith('.xls') || file.name.endsWith('.xlsx')
        );

        if (files.length > 0) {
            setSelectedFiles(prev => [...prev, ...files]);
            onFilesSelected(files);
        }
    }, [onFilesSelected]);

    const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files = Array.from(e.target.files).filter(
                file => file.name.endsWith('.xls') || file.name.endsWith('.xlsx')
            );
            if (files.length > 0) {
                setSelectedFiles(prev => [...prev, ...files]);
                onFilesSelected(files);
            }
        }
    }, [onFilesSelected]);

    const removeFile = (index: number) => {
        setSelectedFiles(prev => prev.filter((_, i) => i !== index));
        // Note: We might need to notify parent about removal, but for now we just append new files.
        // Ideally parent manages state, but this is a simple implementation.
    };

    return (
        <div className="w-full max-w-2xl mx-auto">
            <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={twMerge(
                    "border-2 border-dashed rounded-xl p-8 transition-all duration-300 text-center cursor-pointer",
                    isDragging
                        ? "border-blue-500 bg-blue-50/10 scale-[1.02]"
                        : "border-gray-300 hover:border-gray-400 bg-white/5"
                )}
            >
                <input
                    type="file"
                    multiple
                    accept=".xls,.xlsx"
                    onChange={handleFileInput}
                    className="hidden"
                    id="file-upload"
                />
                <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center gap-4">
                    <div className="p-4 bg-blue-100/10 rounded-full text-blue-500">
                        <Upload size={32} />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold mb-1">Upload Cesim Results</h3>
                        <p className="text-sm text-gray-500">Drag & drop .xls files here, or click to select</p>
                    </div>
                </label>
            </div>

            {selectedFiles.length > 0 && (
                <div className="mt-6 space-y-2">
                    <h4 className="text-sm font-medium text-gray-500 mb-3">Selected Files</h4>
                    {selectedFiles.map((file, i) => (
                        <div key={i} className="flex items-center justify-between p-3 bg-white/5 border border-gray-200/10 rounded-lg animate-in fade-in slide-in-from-bottom-2">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-green-100/10 rounded text-green-500">
                                    <FileSpreadsheet size={20} />
                                </div>
                                <span className="text-sm font-medium">{file.name}</span>
                            </div>
                            <button
                                onClick={() => removeFile(i)}
                                className="p-1 hover:bg-red-100/10 text-gray-400 hover:text-red-500 rounded transition-colors"
                            >
                                <X size={16} />
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
