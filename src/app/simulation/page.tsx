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

const TEAMS = [
    { id: 'red', name: 'Red Team', color: 'bg-red-500' },
    { id: 'blue', name: 'Blue Team', color: 'bg-blue-500' },
    { id: 'green', name: 'Green Team', color: 'bg-green-500' },
    { id: 'yellow', name: 'Yellow Team', color: 'bg-yellow-500' },
    { id: 'pink', name: 'Pink Team', color: 'bg-pink-500' },
    { id: 'orange', name: 'Orange Team', color: 'bg-orange-500' },
];

interface TeamState {
    growth: { usa: number; asia: number; europe: number };
    decisions: {
        usa: { p1: { tech: string; share: number }; p2: { tech: string; share: number } };
        asia: { p1: { tech: string; share: number }; p2: { tech: string; share: number } };
        europe: { p1: { tech: string; share: number }; p2: { tech: string; share: number } };
        production: {
            usa: {
                line1: { tech: string; capacity: number };
                line2: { tech: string; capacity: number };
                outsourcing: { tech: string; amount: number };
                investment: number;
            };
            asia: {
                line1: { tech: string; capacity: number };
                line2: { tech: string; capacity: number };
                outsourcing: { tech: string; amount: number };
                investment: number;
            };
        };
        rnd: {
            [key: string]: { spend: number; features: string };
        };
        marketing: {
            usa: Record<string, { price: number; promo: number; features: number }>;
            asia: Record<string, { price: number; promo: number; features: number }>;
            europe: Record<string, { price: number; promo: number; features: number }>;
        };
    };
}

const INITIAL_TEAM_STATE: TeamState = {
    growth: { usa: 0, asia: 0, europe: 0 },
    decisions: {
        usa: { p1: { tech: 'Technology 1', share: 10 }, p2: { tech: 'Technology 2', share: 0 } },
        asia: { p1: { tech: 'Technology 1', share: 10 }, p2: { tech: 'Technology 2', share: 0 } },
        europe: { p1: { tech: 'Technology 1', share: 10 }, p2: { tech: 'Technology 2', share: 0 } },
        production: {
            usa: {
                line1: { tech: 'Technology 1', capacity: 81.0 },
                line2: { tech: 'Technology 1', capacity: 0 },
                outsourcing: { tech: 'Technology 1', amount: 0 },
                investment: 0
            },
            asia: {
                line1: { tech: 'Technology 1', capacity: 0 },
                line2: { tech: 'Technology 1', capacity: 0 },
                outsourcing: { tech: 'Technology 1', amount: 0 },
                investment: 0
            }
        },
        rnd: {
            tech1: { spend: 0, features: 'Not purchased' },
            tech2: { spend: 0, features: 'Not purchased' },
            tech3: { spend: 0, features: 'Not purchased' },
            tech4: { spend: 0, features: 'Not purchased' }
        },
        marketing: {
            usa: {
                tech1: { price: 280, promo: 5580, features: 2 },
                tech2: { price: 0, promo: 0, features: 1 },
                tech3: { price: 0, promo: 0, features: 1 },
                tech4: { price: 0, promo: 0, features: 1 }
            },
            asia: {
                tech1: { price: 280, promo: 5580, features: 2 },
                tech2: { price: 0, promo: 0, features: 1 },
                tech3: { price: 0, promo: 0, features: 1 },
                tech4: { price: 0, promo: 0, features: 1 }
            },
            europe: {
                tech1: { price: 280, promo: 5580, features: 2 },
                tech2: { price: 0, promo: 0, features: 1 },
                tech3: { price: 0, promo: 0, features: 1 },
                tech4: { price: 0, promo: 0, features: 1 }
            }
        }
    }
};

const SECTIONS = [
    { id: 'demand', label: 'Demand Forecast' },
    { id: 'production', label: 'Production' },
    { id: 'rnd', label: 'Research & Development' },
    { id: 'marketing', label: 'Marketing' },
    { id: 'logistics', label: 'Logistics' },
    { id: 'finance', label: 'Finance' },
];

