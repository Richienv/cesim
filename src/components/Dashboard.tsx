'use client';

import React, { useMemo, useState } from 'react';
import { RoundData } from '@/lib/types';
import { calculateRankings } from '@/lib/ranking';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend, Cell, LabelList
} from 'recharts';
import {
    Activity, BarChart3, DollarSign, Factory, FileText, PieChart, Truck, Users, TrendingUp, Search, Bell, ArrowRight, ArrowRightLeft, Target, ArrowLeft, Table as TableIcon
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
import { DataTable } from './DataTable';

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
    const [financialViewMode, setFinancialViewMode] = useState<'chart' | 'table'>('chart');
    const [highlightedTeams, setHighlightedTeams] = useState<string[]>([]);
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

    // Bar Data for Overview (Net Profit for latest round)
    const barData = useMemo(() => {
        return latestRound.teams.map(t => ({
            name: t.name,
            netProfit: getMetric(t, "Financials", "Profit for the round")
        })).sort((a, b) => b.netProfit - a.netProfit);
    }, [latestRound]);

    // Bar Data for EBIT
    const ebitData = useMemo(() => {
        return latestRound.teams.map(t => ({
            name: t.name,
            ebit: t.financials.incomeStatement.global.ebit || 0
        })).sort((a, b) => b.ebit - a.ebit);
    }, [latestRound]);

    // Bar Data for Profit Before Tax
    const pbtData = useMemo(() => {
        return latestRound.teams.map(t => ({
            name: t.name,
            pbt: t.financials.incomeStatement.global.profitBeforeTax || 0
        })).sort((a, b) => b.pbt - a.pbt);
    }, [latestRound]);

    const handleTeamClick = (teamName: string) => {
        setSelectedTeamForAnalysis(teamName);
        setActiveTab("TeamAnalysis");
    };

    const handleChartClick = (teamName: string) => {
        setHighlightedTeams(prev => {
            if (prev.includes(teamName)) {
                return prev.filter(t => t !== teamName);
            }
            if (prev.length >= 3) {
                return [...prev.slice(1), teamName];
            }
            return [...prev, teamName];
        });
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
                                "flex items-center gap-2 px-4 py-2 rounded-lg text-base font-medium whitespace-nowrap transition-colors",
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
                    className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors text-base"
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
                            {calculateRankings(teams).slice(0, 3).map((rankInfo, index) => {
                                const team = teams.find(t => t.name === rankInfo.teamName);
                                if (!team) return null;

                                const tsr = team.financials.ratios["Cumulative total shareholder return (p.a.), %"] || 0;
                                const roe = team.financials.ratios["Return on equity (ROE)"] || 0;
                                const dividends = team.financials.cashFlow.global["Dividends"] || 0;
                                const shortTermLoans = team.financials.balanceSheet.global["Short-term debts (unplanned)"] || 0;
                                const longTermLoans = team.financials.balanceSheet.global["Long-term debts"] || 0;
                                const marketingSpend = team.financials.incomeStatement.global["Promotion"] || 0;

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
                                                    <h3 className="font-bold text-gray-900 text-xl group-hover:text-blue-600 transition-colors">{team.name}</h3>
                                                </div>
                                                <p className="text-sm text-gray-500 mt-1">Rank #{index + 1}</p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4 mb-6 border-b border-gray-100 pb-6 relative z-10">
                                            <div>
                                                <p className="text-xs text-gray-500 mb-1">TSR</p>
                                                <p className="font-bold text-gray-900">{tsr.toFixed(2)}%</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500 mb-1">ROE</p>
                                                <p className="font-bold text-gray-900">{roe.toFixed(2)}%</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500 mb-1">Dividends</p>
                                                <p className="font-bold text-gray-900">${dividends.toLocaleString()}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500 mb-1">Marketing</p>
                                                <p className="font-bold text-gray-900">${marketingSpend.toLocaleString()}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500 mb-1">Short-term Loans</p>
                                                <p className="font-bold text-red-600">${shortTermLoans.toLocaleString()}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500 mb-1">Long-term Loans</p>
                                                <p className="font-bold text-orange-600">${longTermLoans.toLocaleString()}</p>
                                            </div>
                                        </div>

                                        <div className="relative z-10">
                                            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Pricing Strategy</p>
                                            <div className="bg-gray-50 rounded-lg p-3">
                                                <div className="grid grid-cols-4 gap-2 text-xs mb-2 border-b border-gray-200 pb-2">
                                                    <div className="font-medium text-gray-400"></div>
                                                    <div className="font-medium text-center text-gray-500">USA</div>
                                                    <div className="font-medium text-center text-gray-500">Asia</div>
                                                    <div className="font-medium text-center text-gray-500">Eur</div>
                                                </div>
                                                {['Tech 1', 'Tech 2', 'Tech 3', 'Tech 4'].map(tech => (
                                                    <div key={tech} className="grid grid-cols-4 gap-2 text-xs py-1">
                                                        <div className="font-medium text-gray-600 truncate">{tech}</div>
                                                        <div className="text-center text-gray-900">${team.prices.usa?.[tech] || '-'}</div>
                                                        <div className="text-center text-gray-900">¥{team.prices.asia?.[tech] || '-'}</div>
                                                        <div className="text-center text-gray-900">€{team.prices.europe?.[tech] || '-'}</div>
                                                    </div>
                                                ))}
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
                                    <h3 className="text-xl font-semibold text-gray-900">Competitive Strategy Analysis</h3>

                                    {/* View Mode Toggle */}
                                    <div className="flex bg-gray-100 p-1 rounded-lg">
                                        <button
                                            onClick={() => setViewMode('tech')}
                                            className={twMerge(
                                                "px-4 py-1.5 text-base font-medium rounded-md transition-all",
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
                                                "px-4 py-1.5 text-base font-medium rounded-md transition-all",
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
                                                        "px-4 py-1.5 text-base font-medium rounded-md transition-all",
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
                                                        "px-4 py-1.5 text-base font-medium rounded-md transition-all",
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
                                            <h4 className="text-base font-medium text-gray-500 mb-4 text-center">
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
                                                        {chartData.map((entry, index) => {
                                                            const isHighlighted = highlightedTeams.includes(entry.name);
                                                            const isDimmed = highlightedTeams.length > 0 && !isHighlighted;
                                                            return (
                                                                <Cell
                                                                    key={`cell-${index}`}
                                                                    fill={getColor(entry.price)}
                                                                    onClick={() => handleChartClick(entry.name)}
                                                                    cursor="pointer"
                                                                    opacity={isDimmed ? 0.1 : 1}
                                                                    stroke={isHighlighted ? "#000" : "none"}
                                                                    strokeWidth={isHighlighted ? 2 : 0}
                                                                />
                                                            );
                                                        })}
                                                        <LabelList
                                                            dataKey="price"
                                                            position="top"
                                                            formatter={(val: any) => val}
                                                            style={{ fontSize: '10px', fill: '#6b7280' }}
                                                        />
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
                                                <h4 className="text-base font-medium text-gray-500 mb-4 text-center">
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
                                                            {chartData.map((entry, index) => {
                                                                const isHighlighted = highlightedTeams.includes(entry.name);
                                                                const isDimmed = highlightedTeams.length > 0 && !isHighlighted;
                                                                return (
                                                                    <Cell
                                                                        key={`cell-${index}`}
                                                                        fill={getMarketingColor(entry.promotion)}
                                                                        onClick={() => handleChartClick(entry.name)}
                                                                        cursor="pointer"
                                                                        opacity={isDimmed ? 0.1 : 1}
                                                                        stroke={isHighlighted ? "#000" : "none"}
                                                                        strokeWidth={isHighlighted ? 2 : 0}
                                                                    />
                                                                );
                                                            })}
                                                            <LabelList
                                                                dataKey="promotion"
                                                                position="top"
                                                                formatter={(val: any) => val > 0 ? val.toLocaleString() : ''}
                                                                style={{ fontSize: '10px', fill: '#6b7280' }}
                                                            />
                                                        </Bar>
                                                    </BarChart>
                                                </ResponsiveContainer>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* R&D Investment Section */}
                            <div className="border-t border-gray-100 pt-8 mt-8">
                                <h4 className="text-md font-medium text-gray-700 mb-4 border-l-4 border-pink-500 pl-3">R&D Investment</h4>
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    {/* Total R&D Spending */}
                                    <div className="h-[300px]">
                                        <h4 className="text-base font-medium text-gray-500 mb-4 text-center">Total R&D Spending (USD)</h4>
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart
                                                data={teams.map(t => ({ name: t.name, value: t.financials.incomeStatement.global["R&D"] || 0 }))}
                                                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                                            >
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                                <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={0} angle={-45} textAnchor="end" height={60} />
                                                <YAxis tickFormatter={(val) => `$${val / 1000}k`} />
                                                <Tooltip formatter={(val: number) => `$${val.toLocaleString()}`} />
                                                <Bar dataKey="value" name="R&D" radius={[4, 4, 0, 0]}>
                                                    {teams.map((entry, index) => {
                                                        const isHighlighted = highlightedTeams.includes(entry.name);
                                                        const isDimmed = highlightedTeams.length > 0 && !isHighlighted;
                                                        return <Cell key={`cell-${index}`} fill="#8b5cf6" onClick={() => handleChartClick(entry.name)} cursor="pointer" opacity={isDimmed ? 0.1 : 1} stroke={isHighlighted ? "#000" : "none"} strokeWidth={isHighlighted ? 2 : 0} />;
                                                    })}
                                                </Bar>
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>

                                    {/* Total Feature Costs */}
                                    <div className="h-[300px]">
                                        <h4 className="text-base font-medium text-gray-500 mb-4 text-center">Total Feature Costs (USD)</h4>
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart
                                                data={teams.map(t => ({ name: t.name, value: t.financials.incomeStatement.global["Feature costs"] || 0 }))}
                                                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                                            >
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                                <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={0} angle={-45} textAnchor="end" height={60} />
                                                <YAxis tickFormatter={(val) => `$${val / 1000}k`} />
                                                <Tooltip formatter={(val: number) => `$${val.toLocaleString()}`} />
                                                <Bar dataKey="value" name="Feature Costs" radius={[4, 4, 0, 0]}>
                                                    {teams.map((entry, index) => {
                                                        const isHighlighted = highlightedTeams.includes(entry.name);
                                                        const isDimmed = highlightedTeams.length > 0 && !isHighlighted;
                                                        return <Cell key={`cell-${index}`} fill="#ec4899" onClick={() => handleChartClick(entry.name)} cursor="pointer" opacity={isDimmed ? 0.1 : 1} stroke={isHighlighted ? "#000" : "none"} strokeWidth={isHighlighted ? 2 : 0} />;
                                                    })}
                                                </Bar>
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                            </div>

                            {/* Feature Strategy Section */}
                            <div className="border-t border-gray-100 pt-8 mt-8">
                                <h4 className="text-md font-medium text-gray-700 mb-4 border-l-4 border-green-500 pl-3">Feature Strategy (Count)</h4>
                                <div className={`grid grid-cols-1 ${viewMode === 'tech' ? 'lg:grid-cols-3' : 'lg:grid-cols-4'} gap-6`}>
                                    {(viewMode === 'tech' ? ['USA', 'Asia', 'Europe'] : ['Tech 1', 'Tech 2', 'Tech 3', 'Tech 4']).map(item => {
                                        // Determine context based on view mode
                                        const regionName = viewMode === 'tech' ? item : selectedRegion;
                                        const techName = viewMode === 'tech' ? selectedTech : item;

                                        const rKey = regionName.toLowerCase() as 'usa' | 'asia' | 'europe';

                                        const chartData = teams.map(t => ({
                                            name: t.name,
                                            features: t.features[rKey]?.[techName] || 0
                                        }));

                                        const values = chartData.map(d => d.features).filter(p => p > 0);
                                        const minVal = Math.min(...values);
                                        const maxVal = Math.max(...values);

                                        const getFeatureColor = (val: number) => {
                                            if (val === 0) return '#e5e7eb';
                                            if (minVal === maxVal) return '#22c55e';

                                            const ratio = (val - minVal) / (maxVal - minVal);
                                            // Light Green to Dark Green
                                            const r = 220 + (22 - 220) * ratio;
                                            const g = 252 + (197 - 252) * ratio;
                                            const b = 231 + (94 - 231) * ratio;
                                            return `rgb(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)})`;
                                        };

                                        return (
                                            <div key={item} className="h-[300px]">
                                                <h4 className="text-base font-medium text-gray-500 mb-4 text-center">
                                                    {viewMode === 'tech' ? `${item} (Features)` : `${item} (Features)`}
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
                                                        <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
                                                        <Tooltip
                                                            formatter={(val: number) => [`${val} Features`, 'Count']}
                                                            contentStyle={{ fontSize: '12px' }}
                                                        />
                                                        <Bar dataKey="features" radius={[4, 4, 0, 0]}>
                                                            {chartData.map((entry, index) => {
                                                                const isHighlighted = highlightedTeams.includes(entry.name);
                                                                const isDimmed = highlightedTeams.length > 0 && !isHighlighted;
                                                                return (
                                                                    <Cell
                                                                        key={`cell-${index}`}
                                                                        fill={getFeatureColor(entry.features)}
                                                                        onClick={() => handleChartClick(entry.name)}
                                                                        cursor="pointer"
                                                                        opacity={isDimmed ? 0.1 : 1}
                                                                        stroke={isHighlighted ? "#000" : "none"}
                                                                        strokeWidth={isHighlighted ? 2 : 0}
                                                                    />
                                                                );
                                                            })}
                                                            <LabelList
                                                                dataKey="features"
                                                                position="top"
                                                                formatter={(val: any) => val > 0 ? val : ''}
                                                                style={{ fontSize: '10px', fill: '#6b7280' }}
                                                            />
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

                                        const totalVolume = chartData.reduce((sum, d) => sum + d.volume, 0);
                                        const chartDataWithShare = chartData.map(d => ({
                                            ...d,
                                            share: totalVolume > 0 ? (d.volume / totalVolume) * 100 : 0
                                        }));

                                        const values = chartData.map(d => d.volume).filter(p => p > 0);
                                        const minVal = Math.min(...values);
                                        const maxVal = Math.max(...values);

                                        const getVolumeColor = (val: number) => {
                                            if (val === 0) return '#e5e7eb';
                                            if (minVal === maxVal) return '#06b6d4';

                                            const ratio = (val - minVal) / (maxVal - minVal);
                                            // Light Cyan to Dark Cyan
                                            const r = 207 + (8 - 207) * ratio;
                                            const g = 250 + (145 - 250) * ratio;
                                            const b = 254 + (178 - 254) * ratio;
                                            return `rgb(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)})`;
                                        };

                                        return (
                                            <div key={item} className="h-[300px]">
                                                <h4 className="text-base font-medium text-gray-500 mb-4 text-center">
                                                    {viewMode === 'tech' ? `${item} (Units)` : `${item} (Units)`}
                                                </h4>
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <BarChart data={chartDataWithShare} margin={{ top: 20, right: 5, left: -10, bottom: 60 }}>
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
                                                            formatter={(val: number, name: string, props: any) => [
                                                                `${val.toLocaleString()} units (${props.payload.share.toFixed(1)}%)`,
                                                                "Volume"
                                                            ]}
                                                            contentStyle={{ fontSize: '12px' }}
                                                        />
                                                        <Bar dataKey="volume" radius={[4, 4, 0, 0]}>
                                                            {chartDataWithShare.map((entry, index) => {
                                                                const isHighlighted = highlightedTeams.includes(entry.name);
                                                                const isDimmed = highlightedTeams.length > 0 && !isHighlighted;
                                                                return (
                                                                    <Cell
                                                                        key={`cell-${index}`}
                                                                        fill={getVolumeColor(entry.volume)}
                                                                        onClick={() => handleChartClick(entry.name)}
                                                                        cursor="pointer"
                                                                        opacity={isDimmed ? 0.1 : 1}
                                                                        stroke={isHighlighted ? "#000" : "none"}
                                                                        strokeWidth={isHighlighted ? 2 : 0}
                                                                    />
                                                                );
                                                            })}
                                                            <LabelList
                                                                dataKey="share"
                                                                position="top"
                                                                formatter={(val: any) => val > 0 ? `${val.toFixed(0)}%` : ''}
                                                                style={{ fontSize: '10px', fill: '#6b7280' }}
                                                            />
                                                        </Bar>
                                                    </BarChart>
                                                </ResponsiveContainer>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>


                        {/* Financial Performance Comparison */}
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-6">
                            <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                                <h3 className="text-lg font-semibold text-gray-900">Financial Performance Comparison</h3>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left text-gray-500">
                                    <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3">Metric</th>
                                            {teams.map(t => (
                                                <th key={t.name} className="px-6 py-3 text-right">{t.name}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr className="bg-white border-b font-semibold text-gray-900">
                                            <td className="px-6 py-4">Sales Revenue</td>
                                            {teams.map(t => (
                                                <td key={t.name} className="px-6 py-4 text-right">
                                                    {(t.financials.incomeStatement.global['Sales revenue'] || 0).toLocaleString()}
                                                </td>
                                            ))}
                                        </tr>
                                        {[
                                            { key: 'In-house manufacturing costs', label: 'In-house Production' },
                                            { key: 'Feature costs', label: 'Feature Cost' },
                                            { key: 'Contract manufacturing costs', label: 'Outsourcing' },
                                            { key: 'Transportation and tariffs', label: 'Logistics' },
                                            { key: 'R&D', label: 'R&D' },
                                            { key: 'Promotion', label: 'Marketing' },
                                            { key: 'Administration', label: 'Admin' },
                                        ].map((item, idx) => (
                                            <tr key={item.key} className={idx % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                                                <td className="px-6 py-3 font-medium text-gray-900">{item.label}</td>
                                                {teams.map(t => (
                                                    <td key={t.name} className="px-6 py-3 text-right">
                                                        {(t.financials.incomeStatement.global[item.key] || 0).toLocaleString()}
                                                    </td>
                                                ))}
                                            </tr>
                                        ))}
                                        <tr className="bg-gray-100 border-t font-bold text-gray-900">
                                            <td className="px-6 py-4">Total Costs</td>
                                            {teams.map(t => {
                                                const total = [
                                                    'In-house manufacturing costs',
                                                    'Feature costs',
                                                    'Contract manufacturing costs',
                                                    'Transportation and tariffs',
                                                    'R&D',
                                                    'Promotion',
                                                    'Administration'
                                                ].reduce((sum, key) => sum + (t.financials.incomeStatement.global[key] || 0), 0);
                                                return (
                                                    <td key={t.name} className="px-6 py-4 text-right">
                                                        {total.toLocaleString()}
                                                    </td>
                                                );
                                            })}
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                                <h3 className="text-xl font-semibold text-gray-900 mb-6">Revenue by Team</h3>
                                <div className="h-[300px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={teamsByRevenue.map(t => ({ name: t.name, revenue: getMetric(t, "Financials", "Sales revenue") }))}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                            <XAxis dataKey="name" />
                                            <YAxis tickFormatter={(val) => `$${val / 1000}k`} />
                                            <Tooltip formatter={(val: number) => [`$${val.toLocaleString()}`, 'Revenue']} />
                                            <Bar dataKey="revenue" radius={[4, 4, 0, 0]}>
                                                {teamsByRevenue.map((entry, index) => {
                                                    const isHighlighted = highlightedTeams.includes(entry.name);
                                                    const isDimmed = highlightedTeams.length > 0 && !isHighlighted;
                                                    return (
                                                        <Cell
                                                            key={`cell-${index}`}
                                                            fill="#3b82f6"
                                                            onClick={() => handleChartClick(entry.name)}
                                                            cursor="pointer"
                                                            opacity={isDimmed ? 0.1 : 1}
                                                            stroke={isHighlighted ? "#000" : "none"}
                                                            strokeWidth={isHighlighted ? 2 : 0}
                                                        />
                                                    );
                                                })}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
                            {/* Net Profit Chart */}
                            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                                <h3 className="text-lg font-semibold text-gray-900 mb-6">Net Profit</h3>
                                <div className="h-[300px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={barData}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                            <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={0} angle={-45} textAnchor="end" height={60} />
                                            <YAxis tickFormatter={(val) => `$${val / 1000}k`} />
                                            <Tooltip formatter={(val: number) => [`$${val.toLocaleString()}`, 'Net Profit']} />
                                            <Bar dataKey="netProfit" radius={[4, 4, 0, 0]}>
                                                {barData.map((entry, index) => {
                                                    const isHighlighted = highlightedTeams.includes(entry.name);
                                                    const isDimmed = highlightedTeams.length > 0 && !isHighlighted;
                                                    return (
                                                        <Cell
                                                            key={`cell-${index}`}
                                                            fill="#22c55e"
                                                            onClick={() => handleChartClick(entry.name)}
                                                            cursor="pointer"
                                                            opacity={isDimmed ? 0.1 : 1}
                                                            stroke={isHighlighted ? "#000" : "none"}
                                                            strokeWidth={isHighlighted ? 2 : 0}
                                                        />
                                                    );
                                                })}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            {/* EBIT Chart */}
                            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                                <h3 className="text-lg font-semibold text-gray-900 mb-6">EBIT</h3>
                                <div className="h-[300px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={ebitData}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                            <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={0} angle={-45} textAnchor="end" height={60} />
                                            <YAxis tickFormatter={(val) => `$${val / 1000}k`} />
                                            <Tooltip formatter={(val: number) => [`$${val.toLocaleString()}`, 'EBIT']} />
                                            <Bar dataKey="ebit" radius={[4, 4, 0, 0]}>
                                                {ebitData.map((entry, index) => {
                                                    const isHighlighted = highlightedTeams.includes(entry.name);
                                                    const isDimmed = highlightedTeams.length > 0 && !isHighlighted;
                                                    return (
                                                        <Cell
                                                            key={`cell-${index}`}
                                                            fill="#8b5cf6"
                                                            onClick={() => handleChartClick(entry.name)}
                                                            cursor="pointer"
                                                            opacity={isDimmed ? 0.1 : 1}
                                                            stroke={isHighlighted ? "#000" : "none"}
                                                            strokeWidth={isHighlighted ? 2 : 0}
                                                        />
                                                    );
                                                })}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            {/* Profit Before Tax Chart */}
                            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                                <h3 className="text-lg font-semibold text-gray-900 mb-6">Profit Before Tax</h3>
                                <div className="h-[300px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={pbtData}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                            <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={0} angle={-45} textAnchor="end" height={60} />
                                            <YAxis tickFormatter={(val) => `$${val / 1000}k`} />
                                            <Tooltip formatter={(val: number) => [`$${val.toLocaleString()}`, 'Profit Before Tax']} />
                                            <Bar dataKey="pbt" radius={[4, 4, 0, 0]}>
                                                {pbtData.map((entry, index) => {
                                                    const isHighlighted = highlightedTeams.includes(entry.name);
                                                    const isDimmed = highlightedTeams.length > 0 && !isHighlighted;
                                                    return (
                                                        <Cell
                                                            key={`cell-${index}`}
                                                            fill="#f59e0b"
                                                            onClick={() => handleChartClick(entry.name)}
                                                            cursor="pointer"
                                                            opacity={isDimmed ? 0.1 : 1}
                                                            stroke={isHighlighted ? "#000" : "none"}
                                                            strokeWidth={isHighlighted ? 2 : 0}
                                                        />
                                                    );
                                                })}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>


                        {/* Balance Sheet Analysis */}
                        <div className="border-t border-gray-100 pt-8 mt-8">
                            <h4 className="text-md font-medium text-gray-700 mb-6 border-l-4 border-red-500 pl-3">Balance Sheet Analysis (k USD)</h4>

                            <div className="space-y-8">
                                {/* Assets Section */}
                                <div>
                                    <h5 className="text-sm font-bold text-gray-600 mb-4 uppercase tracking-wide">Assets</h5>
                                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                        {[
                                            { label: 'Receivables', key: 'Receivables', color: '#60a5fa' },
                                            { label: 'Cash & Equivalents', key: 'Cash and cash equivalents', color: '#34d399' },
                                            { label: 'Total Assets', key: 'Total assets', color: '#818cf8' },
                                        ].map((metric) => {
                                            const chartData = teams.map(t => ({
                                                name: t.name,
                                                value: t.financials.balanceSheet.global[metric.key] || 0
                                            }));
                                            return (
                                                <div key={metric.key} className="h-[250px] bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                                                    <h4 className="text-xs font-medium text-gray-400 mb-2 text-center">{metric.label}</h4>
                                                    <ResponsiveContainer width="100%" height="100%">
                                                        <BarChart data={chartData} margin={{ top: 20, right: 5, left: -10, bottom: 60 }}>
                                                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                                            <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={0} angle={-45} textAnchor="end" height={60} />
                                                            <YAxis tick={{ fontSize: 10 }} tickFormatter={(val) => `${(val / 1000).toFixed(0)}k`} />
                                                            <Tooltip formatter={(val: number) => [val.toLocaleString(), metric.label]} contentStyle={{ fontSize: '12px' }} />
                                                            <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                                                                {chartData.map((entry, index) => {
                                                                    const isHighlighted = highlightedTeams.includes(entry.name);
                                                                    const isDimmed = highlightedTeams.length > 0 && !isHighlighted;
                                                                    return (
                                                                        <Cell
                                                                            key={`cell-${index}`}
                                                                            fill={metric.color}
                                                                            onClick={() => handleChartClick(entry.name)}
                                                                            cursor="pointer"
                                                                            opacity={isDimmed ? 0.1 : 1}
                                                                            stroke={isHighlighted ? "#000" : "none"}
                                                                            strokeWidth={isHighlighted ? 2 : 0}
                                                                        />
                                                                    );
                                                                })}
                                                                <LabelList dataKey="value" position="top" formatter={(val: any) => val > 0 ? `${(val / 1000).toFixed(0)}k` : ''} style={{ fontSize: '10px', fill: '#6b7280' }} />
                                                            </Bar>
                                                        </BarChart>
                                                    </ResponsiveContainer>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Equity Section */}
                                <div>
                                    <h5 className="text-sm font-bold text-gray-600 mb-4 uppercase tracking-wide">Shareholders' Equity</h5>
                                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                        {[
                                            { label: 'Share Capital', key: 'Share capital', color: '#f472b6' },
                                            { label: 'Retained Earnings', key: 'Retained earnings', color: '#fbbf24' },
                                            { label: 'Total Equity', key: 'Total equity', color: '#f87171' },
                                        ].map((metric) => {
                                            const chartData = teams.map(t => ({
                                                name: t.name,
                                                value: t.financials.balanceSheet.global[metric.key] || 0
                                            }));
                                            return (
                                                <div key={metric.key} className="h-[250px] bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                                                    <h4 className="text-xs font-medium text-gray-400 mb-2 text-center">{metric.label}</h4>
                                                    <ResponsiveContainer width="100%" height="100%">
                                                        <BarChart data={chartData} margin={{ top: 20, right: 5, left: -10, bottom: 60 }}>
                                                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                                            <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={0} angle={-45} textAnchor="end" height={60} />
                                                            <YAxis tick={{ fontSize: 10 }} tickFormatter={(val) => `${(val / 1000).toFixed(0)}k`} />
                                                            <Tooltip formatter={(val: number) => [val.toLocaleString(), metric.label]} contentStyle={{ fontSize: '12px' }} />
                                                            <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                                                                {chartData.map((entry, index) => {
                                                                    const isHighlighted = highlightedTeams.includes(entry.name);
                                                                    const isDimmed = highlightedTeams.length > 0 && !isHighlighted;
                                                                    return (
                                                                        <Cell
                                                                            key={`cell-${index}`}
                                                                            fill={metric.color}
                                                                            onClick={() => handleChartClick(entry.name)}
                                                                            cursor="pointer"
                                                                            opacity={isDimmed ? 0.1 : 1}
                                                                            stroke={isHighlighted ? "#000" : "none"}
                                                                            strokeWidth={isHighlighted ? 2 : 0}
                                                                        />
                                                                    );
                                                                })}
                                                                <LabelList dataKey="value" position="top" formatter={(val: any) => val > 0 ? `${(val / 1000).toFixed(0)}k` : ''} style={{ fontSize: '10px', fill: '#6b7280' }} />
                                                            </Bar>
                                                        </BarChart>
                                                    </ResponsiveContainer>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Liabilities Section */}
                                <div>
                                    <h5 className="text-sm font-bold text-gray-600 mb-4 uppercase tracking-wide">Liabilities</h5>
                                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                        {[
                                            { label: 'Long-term Loans', key: 'Long-term debts', color: '#a78bfa' },
                                            { label: 'Short-term Loans', key: 'Short-term debts (unplanned)', color: '#fb923c' },
                                            { label: 'Payables', key: 'Payables', color: '#94a3b8' },
                                        ].map((metric) => {
                                            const chartData = teams.map(t => ({
                                                name: t.name,
                                                value: t.financials.balanceSheet.global[metric.key] || 0
                                            }));
                                            return (
                                                <div key={metric.key} className="h-[250px] bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                                                    <h4 className="text-xs font-medium text-gray-400 mb-2 text-center">{metric.label}</h4>
                                                    <ResponsiveContainer width="100%" height="100%">
                                                        <BarChart data={chartData} margin={{ top: 20, right: 5, left: -10, bottom: 60 }}>
                                                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                                            <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={0} angle={-45} textAnchor="end" height={60} />
                                                            <YAxis tick={{ fontSize: 10 }} tickFormatter={(val) => `${(val / 1000).toFixed(0)}k`} />
                                                            <Tooltip formatter={(val: number) => [val.toLocaleString(), metric.label]} contentStyle={{ fontSize: '12px' }} />
                                                            <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                                                                {chartData.map((entry, index) => {
                                                                    const isHighlighted = highlightedTeams.includes(entry.name);
                                                                    const isDimmed = highlightedTeams.length > 0 && !isHighlighted;
                                                                    return (
                                                                        <Cell
                                                                            key={`cell-${index}`}
                                                                            fill={metric.color}
                                                                            onClick={() => handleChartClick(entry.name)}
                                                                            cursor="pointer"
                                                                            opacity={isDimmed ? 0.1 : 1}
                                                                            stroke={isHighlighted ? "#000" : "none"}
                                                                            strokeWidth={isHighlighted ? 2 : 0}
                                                                        />
                                                                    );
                                                                })}
                                                                <LabelList dataKey="value" position="top" formatter={(val: any) => val > 0 ? `${(val / 1000).toFixed(0)}k` : ''} style={{ fontSize: '10px', fill: '#6b7280' }} />
                                                            </Bar>
                                                        </BarChart>
                                                    </ResponsiveContainer>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        </div>


                        {/* Key Financial Indicators Charts */}
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-6">
                            <h3 className="text-xl font-semibold text-gray-900 mb-6">Key Financial Indicators</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {/* Dividend Yield */}
                                <div className="h-[300px]">
                                    <h4 className="text-sm font-medium text-gray-500 mb-4 text-center">Dividend Yield (%)</h4>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={teams.map(t => ({ name: t.name, value: t.financials.ratios["Dividend yield, %"] || 0 }))} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                            <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={0} angle={-45} textAnchor="end" height={60} />
                                            <YAxis />
                                            <Tooltip formatter={(val: number) => `${val.toFixed(2)}%`} />
                                            <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                                                {teams.map((entry, index) => {
                                                    const isHighlighted = highlightedTeams.includes(entry.name);
                                                    const isDimmed = highlightedTeams.length > 0 && !isHighlighted;
                                                    return (
                                                        <Cell
                                                            key={`cell-${index}`}
                                                            fill="#10b981"
                                                            onClick={() => handleChartClick(entry.name)}
                                                            cursor="pointer"
                                                            opacity={isDimmed ? 0.1 : 1}
                                                            stroke={isHighlighted ? "#000" : "none"}
                                                            strokeWidth={isHighlighted ? 2 : 0}
                                                        />
                                                    );
                                                })}
                                                <LabelList dataKey="value" position="top" formatter={(val: any) => `${val.toFixed(2)}%`} style={{ fontSize: '10px', fill: '#6b7280' }} />
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                                {/* Average Share Price */}
                                <div className="h-[300px]">
                                    <h4 className="text-sm font-medium text-gray-500 mb-4 text-center">Average Share Price (USD)</h4>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={teams.map(t => ({ name: t.name, value: t.financials.ratios["Average trading price during the round, USD"] || 0 }))} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                            <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={0} angle={-45} textAnchor="end" height={60} />
                                            <YAxis />
                                            <Tooltip formatter={(val: number) => `$${val.toFixed(2)}`} />
                                            <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                                                {teams.map((entry, index) => {
                                                    const isHighlighted = highlightedTeams.includes(entry.name);
                                                    const isDimmed = highlightedTeams.length > 0 && !isHighlighted;
                                                    return (
                                                        <Cell
                                                            key={`cell-${index}`}
                                                            fill="#3b82f6"
                                                            onClick={() => handleChartClick(entry.name)}
                                                            cursor="pointer"
                                                            opacity={isDimmed ? 0.1 : 1}
                                                            stroke={isHighlighted ? "#000" : "none"}
                                                            strokeWidth={isHighlighted ? 2 : 0}
                                                        />
                                                    );
                                                })}
                                                <LabelList dataKey="value" position="top" formatter={(val: any) => `$${val.toFixed(0)}`} style={{ fontSize: '10px', fill: '#6b7280' }} />
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                                {/* Share Price at End */}
                                <div className="h-[300px]">
                                    <h4 className="text-sm font-medium text-gray-500 mb-4 text-center">Share Price at End (USD)</h4>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={teams.map(t => ({ name: t.name, value: t.financials.ratios["Share price at the end of round, USD"] || 0 }))} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                            <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={0} angle={-45} textAnchor="end" height={60} />
                                            <YAxis />
                                            <Tooltip formatter={(val: number) => `$${val.toFixed(2)}`} />
                                            <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                                                {teams.map((entry, index) => {
                                                    const isHighlighted = highlightedTeams.includes(entry.name);
                                                    const isDimmed = highlightedTeams.length > 0 && !isHighlighted;
                                                    return (
                                                        <Cell
                                                            key={`cell-${index}`}
                                                            fill="#8b5cf6"
                                                            onClick={() => handleChartClick(entry.name)}
                                                            cursor="pointer"
                                                            opacity={isDimmed ? 0.1 : 1}
                                                            stroke={isHighlighted ? "#000" : "none"}
                                                            strokeWidth={isHighlighted ? 2 : 0}
                                                        />
                                                    );
                                                })}
                                                <LabelList dataKey="value" position="top" formatter={(val: any) => `$${val.toFixed(0)}`} style={{ fontSize: '10px', fill: '#6b7280' }} />
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                                {/* Shares Issued */}
                                <div className="h-[300px]">
                                    <h4 className="text-sm font-medium text-gray-500 mb-4 text-center">Shares Issued (k)</h4>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={teams.map(t => ({ name: t.name, value: t.financials.ratios["Shares outstanding at the end of round, k shares"] || 0 }))} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                            <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={0} angle={-45} textAnchor="end" height={60} />
                                            <YAxis />
                                            <Tooltip formatter={(val: number) => val.toLocaleString()} />
                                            <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                                                {teams.map((entry, index) => {
                                                    const isHighlighted = highlightedTeams.includes(entry.name);
                                                    const isDimmed = highlightedTeams.length > 0 && !isHighlighted;
                                                    return (
                                                        <Cell
                                                            key={`cell-${index}`}
                                                            fill="#f59e0b"
                                                            onClick={() => handleChartClick(entry.name)}
                                                            cursor="pointer"
                                                            opacity={isDimmed ? 0.1 : 1}
                                                            stroke={isHighlighted ? "#000" : "none"}
                                                            strokeWidth={isHighlighted ? 2 : 0}
                                                        />
                                                    );
                                                })}
                                                <LabelList dataKey="value" position="top" formatter={(val: any) => val.toLocaleString()} style={{ fontSize: '10px', fill: '#6b7280' }} />
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>

                        {/* Production & Logistics Analysis */}
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-6">
                            <h3 className="text-xl font-semibold text-gray-900 mb-6">Production & Logistics Analysis</h3>

                            <div className="space-y-8">




                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                    {/* USA In-house Production Volume */}
                                    <div className="h-[350px]">
                                        <h4 className="text-base font-medium text-gray-500 mb-4 text-center">USA In-house Production (k units)</h4>
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart
                                                data={teams.map(t => {
                                                    const sumMetrics = (metrics: any) => Object.values(metrics || {}).reduce((a: any, b: any) => a + b, 0) as number;
                                                    return { name: t.name, value: sumMetrics(t.manufacturing.usa.inHouse) };
                                                })}
                                                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                                            >
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                                <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={0} angle={-45} textAnchor="end" height={60} />
                                                <YAxis />
                                                <Tooltip formatter={(val: number) => `${val.toLocaleString()} k`} />
                                                <Bar dataKey="value" name="USA In-house" radius={[4, 4, 0, 0]}>
                                                    {teams.map((entry, index) => {
                                                        const isHighlighted = highlightedTeams.includes(entry.name);
                                                        const isDimmed = highlightedTeams.length > 0 && !isHighlighted;
                                                        return <Cell key={`cell-${index}`} fill="#1e3a8a" onClick={() => handleChartClick(entry.name)} cursor="pointer" opacity={isDimmed ? 0.1 : 1} stroke={isHighlighted ? "#000" : "none"} strokeWidth={isHighlighted ? 2 : 0} />;
                                                    })}
                                                </Bar>
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>

                                    {/* USA Contract Production Volume */}
                                    <div className="h-[350px]">
                                        <h4 className="text-base font-medium text-gray-500 mb-4 text-center">USA Contract Production (k units)</h4>
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart
                                                data={teams.map(t => {
                                                    const sumMetrics = (metrics: any) => Object.values(metrics || {}).reduce((a: any, b: any) => a + b, 0) as number;
                                                    return { name: t.name, value: sumMetrics(t.manufacturing.usa.contract) };
                                                })}
                                                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                                            >
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                                <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={0} angle={-45} textAnchor="end" height={60} />
                                                <YAxis />
                                                <Tooltip formatter={(val: number) => `${val.toLocaleString()} k`} />
                                                <Bar dataKey="value" name="USA Contract" radius={[4, 4, 0, 0]}>
                                                    {teams.map((entry, index) => {
                                                        const isHighlighted = highlightedTeams.includes(entry.name);
                                                        const isDimmed = highlightedTeams.length > 0 && !isHighlighted;
                                                        return <Cell key={`cell-${index}`} fill="#60a5fa" onClick={() => handleChartClick(entry.name)} cursor="pointer" opacity={isDimmed ? 0.1 : 1} stroke={isHighlighted ? "#000" : "none"} strokeWidth={isHighlighted ? 2 : 0} />;
                                                    })}
                                                </Bar>
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>

                                    {/* Asia In-house Production Volume */}
                                    <div className="h-[350px]">
                                        <h4 className="text-base font-medium text-gray-500 mb-4 text-center">Asia In-house Production (k units)</h4>
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart
                                                data={teams.map(t => {
                                                    const sumMetrics = (metrics: any) => Object.values(metrics || {}).reduce((a: any, b: any) => a + b, 0) as number;
                                                    return { name: t.name, value: sumMetrics(t.manufacturing.asia.inHouse) };
                                                })}
                                                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                                            >
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                                <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={0} angle={-45} textAnchor="end" height={60} />
                                                <YAxis />
                                                <Tooltip formatter={(val: number) => `${val.toLocaleString()} k`} />
                                                <Bar dataKey="value" name="Asia In-house" radius={[4, 4, 0, 0]}>
                                                    {teams.map((entry, index) => {
                                                        const isHighlighted = highlightedTeams.includes(entry.name);
                                                        const isDimmed = highlightedTeams.length > 0 && !isHighlighted;
                                                        return <Cell key={`cell-${index}`} fill="#b91c1c" onClick={() => handleChartClick(entry.name)} cursor="pointer" opacity={isDimmed ? 0.1 : 1} stroke={isHighlighted ? "#000" : "none"} strokeWidth={isHighlighted ? 2 : 0} />;
                                                    })}
                                                </Bar>
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>

                                    {/* Asia Contract Production Volume */}
                                    <div className="h-[350px]">
                                        <h4 className="text-base font-medium text-gray-500 mb-4 text-center">Asia Contract Production (k units)</h4>
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart
                                                data={teams.map(t => {
                                                    const sumMetrics = (metrics: any) => Object.values(metrics || {}).reduce((a: any, b: any) => a + b, 0) as number;
                                                    return { name: t.name, value: sumMetrics(t.manufacturing.asia.contract) };
                                                })}
                                                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                                            >
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                                <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={0} angle={-45} textAnchor="end" height={60} />
                                                <YAxis />
                                                <Tooltip formatter={(val: number) => `${val.toLocaleString()} k`} />
                                                <Bar dataKey="value" name="Asia Contract" radius={[4, 4, 0, 0]}>
                                                    {teams.map((entry, index) => {
                                                        const isHighlighted = highlightedTeams.includes(entry.name);
                                                        const isDimmed = highlightedTeams.length > 0 && !isHighlighted;
                                                        return <Cell key={`cell-${index}`} fill="#f87171" onClick={() => handleChartClick(entry.name)} cursor="pointer" opacity={isDimmed ? 0.1 : 1} stroke={isHighlighted ? "#000" : "none"} strokeWidth={isHighlighted ? 2 : 0} />;
                                                    })}
                                                </Bar>
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>

                                    {/* Capacity Utilization */}
                                    <div className="h-[350px]">
                                        <h4 className="text-base font-medium text-gray-500 mb-4 text-center">In-house Capacity Utilization (%)</h4>
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart
                                                data={teams.map(t => ({
                                                    name: t.name,
                                                    usa: t.manufacturing.usa.capacityUsage["Total"] || 0,
                                                    asia: t.manufacturing.asia.capacityUsage["Total"] || 0,
                                                }))}
                                                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                                            >
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                                <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={0} angle={-45} textAnchor="end" height={60} />
                                                <YAxis domain={[0, 100]} />
                                                <Tooltip formatter={(val: number) => `${val.toFixed(1)}%`} />
                                                <Legend />
                                                <Bar dataKey="usa" name="USA" radius={[4, 4, 0, 0]}>
                                                    {teams.map((entry, index) => {
                                                        const isHighlighted = highlightedTeams.includes(entry.name);
                                                        const isDimmed = highlightedTeams.length > 0 && !isHighlighted;
                                                        return <Cell key={`cell-${index}`} fill="#1e3a8a" onClick={() => handleChartClick(entry.name)} cursor="pointer" opacity={isDimmed ? 0.1 : 1} stroke={isHighlighted ? "#000" : "none"} strokeWidth={isHighlighted ? 2 : 0} />;
                                                    })}
                                                </Bar>
                                                <Bar dataKey="asia" name="Asia" radius={[4, 4, 0, 0]}>
                                                    {teams.map((entry, index) => {
                                                        const isHighlighted = highlightedTeams.includes(entry.name);
                                                        const isDimmed = highlightedTeams.length > 0 && !isHighlighted;
                                                        return <Cell key={`cell-${index}`} fill="#b91c1c" onClick={() => handleChartClick(entry.name)} cursor="pointer" opacity={isDimmed ? 0.1 : 1} stroke={isHighlighted ? "#000" : "none"} strokeWidth={isHighlighted ? 2 : 0} />;
                                                    })}
                                                </Bar>
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
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
        </div >
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
                    <span className="text-sm font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
                        {trend}
                    </span>
                )}
            </div>
            <div>
                <p className="text-base text-gray-500 font-medium">{title}</p>
                <h4 className="text-3xl font-bold text-gray-900 mt-1">{value}</h4>
                {subtitle && <p className="text-sm text-gray-400 mt-1">{subtitle}</p>}
            </div>
        </div>
    );
}
