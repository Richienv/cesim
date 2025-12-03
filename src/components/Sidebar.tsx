'use client';

import React from 'react';
import { LayoutDashboard, PieChart, Settings, FileText, LogOut, Activity, Zap } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { clsx } from 'clsx';

interface SidebarProps {
    isOpen?: boolean;
    onClose?: () => void;
}

export function Sidebar({ isOpen = false, onClose }: SidebarProps) {
    const pathname = usePathname();

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 md:hidden"
                    onClick={onClose}
                />
            )}

            {/* Sidebar */}
            <aside className={clsx(
                "fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-200 flex flex-col z-50 transition-transform duration-300 ease-in-out",
                // Mobile: slide in/out based on isOpen
                isOpen ? "translate-x-0" : "-translate-x-full",
                // Desktop: always visible (reset transform)
                "md:translate-x-0"
            )}>
                <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                    <div className="flex items-center gap-2 text-red-600 font-bold text-2xl">
                        <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center text-white">
                            C
                        </div>
                        CesimApp
                    </div>
                    {/* Mobile Close Button */}
                    <button onClick={onClose} className="md:hidden text-gray-500 hover:text-gray-700">
                        <LogOut size={24} className="rotate-180" /> {/* Reusing LogOut as a back/close icon variant or just X */}
                    </button>
                </div>

                <nav className="flex-1 p-4 space-y-1">
                    <NavItem
                        icon={<Zap size={20} />}
                        label="Cesim Algorithm"
                        active={pathname === '/cesim-algorithm'}
                        href="/cesim-algorithm"
                        onClick={onClose}
                    />
                    <NavItem
                        icon={<LayoutDashboard size={20} />}
                        label="Dashboard"
                        active={pathname === '/'}
                        href="/"
                        onClick={onClose}
                    />
                    <NavItem
                        icon={<FileText size={20} />}
                        label="Case Descriptive"
                        active={pathname === '/case-description'}
                        href="/case-description"
                        onClick={onClose}
                    />
                    <NavItem
                        icon={<Activity size={20} />}
                        label="Simulation"
                        active={pathname?.startsWith('/simulation') || false}
                        href="/simulation"
                        onClick={onClose}
                    />
                </nav>

                <div className="p-4 border-t border-gray-100">
                    <button className="flex items-center gap-3 w-full px-4 py-2 text-base font-medium text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                        <LogOut size={20} />
                        Logout
                    </button>
                </div>
            </aside>
        </>
    );
}

function NavItem({ icon, label, active, href, onClick }: { icon: React.ReactNode, label: string, active?: boolean, href?: string, onClick?: () => void }) {
    if (href) {
        return (
            <Link
                href={href}
                onClick={onClick}
                className={clsx(
                    "flex items-center gap-3 w-full px-4 py-3 text-base font-medium rounded-lg transition-all duration-200",
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
            onClick={onClick}
            className={clsx(
                "flex items-center gap-3 w-full px-4 py-3 text-base font-medium rounded-lg transition-all duration-200",
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
