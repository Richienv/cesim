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

                <div className="p-8 md:p-12 max-w-[1920px] mx-auto space-y-12">

                    {/* Tab Navigation */}


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
                        <button
                            onClick={() => setActiveTab('whatif')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'whatif' ? 'bg-white text-rose-600 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
                        >
                            What-If Analysis (Critique)
                        </button>
                    </div>

                    {activeTab === 'practice' ? (
                        <PracticeRoundContent />
                    ) : activeTab === 'actual' ? (
                        <ActualRoundContent />
                    ) : (
                        <WhatIfContent />
                    )}

                </div>
            </main>
        </div>
    );
}

function WhatIfContent() {
    const userScenarios = [
        {
            round: 1,
            focus: "R1: The Big Bet (High Debt)",
            demand: "Growth: 20%",
            production: {
                capacity: "Build 2 Plants in Asia (Total 4)",
                allocation: "T1: 60% / T2: 40% (Asia Production)",
                outsourcing: "No"
            },
            rnd: {
                tech: "Buy Tech 2 License + Start Tech 4 R&D",
                features: "T1: 1 feature",
                budget: "$350k+ (High Spend)"
            },
            marketing: {
                usa: { price: 290, promo: 25 },
                asia: { price: 2100, promo: 35 },
                europe: { price: 160, promo: 22 }
            },
            logistics: "Prioritize Asia. Export T2 to USA/EU.",
            tax: "Transfer Pricing: 2.00",
            finance: "Long-term Loan ($800k) to fund T2 License + T4 R&D.",
            analysis: {
                score: 78,
                compliments: ["Aggressive start."],
                critiques: ["High Cash Burn. Watch liquidity."],
                outcome: "High Risk / High Reward."
            }
        },
        {
            round: 2,
            focus: "R2: Tech 2 Launch & Survival",
            demand: "T2 Demand Explodes",
            production: {
                capacity: "Build 1 Plant in Asia. Run 98% Util.",
                allocation: "T1: 50% / T2: 50%",
                outsourcing: "Yes (Overflow)"
            },
            rnd: {
                tech: "Continue Tech 4 R&D",
                features: "T1: 1, T2: 3",
                budget: "$200k"
            },
            marketing: {
                usa: { price: 480, promo: 25 },
                asia: { price: 3500, promo: 45 },
                europe: { price: 360, promo: 25 }
            },
            logistics: "Push T2 to all markets.",
            tax: "Transfer Pricing: 2.00",
            finance: "Repay Short-term debt. No Dividends.",
            analysis: {
                score: 85,
                compliments: ["T2 margins stabilize cash flow."],
                critiques: ["Still heavy debt load."],
                outcome: "Stabilization phase."
            }
        },
        {
            round: 3,
            focus: "R3: Cash Cow & Prep for T4",
            demand: "Strong T2 Growth",
            production: {
                capacity: "Build 1 Plant in Asia (Total 6)",
                allocation: "T1: 30% / T2: 70%",
                outsourcing: "No"
            },
            rnd: {
                tech: "Finish Tech 4 R&D (Ready R4)",
                features: "T1: 1, T2: 4",
                budget: "$200k"
            },
            marketing: {
                usa: { price: 470, promo: 25 },
                asia: { price: 3400, promo: 50 },
                europe: { price: 340, promo: 30 }
            },
            logistics: "Maximize T2 sales.",
            tax: "Transfer Pricing: 2.00",
            finance: "Start repaying Long-term loan.",
            analysis: {
                score: 90,
                compliments: ["T4 is ready for next round!"],
                critiques: ["None."],
                outcome: "Ready for market dominance."
            }
        },
        {
            round: 4,
            focus: "R4: Tech 4 Launch (Early Adopter)",
            demand: "T4 Monopoly in High-End",
            production: {
                capacity: "Maintain. Max Efficiency.",
                allocation: "T2: 40% / T4: 60%",
                outsourcing: "Yes (T2 Overflow)"
            },
            rnd: {
                tech: "Feature Optimization",
                features: "T2: 5, T4: 8 (USA Target)",
                budget: "$150k"
            },
            marketing: {
                usa: { price: 680, promo: 35 },
                asia: { price: 4800, promo: 60 },
                europe: { price: 550, promo: 40 }
            },
            logistics: "Prioritize T4 to USA/EU.",
            tax: "Transfer Pricing: 2.00",
            finance: "Pay Dividends ($0.50).",
            analysis: {
                score: 95,
                compliments: ["You own the T4 market alone."],
                critiques: ["Competitors are 2 rounds behind."],
                outcome: "Market Leader."
            }
        },
        {
            round: 5,
            focus: "R5: Feature Wars",
            demand: "T4 Mass Market",
            production: {
                capacity: "No new plants.",
                allocation: "T2: 20% / T4: 80%",
                outsourcing: "No"
            },
            rnd: {
                tech: "Maintenance",
                features: "T4: 10 (Max)",
                budget: "$100k"
            },
            marketing: {
                usa: { price: 650, promo: 30 },
                asia: { price: 4500, promo: 80 },
                europe: { price: 520, promo: 50 }
            },
            logistics: "Global T4 distribution.",
            tax: "Transfer Pricing: 2.00",
            finance: "High Dividend ($1.00).",
            analysis: {
                score: 98,
                compliments: ["Massive margins on T4."],
                critiques: [],
                outcome: "Profit machine."
            }
        },
        {
            round: 6,
            focus: "R6: Profit Harvest",
            demand: "Peak T4",
            production: {
                capacity: "Convert lines to T4.",
                allocation: "T4: 100%",
                outsourcing: "No"
            },
            rnd: {
                tech: "Stop R&D",
                features: "T4: 10",
                budget: "$0"
            },
            marketing: {
                usa: { price: 750, promo: 30 },
                asia: { price: 5500, promo: 80 },
                europe: { price: 650, promo: 40 }
            },
            logistics: "Prioritize T4.",
            tax: "Transfer Pricing: 2.00",
            finance: "Massive Dividend ($2.00).",
            analysis: {
                score: 99,
                compliments: ["Perfect execution."],
                critiques: [],
                outcome: "Unbeatable."
            }
        },
        {
            round: 7,
            focus: "R7: Endgame",
            demand: "Last Round",
            production: {
                capacity: "Match Demand exactly.",
                allocation: "T4: 100%",
                outsourcing: "No"
            },
            rnd: {
                tech: "None",
                features: "Max",
                budget: "$0"
            },
            marketing: {
                usa: { price: 700, promo: 10 },
                asia: { price: 5000, promo: 10 },
                europe: { price: 600, promo: 10 }
            },
            logistics: "Clear inventory.",
            tax: "Irrelevant.",
            finance: "Pay out ALL cash.",
            analysis: {
                score: 100,
                compliments: ["Victory."],
                critiques: [],
                outcome: "Winner."
            }
        }
    ];

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-rose-50 rounded-xl p-8 border border-rose-100">
                <h2 className="text-2xl font-bold text-rose-900 mb-4">What-If Analysis Engine</h2>
                <p className="text-rose-800 text-lg leading-relaxed">
                    Based on your input (<strong>Tech 2 Purchase + Early Tech 4 R&D</strong>), here is the <strong>7-Round Forecast</strong>.
                </p>
                <div className="mt-6 p-4 bg-white/60 rounded-lg border border-rose-200 text-sm text-rose-700">
                    <strong>Strategy Note:</strong> The critical phase is <strong>Round 1-2</strong>. You must survive the debt load. By <strong>Round 4</strong>, your early Tech 4 launch gives you a monopoly.
                </div>
            </div>

            <div className="space-y-6">
                {userScenarios.map((scenario) => (
                    <DetailedRoundCard key={scenario.round} data={scenario} isCritique={true} />
                ))}
            </div>
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
    const rounds = [
        {
            round: 1,
            focus: "Foundation & Internal R&D",
            demand: "Global Growth: ~20%",
            production: {
                capacity: "Build 2 Plants in Asia (Total 4)",
                allocation: "T1: 100% Internal (Max Learning Curve)",
                outsourcing: "No (Too expensive)"
            },
            rnd: {
                tech: "Internal R&D Tech 2 (Ready Round 2)",
                features: "T1: 1 feature (Cost focus)",
                budget: "$400k (High - Internal R&D)"
            },
            marketing: {
                usa: { price: 280, promo: 23 },
                asia: { price: 2000, promo: 35 },
                europe: { price: 150, promo: 20 }
            },
            logistics: "Prioritize Asia local sales. Avoid US->Asia exports.",
            tax: "Transfer Pricing: 2.00 (Max Profit Shift to Asia)",
            finance: "Take Long-term Loan ($500k) for plants. No Dividends."
        },
        {
            round: 2,
            focus: "Tech 2 Launch & Tech 3 R&D",
            demand: "Tech 2 Demand explodes (Early Adopters)",
            production: {
                capacity: "Build 1 Plant in Asia. Run 98% Util.",
                allocation: "T1: 60%, T2: 40% (All Internal)",
                outsourcing: "Yes (Only for overflow)"
            },
            rnd: {
                tech: "Internal R&D Tech 3 (Ready Round 3)",
                features: "T1: 1, T2: 3-4 (Differentiation)",
                budget: "$350k"
            },
            marketing: {
                usa: { price: 470, promo: 25 },
                asia: { price: 3400, promo: 45 },
                europe: { price: 350, promo: 25 }
            },
            logistics: "Prioritize T2 delivery to all regions.",
            tax: "Transfer Pricing: 2.00",
            finance: "Repay short-term debt. Small Dividend ($0.10)."
        },
        {
            round: 3,
            focus: "Tech 3 Launch & Tech 4 R&D",
            demand: "Asia T2 growth > 40%",
            production: {
                capacity: "Build 1 Plant in Asia (Total 6)",
                allocation: "T1: 30%, T2: 50%, T3: 20%",
                outsourcing: "No (Capacity should catch up)"
            },
            rnd: {
                tech: "Internal R&D Tech 4 (Ready Round 4)",
                features: "T1: 1, T2: 4, T3: 5",
                budget: "$400k"
            },
            marketing: {
                usa: { price: 450, promo: 25 },
                asia: { price: 3200, promo: 60 },
                europe: { price: 320, promo: 30 }
            },
            logistics: "Asia -> Europe -> USA",
            tax: "Transfer Pricing: 2.00",
            finance: "High Dividend ($0.50). Buyback shares if cash > $2M."
        },
        {
            round: 4,
            focus: "Tech 4 Launch (Global)",
            demand: "Tech 4 starts in Asia (35% coverage)",
            production: {
                capacity: "Maintain. Maximize efficiency.",
                allocation: "T2: 40%, T3: 40%, T4: 20%",
                outsourcing: "Yes (for T2 overflow)"
            },
            rnd: {
                tech: "Feature Optimization",
                features: "T3: 6, T4: 8 (USA Target)",
                budget: "$200k"
            },
            marketing: {
                usa: { price: 650, promo: 30 },
                asia: { price: 4500, promo: 80 },
                europe: { price: 500, promo: 35 }
            },
            logistics: "Prioritize T4 to USA (Feature Lovers).",
            tax: "Transfer Pricing: 2.00",
            finance: "Dividend: $0.80. Cash accumulation."
        },
        {
            round: 5,
            focus: "Feature Wars",
            demand: "Tech 3 hits USA/EU. T4 Early Adopters in EU.",
            production: {
                capacity: "No new plants (Risk of overcapacity later)",
                allocation: "T2: 20%, T3: 40%, T4: 40%",
                outsourcing: "No"
            },
            rnd: {
                tech: "Maintenance",
                features: "T3: 8, T4: 10 (Max for USA)",
                budget: "$150k"
            },
            marketing: {
                usa: { price: 600, promo: 30 },
                asia: { price: 4200, promo: 90 },
                europe: { price: 550, promo: 50 }
            },
            logistics: "Global distribution optimization.",
            tax: "Transfer Pricing: 2.00",
            finance: "Dividend: $1.00."
        },
        {
            round: 6,
            focus: "Profit Harvest",
            demand: "Tech 4 Global Rollout. T1 dead.",
            production: {
                capacity: "Convert T1 lines to T4.",
                allocation: "T3: 30%, T4: 70%",
                outsourcing: "No"
            },
            rnd: {
                tech: "Stop R&D (Sunk cost)",
                features: "T4: 10 (Max)",
                budget: "$0"
            },
            marketing: {
                usa: { price: 750, promo: 30 },
                asia: { price: 5500, promo: 80 },
                europe: { price: 650, promo: 40 }
            },
            logistics: "Prioritize T4 (Highest Margin).",
            tax: "Transfer Pricing: 2.00",
            finance: "Dividend: $2.00 (Massive Payout)."
        },
        {
            round: 7,
            focus: "Endgame: Inventory Clearance",
            demand: "Last round. No future.",
            production: {
                capacity: "Produce ONLY confirmed demand.",
                allocation: "Match orders exactly.",
                outsourcing: "No"
            },
            rnd: {
                tech: "None",
                features: "Max all",
                budget: "$0"
            },
            marketing: {
                usa: { price: 700, promo: 10 },
                asia: { price: 5000, promo: 10 },
                europe: { price: 600, promo: 10 }
            },
            logistics: "Clear all stock.",
            tax: "Irrelevant (Game ends).",
            finance: "Pay out ALL remaining cash as dividends."
        }
    ];

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Strategy Overview */}
            <div className="bg-white rounded-xl p-8 md:p-10 shadow-sm border border-gray-100">
                <h2 className="text-3xl font-bold text-gray-900 mb-6">7-Round Detailed Strategy</h2>
                <p className="text-gray-600 text-lg leading-relaxed mb-8">
                    This playbook provides specific, variable-aware targets for every department. The core strategy relies on <strong>Asia-based production</strong> to minimize tariffs and tax, while aggressively moving up the technology ladder to capture high-margin early adopters.
                </p>

                {/* Financial Logic Section */}
                <div className="bg-slate-50 p-8 rounded-xl border border-slate-200 mb-10">
                    <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-3">
                        <DollarSign className="w-5 h-5" />
                        Financial Logic: Why Asia First?
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-base">
                        <div>
                            <p className="font-bold text-slate-700">1. Tax Arbitrage</p>
                            <p className="text-slate-600">Asia Tax: <strong>15%</strong> vs USA: <strong>35%</strong>. Shifting profit to Asia saves 20% on every dollar earned.</p>
                        </div>
                        <div>
                            <p className="font-bold text-slate-700">2. Tariff Avoidance</p>
                            <p className="text-slate-600">US→Asia Tariff ($12) + Shipping ($15) = <strong>$27/unit loss</strong>. Producing in Asia for Asia/EU avoids this.</p>
                        </div>
                        <div>
                            <p className="font-bold text-slate-700">3. Lower Fixed Costs</p>
                            <p className="text-slate-600">Asia Fixed Cost: <strong>$10k</strong> vs USA: <strong>$35k</strong>. Lower breakeven point for new factories.</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Detailed Round Cards */}
            <div className="space-y-6">
                {rounds.map((round) => (
                    <DetailedRoundCard key={round.round} data={round} />
                ))}
            </div>

            {/* Market Dynamics (Data-Driven) */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-gray-500" />
                    Market Dynamics (Data-Driven Insights)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="p-4 bg-red-50 rounded-lg border border-red-100">
                        <h4 className="font-bold text-red-900 mb-2">The Zero R&D Trap</h4>
                        <p className="text-sm text-red-800 mb-2">
                            Teams that spent <strong>$0 on R&D</strong> in Round 1 ended with <strong>$0 Profit</strong>.
                        </p>
                        <div className="h-20 flex items-end gap-1 mt-2">
                            <Bar label="Winner" height="80%" color="bg-green-500" value="$388k" />
                            <Bar label="Loser" height="5%" color="bg-red-500" value="$0" />
                        </div>
                        <p className="text-xs text-center text-red-600 mt-1">Round 1 R&D Spend</p>
                    </div>

                    <div className="p-4 bg-orange-50 rounded-lg border border-orange-100">
                        <h4 className="font-bold text-orange-900 mb-2">Tech 1 Price Crash</h4>
                        <p className="text-sm text-orange-800 mb-2">
                            Tech 1 prices in Asia crashed from $280 to $150 by Round 3.
                        </p>
                        <div className="h-20 flex items-end gap-1 mt-2">
                            <Bar label="R1" height="90%" color="bg-orange-300" value="$280" />
                            <Bar label="R2" height="60%" color="bg-orange-400" value="$200" />
                            <Bar label="R3" height="40%" color="bg-orange-500" value="$150" />
                        </div>
                        <p className="text-xs text-center text-orange-600 mt-1">Tech 1 Price Trend</p>
                    </div>

                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                        <h4 className="font-bold text-blue-900 mb-2">Marketing Inflation</h4>
                        <p className="text-sm text-blue-800 mb-2">
                            Avg marketing spend in Asia grew <strong>50% per round</strong>.
                        </p>
                        <div className="h-20 flex items-end gap-1 mt-2">
                            <Bar label="R1" height="40%" color="bg-blue-300" value="$22k" />
                            <Bar label="R2" height="60%" color="bg-blue-400" value="$34k" />
                            <Bar label="R3" height="90%" color="bg-blue-500" value="$37k" />
                        </div>
                        <p className="text-xs text-center text-blue-600 mt-1">Asia Marketing Avg</p>
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
                        <h4 className="font-bold text-red-900 mb-2">Tariff Trap</h4>
                        <p className="text-sm text-red-800">
                            Competitors exporting from USA to Asia will bleed cash due to the $27/unit penalty. <strong>Exploit this</strong> by undercutting them with local Asia production.
                        </p>
                    </div>
                    <div className="p-4 bg-orange-50 rounded-lg border border-orange-100">
                        <h4 className="font-bold text-orange-900 mb-2">R&D Lag</h4>
                        <p className="text-sm text-orange-800">
                            Teams starting Tech 4 R&D in Round 5 will be too late. Your Round 4 start ensures you own the "Early Adopter" segment in Round 6.
                        </p>
                    </div>
                    <div className="p-4 bg-green-50 rounded-lg border border-green-100">
                        <h4 className="font-bold text-green-900 mb-2">Feature Bloat</h4>
                        <p className="text-sm text-green-800">
                            Don't over-feature Tech 1. Competitors adding 5+ features to T1 are wasting margin. Keep T1 lean (1-2 features).
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

function DetailedRoundCard({ data, isCritique = false }: any) {
    return (
        <div className={`bg-white rounded-xl shadow-sm border ${isCritique ? 'border-rose-200 ring-4 ring-rose-50' : 'border-gray-200'} overflow-hidden transition-all`}>
            <div className="bg-gray-50 px-8 py-5 border-b border-gray-200 flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <span className="bg-purple-600 text-white text-sm font-bold px-3 py-1.5 rounded uppercase">Round {data.round}</span>
                    <h3 className="text-xl font-bold text-gray-900">{data.focus}</h3>
                </div>
                <span className="text-sm font-medium text-gray-500 bg-white px-3 py-1.5 rounded border border-gray-200">{data.demand}</span>
            </div>

            <div className="p-8 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                {/* Production */}
                <div className="space-y-3">
                    <h4 className="text-sm font-bold text-gray-400 uppercase flex items-center gap-2">
                        <Target className="w-4 h-4" /> Production
                    </h4>
                    <div className="bg-gray-50 p-4 rounded-lg text-base space-y-2">
                        <p><span className="font-semibold">Capacity:</span> {data.production.capacity}</p>
                        <p><span className="font-semibold">Allocation:</span> {data.production.allocation}</p>
                        <p><span className="font-semibold">Outsource:</span> {data.production.outsourcing}</p>
                    </div>
                </div>

                {/* R&D */}
                <div className="space-y-3">
                    <h4 className="text-sm font-bold text-gray-400 uppercase flex items-center gap-2">
                        <Zap className="w-4 h-4" /> R&D
                    </h4>
                    <div className="bg-yellow-50 p-4 rounded-lg text-base space-y-2 text-yellow-900">
                        <p><span className="font-semibold">Tech:</span> {data.rnd.tech}</p>
                        <p><span className="font-semibold">Features:</span> {data.rnd.features}</p>
                        <p><span className="font-semibold">Budget:</span> {data.rnd.budget}</p>
                    </div>
                </div>

                {/* Marketing */}
                <div className="space-y-3">
                    <h4 className="text-sm font-bold text-gray-400 uppercase flex items-center gap-2">
                        <Globe className="w-4 h-4" /> Marketing (Price / Promo)
                    </h4>
                    <div className="bg-blue-50 p-4 rounded-lg text-base space-y-2 text-blue-900">
                        <div className="flex justify-between border-b border-blue-100 pb-1 mb-1">
                            <span>USA</span>
                            <span className="font-mono">${data.marketing.usa.price} / {data.marketing.usa.promo}k</span>
                        </div>
                        <div className="flex justify-between border-b border-blue-100 pb-1 mb-1">
                            <span>Asia</span>
                            <span className="font-mono">{data.marketing.asia.price} / {data.marketing.asia.promo}k</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Europe</span>
                            <span className="font-mono">{data.marketing.europe.price} / {data.marketing.europe.promo}k</span>
                        </div>
                    </div>
                </div>

                {/* Logistics & Tax */}
                <div className="space-y-3">
                    <h4 className="text-sm font-bold text-gray-400 uppercase flex items-center gap-2">
                        <TrendingUp className="w-4 h-4" /> Logistics & Tax
                    </h4>
                    <div className="bg-gray-50 p-4 rounded-lg text-base space-y-2">
                        <p><span className="font-semibold">Logistics:</span> {data.logistics}</p>
                        <p><span className="font-semibold">Tax:</span> {data.tax}</p>
                    </div>
                </div>

                {/* Finance */}
                <div className="space-y-3">
                    <h4 className="text-sm font-bold text-gray-400 uppercase flex items-center gap-2">
                        <DollarSign className="w-4 h-4" /> Finance
                    </h4>
                    <div className="bg-green-50 p-4 rounded-lg text-base space-y-2 text-green-900">
                        <p>{data.finance}</p>
                    </div>
                </div>
            </div>

            {/* Critique Overlay */}
            {data.analysis && (
                <div className="bg-gray-900 text-white p-8 border-t border-gray-800">
                    <div className="flex items-center justify-between mb-6">
                        <h4 className="text-xl font-bold flex items-center gap-2">
                            <BrainCircuit className="w-6 h-6 text-rose-400" />
                            Strategic Audit
                        </h4>
                        <div className={`px-4 py-2 rounded-lg font-bold text-xl ${data.analysis.score > 80 ? 'bg-green-500' : data.analysis.score > 50 ? 'bg-yellow-500 text-black' : 'bg-red-500'}`}>
                            Score: {data.analysis.score}/100
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                            <h5 className="font-bold text-green-400 mb-3 flex items-center gap-2">
                                <TrendingUp className="w-4 h-4" /> Compliments
                            </h5>
                            <ul className="space-y-2">
                                {data.analysis.compliments.map((item: string, i: number) => (
                                    <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                                        <span className="text-green-500 mt-1">✓</span> {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div>
                            <h5 className="font-bold text-red-400 mb-3 flex items-center gap-2">
                                <Target className="w-4 h-4" /> Critical Risks
                            </h5>
                            <ul className="space-y-2">
                                {data.analysis.critiques.map((item: string, i: number) => (
                                    <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                                        <span className="text-red-500 mt-1">⚠</span> {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    <div className="mt-8 pt-6 border-t border-gray-800">
                        <h5 className="font-bold text-gray-400 mb-2 text-sm uppercase">Projected Outcome</h5>
                        <p className="text-lg font-medium text-white">
                            {data.analysis.outcome}
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}
