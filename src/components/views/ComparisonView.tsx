import React, { useState, useMemo } from 'react';
import { TeamData } from '@/lib/types';
import { calculateRankings, TeamRank } from '@/lib/ranking';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend, PieChart, Pie, Cell
} from 'recharts';
import { ArrowRightLeft, TrendingUp, DollarSign, Activity, Target, Users, Factory, Truck, AlertCircle, Scale, Box, Trophy, Medal } from 'lucide-react';
import { clsx } from 'clsx';
import { ComparisonPieCharts } from './ComparisonPieCharts';
import { ManufacturingPieCharts } from './ManufacturingPieCharts';

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
                                <div className="text-base text-gray-500 font-medium">Score: {rankings[1].totalScore}</div>
                            </div>
                        )}

                        {/* 1st Place */}
                        {rankings[0] && (
                            <div className="bg-gradient-to-b from-yellow-50 to-white p-8 rounded-xl shadow-md border border-yellow-200 flex flex-col items-center relative order-2 transform -translate-y-4 z-10">
                                <div className="absolute -top-5 bg-yellow-400 text-white w-10 h-10 rounded-full flex items-center justify-center font-bold border-4 border-white shadow-sm text-xl">1</div>
                                <div className="text-5xl mb-3">🏆</div>
                                <h3 className="font-bold text-gray-900 text-2xl text-center">{rankings[0].teamName}</h3>
                                <div className="text-lg text-yellow-700 font-bold bg-yellow-100 px-3 py-1 rounded-full mt-2">Score: {rankings[0].totalScore}</div>
                            </div>
                        )}

                        {/* 3rd Place */}
                        {rankings[2] && (
                            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center relative order-3">
                                <div className="absolute -top-4 bg-orange-100 text-orange-600 w-8 h-8 rounded-full flex items-center justify-center font-bold border-2 border-white shadow-sm">3</div>
                                <div className="text-3xl mb-2">🥉</div>
                                <h3 className="font-bold text-gray-900 text-xl text-center">{rankings[2].teamName}</h3>
                                <div className="text-base text-gray-500 font-medium">Score: {rankings[2].totalScore}</div>
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
                                Weighted: TSR (3x), Others (1x)
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
                                        <th className="px-6 py-3 text-right">Mkt Share</th>
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
                                            <td className="px-6 py-4 text-right text-gray-600">{team.metrics.marketShare.toFixed(1)}%</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            ) : (
                <>
                    {/* Team Selectors */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <div className="flex flex-col md:flex-row items-center justify-center gap-8">
                            <div className="w-full md:w-1/3">
                                <label className="block text-base font-medium text-gray-700 mb-2">Team A (Baseline)</label>
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
                                <label className="block text-base font-medium text-gray-700 mb-2">Team B (Competitor)</label>
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



                    {/* Regional Deep Dive */}
                    <div className="space-y-6">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <h3 className="text-2xl font-bold text-gray-900">Regional Deep Dive</h3>

                            {/* Tech Selector */}
                            <div className="flex bg-gray-100 p-1 rounded-lg">
                                {['All', 'Tech 1', 'Tech 2', 'Tech 3', 'Tech 4'].map(tech => (
                                    <button
                                        key={tech}
                                        onClick={() => setSelectedTech(tech)}
                                        className={clsx(
                                            "px-4 py-1.5 text-base font-medium rounded-md transition-all",
                                            selectedTech === tech
                                                ? "bg-white text-gray-900 shadow-sm"
                                                : "text-gray-500 hover:text-gray-700"
                                        )}
                                    >
                                        {tech}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-6">
                            {['USA', 'Asia', 'Europe'].map(regionName => {
                                const region = regionName.toLowerCase() as 'usa' | 'asia' | 'europe';
                                return (
                                    <RegionalComparisonTable
                                        key={region}
                                        regionName={regionName}
                                        region={region}
                                        teamA={teamA}
                                        teamB={teamB}
                                        cardOrder={cardOrder}
                                        onMoveCard={handleMoveCard}
                                        selectedTech={selectedTech}
                                    />
                                );
                            })}
                        </div>
                    </div>

                    {/* Chart Filters */}
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6 flex flex-wrap gap-4 items-center justify-between">
                        <h3 className="text-lg font-bold text-gray-900">Performance Overview</h3>
                        <div className="flex gap-4">
                            {/* Region Selector */}
                            <select
                                value={selectedRegion}
                                onChange={(e) => setSelectedRegion(e.target.value as any)}
                                className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="global">Global</option>
                                <option value="usa">USA</option>
                                <option value="asia">Asia</option>
                                <option value="europe">Europe</option>
                            </select>

                            {/* Tech Selector */}
                            <select
                                value={selectedTech}
                                onChange={(e) => setSelectedTech(e.target.value)}
                                className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="All">All Technologies</option>
                                <option value="Tech 1">Tech 1</option>
                                <option value="Tech 2">Tech 2</option>
                                <option value="Tech 3">Tech 3</option>
                                <option value="Tech 4">Tech 4</option>
                            </select>
                        </div>
                    </div>

                    {/* Comparison Pie Charts */}
                    <ComparisonPieCharts
                        teamA={teamA}
                        teamB={teamB}
                        region={selectedRegion}
                        tech={selectedTech}
                    />

                    {/* Charts */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Financial Bar Chart */}
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                            <h3 className="text-xl font-semibold text-gray-900 mb-6">Financial Comparison</h3>
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
                            <h3 className="text-xl font-semibold text-gray-900 mb-6">Strategy Profile</h3>
                            <div className="h-[350px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                                        <PolarGrid />
                                        <PolarAngleAxis dataKey="subject" />
                                        <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} />
                                        <Radar name={teamA.name} dataKey="A" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
                                        <Radar name={teamB.name} dataKey="B" stroke="#f97316" fill="#f97316" fillOpacity={0.3} />
                                        <Legend />
                                        <Tooltip formatter={(val: number) => val.toFixed(0)} />
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
                            <table className="w-full text-base text-left">
                                <thead className="text-sm text-gray-500 uppercase bg-gray-50">
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

                    {/* NEW: Manufacturing & Logistics Comparison */}
                    <div className="space-y-6">
                        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-wrap gap-4 items-center justify-between">
                            <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                <Truck className="w-6 h-6 text-indigo-500" />
                                Supply Chain & Manufacturing Comparison
                            </h3>
                            <div className="flex gap-4">
                                {/* Region Selector */}
                                <select
                                    value={manufRegion}
                                    onChange={(e) => setManufRegion(e.target.value as any)}
                                    className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <option value="global">Global</option>
                                    <option value="usa">USA</option>
                                    <option value="asia">Asia</option>
                                    <option value="europe">Europe</option>
                                </select>

                                {/* Tech Selector */}
                                <select
                                    value={manufTech}
                                    onChange={(e) => setManufTech(e.target.value)}
                                    className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <option value="All">All Technologies</option>
                                    <option value="Tech 1">Tech 1</option>
                                    <option value="Tech 2">Tech 2</option>
                                    <option value="Tech 3">Tech 3</option>
                                    <option value="Tech 4">Tech 4</option>
                                </select>
                            </div>
                        </div>

                        <ManufacturingPieCharts
                            teamA={teamA}
                            teamB={teamB}
                            region={manufRegion}
                            tech={manufTech}
                        />
                    </div>
                </>
            )}

        </div>
    );
}

function RegionalComparisonTable({
    regionName,
    region,
    teamA,
    teamB,
    cardOrder,
    onMoveCard,
    selectedTech
}: {
    regionName: string,
    region: 'usa' | 'asia' | 'europe',
    teamA: TeamData,
    teamB: TeamData,
    cardOrder: string[],
    onMoveCard: (dragIndex: number, hoverIndex: number) => void,
    selectedTech: string
}) {
    const allTechs = ['Tech 1', 'Tech 2', 'Tech 3', 'Tech 4'];
    const techs = selectedTech === 'All' ? allTechs : [selectedTech];

    // Determine currencies
    let localCurrency = '$';
    if (region === 'asia') localCurrency = '¥';
    if (region === 'europe') localCurrency = '€';

    const reportingCurrency = '$'; // Financials are in k USD

    // Helper to get metrics
    const getMetrics = (team: TeamData, tech: string) => {
        const price = team.prices?.[region]?.[tech] || 0;
        const share = team.marketShare[region]?.[tech] || 0;

        const log = team.logistics[region]?.[tech];
        const sales = log ? Math.abs(log.sales) : 0;
        const exported = log?.exported || 0;
        const buffer = log?.productionBuffer || 0;
        const unmet = log?.unsatisfiedDemand || 0;

        // Use parsed demand if available, otherwise calculate
        const parsedDemand = team.demand?.[region]?.[tech] || 0;
        const totalDemand = parsedDemand > 0 ? parsedDemand : (sales + unmet);

        const marginData = team.margins?.[region]?.[tech];
        const promotion = marginData?.promotion || 0;
        const variableCosts = marginData?.variableCosts || 0;

        const unitCost = sales > 0 ? variableCosts / sales : 0;

        const features = team.features?.[region]?.[tech] || 0;

        return { price, share, sales, exported, buffer, unmet, totalDemand, promotion, unitCost, features };
    };

    // Helper for rendering value with indicator
    const renderValueWithIndicator = (val: number, compareVal: number, inverse: boolean = false, prefix: string = "", suffix: string = "", showIndicator: boolean = true) => {
        if (val === compareVal || !showIndicator) return <>{prefix}{val.toFixed(inverse ? 2 : (Number.isInteger(val) ? 0 : 1))}{suffix}</>;

        const isHigher = val > compareVal;
        const isBetter = inverse ? val < compareVal : val > compareVal;

        const Arrow = isHigher ? "↑" : "↓";
        const colorClass = isBetter ? "text-green-600" : "text-red-600";

        return (
            <span className="flex items-center justify-end">
                {prefix}{val.toFixed(inverse ? 2 : (Number.isInteger(val) ? 0 : 1))}{suffix}
                <span className={`${colorClass} font-bold ml-1`}>{Arrow}</span>
            </span>
        );
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-6">
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                <h4 className="font-bold text-xl text-gray-900">{regionName}</h4>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-base">
                    <thead className="bg-gray-50 text-sm text-gray-500 uppercase">
                        <tr>
                            <th className="px-3 py-3 text-left sticky left-0 bg-gray-50 z-10 border-r border-gray-200">Tech</th>
                            {/* Cost */}
                            <th className="px-3 py-3 text-right text-blue-600 bg-green-50/30 border-l border-gray-100">Cost A</th>
                            <th className="px-3 py-3 text-right text-orange-600 bg-green-50/30">Cost B</th>
                            {/* Price */}
                            <th className="px-3 py-3 text-right text-blue-600 bg-blue-50/30 border-l border-gray-100">Price A</th>
                            <th className="px-3 py-3 text-right text-orange-600 bg-blue-50/30">Price B</th>
                            {/* Promo */}
                            <th className="px-3 py-3 text-right text-blue-600 bg-purple-50/30 border-l border-gray-100">Promo A</th>
                            <th className="px-3 py-3 text-right text-orange-600 bg-purple-50/30">Promo B</th>
                            {/* Sales */}
                            <th className="px-3 py-3 text-right text-blue-600 bg-blue-50/30 border-l border-gray-100">Sales A</th>
                            <th className="px-3 py-3 text-right text-orange-600 bg-blue-50/30">Sales B</th>
                            {/* Profit */}
                            <th className="px-3 py-3 text-right text-blue-600 bg-green-50/30 border-l border-gray-100">Profit A</th>
                            <th className="px-3 py-3 text-right text-orange-600 bg-green-50/30">Profit B</th>
                            {/* Share */}
                            <th className="px-3 py-3 text-right text-blue-600 bg-blue-50/30 border-l border-gray-100">Share A</th>
                            <th className="px-3 py-3 text-right text-orange-600 bg-orange-50/30">Share B</th>
                            {/* Demand */}
                            <th className="px-3 py-3 text-right text-blue-600 bg-purple-50/30 border-l border-gray-100">Demand A</th>
                            <th className="px-3 py-3 text-right text-orange-600 bg-purple-50/30">Demand B</th>
                            {/* Features */}
                            <th className="px-3 py-3 text-right text-blue-600 bg-blue-50/30 border-l border-gray-100">Feat A</th>
                            <th className="px-3 py-3 text-right text-orange-600 bg-orange-50/30">Feat B</th>
                            {/* Buffer */}
                            <th className="px-3 py-3 text-right text-blue-600 bg-green-50/30 border-l border-gray-100">Buf A</th>
                            <th className="px-3 py-3 text-right text-orange-600 bg-green-50/30">Buf B</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {techs.map(tech => {
                            const mA = getMetrics(teamA, tech);
                            const mB = getMetrics(teamB, tech);

                            const profitA = mA.price - mA.unitCost;
                            const profitB = mB.price - mB.unitCost;

                            if (mA.price === 0 && mB.price === 0) return null;
                            return (
                                <tr key={tech} className="hover:bg-gray-50/50">
                                    <td className="px-3 py-3 font-medium text-sm sticky left-0 bg-white z-10 border-r border-gray-100">{tech}</td>
                                    {/* Cost */}
                                    <td className="px-3 py-3 text-right bg-green-50/5 border-l border-gray-100">{renderValueWithIndicator(mA.unitCost, mB.unitCost, true, localCurrency)}</td>
                                    <td className="px-3 py-3 text-right bg-green-50/5">{renderValueWithIndicator(mB.unitCost, mA.unitCost, true, localCurrency, "", false)}</td>
                                    {/* Price */}
                                    <td className="px-3 py-3 text-right bg-blue-50/5 border-l border-gray-100">{renderValueWithIndicator(mA.price, mB.price, false, localCurrency)}</td>
                                    <td className="px-3 py-3 text-right bg-orange-50/5">{renderValueWithIndicator(mB.price, mA.price, false, localCurrency, "", false)}</td>
                                    {/* Promo */}
                                    <td className="px-3 py-3 text-right bg-purple-50/5 border-l border-gray-100">{renderValueWithIndicator(mA.promotion, mB.promotion, false, reportingCurrency, "k")}</td>
                                    <td className="px-3 py-3 text-right bg-purple-50/5">{renderValueWithIndicator(mB.promotion, mA.promotion, false, reportingCurrency, "k", false)}</td>
                                    {/* Sales */}
                                    <td className="px-3 py-3 text-right bg-blue-50/5 border-l border-gray-100">{renderValueWithIndicator(mA.sales, mB.sales, false, "", "k")}</td>
                                    <td className="px-3 py-3 text-right bg-orange-50/5">{renderValueWithIndicator(mB.sales, mA.sales, false, "", "k", false)}</td>
                                    {/* Profit */}
                                    <td className="px-3 py-3 text-right bg-green-50/5 border-l border-gray-100">{renderValueWithIndicator(profitA, profitB, false, reportingCurrency)}</td>
                                    <td className="px-3 py-3 text-right bg-green-50/5">{renderValueWithIndicator(profitB, profitA, false, reportingCurrency, "", false)}</td>
                                    {/* Share */}
                                    <td className="px-3 py-3 text-right bg-blue-50/5 border-l border-gray-100">{renderValueWithIndicator(mA.share, mB.share, false, "", "%")}</td>
                                    <td className="px-3 py-3 text-right bg-orange-50/5">{renderValueWithIndicator(mB.share, mA.share, false, "", "%", false)}</td>
                                    {/* Demand */}
                                    <td className="px-3 py-3 text-right bg-purple-50/5 border-l border-gray-100">{renderValueWithIndicator(mA.totalDemand, mB.totalDemand)}</td>
                                    <td className="px-3 py-3 text-right bg-purple-50/5">{renderValueWithIndicator(mB.totalDemand, mA.totalDemand, false, "", "", false)}</td>
                                    {/* Features */}
                                    <td className="px-3 py-3 text-right bg-blue-50/5 border-l border-gray-100">{renderValueWithIndicator(mA.features, mB.features)}</td>
                                    <td className="px-3 py-3 text-right bg-orange-50/5">{renderValueWithIndicator(mB.features, mA.features, false, "", "", false)}</td>
                                    {/* Buffer */}
                                    <td className="px-3 py-3 text-right bg-green-50/5 border-l border-gray-100">{renderValueWithIndicator(mA.buffer, mB.buffer, true)}</td>
                                    <td className="px-3 py-3 text-right bg-green-50/5">{renderValueWithIndicator(mB.buffer, mA.buffer, true, "", "", false)}</td>
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
                <p className="text-base font-medium text-gray-500">{title}</p>
                {icon}
            </div>
            <div className="flex justify-between items-end">
                <div>
                    <div className="text-3xl font-bold text-gray-900">{format(valA)}</div>
                    <div className="text-sm text-gray-400 mt-1">vs {format(valB)}</div>
                </div>
                <div className={clsx("flex items-center text-base font-medium", isPositive ? "text-green-600" : "text-red-600")}>
                    {isPositive ? '+' : ''}{format(diff)}
                </div>
            </div>
        </div>
    );
}
