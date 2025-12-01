'use client';

import React, { useState, useEffect } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { AlertCircle, TrendingUp, DollarSign, Factory, Globe, ChevronDown } from 'lucide-react';
import { clsx } from 'clsx';

// Types for our JSON data
interface MarketParameters {
    round_info: { current_round: string; description: string };
    market_prospects: {
        demand_forecast: { summary: string; growth_projections: Record<string, string>; tech_trends: Record<string, string> };
        cost_outlook: { summary: string; specifics: string };
        financial_outlook: { summary: string; implications: string };
    };
    parameters: {
        shipping_costs_usd: Record<string, number>;
        tariffs_usd: Record<string, number>;
        management_costs_usd: { fixed_per_round: Record<string, number>; basic_per_factory: Record<string, number> };
        finance: { interest_rates: any; corporate_tax_rate: Record<string, number>; capital_opportunity_cost: number; minimum_cash_usd: number };
        production: { investment_cost_k_usd: Record<string, number>; plant_delay_rounds: number; payment_delay_rounds: number; depreciation_rate: number; cost_per_feature_usd: number };
        exchange_rates: { rmb_to_usd: number; eur_to_usd: number };
    };
}

interface NetworkCoverage {
    description: string;
    regions: {
        usa: Record<string, number[]>;
        asia: Record<string, number[]>;
        europe: Record<string, number[]>;
    };
}

// Initial Data from Image
const INITIAL_DEMAND = {
    usa: 10840,
    asia: 18050,
    europe: 15650
};

const TECHNOLOGIES = ['Technology 1', 'Technology 2', 'Technology 3', 'Technology 4'];

