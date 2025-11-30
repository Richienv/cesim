import React, { useState, useMemo } from 'react';
import { TeamData } from '@/lib/types';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend
} from 'recharts';
import { ArrowRightLeft, TrendingUp, DollarSign, Activity, Target, Users } from 'lucide-react';
import { clsx } from 'clsx';

interface ComparisonViewProps {
    teams: TeamData[];
}

export function ComparisonView({ teams }: ComparisonViewProps) {
    const [teamAId, setTeamAId] = useState<string>(teams[0]?.name || "");
    const [teamBId, setTeamBId] = useState<string>(teams[1]?.name || "");

    const teamA = useMemo(() => teams.find(t => t.name === teamAId), [teams, teamAId]);
    const teamB = useMemo(() => teams.find(t => t.name === teamBId), [teams, teamBId]);

    if (!teamA || !teamB) return <div>Select teams to compare</div>;

    // --- Metrics Calculation ---

    const getMetrics = (team: TeamData) => {
        const globalIncome = team.financials.incomeStatement.global;
        const revenue = globalIncome["Sales revenue"] || 0;
        const profit = globalIncome["Profit for the round"] || 0;
        const grossProfit = revenue - (globalIncome["Variable production costs"] || 0);
        const ebitda = globalIncome["Operating profit before depreciation (EBITDA)"] || 0;
        const cumulativeEarnings = team.financials.balanceSheet.global["Retained earnings"] || 0;

        // Market Share (Global Tech 1 as proxy or average?)
        // Let's sum up all market shares
        let totalMarketShare = 0;
        let count = 0;
        Object.values(team.marketShare.global).forEach(v => { totalMarketShare += v; count++; });
        const avgMarketShare = count > 0 ? totalMarketShare / count : 0;

        return {
            revenue,
            profit,
            grossProfit,
            ebitda,
            cumulativeEarnings,
            avgMarketShare
        };
    };

    const metricsA = getMetrics(teamA);
    const metricsB = getMetrics(teamB);

    // --- Chart Data ---

    const financialComparisonData = [
        { name: 'Revenue', A: metricsA.revenue, B: metricsB.revenue },
        { name: 'Gross Profit', A: metricsA.grossProfit, B: metricsB.grossProfit },
        { name: 'EBITDA', A: metricsA.ebitda, B: metricsB.ebitda },
        { name: 'Net Profit', A: metricsA.profit, B: metricsB.profit },
    ];

    // Radar Chart Data (Normalized 0-100 for visualization)
    // We need to find max values across all teams to normalize properly, but for now let's just normalize between A and B
    const normalize = (valA: number, valB: number) => {
        const max = Math.max(valA, valB) || 1;
        return {
            A: (valA / max) * 100,
            B: (valB / max) * 100,
            rawA: valA,
            rawB: valB
        };
    };

    const radarData = [
        { subject: 'Revenue', ...normalize(metricsA.revenue, metricsB.revenue), fullMark: 100 },
        { subject: 'Profit', ...normalize(metricsA.profit, metricsB.profit), fullMark: 100 },
        { subject: 'Market Share', ...normalize(metricsA.avgMarketShare, metricsB.avgMarketShare), fullMark: 100 },
        { subject: 'Cum. Earnings', ...normalize(metricsA.cumulativeEarnings, metricsB.cumulativeEarnings), fullMark: 100 },
        { subject: 'Gross Profit', ...normalize(metricsA.grossProfit, metricsB.grossProfit), fullMark: 100 },
    ];

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Team Selectors */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="flex flex-col md:flex-row items-center justify-center gap-8">
                    <div className="w-full md:w-1/3">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Team A (Baseline)</label>
                        <select
                            value={teamAId}
                            onChange={(e) => setTeamAId(e.target.value)}
                            className="w-full p-3 bg-blue-50 border border-blue-200 rounded-lg text-gray-900 font-medium focus:ring-blue-500 focus:border-blue-500"
                        >
                            {teams.map(t => <option key={t.name} value={t.name}>{t.name}</option>)}
                        </select>
                    </div>

                    <div className="flex items-center justify-center">
                        <div className="p-3 bg-gray-100 rounded-full">
                            <ArrowRightLeft className="text-gray-500" />
                        </div>
                    </div>

                    <div className="w-full md:w-1/3">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Team B (Competitor)</label>
                        <select
                            value={teamBId}
                            onChange={(e) => setTeamBId(e.target.value)}
                            className="w-full p-3 bg-orange-50 border border-orange-200 rounded-lg text-gray-900 font-medium focus:ring-orange-500 focus:border-orange-500"
                        >
                            {teams.map(t => <option key={t.name} value={t.name}>{t.name}</option>)}
                        </select>
                    </div>
                </div>
            </div>

            {/* Comparison Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <ComparisonCard
                    title="Total Revenue"
                    valA={metricsA.revenue}
                    valB={metricsB.revenue}
                    format={(v) => `$${(v / 1000).toFixed(1)}k`}
                    icon={<DollarSign className="text-gray-400" />}
                />
                <ComparisonCard
                    title="Gross Profit"
                    valA={metricsA.grossProfit}
                    valB={metricsB.grossProfit}
                    format={(v) => `$${(v / 1000).toFixed(1)}k`}
                    icon={<Activity className="text-gray-400" />}
                />
                <ComparisonCard
                    title="Avg Market Share"
                    valA={metricsA.avgMarketShare}
                    valB={metricsB.avgMarketShare}
                    format={(v) => `${v.toFixed(1)}%`}
                    icon={<Users className="text-gray-400" />}
                />
                <ComparisonCard
                    title="Cum. Earnings"
                    valA={metricsA.cumulativeEarnings}
                    valB={metricsB.cumulativeEarnings}
                    format={(v) => `$${(v / 1000).toFixed(1)}k`}
                    icon={<TrendingUp className="text-gray-400" />}
                />
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Financial Bar Chart */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-900 mb-6">Financial Comparison</h3>
                    <div className="h-[350px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={financialComparisonData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="name" />
                                <YAxis tickFormatter={(val) => `$${val / 1000}k`} />
                                <Tooltip formatter={(val: number) => `$${val.toLocaleString()}`} />
                                <Legend />
                                <Bar name={teamA.name} dataKey="A" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                                <Bar name={teamB.name} dataKey="B" fill="#f97316" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Strategy Radar Chart */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-900 mb-6">Strategy Profile</h3>
                    <div className="h-[350px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                                <PolarGrid />
                                <PolarAngleAxis dataKey="subject" />
                                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} />
                                <Radar name={teamA.name} dataKey="A" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
                                <Radar name={teamB.name} dataKey="B" stroke="#f97316" fill="#f97316" fillOpacity={0.3} />
                                <Legend />
                                <Tooltip formatter={(val: number, name: string, props: any) => {
                                    // Try to show raw value if possible, but radar uses normalized. 
                                    // For simplicity, just showing normalized score or we could map back.
                                    // Let's just show the normalized score for now as "Score"
                                    return val.toFixed(0);
                                }} />
                            </RadarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Detailed Market Share Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                    <h4 className="font-semibold text-gray-900">Global Market Share Comparison</h4>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-gray-500 uppercase bg-gray-50">
                            <tr>
                                <th className="px-6 py-3">Technology</th>
                                <th className="px-6 py-3 text-right text-blue-600">{teamA.name}</th>
                                <th className="px-6 py-3 text-right text-orange-600">{teamB.name}</th>
                                <th className="px-6 py-3 text-right">Diff</th>
                            </tr>
                        </thead>
                        <tbody>
                            {['Tech 1', 'Tech 2', 'Tech 3', 'Tech 4'].map(tech => {
                                const shareA = teamA.marketShare.global[tech] || 0;
                                const shareB = teamB.marketShare.global[tech] || 0;
                                const diff = shareA - shareB;

                                return (
                                    <tr key={tech} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                                        <td className="px-6 py-4 font-medium text-gray-900">{tech}</td>
                                        <td className="px-6 py-4 text-right font-medium">{shareA.toFixed(2)}%</td>
                                        <td className="px-6 py-4 text-right font-medium">{shareB.toFixed(2)}%</td>
                                        <td className={clsx("px-6 py-4 text-right font-bold", diff > 0 ? "text-green-600" : "text-red-600")}>
                                            {diff > 0 ? '+' : ''}{diff.toFixed(2)}%
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Regional Deep Dive */}
            <div className="space-y-6">
                <h3 className="text-xl font-bold text-gray-900">Regional Deep Dive</h3>
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                    {['USA', 'Asia', 'Europe'].map(regionName => {
                        const region = regionName.toLowerCase() as 'usa' | 'asia' | 'europe';
                        return (
                            <RegionalComparisonTable
                                key={region}
                                regionName={regionName}
                                region={region}
                                teamA={teamA}
                                teamB={teamB}
                            />
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

function RegionalComparisonTable({ regionName, region, teamA, teamB }: { regionName: string, region: 'usa' | 'asia' | 'europe', teamA: TeamData, teamB: TeamData }) {
    const techs = ['Tech 1', 'Tech 2', 'Tech 3', 'Tech 4'];

    // Determine currencies
    let localCurrency = '$';
    if (region === 'asia') localCurrency = '¥';
    if (region === 'europe') localCurrency = '€';

    const reportingCurrency = '$'; // Financials are in k USD

    // Helper to get metrics
    const getMetrics = (team: TeamData) => {
        const logistics = team.financials.incomeStatement[region]?.["Transportation and tariffs"] || 0;
        let totalUnits = 0;
        const rLogistics = team.logistics[region];
        if (rLogistics) {
            Object.values(rLogistics).forEach(l => totalUnits += Math.abs(l.sales));
        }
        const avgLogistics = totalUnits > 0 ? logistics / totalUnits : 0;
        return { logistics, totalUnits, avgLogistics };
    };

    const mA = getMetrics(teamA);
    const mB = getMetrics(teamB);

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                <h4 className="font-semibold text-gray-900">{regionName}</h4>
            </div>

            {/* High Level Regional Metrics */}
            <div className="p-4 grid grid-cols-2 gap-4 border-b border-gray-100 bg-white">
                <div>
                    <p className="text-xs text-gray-500 mb-1">Avg Logistics / Unit</p>
                    <div className="flex justify-between text-sm">
                        <span className="text-blue-600 font-medium">{reportingCurrency}{mA.avgLogistics.toFixed(2)}</span>
                        <span className="text-orange-600 font-medium">{reportingCurrency}{mB.avgLogistics.toFixed(2)}</span>
                    </div>
                </div>
                <div>
                    <p className="text-xs text-gray-500 mb-1">Total Sales (Units)</p>
                    <div className="flex justify-between text-sm">
                        <span className="text-blue-600 font-medium">{(mA.totalUnits / 1000).toFixed(1)}k</span>
                        <span className="text-orange-600 font-medium">{(mB.totalUnits / 1000).toFixed(1)}k</span>
                    </div>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="text-xs text-gray-500 uppercase bg-gray-50">
                        <tr>
                            <th className="px-4 py-2 min-w-[80px]">Tech</th>
                            <th className="px-4 py-2 text-right text-blue-600 min-w-[100px]">
                                Price<br />
                                <span className="text-[10px] opacity-75">{teamA.name}</span>
                            </th>
                            <th className="px-4 py-2 text-right text-orange-600 min-w-[100px]">
                                Price<br />
                                <span className="text-[10px] opacity-75">{teamB.name}</span>
                            </th>
                            <th className="px-4 py-2 text-right text-blue-600 min-w-[100px]">
                                Promo<br />
                                <span className="text-[10px] opacity-75">{teamA.name}</span>
                            </th>
                            <th className="px-4 py-2 text-right text-orange-600 min-w-[100px]">
                                Promo<br />
                                <span className="text-[10px] opacity-75">{teamB.name}</span>
                            </th>
                            <th className="px-4 py-2 text-right min-w-[80px]">Share<br /><span className="text-[10px] text-gray-400">{teamA.name}</span></th>
                            <th className="px-4 py-2 text-right min-w-[80px]">Share<br /><span className="text-[10px] text-gray-400">{teamB.name}</span></th>
                        </tr>
                    </thead>
                    <tbody>
                        {techs.map(tech => {
                            const priceA = teamA.prices?.[region]?.[tech] || 0;
                            const priceB = teamB.prices?.[region]?.[tech] || 0;
                            const shareA = teamA.marketShare[region]?.[tech] || 0;
                            const shareB = teamB.marketShare[region]?.[tech] || 0;

                            // Get Promotion from Margins
                            const promoA = teamA.margins[region]?.[tech]?.promotion || 0;
                            const promoB = teamB.margins[region]?.[tech]?.promotion || 0;

                            if (priceA === 0 && priceB === 0 && shareA === 0 && shareB === 0) return null;

                            return (
                                <tr key={tech} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                                    <td className="px-4 py-2 font-medium text-gray-900 text-xs">{tech}</td>
                                    <td className="px-4 py-2 text-right font-medium">{localCurrency}{priceA.toFixed(0)}</td>
                                    <td className="px-4 py-2 text-right font-medium">{localCurrency}{priceB.toFixed(0)}</td>
                                    <td className="px-4 py-2 text-right font-medium text-gray-600">{reportingCurrency}{(promoA / 1000).toFixed(0)}k</td>
                                    <td className="px-4 py-2 text-right font-medium text-gray-600">{reportingCurrency}{(promoB / 1000).toFixed(0)}k</td>
                                    <td className="px-4 py-2 text-right text-gray-600">{shareA.toFixed(1)}%</td>
                                    <td className="px-4 py-2 text-right text-gray-600">{shareB.toFixed(1)}%</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

function ComparisonCard({ title, valA, valB, format, icon }: { title: string, valA: number, valB: number, format: (v: number) => string, icon: React.ReactNode }) {
    const diff = valA - valB;
    const isPositive = diff > 0;

    return (
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-start mb-4">
                <p className="text-sm font-medium text-gray-500">{title}</p>
                {icon}
            </div>
            <div className="flex justify-between items-end">
                <div>
                    <div className="text-2xl font-bold text-gray-900">{format(valA)}</div>
                    <div className="text-xs text-gray-400 mt-1">vs {format(valB)}</div>
                </div>
                <div className={clsx("flex items-center text-sm font-medium", isPositive ? "text-green-600" : "text-red-600")}>
                    {isPositive ? '+' : ''}{format(diff)}
                </div>
            </div>
        </div>
    );
}
