'use client';

import React from 'react';
import { LayoutDashboard, PieChart, Settings, FileText, LogOut, Activity } from 'lucide-react';
import Link from 'next/link';
import { clsx } from 'clsx';

export function Sidebar() {
    return (
        <aside className="fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-200 hidden md:flex flex-col z-50">
            <div className="p-6 border-b border-gray-100">
                <div className="flex items-center gap-2 text-red-600 font-bold text-xl">
                    <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center text-white">
                        C
                    </div>
                    CesimApp
                </div>
            </div>

            <nav className="flex-1 p-4 space-y-1">
                <NavItem icon={<LayoutDashboard size={20} />} label="Dashboard" active href="/" />
                <NavItem icon={<Activity size={20} />} label="Simulation" href="/simulation" />
            </nav>

            <div className="p-4 border-t border-gray-100">
                <button className="flex items-center gap-3 w-full px-4 py-2 text-sm font-medium text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                    <LogOut size={20} />
                    Logout
                </button>
            </div>
        </aside>
    );
}

function NavItem({ icon, label, active, href }: { icon: React.ReactNode, label: string, active?: boolean, href?: string }) {
    if (href) {
        return (
            <Link
                href={href}
                className={clsx(
                    "flex items-center gap-3 w-full px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200",
                    active
                        ? "bg-red-50 text-red-600 shadow-sm"
                        : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                )}
            >
                {icon}
                {label}
            </Link>
        );
    }

    return (
        <button
            className={clsx(
                "flex items-center gap-3 w-full px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200",
                active
                    ? "bg-red-50 text-red-600 shadow-sm"
                    : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
            )}
        >
            {icon}
            {label}
        </button>
    );
}