export default function SimulationPage() {
    const [marketParams, setMarketParams] = useState<MarketParameters | null>(null);
    const [networkCoverage, setNetworkCoverage] = useState<NetworkCoverage | null>(null);
    const [loading, setLoading] = useState(true);

    // State for Inputs
    const [growth, setGrowth] = useState({ usa: 0, asia: 0, europe: 0 });
    const [decisions, setDecisions] = useState({
        usa: { p1: { tech: 'Technology 1', share: 10 }, p2: { tech: 'Technology 2', share: 0 } },
        asia: { p1: { tech: 'Technology 1', share: 10 }, p2: { tech: 'Technology 2', share: 0 } },
        europe: { p1: { tech: 'Technology 1', share: 10 }, p2: { tech: 'Technology 2', share: 0 } }
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [paramsRes, coverageRes] = await Promise.all([
                    fetch('/data/market_parameters.json'),
                    fetch('/data/network_coverage.json')
                ]);
                const params = await paramsRes.json();
                const coverage = await coverageRes.json();
                setMarketParams(params);
                setNetworkCoverage(coverage);
            } catch (error) {
                console.error("Failed to load simulation data", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleGrowthChange = (region: 'usa' | 'asia' | 'europe', value: string) => {
        setGrowth(prev => ({ ...prev, [region]: parseFloat(value) || 0 }));
    };

    const handleDecisionChange = (region: 'usa' | 'asia' | 'europe', product: 'p1' | 'p2', field: 'tech' | 'share', value: string | number) => {
        setDecisions(prev => ({
            ...prev,
            [region]: {
                ...prev[region],
                [product]: {
                    ...prev[region][product],
                    [field]: value
                }
            }
        }));
    };

    // Calculations
    const getProjectedDemand = (region: 'usa' | 'asia' | 'europe') => {
        return INITIAL_DEMAND[region] * (1 + growth[region] / 100);
    };

    const getProductVolume = (region: 'usa' | 'asia' | 'europe', share: number) => {
        return (getProjectedDemand(region) * share / 100);
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

    return (
        <div className="min-h-screen bg-gray-50">
            <Sidebar />
            <main className="md:pl-64 transition-all duration-300">
                <header className="bg-white border-b border-gray-200 sticky top-0 z-40 px-8 py-4 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Simulation & Forecasting</h1>
                        <p className="text-sm text-gray-500">{marketParams?.round_info.current_round}</p>
                    </div>
                </header>

                <div className="p-8 max-w-7xl mx-auto grid grid-cols-1 xl:grid-cols-2 gap-8">
                    {/* LEFT COLUMN: DECISION INPUTS */}
                    <div className="space-y-8">

                        {/* 1. Demand Forecast */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
                                <h2 className="font-bold text-gray-900">Forecast of total market demand</h2>
                            </div>
                            <div className="p-6">
                                <table className="w-full text-sm mb-6">
                                    <thead>
                                        <tr className="text-left text-gray-500 border-b border-gray-100">
                                            <th className="pb-2 font-medium">Market</th>
                                            <th className="pb-2 font-medium text-right">Prev Round Demand</th>
                                            <th className="pb-2 font-medium text-right">Growth %</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {(['usa', 'asia', 'europe'] as const).map(region => (
                                            <tr key={region}>
                                                <td className="py-3 font-medium capitalize">{region}</td>
                                                <td className="py-3 text-right text-gray-600">{INITIAL_DEMAND[region].toLocaleString()}</td>
                                                <td className="py-3 text-right">
                                                    <input
                                                        type="number"
                                                        className="w-20 text-right bg-blue-50 border border-blue-200 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500 outline-none text-blue-700 font-medium"
                                                        value={growth[region]}
                                                        onChange={(e) => handleGrowthChange(region, e.target.value)}
                                                    />
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>

                                <div className="h-48">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={[
                                            { name: 'USA', prev: INITIAL_DEMAND.usa, curr: getProjectedDemand('usa') },
                                            { name: 'Asia', prev: INITIAL_DEMAND.asia, curr: getProjectedDemand('asia') },
                                            { name: 'Europe', prev: INITIAL_DEMAND.europe, curr: getProjectedDemand('europe') },
                                        ]}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                            <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                                            <YAxis tick={{ fontSize: 10 }} />
                                            <Tooltip />
                                            <Legend iconType="circle" wrapperStyle={{ fontSize: '10px' }} />
                                            <Bar dataKey="prev" name="Previous Round" fill="#fbbf24" radius={[4, 4, 0, 0]} />
                                            <Bar dataKey="curr" name="Forecast" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>

                        {/* 2. Market Share Forecast */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
                                <h2 className="font-bold text-gray-900">Market Share Forecast</h2>
                                <p className="text-xs text-gray-500 mt-1">Estimate your share for each product in each region.</p>
                            </div>
                            <div className="p-6 space-y-8">
                                {(['usa', 'asia', 'europe'] as const).map(region => (
                                    <div key={region}>
                                        <h3 className="font-bold text-gray-800 uppercase text-xs mb-3 border-b border-gray-100 pb-1">{region}</h3>
                                        <table className="w-full text-sm">
                                            <thead>
                                                <tr className="text-left text-gray-400 text-xs">
                                                    <th className="pb-2 font-normal">Product</th>
                                                    <th className="pb-2 font-normal">Technology</th>
                                                    <th className="pb-2 font-normal text-right">Share %</th>
                                                    <th className="pb-2 font-normal text-right">Vol (k)</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-50">
                                                {(['p1', 'p2'] as const).map((prod, idx) => (
                                                    <tr key={prod}>
                                                        <td className="py-2 font-medium text-gray-700">Product {idx + 1}</td>
                                                        <td className="py-2">
                                                            <div className="relative">
                                                                <select
                                                                    className="w-full appearance-none bg-blue-50 border border-blue-200 rounded px-2 py-1 pr-6 text-xs focus:outline-none focus:border-blue-500 text-blue-700 font-medium"
                                                                    value={decisions[region][prod].tech}
                                                                    onChange={(e) => handleDecisionChange(region, prod, 'tech', e.target.value)}
                                                                >
                                                                    {TECHNOLOGIES.map(t => <option key={t} value={t}>{t}</option>)}
                                                                </select>
                                                                <ChevronDown className="absolute right-1 top-1.5 w-3 h-3 text-gray-400 pointer-events-none" />
                                                            </div>
                                                        </td>
                                                        <td className="py-2 text-right">
                                                            <input
                                                                type="number"
                                                                className="w-16 text-right bg-blue-50 border border-blue-200 rounded px-2 py-1 text-xs focus:ring-2 focus:ring-blue-500 outline-none text-blue-700 font-medium"
                                                                value={decisions[region][prod].share}
                                                                onChange={(e) => handleDecisionChange(region, prod, 'share', parseFloat(e.target.value) || 0)}
                                                            />
                                                        </td>
                                                        <td className="py-2 text-right text-gray-600 font-medium">
                                                            {getProductVolume(region, decisions[region][prod].share).toFixed(0)}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ))}
                            </div>
                        </div>

                    </div>

                    {/* RIGHT COLUMN: REFERENCE DATA */}
                    <div className="space-y-6">
                        {/* Market Prospects */}
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <TrendingUp className="w-5 h-5 text-green-600" />
                                Market Prospects
                            </h2>
                            <div className="space-y-4 text-sm">
                                <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                                    <h4 className="font-semibold text-blue-800 mb-1">Demand Forecast</h4>
                                    <p className="text-blue-600">{marketParams?.market_prospects.demand_forecast.summary}</p>
                                    <div className="mt-2 grid grid-cols-3 gap-2 text-xs">
                                        {Object.entries(marketParams?.market_prospects.demand_forecast.growth_projections || {}).map(([region, growth]) => (
                                            <div key={region} className="bg-white p-2 rounded text-center">
                                                <span className="uppercase font-bold text-gray-500 block">{region}</span>
                                                <span className="font-bold text-green-600">{growth}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="p-3 bg-orange-50 rounded-lg border border-orange-100">
                                    <h4 className="font-semibold text-orange-800 mb-1">Cost Outlook</h4>
                                    <p className="text-orange-600">{marketParams?.market_prospects.cost_outlook.specifics}</p>
                                </div>
                            </div>
                        </div>

                        {/* Network Coverage */}
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <Globe className="w-5 h-5 text-indigo-600" />
                                Network Coverage Prediction
                            </h2>
                            <div className="space-y-8">
                                {['usa', 'asia', 'europe'].map(region => (
                                    <div key={region} className="h-48">
                                        <h4 className="text-sm font-bold text-gray-500 uppercase mb-2">{region}</h4>
                                        <ResponsiveContainer width="100%" height="100%">
                                            <LineChart
                                                data={networkCoverage?.regions[region as 'usa' | 'asia' | 'europe'].tech_1.map((_, i) => ({
                                                    round: i,
                                                    tech1: networkCoverage?.regions[region as 'usa' | 'asia' | 'europe'].tech_1[i],
                                                    tech2: networkCoverage?.regions[region as 'usa' | 'asia' | 'europe'].tech_2[i],
                                                    tech3: networkCoverage?.regions[region as 'usa' | 'asia' | 'europe'].tech_3[i],
                                                    tech4: networkCoverage?.regions[region as 'usa' | 'asia' | 'europe'].tech_4[i],
                                                }))}
                                            >
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                                <XAxis dataKey="round" tick={{ fontSize: 10 }} />
                                                <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} />
                                                <Tooltip />
                                                <Legend iconType="circle" wrapperStyle={{ fontSize: '10px' }} />
                                                <Line type="monotone" dataKey="tech1" stroke="#ef4444" dot={false} strokeWidth={2} name="Tech 1" />
                                                <Line type="monotone" dataKey="tech2" stroke="#eab308" dot={false} strokeWidth={2} name="Tech 2" />
                                                <Line type="monotone" dataKey="tech3" stroke="#22c55e" dot={false} strokeWidth={2} name="Tech 3" />
                                                <Line type="monotone" dataKey="tech4" stroke="#3b82f6" dot={false} strokeWidth={2} name="Tech 4" />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Key Parameters */}
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <DollarSign className="w-5 h-5 text-gray-600" />
                                Key Parameters
                            </h2>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <p className="text-gray-500 text-xs">Exchange Rates</p>
                                    <p className="font-medium">1 RMB = ${marketParams?.parameters.exchange_rates.rmb_to_usd}</p>
                                    <p className="font-medium">1 EUR = ${marketParams?.parameters.exchange_rates.eur_to_usd}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500 text-xs">Interest Rates (Long Term)</p>
                                    <p className="font-medium">{marketParams?.parameters.finance.interest_rates.long_term_debt}%</p>
                                </div>
                                <div className="col-span-2">
                                    <p className="text-gray-500 text-xs">Shipping (USA &rarr; Asia)</p>
                                    <p className="font-medium">${marketParams?.parameters.shipping_costs_usd.usa_to_asia} / unit</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
