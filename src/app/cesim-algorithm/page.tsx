'use client';

import React from 'react';
import { Sidebar } from '@/components/Sidebar';
import {
    TrendingUp,
    Target,
    Zap,
    Globe,
    DollarSign,
    BarChart3,
    Lightbulb,
    Rocket,
    BrainCircuit
} from 'lucide-react';

export default function CesimAlgorithmPage() {
    const [activeTab, setActiveTab] = React.useState('practice');

    return (
        <div className="min-h-screen bg-gray-50">
            <Sidebar />

            <main className="md:pl-64 transition-all duration-300">
                {/* Top Header */}
                <header className="bg-white border-b border-gray-200 sticky top-0 z-40 px-8 py-4 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                            <BrainCircuit className="text-purple-600" />
                            The Winning Algorithm
                        </h1>
                        <p className="text-sm text-gray-500">Strategic Roadmap & Analysis</p>
                    </div>
                </header>

                <div className="p-8 max-w-6xl mx-auto space-y-8">

                    {/* Tab Navigation */}
                    <div className="flex space-x-1 bg-gray-200 p-1 rounded-xl w-fit">
                        <button
                            onClick={() => setActiveTab('practice')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'practice' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
                        >
                            Practice Round Analysis
                        </button>
                        <button
                            onClick={() => setActiveTab('actual')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'actual' ? 'bg-white text-purple-600 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
                        >
                            7-Round Forecast (Actual)
                        </button>
                    </div>

                    {activeTab === 'practice' ? (
                        <PracticeRoundContent />
                    ) : (
                        <ActualRoundContent />
                    )}

                </div>
            </main>
        </div>
    );
}

function PracticeRoundContent() {
    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Executive Summary */}
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl p-8 text-white shadow-lg">
                <div className="flex items-start gap-6">
                    <div className="p-4 bg-white/10 rounded-xl backdrop-blur-sm">
                        <Rocket className="w-8 h-8 text-white" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold mb-2">The "Pink" Strategy</h2>
                        <p className="text-purple-100 leading-relaxed text-lg">
                            The winning strategy focuses on <strong>aggressive early R&D investment</strong> to unlock technologies fast, coupled with <strong>premium pricing</strong> in Asia/Europe and <strong>rapidly scaling marketing spend</strong> in growth markets.
                        </p>
                    </div>
                </div>
            </div>

            {/* Core Pillars */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StrategyCard
                    title="R&D Dominance"
                    icon={<Zap className="w-6 h-6 text-yellow-600" />}
                    color="yellow"
                    metric="High Initial Spend"
                    value="$600k+"
                    desc="Front-load R&D in Round 1. Drop to maintenance levels (~100k) by Round 3 once Tech portfolio is established."
                />
                <StrategyCard
                    title="Market Expansion"
                    icon={<Globe className="w-6 h-6 text-blue-600" />}
                    color="blue"
                    metric="Asia/EU Growth"
                    value="+100%"
                    desc="Marketing spend in Asia & Europe should double every round (20k → 35k → 54k). USA marketing remains steady."
                />
                <StrategyCard
                    title="Pricing Power"
                    icon={<DollarSign className="w-6 h-6 text-green-600" />}
                    color="green"
                    metric="Tech 2 Premium"
                    value="High Margin"
                    desc="Maintain high price points for new Tech. Do not engage in price wars for legacy Tech 1."
                />
            </div>

            {/* Detailed Roadmap */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
                    <h3 className="font-bold text-gray-900 flex items-center gap-2">
                        <Target className="w-5 h-5 text-gray-500" />
                        Round-by-Round Playbook
                    </h3>
                </div>
                <div className="p-6">
                    <div className="relative border-l-2 border-gray-200 ml-3 space-y-12">

                        {/* Round 1 */}
                        <TimelineItem
                            round="Round 1"
                            title="Foundation & Aggressive R&D"
                            data={{
                                "R&D Investment": "$355k (High)",
                                "USA Price": "T1: $280 | T2: $450",
                                "Asia Price": "T1: 2,000 | T2: 2,900 RMB",
                                "Europe Price": "T1: 150 | T2: 270 EUR",
                                "Marketing": "USA: 23k | Asia: 35k | EU: 20k",
                                "Dividends": "None (Reinvest)"
                            }}
                        />

                        {/* Round 2 */}
                        <TimelineItem
                            round="Round 2"
                            title="Tech 2 Expansion & Margin Growth"
                            data={{
                                "R&D Investment": "$282k (Sustain)",
                                "USA Price": "T1: $290 | T2: $470",
                                "Asia Price": "T1: 2,100 | T2: 3,480 RMB",
                                "Europe Price": "T1: 160 | T2: 350 EUR",
                                "Marketing": "USA: 23k | Asia: 35k | EU: 24k",
                                "Dividends": "$0.09 per share"
                            }}
                        />

                        {/* Round 3 */}
                        <TimelineItem
                            round="Round 3"
                            title="Market Dominance & Cash Harvest"
                            data={{
                                "R&D Investment": "$110k (Maintenance)",
                                "USA Price": "T1: $295 | T2: $485",
                                "Asia Price": "T1: 2,100 | T2: 3,600 RMB",
                                "Europe Price": "T1: 160 | T2: 350 EUR",
                                "Marketing": "USA: 27k | Asia: 54k | EU: 40k",
                                "Dividends": "$0.59 per share (High Payout)"
                            }}
                        />

                    </div>
                </div>
            </div>

            {/* Data Evidence */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                    <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <BarChart3 className="w-5 h-5 text-gray-500" />
                        Marketing Spend Trajectory
                    </h3>
                    <div className="h-64 flex items-end justify-between px-4 space-x-2">
                        {/* Simple CSS Bar Chart for visualization */}
                        <Bar label="R1" height="30%" color="bg-blue-200" value="20k" />
                        <Bar label="R2" height="50%" color="bg-blue-400" value="35k" />
                        <Bar label="R3" height="80%" color="bg-blue-600" value="54k" />
                    </div>
                    <p className="text-center text-sm text-gray-500 mt-4">Asia Marketing Spend Growth</p>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                    <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <Lightbulb className="w-5 h-5 text-gray-500" />
                        Key Takeaways
                    </h3>
                    <ul className="space-y-4">
                        <li className="flex gap-3">
                            <span className="w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-xs font-bold shrink-0">1</span>
                            <p className="text-sm text-gray-600"><strong>Don't underprice Asia.</strong> The winner maintained high prices (2000+ RMB) despite volume growth.</p>
                        </li>
                        <li className="flex gap-3">
                            <span className="w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-xs font-bold shrink-0">2</span>
                            <p className="text-sm text-gray-600"><strong>Tech 2 is a cash cow.</strong> Launch it early (R2) with a significant premium (~60% higher than T1).</p>
                        </li>
                        <li className="flex gap-3">
                            <span className="w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-xs font-bold shrink-0">3</span>
                            <p className="text-sm text-gray-600"><strong>R&D is an investment, not a cost.</strong> The winner spent 3x more than average in Round 1 to secure the lead.</p>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    );
}

function ActualRoundContent() {
    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Strategy Overview */}
            <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">7-Round Strategic Forecast</h2>
                <p className="text-gray-600 leading-relaxed mb-6">
                    Extending the winning "Pink" strategy to a 7-round game requires careful timing of Tech 3 and Tech 4 launches based on network coverage. The goal is to be the <strong>first mover</strong> in Asia/Europe for new technologies while milking the USA market.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-purple-50 p-6 rounded-xl border border-purple-100">
                        <h3 className="font-bold text-purple-900 mb-3 flex items-center gap-2">
                            <Zap className="w-5 h-5" />
                            Tech Launch Schedule
                        </h3>
                        <ul className="space-y-3 text-sm text-purple-800">
                            <li className="flex justify-between">
                                <span>Tech 2:</span>
                                <span className="font-bold">Round 2 (Global)</span>
                            </li>
                            <li className="flex justify-between">
                                <span>Tech 3:</span>
                                <span className="font-bold">Round 4 (Asia/EU), Round 5 (USA)</span>
                            </li>
                            <li className="flex justify-between">
                                <span>Tech 4:</span>
                                <span className="font-bold">Round 5 (EU), Round 6 (Global)</span>
                            </li>
                        </ul>
                    </div>

                    <div className="bg-blue-50 p-6 rounded-xl border border-blue-100">
                        <h3 className="font-bold text-blue-900 mb-3 flex items-center gap-2">
                            <Target className="w-5 h-5" />
                            Feature Optimization
                        </h3>
                        <ul className="space-y-3 text-sm text-blue-800">
                            <li className="flex justify-between">
                                <span>Tech 1:</span>
                                <span className="font-bold">Low Features (Cost Leader)</span>
                            </li>
                            <li className="flex justify-between">
                                <span>Tech 2:</span>
                                <span className="font-bold">High Features (Differentiation)</span>
                            </li>
                            <li className="flex justify-between">
                                <span>Tech 3/4:</span>
                                <span className="font-bold">Max Features (Premium)</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* 7-Round Timeline */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                    <h3 className="font-bold text-gray-900">Strategic Timeline (Rounds 4-7)</h3>
                </div>
                <div className="p-6">
                    <div className="relative border-l-2 border-gray-200 ml-3 space-y-12">

                        <TimelineItem
                            round="Round 4"
                            title="Tech 3 Entry (Asia Focus)"
                            data={{
                                "Focus": "Launch Tech 3 in Asia (35% coverage)",
                                "R&D": "Invest heavily in Tech 4",
                                "Pricing": "Premium for T3, Competitive for T2",
                                "Production": "Shift capacity to Asia for T3"
                            }}
                        />

                        <TimelineItem
                            round="Round 5"
                            title="Tech 3 Expansion & Tech 4 Prep"
                            data={{
                                "Focus": "Launch Tech 3 in USA/Europe. Prep Tech 4.",
                                "R&D": "Finalize Tech 4 development",
                                "Marketing": "Aggressive push in Europe (High Growth)",
                                "Competitor": "Expect others to dump T1 inventory"
                            }}
                        />

                        <TimelineItem
                            round="Round 6"
                            title="Tech 4 Global Launch"
                            data={{
                                "Focus": "Full Tech 4 rollout. Phase out Tech 1.",
                                "R&D": "Stop all R&D (Endgame)",
                                "Pricing": "Skim pricing for T4 (Max Price)",
                                "Dividends": "Start massive payouts"
                            }}
                        />

                        <TimelineItem
                            round="Round 7"
                            title="Endgame & Cash Harvest"
                            data={{
                                "Focus": "Empty inventory. Maximize dividends.",
                                "Production": "Exact match to demand (No overstock)",
                                "Marketing": "Cut maintenance marketing",
                                "Financials": "Pay out all excess cash"
                            }}
                        />
                    </div>
                </div>
            </div>

            {/* Competitor Prediction */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Globe className="w-5 h-5 text-gray-500" />
                    Competitor Behavior Prediction
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="p-4 bg-red-50 rounded-lg border border-red-100">
                        <h4 className="font-bold text-red-900 mb-2">Price Wars</h4>
                        <p className="text-sm text-red-800">
                            Teams lagging in Tech will slash Tech 1 prices. <strong>Do not follow.</strong> Abandon the low-end market and focus on high-margin Tech 2/3/4.
                        </p>
                    </div>
                    <div className="p-4 bg-orange-50 rounded-lg border border-orange-100">
                        <h4 className="font-bold text-orange-900 mb-2">Late Tech Entry</h4>
                        <p className="text-sm text-orange-800">
                            Most teams will be late to Tech 4. Use this window (Round 6) to capture 100% of the early adopter segment at max price.
                        </p>
                    </div>
                    <div className="p-4 bg-green-50 rounded-lg border border-green-100">
                        <h4 className="font-bold text-green-900 mb-2">Production Panic</h4>
                        <p className="text-sm text-green-800">
                            Teams often overproduce in the final round. Trust your forecasts and produce <strong>exactly</strong> what you need to end with 0 inventory.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

function StrategyCard({ title, icon, color, metric, value, desc }: any) {
    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
                <div className={`p-2 bg-${color}-50 rounded-lg`}>{icon}</div>
                <div className="text-right">
                    <p className="text-xs text-gray-500 uppercase font-bold">{metric}</p>
                    <p className={`text-xl font-bold text-${color}-600`}>{value}</p>
                </div>
            </div>
            <h3 className="font-bold text-gray-900 mb-2">{title}</h3>
            <p className="text-sm text-gray-600 leading-relaxed">{desc}</p>
        </div>
    );
}

function TimelineItem({ round, title, data }: any) {
    return (
        <div className="relative pl-8">
            <span className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-purple-600 border-4 border-white shadow-sm"></span>
            <div className="mb-1 flex items-center gap-2">
                <span className="text-xs font-bold text-purple-600 bg-purple-50 px-2 py-1 rounded uppercase tracking-wider">{round}</span>
                <h4 className="font-bold text-gray-900">{title}</h4>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 mt-3 grid grid-cols-2 md:grid-cols-3 gap-4">
                {Object.entries(data).map(([key, val]: any) => (
                    <div key={key}>
                        <p className="text-xs text-gray-500 mb-1">{key}</p>
                        <p className="text-sm font-medium text-gray-900">{val}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}

function Bar({ label, height, color, value }: any) {
    return (
        <div className="flex flex-col items-center justify-end h-full w-full group">
            <div className="mb-2 text-xs font-bold text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity">{value}</div>
            <div className={`w-full rounded-t-lg ${color} transition-all duration-500 hover:opacity-80`} style={{ height }}></div>
            <div className="mt-2 text-xs text-gray-500 font-medium">{label}</div>
        </div>
    );
}
