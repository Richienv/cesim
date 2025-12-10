import React, { useState, useMemo } from 'react';
import { TeamData } from '@/lib/types';
import { calculateRankings, TeamRank } from '@/lib/ranking';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend, PieChart, Pie, Cell, LabelList
} from 'recharts';
import { ArrowRightLeft, TrendingUp, DollarSign, Activity, Target, Users, Factory, Truck, AlertCircle, Scale, Box, Trophy, Medal } from 'lucide-react';
import { clsx } from 'clsx';
import { ComparisonPieCharts } from './ComparisonPieCharts';
import { ManufacturingPieCharts } from './ManufacturingPieCharts';
import { DetailedMarketAnalysis } from './DetailedMarketAnalysis';
import { RegionalStrategyTable } from './RegionalStrategyTable';
import { HiddenInsightsTable } from './HiddenInsightsTable';
import { LogisticsComparisonTable } from './LogisticsComparisonTable';

interface ComparisonViewProps {
    teams: TeamData[];
}

export function ComparisonView({ teams }: ComparisonViewProps) {
    const [activeTab, setActiveTab] = useState<'comparison' | 'leaderboard'>('leaderboard');
    const [teamAId, setTeamAId] = useState<string>(teams[0]?.name || "");
    const [teamBId, setTeamBId] = useState<string>(teams[1]?.name || "");
    const [cardOrder, setCardOrder] = useState<string[]>(['commercial', 'marketing', 'operations']);
    const [selectedTech, setSelectedTech] = useState<string>('All');
    const [selectedRegion, setSelectedRegion] = useState<'global' | 'usa' | 'asia' | 'europe'>('global');
    const [manufRegion, setManufRegion] = useState<'global' | 'usa' | 'asia' | 'europe'>('global');
    const [manufTech, setManufTech] = useState<string>('All');

    const handleMoveCard = (dragIndex: number, hoverIndex: number) => {
        const newOrder = [...cardOrder];
        const [removed] = newOrder.splice(dragIndex, 1);
        newOrder.splice(hoverIndex, 0, removed);
        setCardOrder(newOrder);
    };

    const teamA = useMemo(() => teams.find(t => t.name === teamAId), [teams, teamAId]);
    const teamB = useMemo(() => teams.find(t => t.name === teamBId), [teams, teamBId]);

    const rankings = useMemo(() => calculateRankings(teams), [teams]);

    if (!teamA || !teamB) return <div>Select teams to compare</div>;

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
            avgCapacityUsage
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

    const manufacturingComparisonData = [
        { name: 'In-House', A: metricsA.totalInHouse, B: metricsB.totalInHouse },
        { name: 'Contract', A: metricsA.totalContract, B: metricsB.totalContract },
        { name: 'Buffer Stock', A: metricsA.totalBuffer, B: metricsB.totalBuffer },
    ];

    // Radar Chart Data (Normalized 0-100 for visualization)
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
        { subject: 'Efficiency', ...normalize(100 - (metricsA.totalUnsatisfied > 0 ? 20 : 0), 100 - (metricsB.totalUnsatisfied > 0 ? 20 : 0)), fullMark: 100 }, // Rough proxy
        { subject: 'Gross Profit', ...normalize(metricsA.grossProfit, metricsB.grossProfit), fullMark: 100 },
    ];

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
                </div>
            </div>

            {activeTab === 'leaderboard' ? (
                <div className="space-y-6">
                    {/* Top 3 Podium */}
                    <div className="grid grid-cols-3 gap-4 mb-8 items-end">
                        {/* 2nd Place */}
                        {rankings[1] && (
                            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center relative order-1">
                                <div className="absolute -top-4 bg-gray-200 text-gray-600 w-8 h-8 rounded-full flex items-center justify-center font-bold border-2 border-white shadow-sm">2</div>
                                <div className="text-3xl mb-2">🥈</div>
                                <h3 className="font-bold text-gray-900 text-xl text-center">{rankings[1].teamName}</h3>
                                <div className="text-base text-gray-500 font-medium">TSR: {rankings[1].metrics.tsr.toFixed(2)}%</div>
                            </div>
                        )}

                        {/* 1st Place */}
                        {rankings[0] && (
                            <div className="bg-gradient-to-b from-yellow-50 to-white p-8 rounded-xl shadow-md border border-yellow-200 flex flex-col items-center relative order-2 transform -translate-y-4 z-10">
                                <div className="absolute -top-5 bg-yellow-400 text-white w-10 h-10 rounded-full flex items-center justify-center font-bold border-4 border-white shadow-sm text-xl">1</div>
                                <div className="text-5xl mb-3">🏆</div>
                                <h3 className="font-bold text-gray-900 text-2xl text-center">{rankings[0].teamName}</h3>
                                <div className="text-lg text-yellow-700 font-bold bg-yellow-100 px-3 py-1 rounded-full mt-2">TSR: {rankings[0].metrics.tsr.toFixed(2)}%</div>
                            </div>
                        )}

                        {/* 3rd Place */}
                        {rankings[2] && (
                            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center relative order-3">
                                <div className="absolute -top-4 bg-orange-100 text-orange-600 w-8 h-8 rounded-full flex items-center justify-center font-bold border-2 border-white shadow-sm">3</div>
                                <div className="text-3xl mb-2">🥉</div>
                                <h3 className="font-bold text-gray-900 text-xl text-center">{rankings[2].teamName}</h3>
                                <div className="text-base text-gray-500 font-medium">TSR: {rankings[2].metrics.tsr.toFixed(2)}%</div>
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
                        <h3 className="text-2xl font-bold text-gray-900">Regional Deep Dive (Momentum)</h3>

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

        </div>
    );
}

function RegionalAnalysis({ region, teamA, teamB, selectedTech }: { region: 'usa' | 'asia' | 'europe', teamA: TeamData, teamB: TeamData, selectedTech: string }) {
    const allTechs = ['Tech 1', 'Tech 2', 'Tech 3', 'Tech 4'];
    const techs = selectedTech === 'All' ? allTechs : [selectedTech];

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

        const costA = salesA > 0 ? (marginA?.variableCosts || 0) / salesA : 0;
        const costB = salesB > 0 ? (marginB?.variableCosts || 0) / salesB : 0;

        const profitA = priceA - costA;
        const profitB = priceB - costB;

        const shareA = teamA.marketShare[region]?.[tech] || 0;
        const shareB = teamB.marketShare[region]?.[tech] || 0;

        const promoA = marginA?.promotion || 0;
        const promoB = marginB?.promotion || 0;

        return {
            name: tech,
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
