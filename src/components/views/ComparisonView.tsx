import React, { useState, useMemo } from 'react';
import { TeamData, RoundData } from '@/lib/types';
import { calculateRankings, TeamRank } from '@/lib/ranking';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend, PieChart, Pie, Cell, LabelList, LineChart, Line
} from 'recharts';
import { ArrowRightLeft, TrendingUp, DollarSign, Activity, Target, Users, Factory, Truck, AlertCircle, Scale, Box, Trophy, Medal, Upload } from 'lucide-react';
import { clsx } from 'clsx';
import { FileUpload } from '@/components/FileUpload';
import { ComparisonPieCharts } from './ComparisonPieCharts';
import { ManufacturingPieCharts } from './ManufacturingPieCharts';
import { DetailedMarketAnalysis } from './DetailedMarketAnalysis';
import { RegionalStrategyTable } from './RegionalStrategyTable';
import { HiddenInsightsTable } from './HiddenInsightsTable';
import { LogisticsComparisonTable } from './LogisticsComparisonTable';
import { ComparativeScatterPlot } from '../charts/ComparativeScatterPlot';
import { getTechLabel, TECH_NAME_MAP } from '@/lib/constants';

const TEAM_COLORS = [
    '#ef4444', // Red
    '#3b82f6', // Bright Blue
    '#22c55e', // Green
    '#a855f7', // Purple
    '#f97316', // Orange
    '#000000', // Black
    '#ec4899', // Pink
    '#eab308', // Yellow
    '#8b4513', // Brown
    '#6b7280', // Grey
    '#14b8a6', // Teal
    '#6366f1', // Indigo
];

interface ComparisonViewProps {
    teams: TeamData[];
    roundData: RoundData[];
    onFileUpload: (files: File[]) => Promise<void>;
}

