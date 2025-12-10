'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface SidebarContextType {
    isCollapsed: boolean;
    toggleCollapse: () => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export function SidebarProvider({ children }: { children: React.ReactNode }) {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        const stored = localStorage.getItem('cesim_sidebar_collapsed');
        if (stored) {
            setIsCollapsed(stored === 'true');
        }
    }, []);

    useEffect(() => {
        if (mounted) {
            localStorage.setItem('cesim_sidebar_collapsed', String(isCollapsed));
            document.documentElement.style.setProperty('--sidebar-width', isCollapsed ? '5rem' : '16rem');
        } else {
            // Default check to sync style with initial state (expanded)
            document.documentElement.style.setProperty('--sidebar-width', '16rem');
        }
    }, [isCollapsed, mounted]);

    const toggleCollapse = () => setIsCollapsed(prev => !prev);

    return (
        <SidebarContext.Provider value={{ isCollapsed, toggleCollapse }}>
            {children}
        </SidebarContext.Provider>
    );
}

export function useSidebar() {
    const context = useContext(SidebarContext);
    if (context === undefined) {
        throw new Error('useSidebar must be used within a SidebarProvider');
    }
    return context;
}
