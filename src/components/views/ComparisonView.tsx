import React, { useState, useMemo } from 'react';
import { TeamData } from '@/lib/types';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend
} from 'recharts';
import { ArrowRightLeft, TrendingUp, DollarSign, Activity, Target, Users, Factory, Truck, AlertCircle, Scale, Box } from 'lucide-react';
import { clsx } from 'clsx';

interface ComparisonViewProps {
    teams: TeamData[];
}

export function ComparisonView({ teams }: ComparisonViewProps) {
    const [teamAId, setTeamAId] = useState<string>(teams[0]?.name || "");
    const [teamBId, setTeamBId] = useState<string>(teams[1]?.name || "");
    const [cardOrder, setCardOrder] = useState<string[]>(['commercial', 'marketing', 'operations']);
    const [selectedTech, setSelectedTech] = useState<string>('All');

    const handleMoveCard = (dragIndex: number, hoverIndex: number) => {
        const newOrder = [...cardOrder];
        const [removed] = newOrder.splice(dragIndex, 1);
        newOrder.splice(hoverIndex, 0, removed);
        setCardOrder(newOrder);
    };

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



            {/* Regional Deep Dive */}
            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <h3 className="text-xl font-bold text-gray-900">Regional Deep Dive</h3>

                    {/* Tech Selector */}
                    <div className="flex bg-gray-100 p-1 rounded-lg">
                        {['All', 'Tech 1', 'Tech 2', 'Tech 3', 'Tech 4'].map(tech => (
                            <button
                                key={tech}
                                onClick={() => setSelectedTech(tech)}
                                className={clsx(
                                    "px-4 py-1.5 text-sm font-medium rounded-md transition-all",
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

            {/* NEW: Manufacturing & Logistics Comparison */}
            <div className="space-y-6">
                <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <Truck className="w-6 h-6 text-indigo-500" />
                    Supply Chain & Manufacturing Comparison
                </h3>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Manufacturing Volume Chart */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <h4 className="font-semibold text-gray-900 mb-4">Manufacturing Strategy (Volume)</h4>
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={manufacturingComparisonData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="name" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Bar name={teamA.name} dataKey="A" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                                    <Bar name={teamB.name} dataKey="B" fill="#f97316" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Efficiency Metrics */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <ComparisonCard
                            title="Avg Capacity Usage"
                            valA={metricsA.avgCapacityUsage}
                            valB={metricsB.avgCapacityUsage}
                            format={(v) => `${v.toFixed(1)}%`}
                            icon={<Scale className="text-gray-400" />}
                        />
                        <ComparisonCard
                            title="Total Exports"
                            valA={metricsA.totalExports}
                            valB={metricsB.totalExports}
                            format={(v) => `${v.toFixed(0)}k`}
                            icon={<Truck className="text-gray-400" />}
                        />
                        <ComparisonCard
                            title="Unsatisfied Demand"
                            valA={metricsA.totalUnsatisfied}
                            valB={metricsB.totalUnsatisfied}
                            format={(v) => `${v.toFixed(0)}k`}
                            icon={<AlertCircle className={clsx("text-gray-400", (metricsA.totalUnsatisfied > 0 || metricsB.totalUnsatisfied > 0) && "text-red-500")} />}
                        />
                        <ComparisonCard
                            title="Inventory (Buffer)"
                            valA={metricsA.totalBuffer}
                            valB={metricsB.totalBuffer}
                            format={(v) => `${v.toFixed(0)}k`}
                            icon={<Box className="text-gray-400" />}
                        />
                    </div>
                </div>
            </div>


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

    const renderCard = (type: string, index: number) => {
        const handleDragStart = (e: React.DragEvent) => {
            e.dataTransfer.setData('text/plain', index.toString());
            e.dataTransfer.effectAllowed = 'move';
        };

        const handleDragOver = (e: React.DragEvent) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
        };

        const handleDrop = (e: React.DragEvent) => {
            e.preventDefault();
            const dragIndex = parseInt(e.dataTransfer.getData('text/plain'));
            if (dragIndex !== index) {
                onMoveCard(dragIndex, index);
            }
        };

        if (type === 'commercial') {
            return (
                <div
                    key="commercial"
                    draggable
                    onDragStart={handleDragStart}
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    className="border border-gray-100 rounded-lg overflow-hidden cursor-move hover:shadow-md transition-shadow bg-white"
                >
                    <div className="bg-blue-50/50 px-4 py-2 border-b border-gray-100 flex items-center justify-between">
                        <h5 className="font-semibold text-gray-700 text-sm">Commercial Strategy</h5>
                        <div className="text-gray-400 text-xs">⋮⋮</div>
                    </div>
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                            <tr>
                                <th className="px-3 py-2 text-left">Tech</th>
                                <th className="px-3 py-2 text-right text-blue-600">Price A</th>
                                <th className="px-3 py-2 text-right text-orange-600">Price B</th>
                                <th className="px-3 py-2 text-right">Feat A</th>
                                <th className="px-3 py-2 text-right">Feat B</th>
                                <th className="px-3 py-2 text-right">Share A</th>
                                <th className="px-3 py-2 text-right">Share B</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {techs.map(tech => {
                                const mA = getMetrics(teamA, tech);
                                const mB = getMetrics(teamB, tech);
                                if (mA.price === 0 && mB.price === 0) return null;
                                return (
                                    <tr key={tech} className="hover:bg-gray-50/50">
                                        <td className="px-3 py-2 font-medium text-xs">{tech}</td>
                                        <td className="px-3 py-2 text-right">{localCurrency}{mA.price.toFixed(0)}</td>
                                        <td className="px-3 py-2 text-right">{localCurrency}{mB.price.toFixed(0)}</td>
                                        <td className="px-3 py-2 text-right text-gray-600">{mA.features.toFixed(0)}</td>
                                        <td className="px-3 py-2 text-right text-gray-600">{mB.features.toFixed(0)}</td>
                                        <td className="px-3 py-2 text-right text-gray-600">{mA.share.toFixed(1)}%</td>
                                        <td className="px-3 py-2 text-right text-gray-600">{mB.share.toFixed(1)}%</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            );
        }

        if (type === 'marketing') {
            return (
                <div
                    key="marketing"
                    draggable
                    onDragStart={handleDragStart}
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    className="border border-gray-100 rounded-lg overflow-hidden cursor-move hover:shadow-md transition-shadow bg-white"
                >
                    <div className="bg-purple-50/50 px-4 py-2 border-b border-gray-100 flex items-center justify-between">
                        <h5 className="font-semibold text-gray-700 text-sm">Marketing & Demand</h5>
                        <div className="text-gray-400 text-xs">⋮⋮</div>
                    </div>
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                            <tr>
                                <th className="px-3 py-2 text-left">Tech</th>
                                <th className="px-3 py-2 text-right text-blue-600">Promo A</th>
                                <th className="px-3 py-2 text-right text-orange-600">Promo B</th>
                                <th className="px-3 py-2 text-right">Demand A</th>
                                <th className="px-3 py-2 text-right">Demand B</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {techs.map(tech => {
                                const mA = getMetrics(teamA, tech);
                                const mB = getMetrics(teamB, tech);
                                if (mA.price === 0 && mB.price === 0) return null;
                                return (
                                    <tr key={tech} className="hover:bg-gray-50/50">
                                        <td className="px-3 py-2 font-medium text-xs">{tech}</td>
                                        <td className="px-3 py-2 text-right">{reportingCurrency}{mA.promotion.toFixed(0)}k</td>
                                        <td className="px-3 py-2 text-right">{reportingCurrency}{mB.promotion.toFixed(0)}k</td>
                                        <td className="px-3 py-2 text-right text-gray-600">{mA.totalDemand.toFixed(0)}</td>
                                        <td className="px-3 py-2 text-right text-gray-600">{mB.totalDemand.toFixed(0)}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            );
        }

        if (type === 'operations') {
            return (
                <div
                    key="operations"
                    draggable
                    onDragStart={handleDragStart}
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    className="border border-gray-100 rounded-lg overflow-hidden cursor-move hover:shadow-md transition-shadow bg-white"
                >
                    <div className="bg-green-50/50 px-4 py-2 border-b border-gray-100 flex items-center justify-between">
                        <h5 className="font-semibold text-gray-700 text-sm">Operations (Per Unit)</h5>
                        <div className="text-gray-400 text-xs">⋮⋮</div>
                    </div>
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                            <tr>
                                <th className="px-3 py-2 text-left">Tech</th>
                                <th className="px-3 py-2 text-right text-blue-600">Cost A</th>
                                <th className="px-3 py-2 text-right text-orange-600">Cost B</th>
                                <th className="px-3 py-2 text-right">Buf A</th>
                                <th className="px-3 py-2 text-right">Buf B</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {techs.map(tech => {
                                const mA = getMetrics(teamA, tech);
                                const mB = getMetrics(teamB, tech);
                                if (mA.price === 0 && mB.price === 0) return null;
                                return (
                                    <tr key={tech} className="hover:bg-gray-50/50">
                                        <td className="px-3 py-2 font-medium text-xs">{tech}</td>
                                        <td className="px-3 py-2 text-right">{reportingCurrency}{mA.unitCost.toFixed(2)}</td>
                                        <td className="px-3 py-2 text-right">{reportingCurrency}{mB.unitCost.toFixed(2)}</td>
                                        <td className="px-3 py-2 text-right text-gray-500">{mA.buffer.toFixed(0)}</td>
                                        <td className="px-3 py-2 text-right text-gray-500">{mB.buffer.toFixed(0)}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                <h4 className="font-bold text-lg text-gray-900">{regionName}</h4>
            </div>

            <div className="p-6 grid grid-cols-1 xl:grid-cols-3 gap-6">
                {cardOrder.map((type, index) => renderCard(type, index))}
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
