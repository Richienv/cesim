import React, { useMemo } from 'react';
import { clsx } from 'clsx';
import { TeamData } from '@/lib/types';

interface LogisticsComparisonTableProps {
    teams: TeamData[];
}

export function LogisticsComparisonTable({ teams }: LogisticsComparisonTableProps) {
    // 1. Identify Momentum or Target Team (fallback to first)
    const heroTeam = teams.find(t => t.name === 'Momentum') || teams.find(t => t.name === '多财多亿') || teams[0];

    // Helper to calculate strategy (same as RegionalStrategyTable)
    const getStrategy = (team: TeamData, allTeams: TeamData[]) => {
        let totalPrices = 0, priceCount = 0, totalPromo = 0, totalRnD = 0;
        allTeams.forEach(t => {
            ['usa', 'asia', 'europe'].forEach(r => {
                const pList = t.prices[r as 'usa' | 'asia' | 'europe'];
                if (pList) Object.values(pList).forEach(p => { if (p > 0) { totalPrices += p; priceCount++; } });
            });
            totalPromo += t.financials.incomeStatement.global["Promotion"] || 0;
            totalRnD += t.financials.incomeStatement.global["R&D"] || 0;
        });
        const avgPrice = priceCount > 0 ? totalPrices / priceCount : 0;
        const avgPromo = totalPromo / allTeams.length;
        const avgRnD = totalRnD / allTeams.length;

        let myTotalPrices = 0, myPriceCount = 0;
        ['usa', 'asia', 'europe'].forEach(r => {
            const pList = team.prices[r as 'usa' | 'asia' | 'europe'];
            if (pList) Object.values(pList).forEach(p => { if (p > 0) { myTotalPrices += p; myPriceCount++; } });
        });
        const myAvgPrice = myPriceCount > 0 ? myTotalPrices / myPriceCount : 0;
        const promo = team.financials.incomeStatement.global["Promotion"] || 0;
        const rnd = team.financials.incomeStatement.global["R&D"] || 0;

        const priceDiffPct = ((myAvgPrice - avgPrice) / avgPrice) * 100;
        const promoDiffPct = ((promo - avgPromo) / avgPromo) * 100;
        const rndDiffPct = ((rnd - avgRnD) / avgRnD) * 100;

        if (priceDiffPct > 5 && rndDiffPct > 10) return "Premium Innovator";
        if (priceDiffPct < -5 && rndDiffPct < 5) return "Cost Leader";
        if (promoDiffPct > 15 && priceDiffPct > 0) return "Brand Builder";
        if (promoDiffPct > 15 && priceDiffPct < -5) return "Aggressive Penetration";
        return "Balanced Competitor";
    };

    const heroStrategy = heroTeam ? getStrategy(heroTeam, teams) : "Balanced Competitor";

    // 2. Use All Teams (No Filtering)
    const relevantTeams = teams;

    const techs = ['Tech 1', 'Tech 2', 'Tech 3', 'Tech 4'];
    const regions = ['usa', 'asia', 'europe'];
    const regionLabels: Record<string, string> = { usa: 'USA', asia: 'Asia', europe: 'Europe' };

    const metrics = [
        { key: 'inHouse', label: 'In-house Production' },
        { key: 'contract', label: 'Contract Production' },
        { key: 'imported', label: 'Imported' },
        { key: 'total', label: 'Total Products' },
        { key: 'sales', label: 'Sales' },
        { key: 'exported', label: 'Exported' },
        { key: 'productionBuffer', label: 'Production Buffer' },
        { key: 'unsatisfiedDemand', label: 'Unsatisfied Demand' },
    ];

    if (!heroTeam) return <div className="text-gray-500">No data available for logistics analysis.</div>;

    return (
        <div className="space-y-8">
            <div className="bg-purple-50 p-4 rounded-lg border border-purple-100 mb-4">
                <h4 className="font-bold text-purple-900">Logistics Deep Dive: All Teams</h4>
                <p className="text-sm text-purple-700">Detailed logistics flow for all teams.</p>
            </div>

            {techs.map(tech => (
                <div key={tech} className="space-y-4">
                    <h3 className="text-xl font-bold text-gray-900 border-b border-gray-200 pb-2">
                        {tech}
                    </h3>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {regions.map(region => {
                            // Check if any relevant team has activity in this region/tech
                            const hasActivity = relevantTeams.some(t => {
                                const data = t.logistics[region as 'usa' | 'asia' | 'europe']?.[tech];
                                return data && Math.abs(data.total) > 0;
                            });

                            if (!hasActivity) return null;

                            return (
                                <div key={region} className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
                                    <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
                                        <h4 className="font-bold text-gray-700">{regionLabels[region]}</h4>
                                    </div>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm text-left">
                                            <thead className="text-xs text-gray-500 uppercase bg-gray-50">
                                                <tr>
                                                    <th className="px-3 py-2">Metric</th>
                                                    {relevantTeams.map(t => (
                                                        <th key={t.name} className="px-3 py-2 text-right">
                                                            {t.name}
                                                        </th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100">
                                                {metrics.map(metric => (
                                                    <tr key={metric.key} className="hover:bg-gray-50">
                                                        <td className="px-3 py-2 font-medium text-gray-600">{metric.label}</td>
                                                        {relevantTeams.map(t => {
                                                            const val = t.logistics[region as 'usa' | 'asia' | 'europe']?.[tech]?.[metric.key as keyof typeof t.logistics.usa.Tech1] || 0;
                                                            return (
                                                                <td key={t.name} className="px-3 py-2 text-right text-gray-500">
                                                                    {val !== 0 ? (val / 1000).toFixed(1) + 'k' : '-'}
                                                                </td>
                                                            );
                                                        })}
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            ))}
        </div>
    );
}
