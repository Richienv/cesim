import React, { useState } from 'react';
import { TeamData } from '@/lib/types';
import { clsx } from 'clsx';
import { Table } from 'lucide-react';

interface DetailedMarketAnalysisProps {
    teams: TeamData[];
}

export function DetailedMarketAnalysis({ teams }: DetailedMarketAnalysisProps) {
    const [selectedRegion, setSelectedRegion] = useState<'usa' | 'asia' | 'europe'>('usa');

    const regions = ['USA', 'Asia', 'Europe'];
    const techs = ['Tech 1', 'Tech 2', 'Tech 3', 'Tech 4'];

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-wrap gap-4 items-center justify-between">
                <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <Table className="w-6 h-6 text-indigo-500" />
                    Detailed Market Analysis
                </h3>

                {/* Region Tabs */}
                <div className="flex bg-gray-100 p-1 rounded-lg">
                    {regions.map(r => (
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

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                {techs.map(tech => (
                    <TechTable
                        key={tech}
                        tech={tech}
                        region={selectedRegion}
                        teams={teams}
                    />
                ))}
            </div>
        </div>
    );
}

function TechTable({ tech, region, teams }: { tech: string, region: 'usa' | 'asia' | 'europe', teams: TeamData[] }) {
    // Sort teams by Market Share (descending)
    const sortedTeams = [...teams].sort((a, b) => {
        const shareA = a.marketShare[region]?.[tech] || 0;
        const shareB = b.marketShare[region]?.[tech] || 0;
        return shareB - shareA;
    });

    let currency = '$';
    if (region === 'asia') currency = '¥';
    if (region === 'europe') currency = '€';

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                <h4 className="font-bold text-gray-900 uppercase tracking-wide text-sm">
                    [{tech} - {region.toUpperCase()}]
                </h4>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="text-xs text-gray-500 uppercase bg-gray-50/50">
                        <tr>
                            <th className="px-4 py-3 font-medium">Team</th>
                            <th className="px-4 py-3 font-medium text-right">Price</th>
                            <th className="px-4 py-3 font-medium text-right">Marketing</th>
                            <th className="px-4 py-3 font-medium text-right">Feature</th>
                            <th className="px-4 py-3 font-medium text-right">Sales</th>
                            <th className="px-4 py-3 font-medium text-right">Profit</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {sortedTeams.map(team => {
                            const price = team.prices[region]?.[tech] || 0;
                            const features = team.features[region]?.[tech] || 0;
                            const salesVol = Math.abs(team.demand[region]?.[tech] || 0); // Demand is sometimes negative in parser? No, usually positive.
                            const share = team.marketShare[region]?.[tech] || 0;

                            // Marketing is usually per tech per region
                            const marketing = team.margins[region]?.[tech]?.promotion || 0;

                            // Profit Calculation
                            // Unit Margin = Price - (Variable Costs / Sales Volume)
                            const variableCosts = team.margins[region]?.[tech]?.variableCosts || 0;
                            const unitCost = salesVol > 0 ? variableCosts / salesVol : 0;
                            const unitProfit = price - unitCost;

                            return (
                                <tr key={team.name} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-4 py-3 font-medium text-gray-900">{team.name}</td>
                                    <td className="px-4 py-3 text-right font-medium">
                                        {price > 0 ? `${currency}${price.toFixed(0)}` : '-'}
                                    </td>
                                    <td className="px-4 py-3 text-right text-gray-600">
                                        {marketing > 0 ? (marketing / 1000).toFixed(0) : '-'}k
                                    </td>
                                    <td className="px-4 py-3 text-right text-gray-600">
                                        {features > 0 ? features : '-'}
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <div className="font-bold text-gray-900">{salesVol.toLocaleString()}</div>
                                        <div className="text-xs text-gray-500">({share.toFixed(0)}%)</div>
                                    </td>
                                    <td className={clsx("px-4 py-3 text-right font-medium", unitProfit > 0 ? "text-green-600" : "text-red-500")}>
                                        {unitProfit !== 0 ? unitProfit.toFixed(0) : '-'}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
