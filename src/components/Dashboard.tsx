'use client';

import React, { useMemo, useState } from 'react';
import { RoundData } from '@/lib/types';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend, Cell
} from 'recharts';
import {
    Activity, BarChart3, DollarSign, Factory, FileText, PieChart, Truck, Users, TrendingUp, Search, Bell, ArrowRight, ArrowRightLeft, Target, ArrowLeft
} from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { FinancialsView } from './views/FinancialsView';
import { ManufacturingView } from './views/ManufacturingView';
import { LogisticsView } from './views/LogisticsView';
import { CostsView } from './views/CostsView';
import { MarginsView } from './views/MarginsView';
import { MarketView } from './views/MarketView';
import { TeamDetailView } from './views/TeamDetailView';
import { ComparisonView } from './views/ComparisonView';

interface DashboardProps {
    data: RoundData[];
}

const TABS = [
    { id: "Overview", label: "Overview", icon: Activity },
    { id: "TeamAnalysis", label: "Team Analysis", icon: Users },
    { id: "Comparison", label: "Comparison", icon: ArrowRightLeft },
    { id: "Financials", label: "Financials", icon: DollarSign },
    { id: "Market", label: "Market", icon: Target },
    { id: "Manufacturing", label: "Manufacturing", icon: Factory },
    { id: "Logistics", label: "Logistics", icon: Truck },
    { id: "Costs", label: "Costs", icon: DollarSign },
    { id: "Margins", label: "Margins", icon: TrendingUp },
];