export function ComparisonView({ teams, roundData, onFileUpload }: ComparisonViewProps) {
    const [activeTab, setActiveTab] = useState<'comparison' | 'leaderboard' | 'trends'>('leaderboard');
    const [selectedRegion, setSelectedRegion] = useState<'global' | 'usa' | 'asia' | 'europe'>('global');
    const [activeTech, setActiveTech] = useState<string>('Tech 1');
    const [scatterRegion, setScatterRegion] = useState<'usa' | 'asia' | 'europe'>('usa');
    const [focusedTeams, setFocusedTeams] = useState<string[]>([]);
    const [hrMetric, setHrMetric] = useState<'totalCost' | 'salary' | 'trainingBudget' | 'efficiency' | 'turnoverRate' | 'staffingLevel'>('totalCost');

    const handleTeamClick = (team: string) => {
        setFocusedTeams(prev => {
            if (prev.includes(team)) {
                return prev.filter(t => t !== team);
            }
            return [...prev, team];
        });
    };

    const rankings = useMemo(() => calculateRankings(teams), [teams]);

    // --- Metrics Calculation ---

    const getMetrics = (team: TeamData) => {
        const globalIncome = team.financials.incomeStatement.global;
        const revenue = globalIncome["Sales revenue"] || 0;
        const profit = globalIncome["Profit for the round"] || 0;
        const grossProfit = revenue - (globalIncome["Variable production costs"] || 0);
        const ebitda = globalIncome["Operating profit before depreciation (EBITDA)"] || 0;
        const cumulativeEarnings = team.financials.balanceSheet.global["Retained earnings"] || 0;

        // Market Share
        let totalMarketShare = 0;
        let count = 0;
        Object.values(team.marketShare.global).forEach(v => { totalMarketShare += v; count++; });
        const avgMarketShare = count > 0 ? totalMarketShare / count : 0;

        // Logistics & Manufacturing Aggregates
        let totalInHouse = 0;
        let totalContract = 0;
        let totalExports = 0;
        let totalBuffer = 0;
        let totalUnsatisfied = 0;

        ['usa', 'asia', 'europe'].forEach(r => {
            const rKey = r as 'usa' | 'asia' | 'europe';
            const log = team.logistics[rKey];
            if (log) {
                Object.values(log).forEach(l => {
                    totalInHouse += l.inHouse;
                    totalContract += l.contract;
                    totalExports += l.exported;
                    totalBuffer += l.productionBuffer;
                    totalUnsatisfied += l.unsatisfiedDemand;
                });
            }
        });

        // Capacity Usage (Avg)
        let totalCapUsage = 0;
        let capCount = 0;
        ['usa', 'asia'].forEach(r => {
            const rKey = r as 'usa' | 'asia';
            const caps = team.manufacturing[rKey].capacityUsage;
            if (caps) Object.values(caps).forEach(c => { totalCapUsage += c; capCount++; });
        });
        const avgCapacityUsage = capCount > 0 ? totalCapUsage / capCount : 0;

        // Total Output (In-House)
        const totalOutput = Object.values(team.manufacturing.usa.inHouse).reduce((a, b) => a + b, 0) +
            Object.values(team.manufacturing.asia.inHouse).reduce((a, b) => a + b, 0);

        return {
            revenue,
            profit,
            grossProfit,
            ebitda,
            cumulativeEarnings,
            avgMarketShare,
            totalInHouse,
            totalContract,
            totalExports,
            totalBuffer,
            totalUnsatisfied,
            avgCapacityUsage,
            totalOutput
        };
    };

    const capacityData = teams.map(t => ({ name: t.name, value: getMetrics(t).avgCapacityUsage }));

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-10">
            {/* Tabs */}
            <div className="flex justify-center mb-6">
                <div className="bg-gray-100 p-1 rounded-lg flex gap-1">
                    <button
                        onClick={() => setActiveTab('leaderboard')}
                        className={clsx(
                            "px-6 py-2 rounded-md text-base font-medium transition-all flex items-center gap-2",
                            activeTab === 'leaderboard' ? "bg-white text-blue-600 shadow-sm" : "text-gray-500 hover:text-gray-700"
                        )}
                    >
                        <Trophy className="w-4 h-4" /> Leaderboard
                    </button>
                    <button
                        onClick={() => setActiveTab('comparison')}
                        className={clsx(
                            "px-6 py-2 rounded-md text-base font-medium transition-all flex items-center gap-2",
                            activeTab === 'comparison' ? "bg-white text-blue-600 shadow-sm" : "text-gray-500 hover:text-gray-700"
                        )}
                    >
                        <ArrowRightLeft className="w-4 h-4" /> Comparison
                    </button>
                    <button
                        onClick={() => setActiveTab('trends')}
                        className={clsx(
                            "px-6 py-2 rounded-md text-base font-medium transition-all flex items-center gap-2",
                            activeTab === 'trends' ? "bg-white text-blue-600 shadow-sm" : "text-gray-500 hover:text-gray-700"
                        )}
                    >
                        <TrendingUp className="w-4 h-4" /> Trend Analysis
                    </button>
                </div>
            </div>

            {activeTab === 'leaderboard' ? (
                <div className="space-y-6">
                    {/* Top 3 Podium - Glossy Metallic */}
                    <div className="grid grid-cols-3 gap-4 mb-8 items-end">
                        {/* 2nd Place - Silver */}
                        {rankings[1] && (
                            <div className="bg-gradient-to-br from-slate-100 via-slate-200 to-slate-300 p-4 rounded-xl shadow-lg border border-slate-300 flex flex-col items-center relative order-1 transform scale-95 opacity-90 backdrop-blur-sm">
                                <div className="absolute inset-0 bg-white/30 rounded-xl pointer-events-none" style={{ backgroundImage: 'linear-gradient(45deg, rgba(255,255,255,0.4) 0%, transparent 40%, transparent 60%, rgba(255,255,255,0.4) 100%)' }}></div>
                                <div className="absolute -top-3 bg-slate-500 text-white w-6 h-6 rounded-full flex items-center justify-center font-bold text-sm border-2 border-white shadow-sm z-10">2</div>
                                <h3 className="font-bold text-gray-800 text-lg text-center z-10 mb-1">{rankings[1].teamName}</h3>
                                <div className="text-sm text-slate-700 font-medium z-10">TSR: {rankings[1].metrics.tsr.toFixed(2)}%</div>
                            </div>
                        )}

                        {/* 1st Place - Gold */}
                        {rankings[0] && (
                            <div className="bg-gradient-to-br from-amber-100 via-yellow-200 to-amber-300 p-6 rounded-xl shadow-xl border border-yellow-400 flex flex-col items-center relative order-2 z-10">
                                <div className="absolute inset-0 bg-white/40 rounded-xl pointer-events-none" style={{ backgroundImage: 'linear-gradient(45deg, rgba(255,255,255,0.6) 0%, transparent 40%, transparent 60%, rgba(255,255,255,0.6) 100%)' }}></div>
                                <div className="absolute -top-4 bg-yellow-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-lg border-2 border-white shadow-md z-20">1</div>
                                <h3 className="font-bold text-yellow-900 text-xl text-center z-10 mb-1">{rankings[0].teamName}</h3>
                                <div className="text-base text-yellow-800 font-bold bg-yellow-100/50 px-3 py-1 rounded-full z-10">TSR: {rankings[0].metrics.tsr.toFixed(2)}%</div>
                            </div>
                        )}

                        {/* 3rd Place - Bronze */}
                        {rankings[2] && (
                            <div className="bg-gradient-to-br from-orange-100 via-orange-200 to-orange-300 p-4 rounded-xl shadow-lg border border-orange-300 flex flex-col items-center relative order-3 transform scale-95 opacity-90 backdrop-blur-sm">
                                <div className="absolute inset-0 bg-white/30 rounded-xl pointer-events-none" style={{ backgroundImage: 'linear-gradient(45deg, rgba(255,255,255,0.4) 0%, transparent 40%, transparent 60%, rgba(255,255,255,0.4) 100%)' }}></div>
                                <div className="absolute -top-3 bg-orange-700 text-white w-6 h-6 rounded-full flex items-center justify-center font-bold text-sm border-2 border-white shadow-sm z-10">3</div>
                                <h3 className="font-bold text-gray-900 text-lg text-center z-10 mb-1">{rankings[2].teamName}</h3>
                                <div className="text-sm text-orange-900 font-medium z-10">TSR: {rankings[2].metrics.tsr.toFixed(2)}%</div>
                            </div>
                        )}
                    </div>

                    {/* Full Leaderboard Table */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                            <h4 className="font-bold text-xl text-gray-900 flex items-center gap-2">
                                <Activity className="w-5 h-5 text-blue-500" />
                                Comprehensive Rankings
                            </h4>
                            <div className="text-sm text-gray-500 bg-white px-3 py-1 rounded-full border border-gray-200">
                                Rankings based on Total Shareholder Return (TSR)
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-base text-left">
                                <thead className="text-sm text-gray-500 uppercase bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3">Rank</th>
                                        <th className="px-6 py-3">Team</th>
                                        <th className="px-6 py-3 text-right">Total Score</th>
                                        <th className="px-6 py-3 text-right text-blue-700 bg-blue-50/50">TSR %</th>
                                        <th className="px-6 py-3 text-right">ROE %</th>
                                        <th className="px-6 py-3 text-right">Net Profit</th>
                                        <th className="px-6 py-3 text-right">EPS</th>
                                        <th className="px-6 py-3 text-right text-gray-400 font-normal">USA</th>
                                        <th className="px-6 py-3 text-right text-gray-400 font-normal">Asia</th>
                                        <th className="px-6 py-3 text-right text-gray-400 font-normal">Europe</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {rankings.map((team, idx) => (
                                        <tr key={team.teamName} className={clsx("hover:bg-gray-50", idx < 3 ? "bg-gray-50/30" : "")}>
                                            <td className="px-6 py-4 font-bold text-gray-900">
                                                {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${idx + 1}`}
                                            </td>
                                            <td className="px-6 py-4 font-medium text-gray-900">{team.teamName}</td>
                                            <td className="px-6 py-4 text-right font-bold text-blue-600">{team.totalScore}</td>
                                            <td className="px-6 py-4 text-right font-medium bg-blue-50/30 text-blue-800">{team.metrics.tsr.toFixed(2)}%</td>
                                            <td className="px-6 py-4 text-right text-gray-600">{team.metrics.roe.toFixed(2)}%</td>
                                            <td className="px-6 py-4 text-right text-gray-600">${(team.metrics.netProfit / 1000).toFixed(0)}k</td>
                                            <td className="px-6 py-4 text-right text-gray-600">${team.metrics.eps.toFixed(2)}</td>
                                            <td className="px-6 py-4 text-right text-gray-500 text-sm">{team.metrics.marketShareUSA.toFixed(1)}%</td>
                                            <td className="px-6 py-4 text-right text-gray-500 text-sm">{team.metrics.marketShareAsia.toFixed(1)}%</td>
                                            <td className="px-6 py-4 text-right text-gray-500 text-sm">{team.metrics.marketShareEurope.toFixed(1)}%</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="space-y-6">

                    {/* Regional Deep Dive */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <h3 className="text-2xl font-bold text-gray-900">Regional Deep Dive</h3>

                        <div className="flex gap-4">
                            {/* Region Tabs */}
                            <div className="flex bg-gray-100 p-1 rounded-lg">
                                {['USA', 'Asia', 'Europe'].map(r => (
                                    <button
                                        key={r}
                                        onClick={() => setSelectedRegion(r.toLowerCase() as any)}
                                        className={clsx(
                                            "px-4 py-1.5 text-base font-medium rounded-md transition-all",
                                            selectedRegion === r.toLowerCase()
                                                ? "bg-white text-gray-900 shadow-sm"
                                                : "text-gray-500 hover:text-gray-700"
                                        )}
                                    >
                                        {r}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Regional Strategy Table (Static Analysis) */}
                    <div className="mb-8">
                        <RegionalStrategyTable teams={teams} region={selectedRegion === 'global' ? 'usa' : selectedRegion} />
                    </div>

                    {/* HR Comparison Section (New) */}
                    <div className="mb-8 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
                            <Users className="w-5 h-5 text-purple-600" />
                            HR & Production Analysis
                        </h3>

                        <div className="flex flex-col space-y-12">
                            {/* Row 1: HR Metrics Chart */}
                            <div>
                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                                    <h4 className="text-lg font-semibold text-gray-800">HR Metrics Analysis</h4>
                                    <div className="flex bg-gray-100 p-1 rounded-lg overflow-x-auto max-w-full">
                                        {[
                                            { key: 'totalCost', label: 'Total Cost' },
                                            { key: 'salary', label: 'Salary' },
                                            { key: 'efficiency', label: 'Efficiency' },
                                            { key: 'turnoverRate', label: 'Turnover' },
                                            { key: 'trainingBudget', label: 'Training' },
                                            { key: 'staffingLevel', label: 'Staffing' },
                                        ].map((m) => (
                                            <button
                                                key={m.key}
                                                onClick={() => setHrMetric(m.key as any)}
                                                className={clsx(
                                                    "px-3 py-1.5 text-sm font-medium rounded-md transition-all whitespace-nowrap",
                                                    hrMetric === m.key
                                                        ? "bg-white text-purple-600 shadow-sm"
                                                        : "text-gray-500 hover:text-gray-700"
                                                )}
                                            >
                                                {m.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className="h-[300px] w-full bg-gray-50/50 rounded-lg p-4 border border-gray-100">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={teams.map(t => ({
                                            name: t.name,
                                            value: (t.hr as any)[hrMetric],
                                            // Handle special formatting or validation if needed
                                        }))}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                            <XAxis dataKey="name" tick={{ fontSize: 11 }} interval={0} height={30} />
                                            <YAxis
                                                tick={{ fontSize: 11 }}
                                                tickFormatter={(val) => {
                                                    if (hrMetric === 'efficiency') return val.toFixed(2);
                                                    if (hrMetric === 'turnoverRate') return `${val}%`;
                                                    if (hrMetric === 'staffingLevel') return `${val}`;
                                                    return `$${(val / 1000).toFixed(0)}k`;
                                                }}
                                            />
                                            <Tooltip
                                                formatter={(val: number) => {
                                                    if (hrMetric === 'efficiency') return val.toFixed(3);
                                                    if (hrMetric === 'turnoverRate') return `${val.toFixed(1)}%`;
                                                    if (hrMetric === 'staffingLevel') return val.toLocaleString();
                                                    return `$${val.toLocaleString()}`;
                                                }}
                                                labelStyle={{ color: '#374151', fontWeight: 600 }}
                                            />
                                            <Bar dataKey="value" fill="#8b5cf6" radius={[4, 4, 0, 0]}>
                                                <LabelList
                                                    dataKey="value"
                                                    position="top"
                                                    formatter={(val: any) => {
                                                        if (hrMetric === 'efficiency') return val.toFixed(2);
                                                        if (hrMetric === 'turnoverRate') return `${val.toFixed(1)}%`;
                                                        if (hrMetric === 'staffingLevel') return val.toLocaleString();
                                                        return `$${(val / 1000).toFixed(0)}k`;
                                                    }}
                                                    style={{ fontSize: '10px', fill: '#6b7280' }}
                                                />
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            {/* Row 2: Production Charts (Side by Side) */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                <div className="h-[250px]">
                                    <h4 className="text-sm font-medium text-gray-500 mb-4 text-center">Total Production Output (Units)</h4>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={teams.map(t => ({ name: t.name, value: getMetrics(t).totalOutput }))}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                            <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={0} angle={-45} textAnchor="end" height={60} />
                                            <YAxis tickFormatter={(val) => val >= 1000000 ? `${(val / 1000000).toFixed(1)}M` : `${(val / 1000).toFixed(0)}k`} />
                                            <Tooltip formatter={(val: number) => [val >= 1000000 ? `${(val / 1000000).toFixed(2)}M` : `${(val / 1000).toFixed(0)}k`, 'Output']} />
                                            <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]}>
                                                <LabelList
                                                    dataKey="value"
                                                    position="top"
                                                    formatter={(val: any) => val >= 1000000 ? (val / 1000000).toFixed(1) + 'M' : (val / 1000).toFixed(1) + 'k'}
                                                    style={{ fontSize: '10px', fill: '#6b7280' }}
                                                />
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                                <div className="h-[250px]">
                                    <h4 className="text-sm font-medium text-gray-500 mb-4 text-center">Avg. Capacity Usage (%)</h4>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={capacityData}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                            <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={0} angle={-45} textAnchor="end" height={60} />
                                            <YAxis domain={[0, 100]} />
                                            <Tooltip formatter={(val: number) => [`${val.toFixed(1)}%`, 'Usage']} />
                                            <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                                                {capacityData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.value > 90 ? '#ef4444' : '#22c55e'} />
                                                ))}
                                                <LabelList dataKey="value" position="top" formatter={(val: any) => `${val.toFixed(1)}%`} style={{ fontSize: '10px', fill: '#6b7280' }} />
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Competitive Landscape (Scatter Analysis) */}
                    <div className="mb-8 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 mb-6">
                            <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                                <Target className="w-5 h-5 text-indigo-600" />
                                Competitive Landscape <span className="text-base font-normal text-gray-500">(Scatter Analysis)</span>
                            </h3>

                            <div className="flex flex-col sm:flex-row gap-4 w-full xl:w-auto">
                                {/* Region Selector */}
                                <div className="flex bg-gray-100 p-1 rounded-lg self-start sm:self-auto">
                                    {['USA', 'Asia', 'Europe'].map((r) => (
                                        <button
                                            key={r}
                                            onClick={() => setScatterRegion(r.toLowerCase() as any)}
                                            className={clsx(
                                                "px-3 py-1 text-sm font-medium rounded-md transition-all",
                                                scatterRegion === r.toLowerCase()
                                                    ? "bg-white text-gray-900 shadow-sm"
                                                    : "text-gray-500 hover:text-gray-700"
                                            )}
                                        >
                                            {r}
                                        </button>
                                    ))}
                                </div>

                                {/* Tech Selector */}
                                <div className="flex bg-gray-100 p-1 rounded-lg self-start sm:self-auto overflow-x-auto max-w-full">
                                    {['Tech 1', 'Tech 2', 'Tech 3', 'Tech 4'].map((tech) => (
                                        <button
                                            key={tech}
                                            onClick={() => setActiveTech(tech)}
                                            className={clsx(
                                                "px-3 py-1 text-sm font-medium rounded-md transition-all whitespace-nowrap",
                                                activeTech === tech
                                                    ? "bg-white text-indigo-600 shadow-sm"
                                                    : "text-gray-500 hover:text-gray-700"
                                            )}
                                        >
                                            {tech}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="space-y-12">
                            {[activeTech].map((tech) => {
                                const rKey = scatterRegion;
                                let currency = '$';
                                if (rKey === 'asia') currency = '¥';
                                if (rKey === 'europe') currency = '€';

                                const scatterData = teams.map((t, idx) => {
                                    const mData = t.margins[rKey]?.[tech];
                                    const lData = t.logistics[rKey];
                                    const price = t.prices[rKey]?.[tech] || 0;
                                    const features = t.features[rKey]?.[tech] || 0;
                                    const marketShare = t.marketShare[rKey]?.[tech] || 0;

                                    // Financial Calculations
                                    const rev = mData?.sales || 0;
                                    const profit = mData?.grossProfit || 0;
                                    const promotion = mData?.promotion || 0;

                                    // Region Totals for Allocation
                                    const regionTotalSales = Object.values(t.margins[rKey] || {}).reduce((sum, item) => sum + item.sales, 0);
                                    const revShare = regionTotalSales > 0 ? rev / regionTotalSales : 0;
                                    const regionEBITDA = t.financials.incomeStatement[rKey].ebitda || 0;
                                    const regionNetProfit = t.financials.incomeStatement[rKey].netProfit || 0;

                                    const regionContribution = Object.values(t.margins[rKey] || {}).reduce((sum, item) => sum + (item.grossProfit - item.promotion), 0);
                                    const regionFixedCosts = regionContribution - regionEBITDA;
                                    const regionNonOpCosts = regionEBITDA - regionNetProfit;

                                    const allocatedFixed = regionFixedCosts * revShare;
                                    const allocatedNonOp = regionNonOpCosts * revShare;

                                    const techContribution = profit - promotion;
                                    const techEBITDA = techContribution - allocatedFixed;
                                    const techNetProfit = techEBITDA - allocatedNonOp;

                                    return {
                                        name: t.name,
                                        price,
                                        features,
                                        marketShare,
                                        netProfit: techNetProfit,
                                        unitSales: Math.abs(t.logistics[rKey]?.[tech]?.sales || 0),
                                        promotion, // Includes promotion in data
                                        fill: TEAM_COLORS[idx % TEAM_COLORS.length] // Consistent color assignment
                                    };
                                });

                                return (
                                    <div key={tech} className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                                        <div className="flex items-center gap-2 mb-4">
                                            <div className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-lg font-bold text-sm border border-indigo-100">
                                                {tech}
                                            </div>
                                            <span className="text-sm text-gray-400">in {scatterRegion.toUpperCase()}</span>
                                        </div>

                                        {/* Grid Layout: 3 Rows (Strategies) x 3 Columns (Outcomes) */}
                                        <div className="space-y-12">

                                            {/* Row 1: Price Strategy */}
                                            <div>
                                                <h4 className="text-lg font-semibold text-gray-800 mb-4 border-l-4 border-indigo-500 pl-3">Price Strategy Impact</h4>
                                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                                    <ComparativeScatterPlot
                                                        title="Price vs Market Share"
                                                        xLabel={`Price (${currency})`}
                                                        yLabel="Market Share (%)"
                                                        data={scatterData.map(d => ({ name: d.name, x: d.price, y: d.marketShare, fill: d.fill }))}
                                                        xFormatter={(val) => `${currency}${val}`}
                                                        yFormatter={(val) => `${val.toFixed(1)}%`}
                                                        focusedTeams={focusedTeams}
                                                        onTeamClick={handleTeamClick}
                                                    />
                                                    <ComparativeScatterPlot
                                                        title="Price vs Profit"
                                                        xLabel={`Price (${currency})`}
                                                        yLabel={`Net Profit (${currency})`}
                                                        data={scatterData.map(d => ({ name: d.name, x: d.price, y: d.netProfit, fill: d.fill }))}
                                                        xFormatter={(val) => `${currency}${val}`}
                                                        yFormatter={(val) => `${currency}${(val / 1000).toFixed(0)}k`}
                                                        focusedTeams={focusedTeams}
                                                        onTeamClick={handleTeamClick}
                                                    />
                                                    <ComparativeScatterPlot
                                                        title="Price vs Unit Sales"
                                                        xLabel={`Price (${currency})`}
                                                        yLabel="Unit Sales"
                                                        data={scatterData.map(d => ({ name: d.name, x: d.price, y: d.unitSales, fill: d.fill }))}
                                                        xFormatter={(val) => `${currency}${val}`}
                                                        yFormatter={(val) => val.toLocaleString()}
                                                        focusedTeams={focusedTeams}
                                                        onTeamClick={handleTeamClick}
                                                    />
                                                </div>
                                            </div>

                                            {/* Row 2: Product Strategy (Features) */}
                                            <div>
                                                <h4 className="text-lg font-semibold text-gray-800 mb-4 border-l-4 border-indigo-500 pl-3">Product Strategy Impact (Features)</h4>
                                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                                    <ComparativeScatterPlot
                                                        title="Features vs Market Share"
                                                        xLabel="Features (Count)"
                                                        yLabel="Market Share (%)"
                                                        data={scatterData.map(d => ({ name: d.name, x: d.features, y: d.marketShare, fill: d.fill }))}
                                                        xFormatter={(val) => val.toFixed(1)}
                                                        yFormatter={(val) => `${val.toFixed(1)}%`}
                                                        focusedTeams={focusedTeams}
                                                        onTeamClick={handleTeamClick}
                                                    />
                                                    <ComparativeScatterPlot
                                                        title="Features vs Profit"
                                                        xLabel="Features (Count)"
                                                        yLabel={`Net Profit (${currency})`}
                                                        data={scatterData.map(d => ({ name: d.name, x: d.features, y: d.netProfit, fill: d.fill }))}
                                                        xFormatter={(val) => val.toFixed(1)}
                                                        yFormatter={(val) => `${currency}${(val / 1000).toFixed(0)}k`}
                                                        focusedTeams={focusedTeams}
                                                        onTeamClick={handleTeamClick}
                                                    />
                                                    <ComparativeScatterPlot
                                                        title="Features vs Unit Sales"
                                                        xLabel="Features (Count)"
                                                        yLabel="Unit Sales"
                                                        data={scatterData.map(d => ({ name: d.name, x: d.features, y: d.unitSales, fill: d.fill }))}
                                                        xFormatter={(val) => val.toFixed(1)}
                                                        yFormatter={(val) => val.toLocaleString()}
                                                        focusedTeams={focusedTeams}
                                                        onTeamClick={handleTeamClick}
                                                    />
                                                </div>
                                            </div>

                                            {/* Row 3: Marketing Strategy */}
                                            <div>
                                                <h4 className="text-lg font-semibold text-gray-800 mb-4 border-l-4 border-indigo-500 pl-3">Marketing Strategy Impact</h4>
                                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                                    <ComparativeScatterPlot
                                                        title="Marketing vs Market Share"
                                                        xLabel={`Marketing Spend (${currency})`}
                                                        yLabel="Market Share (%)"
                                                        data={scatterData.map(d => ({ name: d.name, x: d.promotion, y: d.marketShare, fill: d.fill }))}
                                                        xFormatter={(val) => `${currency}${(val / 1000).toFixed(0)}k`}
                                                        yFormatter={(val) => `${val.toFixed(1)}%`}
                                                        focusedTeams={focusedTeams}
                                                        onTeamClick={handleTeamClick}
                                                    />
                                                    <ComparativeScatterPlot
                                                        title="Marketing vs Profit"
                                                        xLabel={`Marketing Spend (${currency})`}
                                                        yLabel={`Net Profit (${currency})`}
                                                        data={scatterData.map(d => ({ name: d.name, x: d.promotion, y: d.netProfit, fill: d.fill }))}
                                                        xFormatter={(val) => `${currency}${(val / 1000).toFixed(0)}k`}
                                                        yFormatter={(val) => `${currency}${(val / 1000).toFixed(0)}k`}
                                                        focusedTeams={focusedTeams}
                                                        onTeamClick={handleTeamClick}
                                                    />
                                                    <ComparativeScatterPlot
                                                        title="Marketing vs Unit Sales"
                                                        xLabel={`Marketing Spend (${currency})`}
                                                        yLabel="Unit Sales"
                                                        data={scatterData.map(d => ({ name: d.name, x: d.promotion, y: d.unitSales, fill: d.fill }))}
                                                        xFormatter={(val) => `${currency}${(val / 1000).toFixed(0)}k`}
                                                        yFormatter={(val) => val.toLocaleString()}
                                                        focusedTeams={focusedTeams}
                                                        onTeamClick={handleTeamClick}
                                                    />
                                                </div>
                                            </div>

                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Hidden Insights Table */}
                    <div className="mb-8">
                        <HiddenInsightsTable teams={teams} />
                    </div>

                    {/* Logistics Comparison Table */}
                    <div className="mb-8">
                        <LogisticsComparisonTable teams={teams} />
                    </div>
                </div>
            )}

            {activeTab === 'trends' && (
                <TrendAnalysisView roundData={roundData} teams={teams} onFileUpload={onFileUpload} />
            )}


        </div>
    );
}

function RegionalAnalysis({ region, teamA, teamB, selectedTech }: { region: 'usa' | 'asia' | 'europe', teamA: TeamData, teamB: TeamData, selectedTech: string }) {
    const allTechs = Object.keys(TECH_NAME_MAP).filter(k => k.startsWith('Tech'));
    // Fallback if TECH_NAME_MAP is not consistent with usage (e.g. if we want the Translated Names as the list?)
    // Actually, allTechs usually iterates over the internal keys 'Tech 1'...'Tech 4' to access data objects.
    // The data objects (prices, margins) are keyed by 'Tech 1' etc in `TeamData`.
    // So `allTechs` should be ['Tech 1', 'Tech 2', 'Tech 3', 'Tech 4'].
    const techKeys = ['Tech 1', 'Tech 2', 'Tech 3', 'Tech 4'];
    const techs = selectedTech === 'All' ? techKeys : [selectedTech];

    let currency = '$';
    if (region === 'asia') currency = '¥';
    if (region === 'europe') currency = '€';

    // Prepare data for all charts
    const data = techs.map(tech => {
        const priceA = teamA.prices?.[region]?.[tech] || 0;
        const priceB = teamB.prices?.[region]?.[tech] || 0;

        const marginA = teamA.margins?.[region]?.[tech];
        const marginB = teamB.margins?.[region]?.[tech];

        const salesA = Math.abs(teamA.logistics[region]?.[tech]?.sales || 0);
        const salesB = Math.abs(teamB.logistics[region]?.[tech]?.sales || 0);

        // Updated Formulas per User Request:
        // Unit Cost = Total Variable Cost / Sales Volume
        // Unit Profit = (Total Revenue / Sales Volume) - Unit Cost

        const realizedPriceA = salesA > 0 ? (marginA?.sales || 0) / salesA : 0;
        const realizedPriceB = salesB > 0 ? (marginB?.sales || 0) / salesB : 0;

        const costA = salesA > 0 ? (marginA?.variableCosts || 0) / salesA : 0;
        const costB = salesB > 0 ? (marginB?.variableCosts || 0) / salesB : 0;

        // Use Realized Price for Profit Calculation (Outcome) but keep List Price for Strategy Chart
        const profitA = realizedPriceA - costA;
        const profitB = realizedPriceB - costB;

        const shareA = teamA.marketShare[region]?.[tech] || 0;
        const shareB = teamB.marketShare[region]?.[tech] || 0;

        const promoA = marginA?.promotion || 0;
        const promoB = marginB?.promotion || 0;

        return {
            name: getTechLabel(tech), // Use translated name for display
            priceA, priceB,
            costA, costB,
            profitA, profitB,
            shareA, shareB,
            salesA, salesB,
            promoA, promoB
        };
    });

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <ComparisonBarChart
                title={`Price Strategy (${currency})`}
                data={data}
                keys={['priceA', 'priceB']}
                teamNames={[teamA.name, teamB.name]}
                formatter={(val) => `${currency}${val}`}
            />
            <ComparisonBarChart
                title={`Unit Cost (${currency})`}
                data={data}
                keys={['costA', 'costB']}
                teamNames={[teamA.name, teamB.name]}
                formatter={(val) => `${currency}${val.toFixed(1)}`}
            />
            <ComparisonBarChart
                title={`Unit Profit (${currency})`}
                data={data}
                keys={['profitA', 'profitB']}
                teamNames={[teamA.name, teamB.name]}
                formatter={(val) => `${currency}${val.toFixed(1)}`}
            />
            <ComparisonBarChart
                title="Market Share (%)"
                data={data}
                keys={['shareA', 'shareB']}
                teamNames={[teamA.name, teamB.name]}
                formatter={(val) => `${val.toFixed(1)}%`}
            />
            <ComparisonBarChart
                title="Sales Volume (Units)"
                data={data}
                keys={['salesA', 'salesB']}
                teamNames={[teamA.name, teamB.name]}
                formatter={(val) => `${(val / 1000).toFixed(1)}k`}
            />
            <ComparisonBarChart
                title="Promotion Spend ($)"
                data={data}
                keys={['promoA', 'promoB']}
                teamNames={[teamA.name, teamB.name]}
                formatter={(val) => `$${(val / 1000).toFixed(0)}k`}
            />
        </div>
    );
}

function ComparisonBarChart({ title, data, keys, teamNames, formatter }: {
    title: string,
    data: any[],
    keys: [string, string],
    teamNames: [string, string],
    formatter: (val: number) => string
}) {
    return (
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <h4 className="text-lg font-semibold text-gray-700 mb-4 text-center">{title}</h4>
            <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data} margin={{ top: 20, right: 5, left: -10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                        <YAxis tick={{ fontSize: 12 }} tickFormatter={(val) => formatter(val).replace(/[^\d\w.%]/g, '')} />
                        <Tooltip formatter={formatter} />
                        <Legend wrapperStyle={{ fontSize: '12px' }} />
                        <Bar name={teamNames[0]} dataKey={keys[0]} fill="#3b82f6" radius={[4, 4, 0, 0]}>
                            <LabelList
                                dataKey={keys[0]}
                                position="top"
                                formatter={(val: any) => formatter(val)}
                                style={{ fontSize: '10px', fill: '#666' }}
                            />
                        </Bar>
                        <Bar name={teamNames[1]} dataKey={keys[1]} fill="#f97316" radius={[4, 4, 0, 0]}>
                            <LabelList
                                dataKey={keys[1]}
                                position="top"
                                formatter={(val: any) => formatter(val)}
                                style={{ fontSize: '10px', fill: '#666' }}
                            />
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
function TrendAnalysisView({ roundData, teams, onFileUpload }: {
    roundData: RoundData[],
    teams: TeamData[],
    onFileUpload: (files: File[]) => Promise<void>
}) {
    const [selectedTech, setSelectedTech] = useState("Tech 1");
    const [selectedRegion, setSelectedRegion] = useState<'usa' | 'asia' | 'europe'>('usa');
    const [isUploadOpen, setIsUploadOpen] = useState(false);
    const [focusedTeam, setFocusedTeam] = useState<string | null>(null);

    const handleTeamClick = (teamName: string) => {
        setFocusedTeam(prev => prev === teamName ? null : teamName);
    };

    // Extract unique team names from the latest round
    const teamNames = teams.map(t => t.name);

    // Prepare data structure for recharts
    const prepareChartData = (metricExtractor: (team: TeamData) => number) => {
        // Create template for 6 rounds
        const templateRounds = Array.from({ length: 6 }, (_, i) => `Round ${i + 1}`);

        return templateRounds.map((templateName, index) => {
            // Find existing round by index (assuming chronological order in roundData)
            const round = roundData[index];

            const dataPoint: any = {
                roundName: round ? round.roundName : templateName
            };

            if (round) {
                round.teams.forEach(team => {
                    if (teamNames.includes(team.name)) {
                        dataPoint[team.name] = metricExtractor(team);
                    }
                });
            }
            return dataPoint;
        });
    };

    const priceData = prepareChartData((team) => team.prices[selectedRegion]?.[selectedTech] || 0);
    const marketingData = prepareChartData((team) => team.margins[selectedRegion]?.[selectedTech]?.promotion || 0);
    const featureData = prepareChartData((team) => team.features[selectedRegion]?.[selectedTech] || 0);
    const marketShareData = prepareChartData((team) => team.marketShare[selectedRegion]?.[selectedTech] || 0);
    const unitSalesData = prepareChartData((team) => team.logistics[selectedRegion]?.[selectedTech]?.sales || 0);
    const profitData = prepareChartData((team) => team.margins[selectedRegion]?.[selectedTech]?.grossProfit || 0);
    const unitCostData = prepareChartData((team) => {
        const costs = team.margins[selectedRegion]?.[selectedTech]?.variableCosts || 0;
        const units = team.logistics[selectedRegion]?.[selectedTech]?.sales || 0;
        return units > 0 ? costs / units : 0;
    });

    let currency = '$';
    if (selectedRegion === 'asia') currency = '¥';
    if (selectedRegion === 'europe') currency = '€';

    const renderCustomTooltip = ({ active, payload, label, data, formatter }: any) => {
        if (!active || !payload || !payload.length) return null;

        // Find current index in data
        const currentIndex = data.findIndex((d: any) => d.roundName === label);
        const prevData = currentIndex > 0 ? data[currentIndex - 1] : null;

        return (
            <div className="bg-white/95 backdrop-blur-sm p-3 border border-gray-100 shadow-lg rounded-xl text-sm z-50">
                <p className="font-bold text-gray-900 mb-2 pb-1 border-b border-gray-100">{label}</p>
                <div className="space-y-1">
                    {payload.map((entry: any) => {
                        // Filter if focused
                        if (focusedTeam && entry.name !== focusedTeam) return null;

                        const teamName = entry.name;
                        const currentVal = entry.value;
                        const prevVal = prevData ? prevData[teamName] : null;

                        // Determine change style
                        let changeText = "";
                        let changeColor = "text-gray-900"; // Default color

                        if (prevVal !== null && prevVal !== undefined) {
                            changeText = `${formatter(prevVal)} → ${formatter(currentVal)}`;
                            if (currentVal > prevVal) {
                                changeColor = "text-emerald-600"; // Jade/Green for increase
                            } else if (currentVal < prevVal) {
                                changeColor = "text-red-700"; // Maroon/Red for decrease
                            }
                        } else {
                            changeText = `${formatter(currentVal)}`;
                        }

                        return (
                            <div key={teamName} className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }}></span>
                                <span className="font-medium text-gray-700">{teamName}:</span>
                                <span className={`font-mono font-semibold ${changeColor}`}>
                                    {changeText}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <TrendingUp className="w-6 h-6 text-blue-600" />
                    Multi-Round Trend Analysis
                </h3>

                <div className="flex flex-col sm:flex-row gap-4 items-center">
                    {/* Upload Button */}
                    <button
                        onClick={() => setIsUploadOpen(!isUploadOpen)}
                        className={clsx(
                            "px-4 py-1.5 text-sm font-medium rounded-md transition-all",
                            isUploadOpen ? "bg-red-50 text-red-600" : "bg-blue-50 text-blue-600 hover:bg-blue-100"
                        )}
                    >
                        <Upload className="w-4 h-4" />
                        {isUploadOpen ? 'Close Upload' : 'Add More Data'}
                    </button>

                    {/* Region Selector */}
                    <div className="flex bg-gray-100 p-1 rounded-lg">
                        {['USA', 'Asia', 'Europe'].map(r => (
                            <button
                                key={r}
                                onClick={() => setSelectedRegion(r.toLowerCase() as any)}
                                className={clsx(
                                    "px-4 py-1.5 text-sm font-medium rounded-md transition-all",
                                    selectedRegion === r.toLowerCase()
                                        ? "bg-white text-gray-900 shadow-sm"
                                        : "text-gray-500 hover:text-gray-700"
                                )}
                            >
                                {r}
                            </button>
                        ))}
                    </div>

                    {/* Tech Selector */}
                    <div className="flex bg-gray-100 p-1 rounded-lg">
                        {['Tech 1', 'Tech 2', 'Tech 3', 'Tech 4'].map(tech => (
                            <button
                                key={tech}
                                onClick={() => setSelectedTech(tech)}
                                className={clsx(
                                    "px-4 py-1.5 text-sm font-medium rounded-md transition-all",
                                    selectedTech === tech
                                        ? "bg-white text-blue-600 shadow-sm"
                                        : "text-gray-500 hover:text-gray-700"
                                )}
                            >
                                {tech}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {isUploadOpen && (
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 animate-in fade-in slide-in-from-top-4">
                    <h4 className="text-lg font-semibold text-gray-800 mb-4">Add More Round Results</h4>
                    <p className="text-sm text-gray-500 mb-6">
                        Upload additional round files (e.g., results-r03.xls) to verify trends. The system will automatically merge and sort them.
                    </p>
                    <FileUpload onFilesSelected={async (files) => {
                        await onFileUpload(files);
                        setIsUploadOpen(false);
                    }} />
                </div>
            )}

            <div className="grid grid-cols-1 gap-8">
                {/* Profit Trend Chart */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h4 className="text-lg font-semibold text-gray-800 mb-6 border-l-4 border-indigo-500 pl-3">
                        Profit Trend (Contribution)
                    </h4>
                    <div className="h-[550px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={profitData} margin={{ top: 10, right: 30, left: 20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="roundName" />
                                <YAxis tickFormatter={(val) => `${currency}${val.toLocaleString()}`} domain={['auto', 'auto']} />
                                <Tooltip content={(props) => renderCustomTooltip({ ...props, data: profitData, formatter: (val: number) => `${currency}${val.toLocaleString()}` })} />
                                <Legend onClick={(e: any) => e.value && handleTeamClick(e.value)} wrapperStyle={{ cursor: 'pointer' }} />
                                {teamNames.map((team, index) => {
                                    const color = TEAM_COLORS[index % TEAM_COLORS.length];
                                    const isDimmed = focusedTeam && focusedTeam !== team;
                                    return (
                                        <Line
                                            key={team}
                                            type="monotone"
                                            dataKey={team}
                                            stroke={color}
                                            strokeWidth={3}
                                            strokeDasharray="5 5"
                                            strokeOpacity={isDimmed ? 0.1 : 1}
                                            dot={{ r: 6, strokeWidth: 0, fill: color }}
                                            activeDot={{ r: 9, strokeWidth: 0, fill: color }}
                                            connectNulls={true}
                                            cursor="pointer"
                                            onClick={() => handleTeamClick(team)}
                                        />
                                    );
                                })}
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
                {/* Price Trend Chart */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h4 className="text-lg font-semibold text-gray-800 mb-6 border-l-4 border-blue-500 pl-3">
                        Selling Price Trend ({selectedTech} - {selectedRegion.toUpperCase()})
                    </h4>
                    <div className="h-[550px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={priceData} margin={{ top: 10, right: 30, left: 20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="roundName" />
                                <YAxis tickFormatter={(val) => `${currency}${val}`} domain={['auto', 'auto']} />
                                <Tooltip content={(props) => renderCustomTooltip({ ...props, data: priceData, formatter: (val: number) => `${currency}${val}` })} />
                                <Legend onClick={(e: any) => e.value && handleTeamClick(e.value)} wrapperStyle={{ cursor: 'pointer' }} />
                                {teamNames.map((team, index) => {
                                    const color = TEAM_COLORS[index % TEAM_COLORS.length];
                                    const isDimmed = focusedTeam && focusedTeam !== team;
                                    return (
                                        <Line
                                            key={team}
                                            type="monotone"
                                            dataKey={team}
                                            stroke={color}
                                            strokeWidth={3}
                                            strokeDasharray="5 5"
                                            strokeOpacity={isDimmed ? 0.1 : 1}
                                            dot={{ r: 6, strokeWidth: 0, fill: color }}
                                            activeDot={{ r: 9, strokeWidth: 0, fill: color }}
                                            connectNulls={true}
                                            cursor="pointer"
                                            onClick={() => handleTeamClick(team)}
                                        />
                                    );
                                })}
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Unit Cost Trend Chart */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h4 className="text-lg font-semibold text-gray-800 mb-6 border-l-4 border-red-500 pl-3">
                        Unit Cost Trend (Variable)
                    </h4>
                    <div className="h-[550px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={unitCostData} margin={{ top: 10, right: 30, left: 20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="roundName" />
                                <YAxis tickFormatter={(val) => `${currency}${val.toLocaleString(undefined, { maximumFractionDigits: 0 })}`} domain={['auto', 'auto']} />
                                <Tooltip content={(props) => renderCustomTooltip({ ...props, data: unitCostData, formatter: (val: number) => `${currency}${val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` })} />
                                <Legend onClick={(e: any) => e.value && handleTeamClick(e.value)} wrapperStyle={{ cursor: 'pointer' }} />
                                {teamNames.map((team, index) => {
                                    const color = TEAM_COLORS[index % TEAM_COLORS.length];
                                    const isDimmed = focusedTeam && focusedTeam !== team;
                                    return (
                                        <Line
                                            key={team}
                                            type="monotone"
                                            dataKey={team}
                                            stroke={color}
                                            strokeWidth={3}
                                            strokeDasharray="5 5"
                                            strokeOpacity={isDimmed ? 0.1 : 1}
                                            dot={{ r: 6, strokeWidth: 0, fill: color }}
                                            activeDot={{ r: 9, strokeWidth: 0, fill: color }}
                                            connectNulls={true}
                                            cursor="pointer"
                                            onClick={() => handleTeamClick(team)}
                                        />
                                    );
                                })}
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Marketing Trend Chart */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h4 className="text-lg font-semibold text-gray-800 mb-6 border-l-4 border-purple-500 pl-3">
                        Marketing/Promotion Spending Trend
                    </h4>
                    <div className="h-[550px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={marketingData} margin={{ top: 10, right: 30, left: 20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="roundName" />
                                <YAxis tickFormatter={(val) => `$${(val / 1000).toFixed(0)}k`} />
                                <Tooltip content={(props) => renderCustomTooltip({ ...props, data: marketingData, formatter: (val: number) => `$${val.toLocaleString()}` })} />
                                <Legend onClick={(e: any) => e.value && handleTeamClick(e.value)} wrapperStyle={{ cursor: 'pointer' }} />
                                {teamNames.map((team, index) => {
                                    const color = TEAM_COLORS[index % TEAM_COLORS.length];
                                    const isDimmed = focusedTeam && focusedTeam !== team;
                                    return (
                                        <Line
                                            key={team}
                                            type="monotone"
                                            dataKey={team}
                                            stroke={color}
                                            strokeWidth={3}
                                            strokeDasharray="5 5"
                                            strokeOpacity={isDimmed ? 0.1 : 1}
                                            dot={{ r: 6, strokeWidth: 0, fill: color }}
                                            activeDot={{ r: 9, strokeWidth: 0, fill: color }}
                                            connectNulls={true}
                                            cursor="pointer"
                                            onClick={() => handleTeamClick(team)}
                                        />
                                    );
                                })}
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Feature Count Trend Chart */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h4 className="text-lg font-semibold text-gray-800 mb-6 border-l-4 border-green-500 pl-3">
                        Feature Count Strategy Trend
                    </h4>
                    <div className="h-[550px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={featureData} margin={{ top: 10, right: 30, left: 20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="roundName" />
                                <YAxis allowDecimals={false} domain={[0, 'auto']} />
                                <Tooltip content={(props) => renderCustomTooltip({ ...props, data: featureData, formatter: (val: number) => val.toString() })} />
                                <Legend onClick={(e: any) => e.value && handleTeamClick(e.value)} wrapperStyle={{ cursor: 'pointer' }} />
                                {teamNames.map((team, index) => {
                                    const color = TEAM_COLORS[index % TEAM_COLORS.length];
                                    const isDimmed = focusedTeam && focusedTeam !== team;
                                    return (
                                        <Line
                                            key={team}
                                            type="stepAfter"
                                            dataKey={team}
                                            stroke={color}
                                            strokeWidth={3}
                                            strokeDasharray="5 5"
                                            strokeOpacity={isDimmed ? 0.1 : 1}
                                            dot={{ r: 6, strokeWidth: 0, fill: color }}
                                            activeDot={{ r: 9, strokeWidth: 0, fill: color }}
                                            connectNulls={true}
                                            cursor="pointer"
                                            onClick={() => handleTeamClick(team)}
                                        />
                                    );
                                })}
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Market Share Trend Chart */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h4 className="text-lg font-semibold text-gray-800 mb-6 border-l-4 border-orange-500 pl-3">
                        Market Share Trend (%)
                    </h4>
                    <div className="h-[550px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={marketShareData} margin={{ top: 10, right: 30, left: 20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="roundName" />
                                <YAxis tickFormatter={(val) => `${val}%`} domain={[4, 'auto']} />
                                <Tooltip content={(props) => renderCustomTooltip({ ...props, data: marketShareData, formatter: (val: number) => `${val.toFixed(2)}%` })} />
                                <Legend onClick={(e: any) => e.value && handleTeamClick(e.value)} wrapperStyle={{ cursor: 'pointer' }} />
                                {teamNames.map((team, index) => {
                                    const color = TEAM_COLORS[index % TEAM_COLORS.length];
                                    const isDimmed = focusedTeam && focusedTeam !== team;
                                    return (
                                        <Line
                                            key={team}
                                            type="monotone"
                                            dataKey={team}
                                            stroke={color}
                                            strokeWidth={3}
                                            strokeDasharray="5 5"
                                            strokeOpacity={isDimmed ? 0.1 : 1}
                                            dot={{ r: 6, strokeWidth: 0, fill: color }}
                                            activeDot={{ r: 9, strokeWidth: 0, fill: color }}
                                            connectNulls={true}
                                            cursor="pointer"
                                            onClick={() => handleTeamClick(team)}
                                        />
                                    );
                                })}
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Unit Sales Trend Chart */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h4 className="text-lg font-semibold text-gray-800 mb-6 border-l-4 border-teal-500 pl-3">
                        Unit Sales Trend
                    </h4>
                    <div className="h-[550px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={unitSalesData} margin={{ top: 10, right: 30, left: 20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="roundName" />
                                <YAxis tickFormatter={(val) => val.toLocaleString()} domain={['auto', 'auto']} />
                                <Tooltip content={(props) => renderCustomTooltip({ ...props, data: unitSalesData, formatter: (val: number) => val.toLocaleString() })} />
                                <Legend onClick={(e: any) => e.value && handleTeamClick(e.value)} wrapperStyle={{ cursor: 'pointer' }} />
                                {teamNames.map((team, index) => {
                                    const color = TEAM_COLORS[index % TEAM_COLORS.length];
                                    const isDimmed = focusedTeam && focusedTeam !== team;
                                    return (
                                        <Line
                                            key={team}
                                            type="monotone"
                                            dataKey={team}
                                            stroke={color}
                                            strokeWidth={3}
                                            strokeDasharray="5 5"
                                            strokeOpacity={isDimmed ? 0.1 : 1}
                                            dot={{ r: 6, strokeWidth: 0, fill: color }}
                                            activeDot={{ r: 9, strokeWidth: 0, fill: color }}
                                            connectNulls={true}
                                            cursor="pointer"
                                            onClick={() => handleTeamClick(team)}
                                        />
                                    );
                                })}
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
}
