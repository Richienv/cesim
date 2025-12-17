import React, { useMemo, useState } from 'react';
import { clsx } from 'clsx';
import { TeamData } from '@/lib/types';
import { AlertCircle, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { getTechLabel } from '@/lib/constants';

interface RegionalStrategyTableProps {
    teams: TeamData[];
    region: 'usa' | 'asia' | 'europe';
}

type SortKey = 'name' | 'unitCost' | 'price' | 'features' | 'share' | 'demand' | 'sales' | 'marketing' | 'contribution' | 'ebitda' | 'netProfit';
type SortDirection = 'asc' | 'desc';

export function RegionalStrategyTable({ teams, region }: RegionalStrategyTableProps) {
    const techs = ['Tech 1', 'Tech 2', 'Tech 3', 'Tech 4'];
    const currency = region === 'usa' ? '$' : region === 'asia' ? '¥' : '€';
    // const flag = region === 'usa' ? '🇺🇸' : region === 'asia' ? '🌏' : '🇪🇺'; // Unused

    const [sortKey, setSortKey] = useState<SortKey>('netProfit');
    const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

    const [hideZeroProfit, setHideZeroProfit] = useState(false);
    const [onlyMomentum, setOnlyMomentum] = useState(false);

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

    // 1. Identify Momentum or Target Team (support '多财多亿')
    const heroTeam = teams.find(t => t.name === 'Momentum') || teams.find(t => t.name === '多财多亿');

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

    const heroStrategy = heroTeam ? getStrategy(heroTeam, teams) : "Balanced Competitor";

    // 2. Use All Teams (No Filtering)
    const relevantTeams = teams;

    if (!heroTeam) return <div>Momentum/"多财多亿" team not found.</div>;

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between bg-blue-50 p-4 rounded-lg border border-blue-100 mb-4">
                <div>
                    <h4 className="font-bold text-blue-900">Strategy Focus: All Teams</h4>
                    <p className="text-sm text-blue-700">Comparing <strong>{heroTeam.name}</strong> with <strong>all teams</strong>. Your strategy: <strong>{heroStrategy}</strong>.</p>
                </div>
                <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                        <input
                            type="checkbox"
                            checked={onlyMomentum}
                            onChange={(e) => setOnlyMomentum(e.target.checked)}
                            className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                        />
                        <span className="text-sm font-medium text-blue-900">Only {heroTeam.name}</span>
                    </label>
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

                    // Actual Values (Raw USD from Parser)
                    const actualQty = Math.abs(lData?.sales || 0);
                    const actualRevUSD = mData?.sales || 0;
                    // const actualProfitUSD = mData?.grossProfit || 0; // Unused
                    const actualPromotionUSD = mData?.promotion || 0;
                    const actualPriceLocal = rPrices?.[tech] || 0;
                    const actualFeatures = rFeatures?.[tech] || 0;
                    const actualDemand = team.demand[region]?.[tech] || 0;
                    const share = rMarketShare?.[tech] || 0;
                    const unitCostUSD = actualQty > 0 ? (mData?.variableCosts || 0) / actualQty : 0;

                    // Currency Conversion Logic
                    // Margins are in USD, Prices are in Local Currency.
                    // Calculate Exchange Rate: Local Price / Implied USD Price
                    const impliedPriceUSD = actualQty > 0 ? actualRevUSD / actualQty : 0;
                    const exchangeRate = (impliedPriceUSD > 0 && actualPriceLocal > 0) ? actualPriceLocal / impliedPriceUSD : 1;

                    // Display Values:
                    // Unit Cost -> Convert to Local (to match Price magnitude)
                    // Profit/EBITDA -> Keep in USD (to match Dashboard)
                    const unitCostLocal = unitCostUSD * exchangeRate;

                    // Allocation Logic (USD)
                    const regionTotalSalesUSD = Object.values(rMargins || {}).reduce((sum, item) => sum + item.sales, 0);
                    const revShare = regionTotalSalesUSD > 0 ? actualRevUSD / regionTotalSalesUSD : 0;
                    const regionEBITDA_USD = team.financials.incomeStatement[region].ebitda || 0;
                    const regionNetProfit_USD = team.financials.incomeStatement[region].netProfit || 0;

                    const regionContributionUSD = Object.values(rMargins || {}).reduce((sum, item) => sum + (item.grossProfit - item.promotion), 0);
                    const regionFixedCostsUSD = regionContributionUSD - regionEBITDA_USD;
                    const regionNonOpCostsUSD = regionEBITDA_USD - regionNetProfit_USD;

                    const allocatedFixedUSD = regionFixedCostsUSD * revShare;
                    const allocatedNonOpUSD = regionNonOpCostsUSD * revShare;

                    const priceLocal = actualPriceLocal;
                    const marketingUSD = actualPromotionUSD;
                    // const features = actualFeatures; // Unused
                    const sales = actualQty;

                    // Recalculate derived metrics
                    // We need to calculate in one currency, then convert if needed.
                    // Let's calculate in Local Currency (since Price and Unit Cost are Local), then convert Profit back to USD.

                    const revenueLocal = priceLocal * sales;
                    const cogsLocal = unitCostLocal * sales;
                    const grossProfitLocal = revenueLocal - cogsLocal;

                    // Convert Gross Profit back to USD for display
                    const grossProfitUSD = exchangeRate > 0 ? grossProfitLocal / exchangeRate : 0;

                    const techContributionUSD = grossProfitUSD - marketingUSD;
                    const techEBITDA_USD = techContributionUSD - allocatedFixedUSD;
                    const techNetProfit_USD = techEBITDA_USD - allocatedNonOpUSD;

                    return {
                        team,
                        name: team.name,

                        unitCost: unitCostLocal, // Display in Local
                        price: priceLocal,       // Display (Actual)
                        actualPrice: actualPriceLocal, // Display (Actual)
                        features: actualFeatures,                // Display (Actual)
                        actualFeatures,          // Display (Actual)
                        share,
                        demand: actualDemand,
                        sales,
                        marketing: marketingUSD, // Display (Actual)
                        actualMarketing: actualPromotionUSD, // Display (Actual)
                        contribution: techContributionUSD, // Display in USD
                        ebitda: techEBITDA_USD,           // Display in USD
                        netProfit: techNetProfit_USD      // Display in USD
                    };
                });

                // Filter data
                const filteredData = tableData.filter(row => {
                    if (onlyMomentum && row.name !== heroTeam.name) return false;
                    if (hideZeroProfit && Math.abs(row.netProfit) < 1) return false;
                    return true;
                });

                // Sort filtered data
                const sortedData = [...filteredData].sort((a, b) => {
                    const modifier = sortDirection === 'asc' ? 1 : -1;
                    switch (sortKey) {
                        case 'name': return a.name.localeCompare(b.name) * modifier;
                        case 'unitCost': return (a.unitCost - b.unitCost) * modifier;
                        case 'price': return (a.price - b.price) * modifier;
                        case 'features': return (a.features - b.features) * modifier;
                        case 'share': return (a.share - b.share) * modifier;
                        case 'demand': return (a.demand - b.demand) * modifier;
                        case 'sales': return (a.sales - b.sales) * modifier;
                        case 'marketing': return (a.marketing - b.marketing) * modifier;
                        case 'contribution': return (a.contribution - b.contribution) * modifier;
                        case 'ebitda': return (a.ebitda - b.ebitda) * modifier;
                        case 'netProfit': return (a.netProfit - b.netProfit) * modifier;
                        default: return 0;
                    }
                });

                if (sortedData.length === 0) return null;

                const techName = getTechLabel(tech);

                return (
                    <div key={tech} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                            <h4 className="font-bold text-gray-900 uppercase tracking-wider text-lg">
                                [{techName} - {region.toUpperCase()} {region === 'usa' ? '🇺🇸' : region === 'asia' ? '🇨🇳' : '🇪🇺'}]
                            </h4>
                            <span className="text-base font-medium bg-white px-2 py-1 rounded border border-gray-200 text-gray-500">
                                {currency}
                            </span>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-base text-left">
                                <thead className="text-sm text-gray-500 uppercase bg-gray-50/50">
                                    <tr>
                                        <th className="px-4 py-3 cursor-pointer hover:bg-gray-100" onClick={() => handleSort('name')}>TEAM <SortIcon column="name" /></th>
                                        <th className="px-4 py-3 text-right cursor-pointer hover:bg-gray-100" onClick={() => handleSort('unitCost')}>UNIT COST <SortIcon column="unitCost" /></th>
                                        <th className="px-4 py-3 text-right cursor-pointer hover:bg-gray-100" onClick={() => handleSort('price')}>PRICE <SortIcon column="price" /></th>
                                        <th className="px-4 py-3 text-right cursor-pointer hover:bg-gray-100" onClick={() => handleSort('features')}>FEAT <SortIcon column="features" /></th>
                                        <th className="px-4 py-3 text-right cursor-pointer hover:bg-gray-100" onClick={() => handleSort('share')}>SHARE <SortIcon column="share" /></th>
                                        <th className="px-4 py-3 text-right cursor-pointer hover:bg-gray-100" onClick={() => handleSort('demand')}>DEMAND <SortIcon column="demand" /></th>
                                        <th className="px-4 py-3 text-right cursor-pointer hover:bg-gray-100" onClick={() => handleSort('sales')}>SALES UNIT <SortIcon column="sales" /></th>
                                        <th className="px-4 py-3 text-right cursor-pointer hover:bg-gray-100" onClick={() => handleSort('marketing')}>MARKETING <SortIcon column="marketing" /></th>
                                        <th className="px-4 py-3 text-right cursor-pointer hover:bg-gray-100" onClick={() => handleSort('contribution')}>(PROFIT-E) <SortIcon column="contribution" /></th>
                                        <th className="px-4 py-3 text-right cursor-pointer hover:bg-gray-100" onClick={() => handleSort('ebitda')}>EBITDA <SortIcon column="ebitda" /></th>
                                        <th className="px-4 py-3 text-right cursor-pointer hover:bg-gray-100" onClick={() => handleSort('netProfit')}>NET PROFIT <SortIcon column="netProfit" /></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {sortedData.map((row) => (
                                        <tr key={row.name} className={clsx("hover:bg-gray-50 transition-colors", row.name === heroTeam.name ? "bg-blue-50/30" : "")}>
                                            <td className={clsx("px-4 py-3 font-medium", row.name === heroTeam.name ? "text-blue-700 font-bold" : "text-gray-900")}>
                                                {row.name}
                                            </td>
                                            <td className="px-4 py-3 text-right text-gray-600">
                                                {currency}{row.unitCost.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                            </td>
                                            <td className="px-4 py-3 text-right font-bold text-blue-600 bg-blue-50/30">
                                                <span>{currency}{row.actualPrice.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                                            </td>
                                            <td className="px-4 py-3 text-right text-gray-600">
                                                <span>{row.actualFeatures}</span>
                                            </td>
                                            <td className="px-4 py-3 text-right text-gray-600">{row.share.toFixed(1)}%</td>
                                            <td className="px-4 py-3 text-right text-gray-600">{row.demand.toLocaleString()}</td>
                                            <td className="px-4 py-3 text-right font-medium text-gray-900">
                                                {row.sales.toLocaleString()}
                                            </td>
                                            <td className="px-4 py-3 text-right text-gray-600">
                                                <span>${(row.actualMarketing / 1000).toLocaleString(undefined, { maximumFractionDigits: 0 })}k</span>
                                            </td>
                                            <td className={clsx("px-4 py-3 text-right font-bold", row.contribution >= 0 ? "text-green-600" : "text-red-600")}>
                                                ${(row.contribution / 1000).toFixed(0)}k
                                            </td>
                                            <td className={clsx("px-4 py-3 text-right font-bold", row.ebitda >= 0 ? "text-purple-600" : "text-red-600")}>
                                                ${(row.ebitda / 1000).toFixed(0)}k
                                            </td>
                                            <td className={clsx("px-4 py-3 text-right font-bold", row.netProfit >= 0 ? "text-green-600" : "text-red-600")}>
                                                ${(row.netProfit / 1000).toFixed(0)}k
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
