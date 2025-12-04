import React, { useState } from 'react';
import { TeamData } from '@/lib/types';
import { DataTable } from '../DataTable';
import { clsx } from 'clsx';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    PieChart, Pie, Cell, LineChart, Line, LabelList
} from 'recharts';
import { LayoutDashboard, Table as TableIcon, TrendingUp, DollarSign, PieChart as PieChartIcon, Activity } from 'lucide-react';

interface FinancialsViewProps {
    teams: TeamData[];
}

type Tab = 'Income Statement' | 'Balance Sheet' | 'Cash Flow' | 'Ratios';
type Region = 'Global' | 'USA' | 'Asia' | 'Europe';
type ViewMode = 'chart' | 'table';

export function FinancialsView({ teams }: FinancialsViewProps) {
    const [activeTab, setActiveTab] = useState<Tab>('Income Statement');
    const [activeRegion, setActiveRegion] = useState<Region>('Global');
    const [viewMode, setViewMode] = useState<ViewMode>('chart');

    const tabs: Tab[] = ['Income Statement', 'Balance Sheet', 'Cash Flow', 'Ratios'];
    const regions: Region[] = ['Global', 'USA', 'Asia', 'Europe'];

    const getData = (team: TeamData) => {
        switch (activeTab) {
            case 'Income Statement':
                return team.financials.incomeStatement[activeRegion.toLowerCase() as 'global' | 'usa' | 'asia' | 'europe'] || {};
            case 'Balance Sheet':
                return team.financials.balanceSheet[activeRegion.toLowerCase() as 'global' | 'usa' | 'asia' | 'europe'] || {};
            case 'Cash Flow':
                return team.financials.cashFlow[activeRegion.toLowerCase() as 'global' | 'usa' | 'asia' | 'europe'] || {};
            case 'Ratios':
                return team.financials.ratios;
            default:
                return {};
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                {/* Tabs */}
                <div className="flex p-1 bg-gray-100 rounded-lg w-fit overflow-x-auto">
                    {tabs.map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={clsx(
                                "px-4 py-2 text-base font-medium rounded-md transition-all whitespace-nowrap",
                                activeTab === tab
                                    ? "bg-white text-gray-900 shadow-sm"
                                    : "text-gray-500 hover:text-gray-700"
                            )}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                <div className="flex items-center gap-4">
                    {/* View Toggle */}
                    <div className="flex p-1 bg-gray-100 rounded-lg">
                        <button
                            onClick={() => setViewMode('chart')}
                            className={clsx(
                                "px-3 py-1.5 rounded-md transition-all flex items-center gap-2",
                                viewMode === 'chart' ? "bg-white text-blue-600 shadow-sm" : "text-gray-500 hover:text-gray-700"
                            )}
                        >
                            <LayoutDashboard className="w-4 h-4" /> Chart
                        </button>
                        <button
                            onClick={() => setViewMode('table')}
                            className={clsx(
                                "px-3 py-1.5 rounded-md transition-all flex items-center gap-2",
                                viewMode === 'table' ? "bg-white text-blue-600 shadow-sm" : "text-gray-500 hover:text-gray-700"
                            )}
                        >
                            <TableIcon className="w-4 h-4" /> Table
                        </button>
                    </div>

                    {/* Region Selector */}
                    {(activeTab === 'Income Statement' || activeTab === 'Balance Sheet' || activeTab === 'Cash Flow') && (
                        <div className="flex items-center gap-2">
                            <span className="text-base font-medium text-gray-500">Region:</span>
                            <select
                                value={activeRegion}
                                onChange={(e) => setActiveRegion(e.target.value as Region)}
                                className="bg-white border border-gray-200 text-gray-700 text-base rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5"
                            >
                                {regions.map(r => (
                                    <option key={r} value={r}>{r}</option>
                                ))}
                            </select>
                        </div>
                    )}
                </div>
            </div>

            {viewMode === 'table' ? (
                <DataTable
                    title={`${activeTab} - ${activeRegion}`}
                    teams={teams}
                    dataExtractor={getData}
                    formatValue={(val) => val.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                />
            ) : (
                <FinancialsCharts
                    teams={teams}
                    activeTab={activeTab}
                    activeRegion={activeRegion}
                />
            )}
        </div>
    );
}

function FinancialsCharts({ teams, activeTab, activeRegion }: { teams: TeamData[], activeTab: Tab, activeRegion: Region }) {
    const regionKey = activeRegion.toLowerCase() as 'global' | 'usa' | 'asia' | 'europe';

    // Helper to get data safely
    const getVal = (team: TeamData, key: string) => {
        if (activeTab === 'Income Statement') return team.financials.incomeStatement[regionKey]?.[key] || 0;
        if (activeTab === 'Balance Sheet') return team.financials.balanceSheet[regionKey]?.[key] || 0;
        if (activeTab === 'Cash Flow') return team.financials.cashFlow[regionKey]?.[key] || 0;
        if (activeTab === 'Ratios') return (team.financials.ratios as any)[key] || 0;
        return 0;
    };

    const formatCurrency = (val: number) => `$${(val / 1000).toFixed(0)}k`;
    const formatPercent = (val: number) => `${val.toFixed(1)}%`;

    if (activeTab === 'Income Statement') {
        const data = teams.map(t => ({
            name: t.name,
            Revenue: getVal(t, 'Sales revenue'),
            GrossProfit: getVal(t, 'Sales revenue') - getVal(t, 'Variable production costs'),
            EBITDA: getVal(t, 'Operating profit before depreciation (EBITDA)'),
            NetProfit: getVal(t, 'Profit for the round'),
            VariableCosts: getVal(t, 'Variable production costs'),
            FixedCosts: getVal(t, 'Fixed manufacturing costs') + getVal(t, 'Administration') + getVal(t, 'R&D'),
            Marketing: getVal(t, 'Promotion'),
        }));

        return (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ChartCard title="Revenue & Profitability">
                    <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="name" />
                        <YAxis tickFormatter={(val) => `$${val / 1000}k`} />
                        <Tooltip formatter={(val: number) => `$${val.toLocaleString()}`} />
                        <Legend />
                        <Bar dataKey="Revenue" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="GrossProfit" fill="#10b981" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="NetProfit" fill="#f97316" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ChartCard>

                <ChartCard title="Cost Structure Breakdown">
                    <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="name" />
                        <YAxis tickFormatter={(val) => `$${val / 1000}k`} />
                        <Tooltip formatter={(val: number) => `$${val.toLocaleString()}`} />
                        <Legend />
                        <Bar dataKey="VariableCosts" stackId="a" fill="#ef4444" radius={[0, 0, 4, 4]} />
                        <Bar dataKey="FixedCosts" stackId="a" fill="#f59e0b" />
                        <Bar dataKey="Marketing" stackId="a" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ChartCard>
            </div>
        );
    }

    if (activeTab === 'Balance Sheet') {
        const data = teams.map(t => ({
            name: t.name,
            CurrentAssets: getVal(t, 'Cash and equivalents') + getVal(t, 'Accounts receivable') + getVal(t, 'Inventory'),
            FixedAssets: getVal(t, 'Fixed assets'),
            Liabilities: getVal(t, 'Loans') + getVal(t, 'Accounts payable'),
            Equity: getVal(t, 'Share capital') + getVal(t, 'Retained earnings'),
        }));

        return (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ChartCard title="Assets Structure">
                    <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="name" />
                        <YAxis tickFormatter={(val) => `$${val / 1000}k`} />
                        <Tooltip formatter={(val: number) => `$${val.toLocaleString()}`} />
                        <Legend />
                        <Bar dataKey="CurrentAssets" stackId="a" fill="#3b82f6" radius={[0, 0, 4, 4]} />
                        <Bar dataKey="FixedAssets" stackId="a" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ChartCard>

                <ChartCard title="Liabilities & Equity">
                    <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="name" />
                        <YAxis tickFormatter={(val) => `$${val / 1000}k`} />
                        <Tooltip formatter={(val: number) => `$${val.toLocaleString()}`} />
                        <Legend />
                        <Bar dataKey="Liabilities" stackId="a" fill="#ef4444" radius={[0, 0, 4, 4]} />
                        <Bar dataKey="Equity" stackId="a" fill="#10b981" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ChartCard>
            </div>
        );
    }

    if (activeTab === 'Ratios') {
        const data = teams.map(t => ({
            name: t.name,
            ROE: getVal(t, 'roe'),
            ROS: getVal(t, 'ros'),
            AssetTurnover: getVal(t, 'assetTurnover'),
            CurrentRatio: getVal(t, 'currentRatio'),
            Gearing: getVal(t, 'gearing'),
        }));

        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <ChartCard title="Return on Equity (ROE %)">
                    <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip formatter={(val: number) => `${val.toFixed(2)}%`} />
                        <Bar dataKey="ROE" fill="#8b5cf6" radius={[4, 4, 0, 0]}>
                            <LabelList dataKey="ROE" position="top" formatter={(val: any) => `${val.toFixed(1)}%`} />
                        </Bar>
                    </BarChart>
                </ChartCard>

                <ChartCard title="Return on Sales (ROS %)">
                    <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip formatter={(val: number) => `${val.toFixed(2)}%`} />
                        <Bar dataKey="ROS" fill="#ec4899" radius={[4, 4, 0, 0]}>
                            <LabelList dataKey="ROS" position="top" formatter={(val: any) => `${val.toFixed(1)}%`} />
                        </Bar>
                    </BarChart>
                </ChartCard>

                <ChartCard title="Gearing Ratio (%)">
                    <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip formatter={(val: number) => `${val.toFixed(2)}%`} />
                        <Bar dataKey="Gearing" fill="#f59e0b" radius={[4, 4, 0, 0]}>
                            <LabelList dataKey="Gearing" position="top" formatter={(val: any) => `${val.toFixed(1)}%`} />
                        </Bar>
                    </BarChart>
                </ChartCard>
            </div>
        );
    }

    return <div className="text-center text-gray-500 py-10">Chart visualization not available for this tab.</div>;
}

function ChartCard({ title, children }: { title: string, children: React.ReactNode }) {
    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-6">{title}</h3>
            <div className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                    {children as any}
                </ResponsiveContainer>
            </div>
        </div>
    );
}