export function Dashboard({ data }: DashboardProps) {
    const [activeTab, setActiveTab] = useState("Overview");
    const [selectedTeamForAnalysis, setSelectedTeamForAnalysis] = useState<string | undefined>(undefined);
    const [selectedTech, setSelectedTech] = useState("Tech 1");
    const [viewMode, setViewMode] = useState<'tech' | 'region'>('tech');
    const [selectedRegion, setSelectedRegion] = useState("Asia");
    const latestRound = data[data.length - 1];
    const teams = latestRound?.teams || [];

    // Helper to get metric safely (legacy support for Overview)
    const getMetric = (team: any, category: string, key: string) => {
        if (!team || !team.metrics || !team.metrics[category]) return 0;
        return team.metrics[category][key] || 0;
    };

    // Sort teams by Revenue for charts
    const teamsByRevenue = [...teams].sort((a, b) =>
        (getMetric(b, "Financials", "Sales revenue") - getMetric(a, "Financials", "Sales revenue"))
    );

    const totalRevenue = teams.reduce((sum, t) => sum + getMetric(t, "Financials", "Sales revenue"), 0);
    const avgEbitda = teams.reduce((sum, t) => sum + getMetric(t, "Financials", "Operating profit before depreciation (EBITDA)"), 0) / (teams.length || 1);

    // Trend Data for Overview (total revenue per round)
    const trendData = useMemo(() => {
        return data.map(round => {
            const totalRevenueForRound = round.teams.reduce((sum, t) => sum + getMetric(t, "Financials", "Sales revenue"), 0);
            return { name: round.roundName, revenue: totalRevenueForRound };
        });
    }, [data]);

    // Bar Data for Overview (EBITDA for latest round)
    const barData = useMemo(() => {
        return latestRound.teams.map(t => ({
            name: t.name,
            ebitda: getMetric(t, "Financials", "Operating profit before depreciation (EBITDA)")
        })).sort((a, b) => b.ebitda - a.ebitda);
    }, [latestRound]);

    const handleTeamClick = (teamName: string) => {
        setSelectedTeamForAnalysis(teamName);
        setActiveTab("TeamAnalysis");
    };
    return (
        <div className="space-y-6">
            {/* Navigation Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-gray-200 no-scrollbar">
                {TABS.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={twMerge(
                                "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors",
                                isActive
                                    ? "bg-red-50 text-red-600"
                                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                            )}
                        >
                            <Icon size={16} />
                            {tab.label}
                        </button>
                    );
                })}
            </div>

            {/* Back Button (only if deep in a view and not using tabs) */}
            {activeTab !== "Overview" && (
                <button
                    onClick={() => setActiveTab("Overview")}
                    className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors text-sm"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Overview
                </button>
            )}

            {
                activeTab === "Overview" && (
                    <div className="space-y-6 animate-in fade-in duration-500">
                        {/* Top 3 Teams Section */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                            {teamsByRevenue.slice(0, 3).map((team, index) => {
                                // Find Top Product (Highest Demand)
                                let topProduct = { tech: '', region: '', volume: 0, promotion: 0 };
                                ['usa', 'asia', 'europe'].forEach(r => {
                                    const region = r as 'usa' | 'asia' | 'europe';
                                    ['Tech 1', 'Tech 2', 'Tech 3', 'Tech 4'].forEach(tech => {
                                        const volume = team.demand[region]?.[tech] || 0;
                                        if (volume > topProduct.volume) {
                                            topProduct = {
                                                tech,
                                                region: r.charAt(0).toUpperCase() + r.slice(1),
                                                volume,
                                                promotion: team.margins[region]?.[tech]?.promotion || 0
                                            };
                                        }
                                    });
                                });

                                const gradientClass = index === 0 ? 'from-yellow-400 to-yellow-600' :
                                    index === 1 ? 'from-gray-300 to-gray-500' :
                                        'from-orange-300 to-orange-600';

                                return (
                                    <div
                                        key={team.name}
                                        onClick={() => handleTeamClick(team.name)}
                                        className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all cursor-pointer group relative overflow-hidden"
                                    >
                                        <div className="absolute top-2 right-4">
                                            <div className={`text-7xl font-black bg-gradient-to-br ${gradientClass} bg-clip-text text-transparent opacity-20 group-hover:opacity-30 transition-opacity`}>
                                                #{index + 1}
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3 mb-6 relative z-10">
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <h3 className="font-bold text-gray-900 text-lg group-hover:text-blue-600 transition-colors">{team.name}</h3>
                                                </div>
                                                <p className="text-xs text-gray-500 mt-1">Market Leader</p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4 mb-6 border-b border-gray-100 pb-6 relative z-10">
                                            <div>
                                                <p className="text-xs text-gray-500 mb-1">Total Revenue</p>
                                                <p className="font-bold text-gray-900 text-lg">${(getMetric(team, "Financials", "Sales revenue") / 1000).toFixed(1)}k</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500 mb-1">Total Profit</p>
                                                <p className="font-bold text-green-600 text-lg">${(getMetric(team, "Financials", "Operating profit before depreciation (EBITDA)") / 1000).toFixed(1)}k</p>
                                            </div>
                                        </div>

                                        <div className="relative z-10">
                                            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Top Performing Product</p>
                                            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-sm font-medium text-gray-700">{topProduct.tech}</span>
                                                    <span className="text-xs font-medium px-2 py-1 bg-white rounded border border-gray-200 text-gray-600">{topProduct.region}</span>
                                                </div>
                                                <div className="flex justify-between items-center text-sm">
                                                    <span className="text-gray-500">Sales Volume</span>
                                                    <span className="font-semibold text-gray-900">{topProduct.volume.toFixed(0)}k units</span>
                                                </div>
                                                <div className="flex justify-between items-center text-sm">
                                                    <span className="text-gray-500">Marketing</span>
                                                    <span className="font-semibold text-blue-600">${topProduct.promotion.toFixed(0)}k</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Competitive Strategy Analysis */}
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-6">
                            <div className="flex flex-col gap-6 mb-8">
                                <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                                    <h3 className="text-lg font-semibold text-gray-900">Competitive Strategy Analysis</h3>

                                    {/* View Mode Toggle */}
                                    <div className="flex bg-gray-100 p-1 rounded-lg">
                                        <button
                                            onClick={() => setViewMode('tech')}
                                            className={twMerge(
                                                "px-4 py-1.5 text-sm font-medium rounded-md transition-all",
                                                viewMode === 'tech'
                                                    ? "bg-white text-gray-900 shadow-sm"
                                                    : "text-gray-500 hover:text-gray-900"
                                            )}
                                        >
                                            By Technology
                                        </button>
                                        <button
                                            onClick={() => setViewMode('region')}
                                            className={twMerge(
                                                "px-4 py-1.5 text-sm font-medium rounded-md transition-all",
                                                viewMode === 'region'
                                                    ? "bg-white text-gray-900 shadow-sm"
                                                    : "text-gray-500 hover:text-gray-900"
                                            )}
                                        >
                                            By Region
                                        </button>
                                    </div>
                                </div>

                                {/* Secondary Selector (Context Dependent) */}
                                <div className="flex justify-end">
                                    {viewMode === 'tech' ? (
                                        <div className="flex bg-blue-50 p-1 rounded-lg">
                                            {['Tech 1', 'Tech 2', 'Tech 3', 'Tech 4'].map((tech) => (
                                                <button
                                                    key={tech}
                                                    onClick={() => setSelectedTech(tech)}
                                                    className={twMerge(
                                                        "px-4 py-1.5 text-sm font-medium rounded-md transition-all",
                                                        selectedTech === tech
                                                            ? "bg-white text-blue-700 shadow-sm"
                                                            : "text-blue-600 hover:text-blue-800"
                                                    )}
                                                >
                                                    {tech}
                                                </button>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="flex bg-purple-50 p-1 rounded-lg">
                                            {['USA', 'Asia', 'Europe'].map((region) => (
                                                <button
                                                    key={region}
                                                    onClick={() => setSelectedRegion(region)}
                                                    className={twMerge(
                                                        "px-4 py-1.5 text-sm font-medium rounded-md transition-all",
                                                        selectedRegion === region
                                                            ? "bg-white text-purple-700 shadow-sm"
                                                            : "text-purple-600 hover:text-purple-800"
                                                    )}
                                                >
                                                    {region}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Pricing Section */}
                            <h4 className="text-md font-medium text-gray-700 mb-4 border-l-4 border-blue-500 pl-3">Pricing Strategy</h4>
                            <div className={`grid grid-cols-1 ${viewMode === 'tech' ? 'lg:grid-cols-3' : 'lg:grid-cols-4'} gap-6 mb-12`}>
                                {(viewMode === 'tech' ? ['USA', 'Asia', 'Europe'] : ['Tech 1', 'Tech 2', 'Tech 3', 'Tech 4']).map(item => {
                                    // Determine context based on view mode
                                    const regionName = viewMode === 'tech' ? item : selectedRegion;
                                    const techName = viewMode === 'tech' ? selectedTech : item;

                                    const rKey = regionName.toLowerCase() as 'usa' | 'asia' | 'europe';
                                    const currency = rKey === 'asia' ? '¥' : rKey === 'europe' ? '€' : '$';

                                    const chartData = teams.map(t => ({
                                        name: t.name,
                                        price: t.prices[rKey]?.[techName] || 0
                                    }));

                                    const prices = chartData.map(d => d.price).filter(p => p > 0);
                                    const minPrice = Math.min(...prices);
                                    const maxPrice = Math.max(...prices);

                                    const getColor = (price: number) => {
                                        if (price === 0) return '#e5e7eb';
                                        if (minPrice === maxPrice) return '#3b82f6';

                                        const ratio = (price - minPrice) / (maxPrice - minPrice);

                                        if (ratio < 0.5) {
                                            const r = 34 + (234 - 34) * (ratio * 2);
                                            const g = 197 + (179 - 197) * (ratio * 2);
                                            const b = 94 + (8 - 94) * (ratio * 2);
                                            return `rgb(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)})`;
                                        } else {
                                            const r = 234 + (239 - 234) * ((ratio - 0.5) * 2);
                                            const g = 179 + (68 - 179) * ((ratio - 0.5) * 2);
                                            const b = 8 + (68 - 8) * ((ratio - 0.5) * 2);
                                            return `rgb(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)})`;
                                        }
                                    };

                                    return (
                                        <div key={item} className="h-[300px]">
                                            <h4 className="text-sm font-medium text-gray-500 mb-4 text-center">
                                                {viewMode === 'tech' ? `${item} (${currency})` : `${item} (${currency})`}
                                            </h4>
                                            <ResponsiveContainer width="100%" height="100%">
                                                <BarChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 60 }}>
                                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                                    <XAxis
                                                        dataKey="name"
                                                        tick={{ fontSize: 10 }}
                                                        interval={0}
                                                        angle={-45}
                                                        textAnchor="end"
                                                        height={60}
                                                    />
                                                    <YAxis tick={{ fontSize: 10 }} tickFormatter={(val) => `${val}`} />
                                                    <Tooltip
                                                        formatter={(val: number) => `${currency}${val}`}
                                                        contentStyle={{ fontSize: '12px' }}
                                                    />
                                                    <Bar dataKey="price" radius={[4, 4, 0, 0]}>
                                                        {chartData.map((entry, index) => (
                                                            <Cell key={`cell-${index}`} fill={getColor(entry.price)} />
                                                        ))}
                                                    </Bar>
                                                </BarChart>
                                            </ResponsiveContainer>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Marketing Section */}
                            <div className="border-t border-gray-100 pt-8">
                                <h4 className="text-md font-medium text-gray-700 mb-4 border-l-4 border-purple-500 pl-3">Marketing Strategy (Promotion)</h4>
                                <div className={`grid grid-cols-1 ${viewMode === 'tech' ? 'lg:grid-cols-3' : 'lg:grid-cols-4'} gap-6`}>
                                    {(viewMode === 'tech' ? ['USA', 'Asia', 'Europe'] : ['Tech 1', 'Tech 2', 'Tech 3', 'Tech 4']).map(item => {
                                        // Determine context based on view mode
                                        const regionName = viewMode === 'tech' ? item : selectedRegion;
                                        const techName = viewMode === 'tech' ? selectedTech : item;

                                        const rKey = regionName.toLowerCase() as 'usa' | 'asia' | 'europe';
                                        const currency = '$';

                                        const chartData = teams.map(t => ({
                                            name: t.name,
                                            promotion: t.margins[rKey]?.[techName]?.promotion || 0
                                        }));

                                        const values = chartData.map(d => d.promotion).filter(p => p > 0);
                                        const minVal = Math.min(...values);
                                        const maxVal = Math.max(...values);

                                        const getMarketingColor = (val: number) => {
                                            if (val === 0) return '#e5e7eb';
                                            if (minVal === maxVal) return '#8b5cf6';

                                            const ratio = (val - minVal) / (maxVal - minVal);
                                            const r = 221 + (76 - 221) * ratio;
                                            const g = 214 + (29 - 214) * ratio;
                                            const b = 254 + (149 - 254) * ratio;
                                            return `rgb(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)})`;
                                        };

                                        return (
                                            <div key={item} className="h-[300px]">
                                                <h4 className="text-sm font-medium text-gray-500 mb-4 text-center">
                                                    {viewMode === 'tech' ? `${item} (Promotion)` : `${item} (Promotion)`}
                                                </h4>
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <BarChart data={chartData} margin={{ top: 5, right: 5, left: -10, bottom: 60 }}>
                                                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                                        <XAxis
                                                            dataKey="name"
                                                            tick={{ fontSize: 10 }}
                                                            interval={0}
                                                            angle={-45}
                                                            textAnchor="end"
                                                            height={60}
                                                        />
                                                        <YAxis tick={{ fontSize: 10 }} tickFormatter={(val) => `${val / 1000}k`} />
                                                        <Tooltip
                                                            formatter={(val: number) => `${currency}${val.toLocaleString()}`}
                                                            contentStyle={{ fontSize: '12px' }}
                                                        />
                                                        <Bar dataKey="promotion" radius={[4, 4, 0, 0]}>
                                                            {chartData.map((entry, index) => (
                                                                <Cell key={`cell-${index}`} fill={getMarketingColor(entry.promotion)} />
                                                            ))}
                                                        </Bar>
                                                    </BarChart>
                                                </ResponsiveContainer>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Sales Volume Section */}
                            <div className="border-t border-gray-100 pt-8 mt-8">
                                <h4 className="text-md font-medium text-gray-700 mb-4 border-l-4 border-cyan-500 pl-3">Sales Performance (Volume)</h4>
                                <div className={`grid grid-cols-1 ${viewMode === 'tech' ? 'lg:grid-cols-3' : 'lg:grid-cols-4'} gap-6`}>
                                    {(viewMode === 'tech' ? ['USA', 'Asia', 'Europe'] : ['Tech 1', 'Tech 2', 'Tech 3', 'Tech 4']).map(item => {
                                        // Determine context based on view mode
                                        const regionName = viewMode === 'tech' ? item : selectedRegion;
                                        const techName = viewMode === 'tech' ? selectedTech : item;

                                        const rKey = regionName.toLowerCase() as 'usa' | 'asia' | 'europe';

                                        const chartData = teams.map(t => ({
                                            name: t.name,
                                            volume: t.demand[rKey]?.[techName] || 0
                                        }));

                                        const values = chartData.map(d => d.volume).filter(p => p > 0);
                                        const minVal = Math.min(...values);
                                        const maxVal = Math.max(...values);

                                        const getVolumeColor = (val: number) => {
                                            if (val === 0) return '#e5e7eb';
                                            if (minVal === maxVal) return '#06b6d4';

                                            const ratio = (val - minVal) / (maxVal - minVal);
                                            // Light Cyan to Dark Cyan
                                            // Min: 207, 250, 254 (cyan-100)
                                            // Max: 8, 145, 178 (cyan-600)
                                            const r = 207 + (8 - 207) * ratio;
                                            const g = 250 + (145 - 250) * ratio;
                                            const b = 254 + (178 - 254) * ratio;
                                            return `rgb(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)})`;
                                        };

                                        return (
                                            <div key={item} className="h-[300px]">
                                                <h4 className="text-sm font-medium text-gray-500 mb-4 text-center">
                                                    {viewMode === 'tech' ? `${item} (Units)` : `${item} (Units)`}
                                                </h4>
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <BarChart data={chartData} margin={{ top: 5, right: 5, left: -10, bottom: 60 }}>
                                                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                                        <XAxis
                                                            dataKey="name"
                                                            tick={{ fontSize: 10 }}
                                                            interval={0}
                                                            angle={-45}
                                                            textAnchor="end"
                                                            height={60}
                                                        />
                                                        <YAxis tick={{ fontSize: 10 }} tickFormatter={(val) => `${(val / 1000).toFixed(0)}k`} />
                                                        <Tooltip
                                                            formatter={(val: number) => `${val.toLocaleString()} units`}
                                                            contentStyle={{ fontSize: '12px' }}
                                                        />
                                                        <Bar dataKey="volume" radius={[4, 4, 0, 0]}>
                                                            {chartData.map((entry, index) => (
                                                                <Cell key={`cell-${index}`} fill={getVolumeColor(entry.volume)} />
                                                            ))}
                                                        </Bar>
                                                    </BarChart>
                                                </ResponsiveContainer>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                                <h3 className="text-lg font-semibold text-gray-900 mb-6">Revenue by Team</h3>
                                <div className="h-[300px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={teamsByRevenue.map(t => ({ name: t.name, revenue: getMetric(t, "Financials", "Sales revenue") }))}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                            <XAxis dataKey="name" />
                                            <YAxis tickFormatter={(val) => `$${val / 1000}k`} />
                                            <Tooltip formatter={(val: number) => [`$${val.toLocaleString()}`, 'Revenue']} />
                                            <Bar dataKey="revenue" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                                <h3 className="text-lg font-semibold text-gray-900 mb-6">Profitability by Team</h3>
                                <div className="h-[300px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={barData}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                            <XAxis dataKey="name" />
                                            <YAxis tickFormatter={(val) => `$${val / 1000}k`} />
                                            <Tooltip formatter={(val: number) => [`$${val.toLocaleString()}`, 'EBITDA']} />
                                            <Bar dataKey="ebitda" fill="#22c55e" radius={[4, 4, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }

            {activeTab === "TeamAnalysis" && <TeamDetailView teams={teams} initialTeam={selectedTeamForAnalysis} />}
            {activeTab === "Comparison" && <ComparisonView teams={teams} />} {/* Render ComparisonView */}
            {activeTab === "Financials" && <FinancialsView teams={teams} />}
            {activeTab === "Market" && <MarketView teams={teams} />}
            {activeTab === "Manufacturing" && <ManufacturingView teams={teams} />}
            {activeTab === "Logistics" && <LogisticsView teams={teams} />}
            {activeTab === "Costs" && <CostsView teams={teams} />}
            {activeTab === "Margins" && <MarginsView teams={teams} />}
        </div>
    );
}

function MetricCard({ title, value, icon, trend, subtitle }: { title: string, value: string, icon: React.ReactNode, trend?: string, subtitle?: string }) {
    return (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
                <div className="p-2 bg-red-50 rounded-lg">
                    {icon}
                </div>
                {trend && (
                    <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
                        {trend}
                    </span>
                )}
            </div>
            <div>
                <p className="text-sm text-gray-500 font-medium">{title}</p>
                <h4 className="text-2xl font-bold text-gray-900 mt-1">{value}</h4>
                {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
            </div>
        </div>
    );
}
