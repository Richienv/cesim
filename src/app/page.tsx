'use client';

import React, { useState } from 'react';
import { FileUpload } from '@/components/FileUpload';
import { Dashboard } from '@/components/Dashboard';
import { Sidebar } from '@/components/Sidebar';
import { parseCesimData } from '@/lib/parser';
import { RoundData } from '@/lib/types';
import { Search, Bell, User } from 'lucide-react';

export default function Home() {
    const [data, setData] = useState<RoundData[]>([]);
    const [loading, setLoading] = useState(false);

    const handleFilesSelected = async (files: File[]) => {
        setLoading(true);
        const newData: RoundData[] = [];

        for (const file of files) {
            try {
                const buffer = await file.arrayBuffer();
                const parsed = parseCesimData(buffer);
                if (parsed.roundName === 'Results') {
                    parsed.roundName = file.name.replace('.xls', '').replace('results-', '');
                }
                newData.push(parsed);
            } catch (error) {
                console.error(`Error parsing ${file.name}:`, error);
            }
        }

        newData.sort((a, b) => a.roundName.localeCompare(b.roundName));

        setData(prev => {
            const existingNames = new Set(prev.map(d => d.roundName));
            const uniqueNew = newData.filter(d => !existingNames.has(d.roundName));
            const combined = [...prev, ...uniqueNew];
            return combined.sort((a, b) => a.roundName.localeCompare(b.roundName));
        });
        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Sidebar />

            <main className="md:pl-64 transition-all duration-300">
                {/* Top Header */}
                <header className="bg-white border-b border-gray-200 sticky top-0 z-40 px-8 py-4 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
                        <p className="text-sm text-gray-500">Welcome back, User</p>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="relative hidden md:block">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="text"
                                placeholder="Search..."
                                className="pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all w-64"
                            />
                        </div>
                        <button className="p-2 text-gray-500 hover:bg-gray-50 rounded-lg relative">
                            <Bell size={20} />
                            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                        </button>
                        <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-orange-500 rounded-full flex items-center justify-center text-white font-medium text-sm shadow-md shadow-red-500/20">
                            U
                        </div>
                    </div>
                </header>

                <div className="p-8 max-w-7xl mx-auto space-y-8">
                    {/* File Upload Section */}
                    {data.length === 0 && (
                        <section className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 text-center">
                            <div className="max-w-xl mx-auto">
                                <h2 className="text-xl font-semibold mb-2">Upload Data</h2>
                                <p className="text-gray-500 mb-6">Upload your Cesim result files to generate the dashboard.</p>
                                <FileUpload onFilesSelected={handleFilesSelected} />
                            </div>
                        </section>
                    )}

                    {loading && (
                        <div className="text-center py-12">
                            <div className="animate-spin w-8 h-8 border-4 border-red-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                            <p className="text-gray-500">Processing data...</p>
                        </div>
                    )}

                    {data.length > 0 && (
                        <Dashboard data={data} />
                    )}
                </div>
            </main>
        </div>
    );
}
