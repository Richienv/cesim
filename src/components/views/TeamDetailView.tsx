import React, { useMemo, useState } from 'react';
import { TeamData } from '@/lib/types';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, AreaChart, Area, ScatterChart, Scatter, ZAxis
} from 'recharts';
import { DollarSign, TrendingUp, Factory, Truck, Activity, Target, Lightbulb, Zap, ArrowUp, ArrowDown, Minus, Award, Percent, Layers, Box, Wallet, Scale, AlertCircle, Package, ArrowRight } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

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

    // --- Data Preparation & Analysis Logic ---

    // 1. Market Statistics (for Comparison)
    const marketStats = useMemo(() => {
        let totalPrices = 0;
        let priceCount = 0;
        let prices: number[] = [];
        let totalPromo = 0;
        let totalRnD = 0;
        let maxRevenue = 0;
        let maxProfit = 0;
        let totalFeatures = 0;
        let featureCount = 0;

        teams.forEach(t => {
            // Prices & Features
            ['usa', 'asia', 'europe'].forEach(r => {
                const pList = t.prices[r as 'usa' | 'asia' | 'europe'];
                const fList = t.features[r as 'usa' | 'asia' | 'europe'];

                if (pList) Object.values(pList).forEach(p => {
                    if (p > 0) {
                        totalPrices += p;
                        priceCount++;
                        prices.push(p);
                    }
                });

                if (fList) Object.values(fList).forEach(f => {
                    if (f > 0) {
                        totalFeatures += f;
                        featureCount++;
                    }
                });
            });

            // Promo & R&D
            totalPromo += t.financials.incomeStatement.global["Promotion"] || 0;
            totalRnD += t.financials.incomeStatement.global["R&D"] || 0;

            // Max for scoring
            maxRevenue = Math.max(maxRevenue, t.financials.incomeStatement.global["Sales revenue"] || 0);
            maxProfit = Math.max(maxProfit, t.financials.incomeStatement.global["Profit for the round"] || 0);
        });

        return {
            avgPrice: priceCount > 0 ? totalPrices / priceCount : 0,
            minPrice: Math.min(...prices),
            maxPrice: Math.max(...prices),
            avgPromo: totalPromo / teams.length,
            avgRnD: totalRnD / teams.length,
            avgFeatures: featureCount > 0 ? totalFeatures / featureCount : 0,
            maxRevenue,
            maxProfit
        };
    }, [teams]);

    // 2. Team Specific Metrics
    const teamMetrics = useMemo(() => {
        // Price & Features
        let myTotalPrices = 0;
        let myPriceCount = 0;
        let myTotalFeatures = 0;
        let myFeatureCount = 0;

        ['usa', 'asia', 'europe'].forEach(r => {
            const pList = selectedTeam.prices[r as 'usa' | 'asia' | 'europe'];
            const fList = selectedTeam.features[r as 'usa' | 'asia' | 'europe'];

            if (pList) Object.values(pList).forEach(p => {
                if (p > 0) {
                    myTotalPrices += p;
                    myPriceCount++;
                }
            });

            if (fList) Object.values(fList).forEach(f => {
                if (f > 0) {
                    myTotalFeatures += f;
                    myFeatureCount++;
                }
            });
        });
        const avgPrice = myPriceCount > 0 ? myTotalPrices / myPriceCount : 0;
        const avgFeatures = myFeatureCount > 0 ? myTotalFeatures / myFeatureCount : 0;

        // Financials
        const revenue = selectedTeam.financials.incomeStatement.global["Sales revenue"] || 0;
        const profit = selectedTeam.financials.incomeStatement.global["Profit for the round"] || 0;
        const promo = selectedTeam.financials.incomeStatement.global["Promotion"] || 0;
        const rnd = selectedTeam.financials.incomeStatement.global["R&D"] || 0;

        // Balance Sheet
        const totalAssets = selectedTeam.financials.balanceSheet.global["Total assets"] || 0;
        const totalEquity = selectedTeam.financials.balanceSheet.global["Total equity"] || 0;
        const fixedAssets = selectedTeam.financials.balanceSheet.global["Fixed assets"] || 0;
        const receivables = selectedTeam.financials.balanceSheet.global["Receivables"] || 0;
        const cash = selectedTeam.financials.balanceSheet.global["Cash and equivalents"] || 0;
        const inventory = selectedTeam.financials.balanceSheet.global["Inventory"] || 0;
        const debt = selectedTeam.financials.balanceSheet.global["Long-term debt"] || 0;

        // Position Calculations
        const priceDiffPct = ((avgPrice - marketStats.avgPrice) / marketStats.avgPrice) * 100;
        const promoDiffPct = ((promo - marketStats.avgPromo) / marketStats.avgPromo) * 100;
        const rndDiffPct = ((rnd - marketStats.avgRnD) / marketStats.avgRnD) * 100;
        const featureDiffPct = ((avgFeatures - marketStats.avgFeatures) / marketStats.avgFeatures) * 100;

        // Scoring (0-100)
        const revenueScore = (revenue / marketStats.maxRevenue) * 100;
        const profitScore = (profit / marketStats.maxProfit) * 100;
        const overallScore = (revenueScore * 0.6) + (profitScore * 0.4); // Weighted score

        return {
            avgPrice,
            avgFeatures,
            revenue,
            profit,
            promo,
            rnd,
            totalAssets,
            totalEquity,
            fixedAssets,
            receivables,
            cash,
            inventory,
            debt,
            priceDiffPct,
            promoDiffPct,
            rndDiffPct,
            featureDiffPct,
            overallScore,
            revenueScore,
            profitScore
        };
    }, [selectedTeam, marketStats]);

    // 3. Strategy Detection (Refined)
    const strategy = useMemo(() => {
        const { priceDiffPct, rndDiffPct, promoDiffPct } = teamMetrics;

        if (priceDiffPct > 5 && rndDiffPct > 10) return {
            name: "Premium Innovator",
            desc: "High prices justified by superior technology.",
            color: "text-purple-600",
            bg: "bg-purple-50",
            border: "border-purple-200"
        };
        if (priceDiffPct < -5 && rndDiffPct < 5) return {
            name: "Cost Leader",
            desc: "Undercutting competitors to drive volume.",
            color: "text-blue-600",
            bg: "bg-blue-50",
            border: "border-blue-200"
        };
        if (promoDiffPct > 15 && priceDiffPct > 0) return {
            name: "Brand Builder",
            desc: "Heavy marketing spend to support premium pricing.",
            color: "text-pink-600",
            bg: "bg-pink-50",
            border: "border-pink-200"
        };
        if (promoDiffPct > 15 && priceDiffPct < -5) return {
            name: "Aggressive Penetration",
            desc: "Buying market share with low prices and high ads.",
            color: "text-red-600",
            bg: "bg-red-50",
            border: "border-red-200"
        };
        return {
            name: "Balanced Competitor",
            desc: "Maintains average positioning across all fronts.",
            color: "text-gray-600",
            bg: "bg-gray-50",
            border: "border-gray-200"
        };
    }, [teamMetrics]);

    // 4. Value Proposition Data
    const valuePropData = useMemo(() => {
        return teams.map(t => {
            let tPrice = 0;
            let tCount = 0;
            let tFeat = 0;
            let fCount = 0;

            ['usa', 'asia', 'europe'].forEach(r => {
                const pList = t.prices[r as 'usa' | 'asia' | 'europe'];
                const fList = t.features[r as 'usa' | 'asia' | 'europe'];
                if (pList) Object.values(pList).forEach(p => { if (p > 0) { tPrice += p; tCount++; } });
                if (fList) Object.values(fList).forEach(f => { if (f > 0) { tFeat += f; fCount++; } });
            });

            return {
                name: t.name,
                price: tCount > 0 ? tPrice / tCount : 0,
                features: fCount > 0 ? tFeat / fCount : 0,
                isCurrent: t.name === selectedTeam.name
            };
        });
    }, [teams, selectedTeam]);

    // 5. Manufacturing Data
    const manufacturingData = useMemo(() => {
        const techs = ['Tech 1', 'Tech 2', 'Tech 3', 'Tech 4'];
        return techs.map(tech => {
            const usaInHouse = selectedTeam.manufacturing.usa.inHouse[tech] || 0;
            const usaContract = selectedTeam.manufacturing.usa.contract[tech] || 0;
            const asiaInHouse = selectedTeam.manufacturing.asia.inHouse[tech] || 0;
            const asiaContract = selectedTeam.manufacturing.asia.contract[tech] || 0;

            return {
                name: tech,
                'USA In-House': usaInHouse,
                'USA Contract': usaContract,
                'Asia In-House': asiaInHouse,
                'Asia Contract': asiaContract,
            };
        });
    }, [selectedTeam]);

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                        {selectedTeam.name}
                        <span className={clsx("px-3 py-1 text-sm font-medium rounded-full border", strategy.bg, strategy.color, strategy.border)}>
                            {strategy.name}
                        </span>
                    </h2>
                    <p className="text-gray-500 text-sm mt-1">{strategy.desc}</p>
                </div>
                <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-gray-500">Analyze Team:</span>
                    <select
                        value={selectedTeamName}
                        onChange={(e) => setSelectedTeamName(e.target.value)}
                        className="bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5"
                    >
                        {sortedTeams.map(t => (
                            <option key={t.name} value={t.name}>{t.name}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* SECTION 1: REGIONAL BREAKDOWN (TOP) */}
            <div>
                <h3 className="text-lg font-bold text-gray-900 mb-6">Regional Breakdown</h3>
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                    {['USA', 'Asia', 'Europe'].map(regionName => {
                        const regionKey = regionName.toLowerCase() as 'usa' | 'asia' | 'europe';
                        const rMargins = selectedTeam.margins[regionKey];
                        const rLogistics = selectedTeam.logistics[regionKey];
                        const rFeatures = selectedTeam.features[regionKey];
                        const rMarketShare = selectedTeam.marketShare[regionKey];
                        const rDemand = selectedTeam.demand[regionKey];
                        const techs = ['Tech 1', 'Tech 2', 'Tech 3', 'Tech 4'];
                        const currency = regionName === 'Asia' ? '¥' : regionName === 'Europe' ? '€' : '$';

                        return (
                            <div key={regionName} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                                <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                                    <h4 className="font-semibold text-gray-900">{regionName}</h4>
                                    <span className="text-xs font-medium bg-white px-2 py-1 rounded border border-gray-200 text-gray-500">
                                        {currency}
                                    </span>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm text-left">
                                        <thead className="text-xs text-gray-500 uppercase bg-gray-50/50">
                                            <tr>
                                                <th className="px-4 py-3">Tech</th>
                                                <th className="px-4 py-3 text-right">Price</th>
                                                <th className="px-4 py-3 text-right">Feat</th>
                                                <th className="px-4 py-3 text-right">Share</th>
                                                <th className="px-4 py-3 text-right">Demand</th>
                                                <th className="px-4 py-3 text-right">Sales</th>
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
                                                const features = rFeatures?.[tech] || 0;
                                                const share = rMarketShare?.[tech] || 0;
                                                const demand = rDemand?.[tech] || 0;

                                                // Missed Opportunity Logic
                                                const missedOpp = demand > qty * 1.05; // 5% buffer

                                                if (qty === 0 && rev === 0) return null;

                                                return (
                                                    <tr key={tech} className="border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors">
                                                        <td className="px-4 py-3 font-medium text-gray-900">{tech}</td>
                                                        <td className="px-4 py-3 text-right font-bold text-blue-600 bg-blue-50/30">
                                                            {currency}{price.toFixed(0)}
                                                        </td>
                                                        <td className="px-4 py-3 text-right text-gray-600">{features}</td>
                                                        <td className="px-4 py-3 text-right text-gray-600">{share.toFixed(1)}%</td>
                                                        <td className="px-4 py-3 text-right text-gray-500">{demand.toLocaleString()}</td>
                                                        <td className={clsx("px-4 py-3 text-right font-medium", missedOpp ? "text-orange-600" : "text-gray-900")}>
                                                            {qty.toLocaleString()}
                                                            {missedOpp && <AlertCircle className="w-3 h-3 inline ml-1 text-orange-500" />}
                                                        </td>
                                                        <td className={clsx("px-4 py-3 text-right font-bold", profit >= 0 ? "text-green-600" : "text-red-600")}>
                                                            {currency}{(profit / 1000).toFixed(0)}k
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

            {/* SECTION 2: SUPPLY CHAIN & LOGISTICS (NEW) */}
            <div className="pt-8 border-t border-gray-100">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Truck className="w-5 h-5 text-orange-500" />
                    Supply Chain & Logistics <span className="text-gray-400 font-normal text-sm">(Flow of Goods)</span>
                </h3>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {['USA', 'Asia', 'Europe'].map(regionName => {
                        const regionKey = regionName.toLowerCase() as 'usa' | 'asia' | 'europe';
                        const logistics = selectedTeam.logistics[regionKey];
                        const techs = ['Tech 1', 'Tech 2', 'Tech 3', 'Tech 4'];

                        return (
                            <div key={regionName} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                                <h4 className="font-semibold text-gray-900 mb-4 border-b border-gray-50 pb-2">{regionName} Logistics</h4>
                                <div className="space-y-6">
                                    {techs.map(tech => {
                                        const lData = logistics?.[tech];
                                        if (!lData || (lData.total === 0 && lData.sales === 0)) return null;

                                        return (
                                            <div key={tech} className="text-sm">
                                                <div className="flex justify-between items-center mb-1">
                                                    <span className="font-medium text-gray-700">{tech}</span>
                                                    <span className="text-xs text-gray-500">Total Supply: {lData.total.toFixed(0)}k</span>
                                                </div>

                                                {/* Supply Bar */}
                                                <div className="flex w-full h-2 rounded-full overflow-hidden mb-1">
                                                    <div className="bg-blue-500 h-full" style={{ width: `${(lData.inHouse / lData.total) * 100}%` }} title="In-House" />
                                                    <div className="bg-cyan-400 h-full" style={{ width: `${(lData.contract / lData.total) * 100}%` }} title="Contract" />
                                                    <div className="bg-purple-400 h-full" style={{ width: `${(lData.imported / lData.total) * 100}%` }} title="Imported" />
                                                </div>

                                                {/* Demand Bar */}
                                                <div className="flex w-full h-2 rounded-full overflow-hidden">
                                                    <div className="bg-green-500 h-full" style={{ width: `${(Math.abs(lData.sales) / lData.total) * 100}%` }} title="Sales" />
                                                    <div className="bg-orange-400 h-full" style={{ width: `${(lData.exported / lData.total) * 100}%` }} title="Exported" />
                                                    <div className="bg-gray-300 h-full" style={{ width: `${(lData.productionBuffer / lData.total) * 100}%` }} title="Buffer" />
                                                </div>

                                                <div className="flex justify-between text-xs text-gray-400 mt-1">
                                                    <span>Supply (In/Out/Imp)</span>
                                                    <span>Demand (Sale/Exp/Buf)</span>
                                                </div>

                                                {lData.unsatisfiedDemand > 0 && (
                                                    <div className="mt-1 text-xs text-red-500 flex items-center gap-1">
                                                        <AlertCircle className="w-3 h-3" />
                                                        Unsatisfied Demand: {lData.unsatisfiedDemand.toFixed(0)}k
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* SECTION 3: MANUFACTURING DETAILS (NEW) */}
            <div className="pt-8 border-t border-gray-100">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Factory className="w-5 h-5 text-gray-600" />
                    Manufacturing Details <span className="text-gray-400 font-normal text-sm">(In-House vs Contract)</span>
                </h3>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={manufacturingData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="USA In-House" stackId="usa" fill="#3b82f6" />
                                <Bar dataKey="USA Contract" stackId="usa" fill="#93c5fd" />
                                <Bar dataKey="Asia In-House" stackId="asia" fill="#ef4444" />
                                <Bar dataKey="Asia Contract" stackId="asia" fill="#fca5a5" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* SECTION 4: DEEP DIVE METRICS (Financials & Capacity) */}
            <div className="pt-8 border-t border-gray-100">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Scale className="w-5 h-5 text-indigo-500" />
                    Deep Dive Analysis <span className="text-gray-400 font-normal text-sm">(Financials & Production)</span>
                </h3>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Financial Position (Balance Sheet) */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <p className="text-sm text-gray-500 font-medium mb-4">Financial Position (Balance Sheet)</p>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center border-b border-gray-50 pb-2">
                                <span className="text-sm text-gray-600">Total Assets</span>
                                <span className="font-bold text-gray-900">${(teamMetrics.totalAssets / 1000).toFixed(1)}k</span>
                            </div>
                            <div className="flex justify-between items-center border-b border-gray-50 pb-2">
                                <span className="text-sm text-gray-600">Shareholders' Equity</span>
                                <span className="font-bold text-blue-600">${(teamMetrics.totalEquity / 1000).toFixed(1)}k</span>
                            </div>
                            <div className="flex justify-between items-center border-b border-gray-50 pb-2">
                                <span className="text-sm text-gray-600">Fixed Assets</span>
                                <span className="font-bold text-gray-900">${(teamMetrics.fixedAssets / 1000).toFixed(1)}k</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">Receivables</span>
                                <span className="font-bold text-gray-900">${(teamMetrics.receivables / 1000).toFixed(1)}k</span>
                            </div>
                        </div>
                    </div>

                    {/* Production Efficiency (Capacity) */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <p className="text-sm text-gray-500 font-medium mb-4">Production Efficiency</p>
                        <div className="space-y-6">
                            {['USA', 'Asia'].map(region => {
                                const rKey = region.toLowerCase() as 'usa' | 'asia';
                                const capUsage = selectedTeam.manufacturing[rKey].capacityUsage || {};

                                return (
                                    <div key={region}>
                                        <p className="text-xs font-bold text-gray-400 uppercase mb-2">{region} Capacity Usage</p>
                                        <div className="space-y-3">
                                            {Object.entries(capUsage).map(([tech, usage]) => (
                                                <div key={tech}>
                                                    <div className="flex justify-between text-xs mb-1">
                                                        <span className="text-gray-700">{tech}</span>
                                                        <span className={clsx("font-bold", usage > 100 ? "text-red-500" : "text-green-600")}>
                                                            {usage.toFixed(1)}%
                                                        </span>
                                                    </div>
                                                    <div className="w-full bg-gray-100 rounded-full h-1.5">
                                                        <div
                                                            className={clsx("h-1.5 rounded-full", usage > 100 ? "bg-red-500" : "bg-green-500")}
                                                            style={{ width: `${Math.min(100, usage)}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            ))}
                                            {Object.keys(capUsage).length === 0 && <p className="text-xs text-gray-400 italic">No capacity data available.</p>}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Operational Health (Existing) */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <p className="text-sm text-gray-500 font-medium mb-4">Operational Health</p>
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-green-50 rounded-lg"><Wallet className="w-4 h-4 text-green-600" /></div>
                                <div>
                                    <p className="text-xs text-gray-500">Cash on Hand</p>
                                    <p className="font-bold text-gray-900">${(teamMetrics.cash / 1000).toFixed(1)}k</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-orange-50 rounded-lg"><Box className="w-4 h-4 text-orange-600" /></div>
                                <div>
                                    <p className="text-xs text-gray-500">Inventory Value</p>
                                    <p className="font-bold text-gray-900">${(teamMetrics.inventory / 1000).toFixed(1)}k</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-red-50 rounded-lg"><Layers className="w-4 h-4 text-red-600" /></div>
                                <div>
                                    <p className="text-xs text-gray-500">Long-term Debt</p>
                                    <p className="font-bold text-gray-900">${(teamMetrics.debt / 1000).toFixed(1)}k</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* SECTION 5: GLOBAL STRATEGY INPUTS (Existing) */}
            <div className="pt-8 border-t border-gray-100">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Lightbulb className="w-5 h-5 text-yellow-500" />
                    Global Strategy <span className="text-gray-400 font-normal text-sm">(Aggregated View)</span>
                </h3>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Value Proposition Matrix */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col">
                        <div className="flex justify-between items-start mb-4">
                            <p className="text-sm text-gray-500 font-medium">Value Proposition (Price vs Features)</p>
                            <div className={clsx("px-2 py-1 rounded text-xs font-bold",
                                teamMetrics.featureDiffPct > 0 ? "bg-purple-50 text-purple-600" : "bg-gray-50 text-gray-600"
                            )}>
                                {teamMetrics.featureDiffPct > 0 ? "+" : ""}{teamMetrics.featureDiffPct.toFixed(1)}% Feat vs Avg
                            </div>
                        </div>
                        <div className="h-[200px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis type="number" dataKey="price" name="Price" unit="$" label={{ value: 'Price', position: 'bottom', offset: 0 }} />
                                    <YAxis type="number" dataKey="features" name="Features" label={{ value: 'Features', angle: -90, position: 'left' }} />
                                    <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                                    <Scatter name="Teams" data={valuePropData} fill="#8884d8">
                                        {valuePropData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.isCurrent ? '#2563eb' : '#94a3b8'} />
                                        ))}
                                    </Scatter>
                                </ScatterChart>
                            </ResponsiveContainer>
                        </div>
                        <p className="text-xs text-center text-gray-400 mt-2">Blue dot is current team. Higher is better features, right is higher price.</p>
                    </div>

                    {/* Marketing & Innovation Card */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <p className="text-sm text-gray-500 font-medium mb-4">Investment Strategy</p>

                        <div className="space-y-6">
                            {/* Promotion */}
                            <div>
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="text-gray-700 font-medium">Promotion Spend</span>
                                    <span className={clsx("font-bold", teamMetrics.promoDiffPct > 0 ? "text-green-600" : "text-gray-600")}>
                                        ${(teamMetrics.promo / 1000).toFixed(1)}k
                                    </span>
                                </div>
                                <div className="w-full bg-gray-100 rounded-full h-2">
                                    <div
                                        className="bg-pink-500 h-2 rounded-full"
                                        style={{ width: `${Math.min(100, (teamMetrics.promo / (marketStats.avgPromo * 2)) * 100)}%` }}
                                    />
                                </div>
                            </div>

                            {/* R&D */}
                            <div>
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="text-gray-700 font-medium">R&D Investment</span>
                                    <span className={clsx("font-bold", teamMetrics.rndDiffPct > 0 ? "text-blue-600" : "text-gray-600")}>
                                        ${(teamMetrics.rnd / 1000).toFixed(1)}k
                                    </span>
                                </div>
                                <div className="w-full bg-gray-100 rounded-full h-2">
                                    <div
                                        className="bg-indigo-500 h-2 rounded-full"
                                        style={{ width: `${Math.min(100, (teamMetrics.rnd / (marketStats.avgRnD * 2)) * 100)}%` }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Manufacturing Mix */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <p className="text-sm text-gray-500 font-medium mb-2">Manufacturing Mix</p>
                        <div className="h-[140px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={[
                                            { name: 'In-House', value: Object.values(selectedTeam.manufacturing.usa.inHouse).reduce((a, b) => a + b, 0) + Object.values(selectedTeam.manufacturing.asia.inHouse).reduce((a, b) => a + b, 0) },
                                            { name: 'Contract', value: Object.values(selectedTeam.manufacturing.usa.contract).reduce((a, b) => a + b, 0) + Object.values(selectedTeam.manufacturing.asia.contract).reduce((a, b) => a + b, 0) }
                                        ]}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={40}
                                        outerRadius={60}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        <Cell fill="#ef4444" />
                                        <Cell fill="#3b82f6" />
                                    </Pie>
                                    <Tooltip />
                                    <Legend verticalAlign="middle" align="right" layout="vertical" iconType="circle" />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            </div>

            {/* SECTION 6: PERFORMANCE RESULTS */}
            <div className="pt-8 border-t border-gray-100">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Award className="w-5 h-5 text-blue-500" />
                    Global Performance <span className="text-gray-400 font-normal text-sm">(Aggregated Results)</span>
                </h3>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Scorecard */}
                    <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl p-6 text-white shadow-lg flex flex-col justify-center items-center text-center">
                        <div className="relative w-24 h-24 flex items-center justify-center mb-4">
                            <svg className="w-full h-full transform -rotate-90">
                                <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-blue-500/30" />
                                <circle
                                    cx="48" cy="48" r="40"
                                    stroke="currentColor" strokeWidth="8"
                                    fill="transparent"
                                    strokeDasharray={251.2}
                                    strokeDashoffset={251.2 - (251.2 * teamMetrics.overallScore / 100)}
                                    className="text-white transition-all duration-1000 ease-out"
                                />
                            </svg>
                            <span className="absolute text-3xl font-bold">{teamMetrics.overallScore.toFixed(0)}</span>
                        </div>
                        <h4 className="font-semibold text-lg">Performance Score</h4>
                        <p className="text-blue-100 text-xs mt-1">Based on Revenue & Profit vs Market Leaders</p>
                    </div>

                    {/* Financial Outcomes */}
                    <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-4">
                        <MetricCard
                            title="Sales Revenue"
                            value={`$${(teamMetrics.revenue / 1000).toFixed(1)}k`}
                            icon={<DollarSign className="text-blue-500" />}
                            subtext={`Rank #${rank} in Market`}
                        />
                        <MetricCard
                            title="Net Profit"
                            value={`$${(teamMetrics.profit / 1000).toFixed(1)}k`}
                            icon={<TrendingUp className="text-green-500" />}
                            subtext={`${((teamMetrics.profit / teamMetrics.revenue) * 100).toFixed(1)}% Margin`}
                        />
                        <MetricCard
                            title="Market Share (Est)"
                            value={`${(teamMetrics.revenueScore * 0.2).toFixed(1)}%`} // Rough proxy for visual
                            icon={<Activity className="text-purple-500" />}
                            subtext="Global Revenue Share"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

function MetricCard({ title, value, icon, subtext }: { title: string, value: string, icon: React.ReactNode, subtext?: string }) {
    return (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 flex items-center gap-4">
            <div className="p-3 bg-gray-50 rounded-lg">{icon}</div>
            <div>
                <p className="text-sm text-gray-500 font-medium">{title}</p>
                <h4 className="text-2xl font-bold text-gray-900">{value}</h4>
                {subtext && <p className="text-xs text-gray-400 mt-0.5">{subtext}</p>}
            </div>
        </div>
    );
}
