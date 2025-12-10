'use client';

import React from 'react';
import { LayoutDashboard, FileText, LogOut, Activity, Zap, ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { clsx } from 'clsx';
import { useSidebar } from '@/context/SidebarContext';

interface SidebarProps {
    isOpen?: boolean;
    onClose?: () => void;
}

export function Sidebar({ isOpen = false, onClose }: SidebarProps) {
    const pathname = usePathname();
    const { isCollapsed, toggleCollapse } = useSidebar();

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
                "fixed left-0 top-0 h-full bg-white border-r border-gray-200 flex flex-col z-50 transition-all duration-300 ease-in-out",
                // Mobile: slide in/out based on isOpen
                isOpen ? "translate-x-0" : "-translate-x-full",
                // Desktop: always visible (reset transform), dynamic width
                "md:translate-x-0",
                isCollapsed ? "md:w-20" : "md:w-64",
                "w-64" // mobile width
            )}>
                <div className={clsx(
                    "p-6 border-b border-gray-100 flex items-center h-20 transition-all duration-300",
                    isCollapsed ? "justify-center px-2" : "justify-between"
                )}>
                    {/* Logo Area */}
                    <div className={clsx(
                        "flex items-center gap-2 font-bold text-2xl transition-all overflow-hidden whitespace-nowrap",
                        isCollapsed ? "hidden" : "text-gray-900"
                    )}>
                        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white shrink-0">
                            C
                        </div>
                        <span>Cesim</span>
                    </div>

                    {/* Collapse Button (Desktop) */}
                    <button
                        onClick={toggleCollapse}
                        className={clsx(
                            "hidden md:flex items-center justify-center p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors",
                            isCollapsed && "w-full"
                        )}
                    >
                        {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
                    </button>

                    {/* Mobile Close Button */}
                    <button onClick={onClose} className="md:hidden text-gray-500 hover:text-gray-700">
                        <LogOut size={24} className="rotate-180" />
                    </button>
                </div>

                <nav className="flex-1 p-4 space-y-1 overflow-x-hidden">
                    <NavItem
                        icon={<Zap size={20} />}
                        label="Cesim Algorithm"
                        active={pathname === '/cesim-algorithm'}
                        href="/cesim-algorithm"
                        onClick={onClose}
                        isCollapsed={isCollapsed}
                    />
                    <NavItem
                        icon={<LayoutDashboard size={20} />}
                        label="Dashboard"
                        active={pathname === '/'}
                        href="/"
                        onClick={onClose}
                        isCollapsed={isCollapsed}
                    />
                    <NavItem
                        icon={<FileText size={20} />}
                        label="Case Descriptive"
                        active={pathname === '/case-description'}
                        href="/case-description"
                        onClick={onClose}
                        isCollapsed={isCollapsed}
                    />
                    <NavItem
                        icon={<Activity size={20} />}
                        label="Simulation"
                        active={pathname?.startsWith('/simulation') || false}
                        href="/simulation"
                        onClick={onClose}
                        isCollapsed={isCollapsed}
                    />
                </nav>

                <div className="p-4 border-t border-gray-100 space-y-2">
                    <button className={clsx(
                        "flex items-center gap-3 w-full px-4 py-2 text-base font-medium text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors overflow-hidden whitespace-nowrap",
                        isCollapsed && "justify-center px-0"
                    )}>
                        <LogOut size={20} className="shrink-0" />
                        <span className={clsx("transition-all duration-300", isCollapsed ? "w-0 opacity-0" : "w-auto opacity-100")}>
                            Logout
                        </span>
                    </button>
                </div>
            </aside>
        </>
    );
}

function NavItem({ icon, label, active, href, onClick, isCollapsed }: { icon: React.ReactNode, label: string, active?: boolean, href?: string, onClick?: () => void, isCollapsed: boolean }) {
    const content = (
        <>
            <div className="shrink-0">{icon}</div>
            <span className={clsx(
                "transition-all duration-300 whitespace-nowrap overflow-hidden",
                isCollapsed ? "w-0 opacity-0" : "w-auto opacity-100"
            )}>
                {label}
            </span>
        </>
    );

    const baseClasses = clsx(
        "flex items-center gap-3 w-full px-4 py-3 text-base font-medium rounded-lg transition-all duration-200 min-h-[48px]",
        active
            ? "bg-red-50 text-red-600 shadow-sm"
            : "text-gray-500 hover:bg-gray-50 hover:text-gray-900",
        isCollapsed && "justify-center px-0"
    );

    if (href) {
        return (
            <Link
                href={href}
                onClick={onClick}
                className={baseClasses}
                title={isCollapsed ? label : undefined}
            >
                {content}
            </Link>
        );
    }

    return (
        <button
            onClick={onClick}
            className={baseClasses}
            title={isCollapsed ? label : undefined}
        >
            {content}
        </button>
    );
}