export default function SimulationPage() {
    const [marketParams, setMarketParams] = useState<MarketParameters | null>(null);
    const [networkCoverage, setNetworkCoverage] = useState<NetworkCoverage | null>(null);
    const [loading, setLoading] = useState(true);

    // Team Management
    const [selectedTeam, setSelectedTeam] = useState(TEAMS[0].id);
    const [teamStates, setTeamStates] = useState<Record<string, TeamState>>(() => {
        const initial: Record<string, TeamState> = {};
        TEAMS.forEach(team => {
            initial[team.id] = JSON.parse(JSON.stringify(INITIAL_TEAM_STATE));
        });
        return initial;
    });

    const [activeSection, setActiveSection] = useState('demand');
    const [productionTab, setProductionTab] = useState<'plan' | 'invest'>('plan');
    const [marketingRegion, setMarketingRegion] = useState<'usa' | 'asia' | 'europe'>('usa');

    const currentTeamState = teamStates[selectedTeam];

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
        const val = parseFloat(value) || 0;
        setTeamStates(prev => ({
            ...prev,
            [selectedTeam]: {
                ...prev[selectedTeam],
                growth: { ...prev[selectedTeam].growth, [region]: val }
            }
        }));
    };

    const handleDecisionChange = (region: 'usa' | 'asia' | 'europe', product: 'p1' | 'p2', field: 'tech' | 'share', value: string | number) => {
        setTeamStates(prev => ({
            ...prev,
            [selectedTeam]: {
                ...prev[selectedTeam],
                decisions: {
                    ...prev[selectedTeam].decisions,
                    [region]: {
                        ...prev[selectedTeam].decisions[region],
                        [product]: {
                            ...prev[selectedTeam].decisions[region][product],
                            [field]: value
                        }
                    }
                }
            }
        }));
    };

    const handleProductionChange = (region: 'usa' | 'asia', type: 'line1' | 'line2' | 'outsourcing' | 'investment', field: string, value: string | number) => {
        setTeamStates(prev => ({
            ...prev,
            [selectedTeam]: {
                ...prev[selectedTeam],
                decisions: {
                    ...prev[selectedTeam].decisions,
                    production: {
                        ...prev[selectedTeam].decisions.production,
                        [region]: {
                            ...prev[selectedTeam].decisions.production[region],
                            [type]: typeof prev[selectedTeam].decisions.production[region][type as 'line1'] === 'object'
                                ? { ...prev[selectedTeam].decisions.production[region][type as 'line1'], [field]: value }
                                : value
                        }
                    }
                }
            }
        }));
    };

    const handleRndChange = (tech: string, field: 'spend' | 'features', value: string | number) => {
        setTeamStates(prev => ({
            ...prev,
            [selectedTeam]: {
                ...prev[selectedTeam],
                decisions: {
                    ...prev[selectedTeam].decisions,
                    rnd: {
                        ...prev[selectedTeam].decisions.rnd,
                        [tech]: {
                            ...prev[selectedTeam].decisions.rnd[tech],
                            [field]: value
                        }
                    }
                }
            }
        }));
    };

    const handleMarketingChange = (region: 'usa' | 'asia' | 'europe', tech: string, field: 'price' | 'promo' | 'features', value: number) => {
        setTeamStates(prev => ({
            ...prev,
            [selectedTeam]: {
                ...prev[selectedTeam],
                decisions: {
                    ...prev[selectedTeam].decisions,
                    marketing: {
                        ...prev[selectedTeam].decisions.marketing,
                        [region]: {
                            ...prev[selectedTeam].decisions.marketing[region],
                            [tech]: {
                                ...prev[selectedTeam].decisions.marketing[region][tech],
                                [field]: value
                            }
                        }
                    }
                }
            }
        }));
    };

    // Calculations
    const getProjectedDemand = (region: 'usa' | 'asia' | 'europe') => {
        return INITIAL_DEMAND[region] * (1 + currentTeamState.growth[region] / 100);
    };

    const getProductVolume = (region: 'usa' | 'asia' | 'europe', share: number) => {
        return (getProjectedDemand(region) * share / 100);
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

    return (
        <div className="min-h-screen bg-gray-50">
            <Sidebar />
            <main className="md:pl-64 transition-all duration-300">
                {/* Header */}
                <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
                    <div className="px-8 py-4 flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Simulation & Forecasting</h1>
                            <p className="text-sm text-gray-500">{marketParams?.round_info.current_round}</p>
                        </div>
                        {/* Team Selector */}
                        <div className="flex items-center gap-3">
                            <span className="text-sm font-medium text-gray-500">Simulating for:</span>
                            <div className="relative">
                                <select
                                    value={selectedTeam}
                                    onChange={(e) => setSelectedTeam(e.target.value)}
                                    className="appearance-none bg-white border border-gray-200 text-gray-700 py-2 pl-4 pr-10 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                                >
                                    {TEAMS.map(team => (
                                        <option key={team.id} value={team.id}>{team.name}</option>
                                    ))}
                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                            </div>
                            <div className={`w-8 h-8 rounded-full ${TEAMS.find(t => t.id === selectedTeam)?.color} shadow-sm border-2 border-white`}></div>
                        </div>
                    </div>

                    {/* Sub-Navigation */}
                    <div className="px-8 flex overflow-x-auto border-t border-gray-100">
                        {SECTIONS.map(section => (
                            <button
                                key={section.id}
                                onClick={() => setActiveSection(section.id)}
                                className={clsx(
                                    "px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors",
                                    activeSection === section.id
                                        ? "border-red-500 text-red-600"
                                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                                )}
                            >
                                {section.label}
                            </button>
                        ))}
                    </div>
                </header>

                <div className="p-8 max-w-7xl mx-auto">

                    {/* DEMAND FORECAST SECTION */}
                    {activeSection === 'demand' && (
                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
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
                                                                value={currentTeamState.growth[region]}
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
                                                                            value={currentTeamState.decisions[region][prod].tech}
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
                                                                        value={currentTeamState.decisions[region][prod].share}
                                                                        onChange={(e) => handleDecisionChange(region, prod, 'share', parseFloat(e.target.value) || 0)}
                                                                    />
                                                                </td>
                                                                <td className="py-2 text-right text-gray-600 font-medium">
                                                                    {getProductVolume(region, currentTeamState.decisions[region][prod].share).toFixed(0)}
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
                    )}

                    {/* PRODUCTION SECTION */}
                    {activeSection === 'production' && (
                        <div className="space-y-6">
                            {/* Production Tabs */}
                            <div className="flex gap-4 border-b border-gray-200">
                                <button
                                    onClick={() => setProductionTab('plan')}
                                    className={clsx(
                                        "pb-3 text-sm font-medium border-b-2 transition-colors",
                                        productionTab === 'plan' ? "border-red-500 text-red-600" : "border-transparent text-gray-500 hover:text-gray-700"
                                    )}
                                >
                                    Production Plan
                                </button>
                                <button
                                    onClick={() => setProductionTab('invest')}
                                    className={clsx(
                                        "pb-3 text-sm font-medium border-b-2 transition-colors",
                                        productionTab === 'invest' ? "border-red-500 text-red-600" : "border-transparent text-gray-500 hover:text-gray-700"
                                    )}
                                >
                                    Factory Investment
                                </button>
                            </div>

                            {productionTab === 'plan' && (
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                    {/* Self Production */}
                                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                                        <div className="px-6 py-4 border-b border-gray-100 bg-red-50">
                                            <h3 className="font-bold text-red-900">Self-production</h3>
                                        </div>
                                        <div className="p-6">
                                            <table className="w-full text-sm">
                                                <thead>
                                                    <tr className="bg-gray-50 text-gray-600">
                                                        <th className="p-2 text-left"></th>
                                                        <th className="p-2 text-center" colSpan={2}>USA</th>
                                                        <th className="p-2 text-center" colSpan={2}>Asia</th>
                                                    </tr>
                                                    <tr className="text-xs text-gray-500 border-b border-gray-100">
                                                        <th className="p-2"></th>
                                                        <th className="p-2">Line 1</th>
                                                        <th className="p-2">Line 2</th>
                                                        <th className="p-2">Line 1</th>
                                                        <th className="p-2">Line 2</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-50">
                                                    <tr>
                                                        <td className="p-2 font-medium">Technology</td>
                                                        {(['usa', 'asia'] as const).map(region =>
                                                            (['line1', 'line2'] as const).map(line => (
                                                                <td key={`${region}-${line}`} className="p-2">
                                                                    <select
                                                                        className="w-full bg-blue-50 border border-blue-200 rounded px-1 py-1 text-xs focus:outline-none text-blue-700"
                                                                        value={currentTeamState.decisions.production[region][line].tech}
                                                                        onChange={(e) => handleProductionChange(region, line, 'tech', e.target.value)}
                                                                    >
                                                                        {TECHNOLOGIES.map(t => <option key={t} value={t}>{t}</option>)}
                                                                    </select>
                                                                </td>
                                                            ))
                                                        )}
                                                    </tr>
                                                    <tr>
                                                        <td className="p-2 font-medium">
                                                            Capacity allocation, %
                                                            <span className="ml-1 text-gray-400 text-xs">?</span>
                                                        </td>
                                                        {(['usa', 'asia'] as const).map(region =>
                                                            (['line1', 'line2'] as const).map(line => (
                                                                <td key={`${region}-${line}`} className="p-2">
                                                                    <input
                                                                        type="number"
                                                                        className="w-full text-right bg-blue-50 border border-blue-200 rounded px-1 py-1 text-xs focus:outline-none text-blue-700"
                                                                        value={currentTeamState.decisions.production[region][line].capacity}
                                                                        onChange={(e) => handleProductionChange(region, line, 'capacity', parseFloat(e.target.value) || 0)}
                                                                    />
                                                                </td>
                                                            ))
                                                        )}
                                                    </tr>
                                                    <tr>
                                                        <td className="p-2 text-gray-600">
                                                            Unit production cost, USD
                                                            <span className="ml-1 text-gray-400 text-xs">?</span>
                                                        </td>
                                                        <td className="p-2 text-center text-gray-500">N/A</td>
                                                        <td className="p-2 text-center text-gray-500"></td>
                                                        <td className="p-2 text-center text-gray-500"></td>
                                                        <td className="p-2 text-center text-gray-500"></td>
                                                    </tr>
                                                    <tr>
                                                        <td className="p-2 text-gray-600">Scrap rate, %</td>
                                                        <td className="p-2 text-center text-gray-500">1.92</td>
                                                        <td className="p-2 text-center text-gray-500"></td>
                                                        <td className="p-2 text-center text-gray-500"></td>
                                                        <td className="p-2 text-center text-gray-500"></td>
                                                    </tr>
                                                    <tr>
                                                        <td className="p-2 text-gray-600">Projected demand: 1,000 units</td>
                                                        <td className="p-2 text-center text-gray-500">0</td>
                                                        <td className="p-2 text-center text-gray-500">0</td>
                                                        <td className="p-2 text-center text-gray-500">0</td>
                                                        <td className="p-2 text-center text-gray-500">0</td>
                                                    </tr>
                                                    <tr>
                                                        <td className="p-2 text-gray-600">Estimated production volume, thousands of pieces</td>
                                                        {/* USA Line 1 Calculation: 6600 * capacity / 100 */}
                                                        <td className="p-2 text-center text-gray-900 font-medium">
                                                            {(6600 * currentTeamState.decisions.production.usa.line1.capacity / 100).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, " ")}
                                                        </td>
                                                        <td className="p-2 text-center text-gray-500">0</td>
                                                        <td className="p-2 text-center text-gray-500">0</td>
                                                        <td className="p-2 text-center text-gray-500">0</td>
                                                    </tr>
                                                </tbody>
                                                {/* Production Capacity Section */}
                                                <thead>
                                                    <tr className="bg-gray-50 border-t border-b border-gray-200">
                                                        <th className="p-2 text-left font-bold text-gray-700" colSpan={5}>Production capacity</th>
                                                    </tr>
                                                    <tr className="bg-red-50 text-gray-600 text-xs">
                                                        <th className="p-2 text-left"></th>
                                                        <th className="p-2 text-center" colSpan={2}>USA</th>
                                                        <th className="p-2 text-center" colSpan={2}>Asia</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-50">
                                                    <tr>
                                                        <td className="p-2 text-gray-600">Production capacity, thousands of pieces</td>
                                                        <td className="p-2 text-center text-gray-900" colSpan={2}>6,600</td>
                                                        <td className="p-2 text-center text-gray-900" colSpan={2}>0</td>
                                                    </tr>
                                                    <tr>
                                                        <td className="p-2 text-gray-600">Capacity utilization rate, %</td>
                                                        <td className="p-2 text-center text-gray-900" colSpan={2}>
                                                            {currentTeamState.decisions.production.usa.line1.capacity.toFixed(1)}
                                                        </td>
                                                        <td className="p-2 text-center text-gray-900" colSpan={2}>0.0</td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>

                                    {/* Outsourcing */}
                                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                                        <div className="px-6 py-4 border-b border-gray-100 bg-red-50 flex justify-between items-center">
                                            <h3 className="font-bold text-red-900">Outsourcing production</h3>
                                            <span className="text-gray-400 text-sm">?</span>
                                        </div>
                                        <div className="p-6">
                                            <table className="w-full text-sm">
                                                <thead>
                                                    <tr className="bg-red-50 text-gray-600 border-b border-gray-100 text-xs font-bold">
                                                        <th className="p-2 text-left"></th>
                                                        <th className="p-2 text-center">USA</th>
                                                        <th className="p-2 text-center">Asia</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-50">
                                                    <tr>
                                                        <td className="p-2 font-bold text-gray-700">technology</td>
                                                        {(['usa', 'asia'] as const).map(region => (
                                                            <td key={region} className="p-2">
                                                                <div className="font-bold text-center mb-1">
                                                                    Technology 1
                                                                </div>
                                                            </td>
                                                        ))}
                                                    </tr>
                                                    <tr>
                                                        <td className="p-2 text-gray-600">Planned outsourcing volume: 1,000 pieces</td>
                                                        {(['usa', 'asia'] as const).map(region => (
                                                            <td key={region} className="p-2">
                                                                <input
                                                                    type="number"
                                                                    className="w-full text-right bg-white border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:border-blue-500"
                                                                    value={currentTeamState.decisions.production[region].outsourcing.amount}
                                                                    onChange={(e) => handleProductionChange(region, 'outsourcing', 'amount', parseFloat(e.target.value) || 0)}
                                                                />
                                                            </td>
                                                        ))}
                                                    </tr>
                                                    <tr>
                                                        <td className="p-2 text-gray-600">Unit production cost, USD</td>
                                                        <td className="p-2 text-center text-gray-900">118.5</td>
                                                        <td className="p-2 text-center text-gray-900">145.5</td>
                                                    </tr>
                                                    <tr>
                                                        <td className="p-2 text-gray-600">Maximum total quantity, thousands of pieces</td>
                                                        <td className="p-2 text-center text-gray-900">1,000</td>
                                                        <td className="p-2 text-center text-gray-900">1,000</td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {productionTab === 'invest' && (
                                <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                                    {/* LEFT COLUMN: Capacity Overview Chart */}
                                    <div className="xl:col-span-1 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden h-fit">
                                        <div className="px-6 py-4 border-b border-gray-100 bg-white">
                                            <h3 className="font-bold text-red-600">Capacity Overview</h3>
                                        </div>
                                        <div className="p-6 h-96">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <BarChart data={[
                                                    { name: 'Last Round', sales: 4454, capacity: 6600 },
                                                    { name: 'This Round', sales: 0, capacity: 6600 },
                                                    { name: 'Next Round', sales: 0, capacity: 6600 },
                                                    { name: 'Round 3', sales: 0, capacity: 6600 },
                                                ]} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                                    <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                                                    <YAxis tick={{ fontSize: 10 }} />
                                                    <Tooltip />
                                                    <Legend iconType="rect" wrapperStyle={{ fontSize: '10px' }} />
                                                    <Bar dataKey="sales" name="Sales" fill="#84cc16" barSize={40} />
                                                    <Bar dataKey="capacity" name="Capacity" fill="#3b82f6" barSize={40} />
                                                </BarChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </div>

                                    {/* RIGHT COLUMN: Tables */}
                                    <div className="xl:col-span-2 space-y-8">

                                        {/* Demand Forecast Table */}
                                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                                            <div className="px-6 py-4 border-b border-gray-100 bg-red-50">
                                                <h3 className="font-bold text-red-900">Demand forecast, thousands of units</h3>
                                            </div>
                                            <div className="p-6">
                                                <table className="w-full text-sm">
                                                    <thead>
                                                        <tr className="bg-red-50 text-gray-700 text-xs font-bold">
                                                            <th className="p-2 text-left">technology</th>
                                                            <th className="p-2 text-right">Last round</th>
                                                            <th className="p-2 text-right">This round</th>
                                                            <th className="p-2 text-right">Next round</th>
                                                            <th className="p-2 text-right">Round 3</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-gray-50">
                                                        {['Technology 1', 'Technology 2', 'Technology 3', 'Technology 4'].map((tech, idx) => (
                                                            <tr key={tech}>
                                                                <td className="p-2 text-gray-600">{tech}</td>
                                                                <td className="p-2 text-right text-gray-900">{idx === 0 ? '4 454' : '-'}</td>
                                                                <td className="p-2 text-right text-gray-900">-</td>
                                                                <td className="p-2 text-right">
                                                                    <input type="number" className="w-full text-right bg-blue-50 border border-blue-200 rounded px-1 py-0.5 text-xs focus:outline-none text-blue-700" defaultValue={0} />
                                                                </td>
                                                                <td className="p-2 text-right">
                                                                    <input type="number" className="w-full text-right bg-blue-50 border border-blue-200 rounded px-1 py-0.5 text-xs focus:outline-none text-blue-700" defaultValue={0} />
                                                                </td>
                                                            </tr>
                                                        ))}
                                                        <tr className="font-bold bg-gray-50">
                                                            <td className="p-2">total</td>
                                                            <td className="p-2 text-right">4 454</td>
                                                            <td className="p-2 text-right">-</td>
                                                            <td className="p-2 text-right">0</td>
                                                            <td className="p-2 text-right">0</td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>

                                        {/* Production Capacity Table */}
                                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                                            <div className="px-6 py-4 border-b border-gray-100 bg-red-50 flex justify-between items-center">
                                                <h3 className="font-bold text-red-900">Production capacity</h3>
                                                <span className="text-gray-400 text-sm">?</span>
                                            </div>
                                            <div className="p-6">
                                                <table className="w-full text-sm">
                                                    <thead>
                                                        <tr className="bg-red-50 text-gray-700 text-xs font-bold">
                                                            <th className="p-2 text-left"></th>
                                                            <th className="p-2 text-center">USA</th>
                                                            <th className="p-2 text-center">Asia</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-gray-50">
                                                        <tr>
                                                            <td className="p-2 text-gray-600">Each factory has a production capacity of 1,000 pieces.</td>
                                                            <td className="p-2 text-center text-gray-900">550</td>
                                                            <td className="p-2 text-center text-gray-900">550</td>
                                                        </tr>
                                                        <tr>
                                                            <td className="p-2 text-gray-600">Fixed costs for each new factory: thousands of USD</td>
                                                            <td className="p-2 text-center text-gray-900">2,897</td>
                                                            <td className="p-2 text-center text-gray-900">6,000</td>
                                                        </tr>
                                                        <tr>
                                                            <td className="p-2 text-gray-600">Factory under construction</td>
                                                            <td className="p-2 text-center text-gray-900">0</td>
                                                            <td className="p-2 text-center text-gray-900">0</td>
                                                        </tr>
                                                        <tr>
                                                            <td className="p-2 text-gray-600">Investment in this round</td>
                                                            {(['usa', 'asia'] as const).map(region => (
                                                                <td key={region} className="p-2">
                                                                    <input
                                                                        type="number"
                                                                        className="w-full text-right bg-white border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:border-blue-500"
                                                                        value={currentTeamState.decisions.production[region].investment}
                                                                        onChange={(e) => handleProductionChange(region, 'investment', 'investment', parseFloat(e.target.value) || 0)}
                                                                    />
                                                                </td>
                                                            ))}
                                                        </tr>
                                                        <tr>
                                                            <td className="p-2 text-gray-600">Payment, 1,000 USD</td>
                                                            <td className="p-2 text-center text-gray-900"></td>
                                                            <td className="p-2 text-center text-gray-900"></td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>

                                        {/* Project and Payment Status Table */}
                                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                                            <div className="px-6 py-4 border-b border-gray-100 bg-white">
                                                <h3 className="font-bold text-red-600">Project and payment status</h3>
                                            </div>
                                            <div className="p-6">
                                                <table className="w-full text-sm">
                                                    <thead>
                                                        <tr className="border-b border-gray-200">
                                                            <th className="p-2 text-left font-bold text-gray-700" colSpan={3}>Number of available factories</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-gray-50">
                                                        <tr>
                                                            <td className="p-2 text-gray-600 w-1/2">This round</td>
                                                            <td className="p-2 text-right text-gray-900">12</td>
                                                            <td className="p-2 text-right text-gray-900">0</td>
                                                        </tr>
                                                        <tr>
                                                            <td className="p-2 text-gray-600">Next round</td>
                                                            <td className="p-2 text-right text-gray-900">12</td>
                                                            <td className="p-2 text-right text-gray-900">0</td>
                                                        </tr>
                                                        <tr>
                                                            <td className="p-2 text-gray-600">Round 3</td>
                                                            <td className="p-2 text-right text-gray-900">12</td>
                                                            <td className="p-2 text-right text-gray-900">0</td>
                                                        </tr>
                                                    </tbody>
                                                    <thead>
                                                        <tr className="border-b border-gray-200 border-t">
                                                            <th className="p-2 text-left font-bold text-gray-700 pt-4" colSpan={3}>Payment, 1,000 USD</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-gray-50">
                                                        <tr>
                                                            <td className="p-2 text-gray-600 w-1/2">This round</td>
                                                            <td className="p-2 text-right text-gray-900">0</td>
                                                            <td className="p-2 text-right text-gray-900">0</td>
                                                        </tr>
                                                        <tr>
                                                            <td className="p-2 text-gray-600">Next round</td>
                                                            <td className="p-2 text-right text-gray-900">0</td>
                                                            <td className="p-2 text-right text-gray-900">0</td>
                                                        </tr>
                                                        <tr>
                                                            <td className="p-2 text-gray-600">Round 3</td>
                                                            <td className="p-2 text-right text-gray-900">0</td>
                                                            <td className="p-2 text-right text-gray-900">0</td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* R&D SECTION */}
                    {activeSection === 'rnd' && (
                        <div className="space-y-8">
                            {/* Charts Row */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                {/* R&D Progress Chart */}
                                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                                    <h3 className="font-bold text-gray-900 mb-4 text-center">R&D Progress, %</h3>
                                    <div className="h-64">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={[
                                                { name: 'Tech 1', current: 100, next: 0 },
                                                { name: 'Tech 2', current: 0, next: 0 },
                                                { name: 'Tech 3', current: 0, next: 0 },
                                                { name: 'Tech 4', current: 0, next: 0 },
                                            ]}>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                                                <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
                                                <Tooltip />
                                                <Legend iconType="rect" wrapperStyle={{ fontSize: '12px' }} />
                                                <Bar dataKey="current" name="This Round" fill="#fbbf24" barSize={40} />
                                                <Bar dataKey="next" name="Next Round" fill="#3b82f6" barSize={40} />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>

                                {/* R&D Features Chart */}
                                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                                    <h3 className="font-bold text-gray-900 mb-4 text-center">R&D Features</h3>
                                    <div className="h-64">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={[
                                                { name: 'Tech 1', current: 2, next: 0 },
                                                { name: 'Tech 2', current: 0, next: 0 },
                                                { name: 'Tech 3', current: 0, next: 0 },
                                                { name: 'Tech 4', current: 0, next: 0 },
                                            ]}>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                                                <YAxis domain={[0, 3]} tick={{ fontSize: 12 }} ticks={[0, 0.5, 1, 1.5, 2, 2.5, 3]} />
                                                <Tooltip />
                                                <Legend iconType="rect" wrapperStyle={{ fontSize: '12px' }} />
                                                <Bar dataKey="current" name="This Round" fill="#fbbf24" barSize={40} />
                                                <Bar dataKey="next" name="Next Round" fill="#3b82f6" barSize={40} />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                            </div>

                            {/* Tables Row */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                {/* In-house Development Table */}
                                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                                    <div className="px-6 py-4 border-b border-gray-100 bg-red-50 flex justify-between items-center">
                                        <h3 className="font-bold text-red-900">Technology/features developed in-house, thousands of USD</h3>
                                        <span className="text-gray-400 text-sm">?</span>
                                    </div>
                                    <div className="p-6">
                                        <table className="w-full text-sm">
                                            <thead>
                                                <tr className="bg-red-50 text-gray-700 text-xs font-bold">
                                                    <th className="p-2 text-left">technology</th>
                                                    <th className="p-2 text-center">?</th>
                                                    <th className="p-2 text-center">This round</th>
                                                    <th className="p-2 text-center">Last round</th>
                                                    <th className="p-2 text-right">Cost of new features</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-50">
                                                {['tech1', 'tech2', 'tech3', 'tech4'].map((tech, idx) => (
                                                    <tr key={tech}>
                                                        <td className="p-2 text-gray-600">Technology {idx + 1}</td>
                                                        <td className="p-2 text-center text-gray-400">?</td>
                                                        <td className="p-2">
                                                            <input
                                                                type="number"
                                                                className="w-full text-right bg-white border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:border-blue-500"
                                                                value={currentTeamState.decisions.rnd[tech]?.spend || 0}
                                                                onChange={(e) => handleRndChange(tech, 'spend', parseFloat(e.target.value) || 0)}
                                                            />
                                                        </td>
                                                        <td className="p-2 text-center text-gray-900">0</td>
                                                        <td className="p-2 text-right text-gray-900">
                                                            {[55000, 190900, 324196, 1287151][idx].toLocaleString().replace(/,/g, ' ')}
                                                        </td>
                                                    </tr>
                                                ))}
                                                <tr className="font-bold bg-gray-50">
                                                    <td className="p-2">total</td>
                                                    <td className="p-2"></td>
                                                    <td className="p-2 text-center">
                                                        {Object.values(currentTeamState.decisions.rnd).reduce((sum, item) => sum + (item.spend || 0), 0).toLocaleString()}
                                                    </td>
                                                    <td className="p-2 text-center">0</td>
                                                    <td className="p-2"></td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                {/* Feature Introduction Table */}
                                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                                    <div className="px-6 py-4 border-b border-gray-100 bg-red-50 flex justify-between items-center">
                                        <h3 className="font-bold text-red-900">Technology/Feature Introduction</h3>
                                        <span className="text-gray-400 text-sm">?</span>
                                    </div>
                                    <div className="p-6">
                                        <table className="w-full text-sm">
                                            <thead>
                                                <tr className="bg-red-50 text-gray-700 text-xs font-bold">
                                                    <th className="p-2 text-left">technology</th>
                                                    <th className="p-2 text-center">?</th>
                                                    <th className="p-2 text-center">Additional features</th>
                                                    <th className="p-2 text-right">Cost, Thousand USD</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-50">
                                                {['tech1', 'tech2', 'tech3', 'tech4'].map((tech, idx) => {
                                                    const selectedOption = currentTeamState.decisions.rnd[tech]?.features || 'Not purchased';

                                                    // Calculate cost based on selection
                                                    let cost = 0;
                                                    if (selectedOption !== 'Not purchased') {
                                                        const match = selectedOption.match(/\+(\d+)/);
                                                        const numFeatures = match ? parseInt(match[1]) : 1;
                                                        // Base cost (1 feature) = 150,000
                                                        // Each additional feature = 65,000
                                                        cost = 150000 + (numFeatures - 1) * 65000;
                                                    }

                                                    return (
                                                        <tr key={tech}>
                                                            <td className="p-2 text-gray-600">Technology {idx + 1}</td>
                                                            <td className="p-2 text-center text-gray-400">?</td>
                                                            <td className="p-2">
                                                                <select
                                                                    className="w-full bg-white border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:border-blue-500"
                                                                    value={selectedOption}
                                                                    onChange={(e) => handleRndChange(tech, 'features', e.target.value)}
                                                                >
                                                                    <option value="Not purchased">Not purchased</option>
                                                                    <option value="Enable this technology + 1 function">Enable this technology + 1 function</option>
                                                                    <option value="Enable this technology + 2 functions">Enable this technology + 2 functions</option>
                                                                    <option value="Enable this technology + 3 functions">Enable this technology + 3 functions</option>
                                                                    <option value="Enable this technology + 4 functions">Enable this technology + 4 functions</option>
                                                                </select>
                                                            </td>
                                                            <td className="p-2 text-right text-gray-900">
                                                                {cost.toLocaleString()}
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                                <tr className="font-bold bg-gray-50">
                                                    <td className="p-2">total</td>
                                                    <td className="p-2"></td>
                                                    <td className="p-2"></td>
                                                    <td className="p-2 text-right">
                                                        {['tech1', 'tech2', 'tech3', 'tech4'].reduce((sum, tech) => {
                                                            const selectedOption = currentTeamState.decisions.rnd[tech]?.features || 'Not purchased';
                                                            if (selectedOption === 'Not purchased') return sum;
                                                            const match = selectedOption.match(/\+(\d+)/);
                                                            const numFeatures = match ? parseInt(match[1]) : 1;
                                                            return sum + (150000 + (numFeatures - 1) * 65000);
                                                        }, 0).toLocaleString()}
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* MARKETING SECTION */}
                    {activeSection === 'marketing' && (
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <h2 className="text-2xl font-bold text-gray-900">Marketing - {marketingRegion.toUpperCase()}</h2>
                            </div>

                            {/* Region Tabs */}
                            <div className="flex gap-4 border-b border-gray-200">
                                {(['usa', 'asia', 'europe'] as const).map(region => (
                                    <button
                                        key={region}
                                        onClick={() => setMarketingRegion(region)}
                                        className={clsx(
                                            "pb-3 text-sm font-medium border-b-2 transition-colors capitalize",
                                            marketingRegion === region ? "border-red-500 text-red-600" : "border-transparent text-gray-500 hover:text-gray-700"
                                        )}
                                    >
                                        {region}
                                    </button>
                                ))}
                            </div>

                            {/* Marketing Table for Tech 1 (Example) */}
                            {/* We can map this if we want to show multiple technologies */}
                            {['tech1'].map((tech, idx) => {
                                const data = currentTeamState.decisions.marketing[marketingRegion][tech];
                                const CURRENCY_LABELS = { usa: 'USD', asia: 'RMB', europe: 'EUR' };
                                const currency = CURRENCY_LABELS[marketingRegion];

                                return (
                                    <div key={tech} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                                        <div className="px-6 py-4 border-b border-gray-100 bg-red-50">
                                            <h3 className="font-bold text-red-900">Technology {idx + 1}</h3>
                                        </div>
                                        <div className="p-6">
                                            <table className="w-full text-sm">
                                                <thead>
                                                    <tr className="bg-red-50 text-gray-700 text-xs font-bold">
                                                        <th className="p-2 text-left w-1/2"></th>
                                                        <th className="p-2 text-right">This round</th>
                                                        <th className="p-2 text-right">Last round</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-50">
                                                    <tr>
                                                        <td className="p-2 text-gray-600">Number of functions used in this product</td>
                                                        <td className="p-2 text-right">
                                                            <input
                                                                type="number"
                                                                className="w-24 text-right bg-white border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:border-blue-500"
                                                                value={data.features}
                                                                onChange={(e) => handleMarketingChange(marketingRegion, tech, 'features', parseFloat(e.target.value) || 0)}
                                                            />
                                                        </td>
                                                        <td className="p-2 text-right text-gray-900">2</td>
                                                    </tr>
                                                    <tr>
                                                        <td className="p-2 text-gray-600">Total number of available functions this round</td>
                                                        <td className="p-2 text-right text-gray-900" colSpan={2}>2</td>
                                                    </tr>

                                                    {/* Marketing Inputs */}
                                                    <tr className="bg-gray-50">
                                                        <td className="p-2 font-bold text-gray-800" colSpan={3}>marketing</td>
                                                    </tr>
                                                    <tr>
                                                        <td className="p-2 text-gray-600">Price, {currency}</td>
                                                        <td className="p-2 text-right">
                                                            <input
                                                                type="number"
                                                                className="w-24 text-right bg-white border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:border-blue-500"
                                                                value={data.price}
                                                                onChange={(e) => handleMarketingChange(marketingRegion, tech, 'price', parseFloat(e.target.value) || 0)}
                                                            />
                                                        </td>
                                                        <td className="p-2 text-right text-gray-900">280</td>
                                                    </tr>
                                                    <tr>
                                                        <td className="p-2 text-gray-600">Advertisement, Thousand {currency}</td>
                                                        <td className="p-2 text-right">
                                                            <input
                                                                type="number"
                                                                className="w-24 text-right bg-white border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:border-blue-500"
                                                                value={data.promo}
                                                                onChange={(e) => handleMarketingChange(marketingRegion, tech, 'promo', parseFloat(e.target.value) || 0)}
                                                            />
                                                        </td>
                                                        <td className="p-2 text-right text-gray-900">5 580</td>
                                                    </tr>
                                                    <tr>
                                                        <td className="p-2 text-gray-600">Projected demand: 1,000 units</td>
                                                        <td className="p-2 text-right text-gray-900">0</td>
                                                        <td className="p-2 text-right text-gray-900">1 084</td>
                                                    </tr>
                                                    <tr>
                                                        <td className="p-2 text-gray-600">Planned sales: 1,000 units</td>
                                                        <td className="p-2 text-right text-gray-900">0</td>
                                                        <td className="p-2 text-right text-gray-900">1 084</td>
                                                    </tr>

                                                    {/* Marginal Accounting */}
                                                    <tr className="bg-gray-50">
                                                        <td className="p-2 font-bold text-gray-800" colSpan={3}>Marginal accounting, thousands of {currency}</td>
                                                    </tr>
                                                    <tr>
                                                        <td className="p-2 font-bold text-gray-700">Sales</td>
                                                        <td className="p-2 text-right text-gray-900 font-bold">0</td>
                                                        <td className="p-2 text-right text-gray-900"></td>
                                                    </tr>
                                                    <tr>
                                                        <td className="p-2 font-bold text-gray-700" colSpan={3}>Costs and expenses</td>
                                                    </tr>
                                                    <tr>
                                                        <td className="p-2 text-gray-600 pl-4">- In-house and outsourced production</td>
                                                        <td className="p-2 text-right text-gray-900">0</td>
                                                        <td className="p-2 text-right text-gray-900"></td>
                                                    </tr>
                                                    <tr>
                                                        <td className="p-2 text-gray-600 pl-4">- Cost of imported products</td>
                                                        <td className="p-2 text-right text-gray-900">0</td>
                                                        <td className="p-2 text-right text-gray-900"></td>
                                                    </tr>
                                                    <tr>
                                                        <td className="p-2 text-gray-600 pl-4">- Transportation and Customs</td>
                                                        <td className="p-2 text-right text-gray-900">0</td>
                                                        <td className="p-2 text-right text-gray-900"></td>
                                                    </tr>
                                                    <tr>
                                                        <td className="p-2 font-bold text-gray-700">Total cost of products sold</td>
                                                        <td className="p-2 text-right text-gray-900 font-bold">0</td>
                                                        <td className="p-2 text-right text-gray-900"></td>
                                                    </tr>
                                                    <tr>
                                                        <td className="p-2 font-bold text-gray-700">Sales Profit</td>
                                                        <td className="p-2 text-right text-gray-900 font-bold">0</td>
                                                        <td className="p-2 text-right text-gray-900"></td>
                                                    </tr>
                                                    <tr>
                                                        <td className="p-2 text-gray-600">advertise</td>
                                                        <td className="p-2 text-right text-gray-900">{data.promo}</td>
                                                        <td className="p-2 text-right text-gray-900"></td>
                                                    </tr>
                                                    <tr>
                                                        <td className="p-2 font-bold text-gray-700">gross profit</td>
                                                        <td className="p-2 text-right text-gray-900 font-bold">-{data.promo}</td>
                                                        <td className="p-2 text-right text-gray-900"></td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                </div>
            </main>
        </div>
    );
}
