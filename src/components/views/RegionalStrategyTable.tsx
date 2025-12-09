import React, { useMemo, useState } from 'react';
import { clsx } from 'clsx';
import { TeamData } from '@/lib/types';
import { AlertCircle, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';

interface RegionalStrategyTableProps {
    teams: TeamData[];
    region: 'usa' | 'asia' | 'europe';
}

type SortKey = 'name' | 'unitCost' | 'price' | 'features' | 'share' | 'sales' | 'marketing' | 'contribution' | 'ebitda' | 'netProfit';
type SortDirection = 'asc' | 'desc';

export function RegionalStrategyTable({ teams, region }: RegionalStrategyTableProps) {
    const techs = ['Tech 1', 'Tech 2', 'Tech 3', 'Tech 4'];
    const currency = region === 'usa' ? '$' : region === 'asia' ? '¥' : '€';
    const flag = region === 'usa' ? '🇺🇸' : region === 'asia' ? '🌏' : '🇪🇺';

    const [sortKey, setSortKey] = useState<SortKey>('netProfit');
    const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

    const [hideZeroProfit, setHideZeroProfit] = useState(false);

    const handleSort = (key: SortKey) => {
        if (sortKey === key) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortKey(key);
            setSortDirection('desc');
        }
    };

    const SortIcon = ({ column }: { column: SortKey }) => {
        if (sortKey !== column) return <ArrowUpDown className="w-3 h-3 ml-1 text-gray-400" />;
        return sortDirection === 'asc' ? <ArrowUp className="w-3 h-3 ml-1 text-blue-600" /> : <ArrowDown className="w-3 h-3 ml-1 text-blue-600" />;
    };

    // 1. Identify Momentum and its Strategy
    const momentum = teams.find(t => t.name === 'Momentum');

    // Helper to calculate strategy (simplified version of TeamDetailView logic)
    const getStrategy = (team: TeamData, allTeams: TeamData[]) => {
        // Calculate Market Averages
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

        // Team Metrics
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

    const momentumStrategy = momentum ? getStrategy(momentum, teams) : "Balanced Competitor";

    // 2. Use All Teams (No Filtering)
    const relevantTeams = teams;

    if (!momentum) return <div>Momentum team not found.</div>;

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between bg-blue-50 p-4 rounded-lg border border-blue-100 mb-4">
                <div>
                    <h4 className="font-bold text-blue-900">Strategy Focus: All Teams</h4>
                    <p className="text-sm text-blue-700">Comparing Momentum with <strong>all teams</strong>. Your strategy: <strong>{momentumStrategy}</strong>.</p>
                </div>
                <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                        type="checkbox"
                        checked={hideZeroProfit}
                        onChange={(e) => setHideZeroProfit(e.target.checked)}
                        className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-blue-900">Hide Zero Profit</span>
                </label>
            </div>

            {techs.map(tech => {
                // Prepare data for sorting
                const tableData = relevantTeams.map(team => {
                    const rMargins = team.margins[region];
                    const rLogistics = team.logistics[region];
                    const rFeatures = team.features[region];
                    const rPrices = team.prices[region];
                    const rMarketShare = team.marketShare[region];

                    const mData = rMargins?.[tech];
                    const lData = rLogistics?.[tech];

                    const qty = Math.abs(lData?.sales || 0);
                    const rev = mData?.sales || 0;
                    const profit = mData?.grossProfit || 0;
                    const promotion = mData?.promotion || 0;
                    const price = rPrices?.[tech] || 0;
                    const features = rFeatures?.[tech] || 0;
                    const share = rMarketShare?.[tech] || 0;
                    const unitCost = qty > 0 ? (mData?.variableCosts || 0) / qty : 0;

                    // Production Unit Cost Logic
                    // Try to find where they produce this tech
                    const prodCostUSA = team.manufacturing.usa.productionCost?.[tech] || 0;
                    const prodCostAsia = team.manufacturing.asia.productionCost?.[tech] || 0;

                    // Simple heuristic: If they produce in region, use that. Else default to Asia (common hub) or USA.
                    // If region is Europe, they likely import.
                    let pUnitCost = 0;
                    if (region === 'usa') {
                        pUnitCost = prodCostUSA > 0 ? prodCostUSA : prodCostAsia;
                    } else if (region === 'asia') {
                        pUnitCost = prodCostAsia > 0 ? prodCostAsia : prodCostUSA;
                    } else { // Europe
                        // Fallback to where they have production cost
                        pUnitCost = prodCostAsia > 0 ? prodCostAsia : prodCostUSA;
                    }

                    // Allocation Logic
                    const regionTotalSales = Object.values(rMargins || {}).reduce((sum, item) => sum + item.sales, 0);
                    const revShare = regionTotalSales > 0 ? rev / regionTotalSales : 0;
                    const regionEBITDA = team.financials.incomeStatement[region].ebitda || 0;
                    const regionNetProfit = team.financials.incomeStatement[region].netProfit || 0;

                    const regionContribution = Object.values(rMargins || {}).reduce((sum, item) => sum + (item.grossProfit - item.promotion), 0);
                    const regionFixedCosts = regionContribution - regionEBITDA;
                    const regionNonOpCosts = regionEBITDA - regionNetProfit;

                    const allocatedFixed = regionFixedCosts * revShare;
                    const allocatedNonOp = regionNonOpCosts * revShare;

                    const techContribution = profit - promotion;
                    const techEBITDA = techContribution - allocatedFixed;
                    const techNetProfit = techEBITDA - allocatedNonOp;

                    return {
                        team,
                        name: team.name,
                        pUnitCost,
                        unitCost,
                        price,
                        features,
                        share,
                        sales: qty,
                        marketing: promotion,
                        contribution: techContribution,
                        ebitda: techEBITDA,
                        netProfit: techNetProfit
                    };
                });

                // Filter data
                const filteredData = tableData.filter(row => {
                    if (hideZeroProfit && Math.abs(row.netProfit) < 1) return false;
                    return true;
                });

                // Sort data
                const sortedData = [...filteredData].sort((a, b) => {
                    const aVal = a[sortKey as keyof typeof a]; // Fix type error
                    const bVal = b[sortKey as keyof typeof b];

                    if (typeof aVal === 'string' && typeof bVal === 'string') {
                        return sortDirection === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
                    }

                    // Handle numeric sort
                    const numA = Number(aVal);
                    const numB = Number(bVal);
                    return sortDirection === 'asc' ? numA - numB : numB - numA;
                });

                if (sortedData.length === 0) return null;

                return (
                    <div key={tech} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                            <h4 className="font-bold text-xl text-gray-900 flex items-center gap-2">
                                [{tech.toUpperCase()} - {region.toUpperCase()} {flag}]
                            </h4>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-base text-left">
                                <thead className="text-sm text-gray-500 uppercase bg-gray-50 cursor-pointer select-none">
                                    <tr>
                                        <th className="px-4 py-3" onClick={() => handleSort('name')}>
                                            <div className="flex items-center">Team <SortIcon column="name" /></div>
                                        </th>
                                        <th className="px-4 py-3 text-right" onClick={() => handleSort('unitCost')}>
                                            <div className="flex items-center justify-end">Unit Cost <SortIcon column="unitCost" /></div>
                                        </th>
                                        <th className="px-4 py-3 text-right" onClick={() => handleSort('pUnitCost' as any)}>
                                            <div className="flex items-center justify-end">P.Unit Cost <SortIcon column={'pUnitCost' as any} /></div>
                                        </th>
                                        <th className="px-4 py-3 text-right" onClick={() => handleSort('price')}>
                                            <div className="flex items-center justify-end">Price <SortIcon column="price" /></div>
                                        </th>
                                        <th className="px-4 py-3 text-right" onClick={() => handleSort('features')}>
                                            <div className="flex items-center justify-end">Feat <SortIcon column="features" /></div>
                                        </th>
                                        <th className="px-4 py-3 text-right" onClick={() => handleSort('share')}>
                                            <div className="flex items-center justify-end">Share <SortIcon column="share" /></div>
                                        </th>
                                        <th className="px-4 py-3 text-right" onClick={() => handleSort('sales')}>
                                            <div className="flex items-center justify-end">Sales <SortIcon column="sales" /></div>
                                        </th>
                                        <th className="px-4 py-3 text-right" onClick={() => handleSort('marketing')}>
                                            <div className="flex items-center justify-end">Marketing <SortIcon column="marketing" /></div>
                                        </th>
                                        <th className="px-4 py-3 text-right" onClick={() => handleSort('contribution')}>
                                            <div className="flex items-center justify-end">(Profit-E) <SortIcon column="contribution" /></div>
                                        </th>
                                        <th className="px-4 py-3 text-right" onClick={() => handleSort('ebitda')}>
                                            <div className="flex items-center justify-end">EBITDA <SortIcon column="ebitda" /></div>
                                        </th>
                                        <th className="px-4 py-3 text-right" onClick={() => handleSort('netProfit')}>
                                            <div className="flex items-center justify-end">Net Profit <SortIcon column="netProfit" /></div>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {sortedData.map((row) => {
                                        const isMomentum = row.name === 'Momentum';
                                        return (
                                            <tr key={row.name} className={clsx("hover:bg-gray-50", isMomentum ? "bg-blue-50/30" : "")}>
                                                <td className={clsx("px-4 py-3 font-medium", isMomentum ? "text-blue-700 font-bold" : "text-gray-900")}>
                                                    {row.name}
                                                </td>
                                                <td className="px-4 py-3 text-right text-gray-600">
                                                    {currency}{row.unitCost.toFixed(0)}
                                                </td>
                                                <td className="px-4 py-3 text-right text-gray-600">
                                                    {currency}{row.pUnitCost.toFixed(0)}
                                                </td>
                                                <td className="px-4 py-3 text-right text-gray-600">
                                                    {currency}{row.price.toFixed(0)}
                                                </td>
                                                <td className="px-4 py-3 text-right text-gray-600">
                                                    {row.features}
                                                </td>
                                                <td className="px-4 py-3 text-right text-gray-600">
                                                    {row.share.toFixed(1)}%
                                                </td>
                                                <td className="px-4 py-3 text-right text-gray-600">
                                                    {(row.sales / 1000).toFixed(0)}k
                                                </td>
                                                <td className="px-4 py-3 text-right text-gray-600">
                                                    {currency}{(row.marketing / 1000).toFixed(0)}k
                                                </td>
                                                <td className={clsx("px-4 py-3 text-right font-bold", row.contribution >= 0 ? "text-green-600" : "text-red-600")}>
                                                    {currency}{(row.contribution / 1000).toFixed(0)}k
                                                </td>
                                                <td className={clsx("px-4 py-3 text-right font-bold", row.ebitda >= 0 ? "text-purple-600" : "text-red-600")}>
                                                    {currency}{(row.ebitda / 1000).toFixed(0)}k
                                                </td>
                                                <td className={clsx("px-4 py-3 text-right font-bold", row.netProfit >= 0 ? "text-green-600" : "text-red-600")}>
                                                    {currency}{(row.netProfit / 1000).toFixed(0)}k
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
    );
}
