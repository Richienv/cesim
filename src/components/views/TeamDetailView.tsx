import React, { useMemo, useState } from 'react';
import { TeamData } from '@/lib/types';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts';
import { DollarSign, TrendingUp, Factory, Truck, Activity, Target } from 'lucide-react';
import { clsx } from 'clsx';

interface TeamDetailViewProps {
    teams: TeamData[];
    initialTeam?: string;
}

const COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e'];

export function TeamDetailView({ teams, initialTeam }: TeamDetailViewProps) {
    // Sort teams by revenue to determine rank
    const sortedTeams = useMemo(() => [...teams].sort((a, b) => {
        const revA = a.financials.incomeStatement.global["Sales revenue"] || 0;
        const revB = b.financials.incomeStatement.global["Sales revenue"] || 0;
        return revB - revA;
    }), [teams]);

    const [selectedTeamName, setSelectedTeamName] = useState<string>(initialTeam || sortedTeams[0]?.name || "");

    const selectedTeam = useMemo(() =>
        teams.find(t => t.name === selectedTeamName) || teams[0],
        [teams, selectedTeamName]);

    const rank = sortedTeams.findIndex(t => t.name === selectedTeam.name) + 1;

    // --- Data Preparation ---

    // 1. Sales by Tech (Global)
    // We need to aggregate sales from Margins (USA + Asia + Europe)
    const salesByTech = useMemo(() => {
        const techs = ['Tech 1', 'Tech 2', 'Tech 3', 'Tech 4'];
        return techs.map(tech => {
            let totalSales = 0;
            ['usa', 'asia', 'europe'].forEach(region => {
                const rData = selectedTeam.margins[region as 'usa' | 'asia' | 'europe'];
                if (rData && rData[tech]) {
                    totalSales += rData[tech].sales;
                }
            });
            return { name: tech, value: totalSales };
        }).filter(d => d.value > 0);
    }, [selectedTeam]);

    // 2. Manufacturing Mix (In-House vs Contract)
    const manufacturingMix = useMemo(() => {
        let inHouse = 0;
        let contract = 0;
        ['usa', 'asia'].forEach(region => {
            const rData = selectedTeam.manufacturing[region as 'usa' | 'asia'];
            Object.values(rData.inHouse).forEach(v => inHouse += v);
            Object.values(rData.contract).forEach(v => contract += v);
        });
        return [
            { name: 'In-House', value: inHouse },
            { name: 'Contract', value: contract }
        ];
    }, [selectedTeam]);

    // 3. Key Metrics
    const revenue = selectedTeam.financials.incomeStatement.global["Sales revenue"] || 0;
    const ebitda = selectedTeam.financials.incomeStatement.global["Operating profit before depreciation (EBITDA)"] || 0;
    const promotion = selectedTeam.financials.incomeStatement.global["Promotion"] || 0;
    const rAndD = selectedTeam.financials.incomeStatement.global["R&D"] || 0;
    const profitForRound = selectedTeam.financials.incomeStatement.global["Profit for the round"] || 0;
    const cumulativeProfit = selectedTeam.financials.balanceSheet.global["Retained earnings"] || 0; // Best proxy for cumulative earnings

    const grossProfit = revenue - (selectedTeam.financials.incomeStatement.global["Variable production costs"] || 0);
    const ros = revenue > 0 ? (profitForRound / revenue) * 100 : 0;

    // Helper to get regional totals
    const getRegionalMetrics = (region: 'usa' | 'asia' | 'europe') => {
        const rMargins = selectedTeam.margins[region];
        const rLogistics = selectedTeam.logistics[region];
        const rIncome = selectedTeam.financials.incomeStatement[region];

        let totalRevenue = 0;
        let totalProfit = 0;
        let totalQuantity = 0;
        let totalLogistics = rIncome?.["Transportation and tariffs"] || 0;

        // Calculate from Margins (more reliable for Revenue/Profit)
        if (rMargins) {
            Object.values(rMargins).forEach(m => {
                totalRevenue += m.sales;
                totalProfit += m.grossProfit;
            });
        }

        // Calculate Quantity from Logistics
        if (rLogistics) {
            Object.values(rLogistics).forEach(l => {
                totalQuantity += Math.abs(l.sales);
            });
        }

        const avgLogisticsCost = totalQuantity > 0 ? totalLogistics / totalQuantity : 0;

        return {
            revenue: totalRevenue,
            profit: totalProfit,
            quantity: totalQuantity,
            promotion: rIncome?.["Promotion"] || 0,
            logisticsCost: totalLogistics,
            avgLogisticsCost
        };
    };

    // Calculate Unit Costs for Tech 1 & 2
    const getUnitCost = (tech: string, region: 'usa' | 'asia' | 'europe') => {
        const mData = selectedTeam.margins[region]?.[tech];
        const lData = selectedTeam.logistics[region]?.[tech];
        if (!mData || !lData) return 0;
        const qty = Math.abs(lData.sales);
        if (qty === 0) return 0;
        return mData.variableCosts / qty;
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header / Selector */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                        {selectedTeam.name}
                        <span className="px-3 py-1 bg-gray-100 text-gray-600 text-sm font-medium rounded-full">
                            Rank #{rank}
                        </span>
                    </h2>
                    <p className="text-gray-500">Deep dive analysis</p>
                </div>

                <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-gray-500">Analyze Team:</span>
                    <select
                        value={selectedTeamName}
                        onChange={(e) => setSelectedTeamName(e.target.value)}
                        className="bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-lg focus:ring-red-500 focus:border-red-500 block p-2.5"
                    >
                        {sortedTeams.map(t => (
                            <option key={t.name} value={t.name}>{t.name}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* KPI Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <MetricCard title="Total Revenue" value={`$${(revenue / 1000).toFixed(1)}k`} icon={<DollarSign className="text-blue-500" />} />
                <MetricCard title="EBITDA" value={`$${(ebitda / 1000).toFixed(1)}k`} icon={<Activity className="text-green-500" />} />
                <MetricCard title="Gross Profit" value={`$${(grossProfit / 1000).toFixed(1)}k`} icon={<PieChart className="text-purple-500" />} />
                <MetricCard title="ROS" value={`${ros.toFixed(1)}%`} icon={<TrendingUp className="text-orange-500" />} />
                <MetricCard title="Cum. Earnings" value={`$${(cumulativeProfit / 1000).toFixed(1)}k`} icon={<DollarSign className="text-teal-500" />} />
                <MetricCard title="Promotion Spend" value={`$${(promotion / 1000).toFixed(1)}k`} icon={<Target className="text-pink-500" />} />
                <MetricCard title="R&D Invest" value={`$${(rAndD / 1000).toFixed(1)}k`} icon={<Factory className="text-indigo-500" />} />
            </div>

            {/* Cost Overview Section */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Cost Overview</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="p-4 bg-gray-50 rounded-lg">
                        <h4 className="text-sm font-medium text-gray-500 mb-2">Avg. Logistics Cost / Unit</h4>
                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <span>USA</span>
                                <span className="font-semibold">${getRegionalMetrics('usa').avgLogisticsCost.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Asia</span>
                                <span className="font-semibold">${getRegionalMetrics('asia').avgLogisticsCost.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Europe</span>
                                <span className="font-semibold">${getRegionalMetrics('europe').avgLogisticsCost.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                        <h4 className="text-sm font-medium text-gray-500 mb-2">Tech 1 Unit Cost (COGS)</h4>
                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <span>USA</span>
                                <span className="font-semibold">${getUnitCost('Tech 1', 'usa').toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Asia</span>
                                <span className="font-semibold">${getUnitCost('Tech 1', 'asia').toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Europe</span>
                                <span className="font-semibold">${getUnitCost('Tech 1', 'europe').toFixed(2)}</span>
                            </div>
                        </div>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                        <h4 className="text-sm font-medium text-gray-500 mb-2">Tech 2 Unit Cost (COGS)</h4>
                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <span>USA</span>
                                <span className="font-semibold">${getUnitCost('Tech 2', 'usa').toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Asia</span>
                                <span className="font-semibold">${getUnitCost('Tech 2', 'asia').toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Europe</span>
                                <span className="font-semibold">${getUnitCost('Tech 2', 'europe').toFixed(2)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Sales by Tech */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-900 mb-6">Revenue by Technology</h3>
                    <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={salesByTech} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                                <XAxis type="number" tickFormatter={(val) => `$${val / 1000}k`} />
                                <YAxis dataKey="name" type="category" width={80} />
                                <Tooltip formatter={(val: number) => `$${val.toLocaleString()}`} />
                                <Bar dataKey="value" fill="#ef4444" radius={[0, 4, 4, 0]}>
                                    {salesByTech.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Manufacturing Mix */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-900 mb-6">Manufacturing Strategy</h3>
                    <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={manufacturingMix}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={100}
                                    fill="#8884d8"
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    <Cell key="cell-0" fill="#ef4444" />
                                    <Cell key="cell-1" fill="#3b82f6" />
                                </Pie>
                                <Tooltip formatter={(val: number) => val.toLocaleString()} />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Regional Breakdown Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {['USA', 'Asia', 'Europe'].map(region => {
                    const metrics = getRegionalMetrics(region.toLowerCase() as 'usa' | 'asia' | 'europe');
                    return (
                        <div key={region} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">{region} Performance</h3>
                            <div className="space-y-3">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Sales Revenue</span>
                                    <span className="font-medium">${metrics.revenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Gross Profit</span>
                                    <span className="font-medium text-green-600">${metrics.profit.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Quantity Sold</span>
                                    <span className="font-medium">{metrics.quantity.toLocaleString()} units</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Promotion</span>
                                    <span className="font-medium">${metrics.promotion.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Detailed Regional Analysis Tables */}
            <div className="space-y-6">
                <h3 className="text-xl font-bold text-gray-900">Detailed Regional Analysis</h3>
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                    {['USA', 'Asia', 'Europe'].map(regionName => {
                        const regionKey = regionName.toLowerCase() as 'usa' | 'asia' | 'europe';
                        const rMargins = selectedTeam.margins[regionKey];
                        const rLogistics = selectedTeam.logistics[regionKey];
                        const techs = ['Tech 1', 'Tech 2', 'Tech 3', 'Tech 4'];

                        return (
                            <div key={regionName} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                                <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                                    <h4 className="font-semibold text-gray-900">{regionName} Breakdown</h4>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm text-left">
                                        <thead className="text-xs text-gray-500 uppercase bg-gray-50">
                                            <tr>
                                                <th className="px-4 py-3">Tech</th>
                                                <th className="px-4 py-3 text-right">Qty</th>
                                                <th className="px-4 py-3 text-right">Price</th>
                                                <th className="px-4 py-3 text-right">Rev</th>
                                                <th className="px-4 py-3 text-right">Profit</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {techs.map(tech => {
                                                const mData = rMargins?.[tech];
                                                const lData = rLogistics?.[tech];
                                                if (!mData && !lData) return null;

                                                const qty = Math.abs(lData?.sales || 0);
                                                const rev = mData?.sales || 0;
                                                const profit = mData?.grossProfit || 0;
                                                const price = qty > 0 ? rev / qty : 0;

                                                if (qty === 0 && rev === 0) return null;

                                                return (
                                                    <tr key={tech} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                                                        <td className="px-4 py-3 font-medium text-gray-900">{tech}</td>
                                                        <td className="px-4 py-3 text-right">{qty.toLocaleString()}</td>
                                                        <td className="px-4 py-3 text-right font-medium text-blue-600">${price.toFixed(2)}</td>
                                                        <td className="px-4 py-3 text-right">${(rev / 1000).toFixed(1)}k</td>
                                                        <td className={clsx("px-4 py-3 text-right font-medium", profit >= 0 ? "text-green-600" : "text-red-600")}>
                                                            ${(profit / 1000).toFixed(1)}k
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

function MetricCard({ title, value, icon }: { title: string, value: string, icon: React.ReactNode }) {
    return (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex justify-between items-start mb-2">
                <div className="p-2 bg-gray-50 rounded-lg">{icon}</div>
            </div>
            <div>
                <p className="text-sm text-gray-500 font-medium">{title}</p>
                <h4 className="text-2xl font-bold text-gray-900 mt-1">{value}</h4>
            </div>
        </div>
    );
}
