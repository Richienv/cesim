'use client';

import React from 'react';
import { Sidebar } from '@/components/Sidebar';
import { ArrowRight, BarChart3, TrendingUp, AlertTriangle, CheckCircle2, XCircle, DollarSign, Lightbulb, GitBranch, Target, Zap, Globe, Rocket, BrainCircuit, Menu } from "lucide-react";

export default function CesimAlgorithmPage() {
    const [activeTab, setActiveTab] = React.useState('practice');
    const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

    return (
        <div className="min-h-screen bg-gray-50">
            <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

            <main className="md:pl-64 transition-all duration-300">
                {/* Top Header */}
                <header className="bg-white border-b border-gray-200 sticky top-0 z-40 px-4 md:px-8 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setIsSidebarOpen(true)}
                            className="md:hidden p-2 text-gray-500 hover:bg-gray-100 rounded-lg"
                        >
                            <Menu size={24} />
                        </button>
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-2">
                                <BrainCircuit className="text-purple-600" />
                                The Winning Algorithm
                            </h1>
                            <p className="text-sm md:text-base text-gray-500">Strategic Roadmap & Analysis</p>
                        </div>
                    </div>
                </header>

                <div className="p-8 md:p-12 max-w-[1920px] mx-auto space-y-12">

                    {/* Tab Navigation */}


                    {/* Tab Navigation */}
                    <div className="flex space-x-1 bg-gray-200 p-1 rounded-xl w-fit">
                        <button
                            onClick={() => setActiveTab('practice')}
                            className={`px-4 py-2 rounded-lg text-base font-medium transition-all ${activeTab === 'practice' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
                        >
                            Practice Round Analysis
                        </button>
                        <button
                            onClick={() => setActiveTab('actual')}
                            className={`px-4 py-2 rounded-lg text-base font-medium transition-all ${activeTab === 'actual' ? 'bg-white text-purple-600 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
                        >
                            7-Round Forecast (Actual)
                        </button>
                        <button
                            onClick={() => setActiveTab('whatif')}
                            className={`px-4 py-2 rounded-lg text-base font-medium transition-all ${activeTab === 'whatif' ? 'bg-white text-rose-600 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
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
            focus: "R1: Hybrid Start (T1 + T2)",
            demand: "Growth: 20%",
            production: {
                capacity: "Build 2 Plants in Asia (Total 4)",
                allocation: "T1: 60% / T2: 40%",
                outsourcing: "No"
            },
            rnd: {
                tech: "Buy Tech 2 License + Start Tech 4 R&D",
                features: "T1: 1, T2: 1",
                budget: "$350k+"
            },
            marketing: {
                usa: [
                    { tech: "Tech 1", price: 290, promo: 15 },
                    { tech: "Tech 2", price: 450, promo: 10 }
                ],
                asia: [
                    { tech: "Tech 1", price: 2100, promo: 20 },
                    { tech: "Tech 2", price: 3200, promo: 15 }
                ],
                europe: [
                    { tech: "Tech 1", price: 160, promo: 12 },
                    { tech: "Tech 2", price: 320, promo: 10 }
                ]
            },
            logistics: "Prioritize Asia. Export T2 to USA/EU.",
            tax: "Transfer Pricing: 2.00",
            finance: "Long-term Loan ($800k).",
            forecast: {
                demand: { usa: 7500, asia: 10600, europe: 12900 },
                growth: { usa: 20, asia: 30, europe: 10 },
                share: {
                    usa: { "Tech 1": 10, "Tech 2": 5 },
                    asia: { "Tech 1": 15, "Tech 2": 5 },
                    europe: { "Tech 1": 10, "Tech 2": 3 }
                }
            },
            analysis: {
                score: 80,
                compliments: ["Maximized Learning Curve (Internal Production).", "Good T1/T2 mix."],
                critiques: ["High cash burn.", "Risk of Unsold Inventory."],
                outcome: "High Risk / High Reward."
            },
            competitor_intel: {
                title: "Killer Threat: Pink Team Strategy",
                description: "If Pink Team keeps pricing T1 < $280 with low marketing, our high-marketing strategy will bleed cash if we try to match their price.",
                implication: "We CANNOT lower price anymore. We must differentiate (Features/Promo) or cede the low-end."
            },
            competitive_advantage: {
                usa: "Feature Leader (Inelastic Demand)",
                asia: "Local Production (0 Tariffs)",
                europe: "Niche Player (High Margin)"
            },
            scenarios: {
                best_case: {
                    probability: "60%",
                    outcome: "Profit > $2M",
                    strategy: "Aggressive Expansion"
                },
                worst_case: {
                    probability: "40%",
                    outcome: "Profit < $500k",
                    strategy: "Cut Marketing, Focus on Asia"
                }
            }
        },
        {
            round: 2,
            focus: "R2: T2 Expansion",
            demand: "T2 Demand Explodes",
            production: {
                capacity: "Build 1 Plant in Asia.",
                allocation: "T1: 40% / T2: 60%",
                outsourcing: "Yes (Overflow)"
            },
            rnd: {
                tech: "Continue Tech 4 R&D",
                features: "T1: 1, T2: 3",
                budget: "$200k"
            },
            marketing: {
                usa: [
                    { tech: "Tech 1", price: 280, promo: 15 },
                    { tech: "Tech 2", price: 440, promo: 20 }
                ],
                asia: [
                    { tech: "Tech 1", price: 2000, promo: 25 },
                    { tech: "Tech 2", price: 3100, promo: 30 }
                ],
                europe: [
                    { tech: "Tech 1", price: 150, promo: 15 },
                    { tech: "Tech 2", price: 310, promo: 20 }
                ]
            },
            logistics: "Push T2 to all markets.",
            tax: "Transfer Pricing: 2.00",
            finance: "Repay Short-term debt.",
            forecast: {
                demand: { usa: 9000, asia: 13800, europe: 14200 },
                growth: { usa: 20, asia: 30, europe: 10 },
                share: {
                    usa: { "Tech 1": 8, "Tech 2": 12 },
                    asia: { "Tech 1": 12, "Tech 2": 15 },
                    europe: { "Tech 1": 8, "Tech 2": 10 }
                }
            },
            analysis: {
                score: 85,
                compliments: ["Perfect R&D Timing (Next Round Availability).", "T2 margins stabilize cash flow."],
                critiques: ["Still heavy debt load.", "Over-reliance on Outsourcing (No Learning Curve)."],
                outcome: "Stabilization phase."
            },
            competitor_intel: {
                title: "Killer Threat: Early T2 Dump",
                description: "Competitors may launch T2 early with low prices to grab market share before we scale.",
                implication: "Maintain premium pricing for T2. Let them fight for the low-margin scraps."
            },
            competitive_advantage: {
                usa: "Feature Leader (Inelastic Demand)",
                asia: "Local Production (0 Tariffs)",
                europe: "Niche Player (High Margin)"
            },
            scenarios: {
                best_case: {
                    probability: "70%",
                    outcome: "T2 Dominance (20% Share)",
                    strategy: "Max Capacity Utilization"
                },
                worst_case: {
                    probability: "30%",
                    outcome: "Price War (Share < 15%)",
                    strategy: "Pivot to Niche High-End"
                }
            }
        },
        {
            round: 3,
            focus: "R3: Cash Cow",
            demand: "Strong T2 Growth",
            production: {
                capacity: "Build 1 Plant in Asia.",
                allocation: "T1: 30% / T2: 70%",
                outsourcing: "No"
            },
            rnd: {
                tech: "Finish Tech 4 R&D",
                features: "T1: 1, T2: 4",
                budget: "$200k"
            },
            marketing: {
                usa: [
                    { tech: "Tech 1", price: 270, promo: 15 },
                    { tech: "Tech 2", price: 430, promo: 25 }
                ],
                asia: [
                    { tech: "Tech 1", price: 1900, promo: 30 },
                    { tech: "Tech 2", price: 3000, promo: 40 }
                ],
                europe: [
                    { tech: "Tech 1", price: 140, promo: 15 },
                    { tech: "Tech 2", price: 300, promo: 25 }
                ]
            },
            logistics: "Maximize T2 sales.",
            tax: "Transfer Pricing: 2.00",
            finance: "Repay Long-term loan.",
            forecast: {
                demand: { usa: 10840, asia: 18050, europe: 15650 },
                growth: { usa: 20, asia: 30, europe: 10 },
                share: {
                    usa: { "Tech 1": 5, "Tech 2": 18 },
                    asia: { "Tech 1": 10, "Tech 2": 20 },
                    europe: { "Tech 1": 4, "Tech 2": 15 }
                }
            },
            analysis: {
                score: 90,
                compliments: ["T4 is ready!", "Good cash preservation."],
                critiques: [
                    "Logistics Inefficiency: Exporting T2 to USA incurs tariffs ($12/unit).",
                    "Forecast Variance Risk: >10% error triggers inventory holding penalties."
                ],
                outcome: "Ready for dominance."
            },
            competitor_intel: {
                title: "Killer Threat: Market Saturation",
                description: "If 5+ teams dump T2 inventory simultaneously, prices will crash below $300.",
                implication: "Shift focus to T4 R&D immediately. Do not get stuck with T2 inventory."
            },
            competitive_advantage: {
                usa: "Feature Leader (Inelastic Demand)",
                asia: "Local Production (0 Tariffs)",
                europe: "Niche Player (High Margin)"
            },
            scenarios: {
                best_case: {
                    probability: "80%",
                    outcome: "Cash Cow (Margins > 40%)",
                    strategy: "Dividend Payout"
                },
                worst_case: {
                    probability: "20%",
                    outcome: "Inventory Glut",
                    strategy: "Emergency Price Cut"
                }
            }
        },
        {
            round: 4,
            focus: "R4: T4 Launch (Split Strategy)",
            demand: "T4 High-End Monopoly",
            production: {
                capacity: "Maintain.",
                allocation: "T2: 40% / T4: 60%",
                outsourcing: "Yes"
            },
            rnd: {
                tech: "Feature Optimization",
                features: "T2: 5, T4: 8",
                budget: "$150k"
            },
            marketing: {
                usa: [
                    { tech: "Tech 2", price: 400, promo: 20 },
                    { tech: "Tech 4", price: 650, promo: 30 }
                ],
                asia: [
                    { tech: "Tech 1", price: 1800, promo: 30 },
                    { tech: "Tech 2", price: 2900, promo: 40 }
                ],
                europe: [
                    { tech: "Tech 2", price: 290, promo: 20 },
                    { tech: "Tech 4", price: 550, promo: 30 }
                ]
            },
            logistics: "Prioritize T4 to USA/EU.",
            tax: "Transfer Pricing: 2.00",
            finance: "Pay Dividends.",
            forecast: {
                demand: { usa: 13000, asia: 23400, europe: 17200 },
                growth: { usa: 20, asia: 30, europe: 10 },
                share: {
                    usa: { "Tech 2": 15, "Tech 4": 10 },
                    asia: { "Tech 1": 10, "Tech 2": 25 },
                    europe: { "Tech 2": 12, "Tech 4": 8 }
                }
            },
            analysis: {
                score: 95,
                compliments: [
                    "Smart split: T4 in rich markets, T1/T2 in Asia.",
                    "Market Fit: High Feature T4 aligns with USA's inelastic demand."
                ],
                critiques: [
                    "Complex logistics.",
                    "Feature Bloat Risk: 10 Features on T4 may be overkill for Europe (Price Sensitive)."
                ],
                outcome: "Market Leader."
            },
            competitor_intel: {
                title: "Killer Threat: Feature War",
                description: "Competitors hitting 8+ features on T4 will steal our 'High End' customers.",
                implication: "We must hit 8 features on T4 this round. No compromise."
            }
        },
        {
            round: 5,
            focus: "R5: T4 Expansion",
            demand: "T4 Mass Market",
            production: {
                capacity: "No new plants.",
                allocation: "T2: 20% / T4: 80%",
                outsourcing: "No"
            },
            rnd: {
                tech: "Maintenance",
                features: "T4: 10",
                budget: "$100k"
            },
            marketing: {
                usa: [
                    { tech: "Tech 2", price: 380, promo: 15 },
                    { tech: "Tech 4", price: 620, promo: 40 }
                ],
                asia: [
                    { tech: "Tech 2", price: 2800, promo: 40 },
                    { tech: "Tech 4", price: 4500, promo: 60 }
                ],
                europe: [
                    { tech: "Tech 2", price: 280, promo: 20 },
                    { tech: "Tech 4", price: 520, promo: 40 }
                ]
            },
            logistics: "Global T4 distribution.",
            tax: "Transfer Pricing: 2.00",
            finance: "High Dividend.",
            forecast: {
                demand: { usa: 15600, asia: 30400, europe: 18900 },
                growth: { usa: 20, asia: 30, europe: 10 },
                share: {
                    usa: { "Tech 2": 10, "Tech 4": 25 },
                    asia: { "Tech 2": 20, "Tech 4": 15 },
                    europe: { "Tech 2": 8, "Tech 4": 20 }
                }
            },
            analysis: {
                score: 98,
                compliments: ["Massive margins."],
                critiques: [
                    "Supply Chain Exposure: High reliance on shipping exposes us to fuel cost volatility."
                ],
                outcome: "Profit machine."
            },
            competitor_intel: {
                title: "Killer Threat: T4 Early Adopters",
                description: "Competitors launching T4 in USA/EU early will capture the premium segment.",
                implication: "We must launch T4 NOW in USA/EU to secure the high ground."
            }
        },
        {
            round: 6,
            focus: "R6: T4 Dominance",
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
                usa: [
                    { tech: "Tech 2", price: 350, promo: 10 },
                    { tech: "Tech 4", price: 600, promo: 40 }
                ],
                asia: [
                    { tech: "Tech 2", price: 2600, promo: 30 },
                    { tech: "Tech 4", price: 4200, promo: 70 }
                ],
                europe: [
                    { tech: "Tech 2", price: 260, promo: 15 },
                    { tech: "Tech 4", price: 500, promo: 40 }
                ]
            },
            logistics: "Prioritize T4.",
            tax: "Transfer Pricing: 2.00",
            finance: "Massive Dividend.",
            forecast: {
                demand: { usa: 18700, asia: 39500, europe: 20800 },
                growth: { usa: 20, asia: 30, europe: 10 },
                share: {
                    usa: { "Tech 2": 5, "Tech 4": 35 },
                    asia: { "Tech 2": 15, "Tech 4": 25 },
                    europe: { "Tech 2": 5, "Tech 4": 30 }
                }
            },
            analysis: {
                score: 99,
                compliments: ["Perfect execution."],
                critiques: [
                    "Capital Allocation: R&D spend on T3 yields diminishing returns. Pivot to cash preservation."
                ],
                outcome: "Unbeatable."
            },
            competitor_intel: {
                title: "Killer Threat: T3 Price War",
                description: "T3 becomes a commodity. Competitors will slash prices to clear stock.",
                implication: "Do not engage. Focus on T4 premium margin."
            }
        },
        {
            round: 7,
            focus: "R7: Endgame",
            demand: "Last Round",
            production: {
                capacity: "Match Demand.",
                allocation: "T4: 100%",
                outsourcing: "No"
            },
            rnd: {
                tech: "None",
                features: "Max",
                budget: "$0"
            },
            marketing: {
                usa: [
                    { tech: "Tech 4", price: 550, promo: 10 },
                    { tech: "Tech 2", price: 300, promo: 5 }
                ],
                asia: [
                    { tech: "Tech 4", price: 4000, promo: 10 },
                    { tech: "Tech 2", price: 2500, promo: 5 }
                ],
                europe: [
                    { tech: "Tech 4", price: 480, promo: 10 },
                    { tech: "Tech 2", price: 250, promo: 5 }
                ]
            },
            logistics: "Clear inventory.",
            tax: "Irrelevant.",
            finance: "Pay out ALL cash.",
            forecast: {
                demand: { usa: 22400, asia: 51300, europe: 22900 },
                growth: { usa: 20, asia: 30, europe: 10 },
                share: {
                    usa: { "Tech 4": 40, "Tech 2": 2 },
                    asia: { "Tech 4": 35, "Tech 2": 8 },
                    europe: { "Tech 4": 38, "Tech 2": 3 }
                }
            },
            analysis: {
                score: 100,
                compliments: ["Zero Inventory Target Met.", "Victory."],
                critiques: ["None."],
                outcome: "Winner."
            },
            competitor_intel: {
                title: "Killer Threat: End Game Loss",
                description: "Unsold inventory is SCRAPPED at zero value (Total Loss). We must hit EXACT demand.",
                implication: "Produce ONLY confirmed demand. Do not build inventory."
            }
        }
    ];

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-rose-50 rounded-xl p-8 border border-rose-100">
                <h2 className="text-3xl font-bold text-rose-900 mb-4">What-If Analysis Engine</h2>
                <p className="text-rose-800 text-xl leading-relaxed">
                    Based on your input (<strong>Tech 2 Purchase + Early Tech 4 R&D</strong>), here is the <strong>7-Round Forecast</strong>.
                </p>
                <div className="mt-6 p-4 bg-white/60 rounded-lg border border-rose-200 text-base text-rose-700">
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
                        <h2 className="text-3xl font-bold mb-2">The "Pink" Strategy</h2>
                        <p className="text-purple-100 leading-relaxed text-xl">
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
                    <p className="text-center text-base text-gray-500 mt-4">Asia Marketing Spend Growth</p>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                    <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <Lightbulb className="w-5 h-5 text-gray-500" />
                        Key Takeaways
                    </h3>
                    <ul className="space-y-4">
                        <li className="flex gap-3">
                            <span className="w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-sm font-bold shrink-0">1</span>
                            <p className="text-base text-gray-600"><strong>Don't underprice Asia.</strong> The winner maintained high prices (2000+ RMB) despite volume growth.</p>
                        </li>
                        <li className="flex gap-3">
                            <span className="w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-sm font-bold shrink-0">2</span>
                            <p className="text-base text-gray-600"><strong>Tech 2 is a cash cow.</strong> Launch it early (R2) with a significant premium (~60% higher than T1).</p>
                        </li>
                        <li className="flex gap-3">
                            <span className="w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-sm font-bold shrink-0">3</span>
                            <p className="text-base text-gray-600"><strong>R&D is an investment, not a cost.</strong> The winner spent 3x more than average in Round 1 to secure the lead.</p>
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
                usa: [
                    { tech: "Tech 1", price: 280, promo: 23 }
                ],
                asia: [
                    { tech: "Tech 1", price: 2000, promo: 35 }
                ],
                europe: [
                    { tech: "Tech 1", price: 150, promo: 20 }
                ]
            },
            logistics: "Prioritize Asia local sales. Avoid US->Asia exports.",
            tax: "Transfer Pricing: 2.00 (Max Profit Shift to Asia)",
            finance: "Take Long-term Loan ($500k) for plants. No Dividends.",
            forecast: {
                demand: { usa: 7500, asia: 10600, europe: 12900 },
                growth: { usa: 20, asia: 30, europe: 10 },
                share: {
                    usa: { "Tech 1": 10 },
                    asia: { "Tech 1": 15 },
                    europe: { "Tech 1": 10 }
                }
            },
            competitor_intel: {
                title: "Killer Threat: Pink Team Strategy",
                description: "If Pink Team keeps pricing T1 < $280 with low marketing, our high-marketing strategy will bleed cash if we try to match their price.",
                implication: "We CANNOT lower price anymore. We must differentiate (Features/Promo) or cede the low-end."
            },
            competitive_advantage: {
                usa: "Feature Leader (Inelastic Demand)",
                asia: "Local Production (0 Tariffs)",
                europe: "Niche Player (High Margin)"
            },
            scenarios: {
                best_case: {
                    probability: "60%",
                    outcome: "Profit > $2M",
                    strategy: "Aggressive Expansion"
                },
                worst_case: {
                    probability: "40%",
                    outcome: "Profit < $500k",
                    strategy: "Cut Marketing, Focus on Asia"
                }
            }
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
                usa: [
                    { tech: "Tech 1", price: 270, promo: 15 },
                    { tech: "Tech 2", price: 470, promo: 25 }
                ],
                asia: [
                    { tech: "Tech 1", price: 1900, promo: 25 },
                    { tech: "Tech 2", price: 3400, promo: 45 }
                ],
                europe: [
                    { tech: "Tech 1", price: 140, promo: 15 },
                    { tech: "Tech 2", price: 350, promo: 25 }
                ]
            },
            logistics: "Prioritize T2 delivery to all regions.",
            tax: "Transfer Pricing: 2.00",
            finance: "Repay short-term debt. Small Dividend ($0.10).",
            forecast: {
                demand: { usa: 9000, asia: 13800, europe: 14200 },
                growth: { usa: 20, asia: 30, europe: 10 },
                share: {
                    usa: { "Tech 1": 8, "Tech 2": 12 },
                    asia: { "Tech 1": 12, "Tech 2": 15 },
                    europe: { "Tech 1": 8, "Tech 2": 10 }
                }
            },
            competitor_intel: {
                title: "Killer Threat: Early T2 Dump",
                description: "Competitors may launch T2 early with low prices to grab market share before we scale.",
                implication: "Maintain premium pricing for T2. Let them fight for the low-margin scraps."
            },
            competitive_advantage: {
                usa: "Feature Leader (Inelastic Demand)",
                asia: "Local Production (0 Tariffs)",
                europe: "Niche Player (High Margin)"
            },
            scenarios: {
                best_case: {
                    probability: "70%",
                    outcome: "T2 Dominance (20% Share)",
                    strategy: "Max Capacity Utilization"
                },
                worst_case: {
                    probability: "30%",
                    outcome: "Price War (Share < 15%)",
                    strategy: "Pivot to Niche High-End"
                }
            }
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
                usa: [
                    { tech: "Tech 2", price: 450, promo: 25 },
                    { tech: "Tech 3", price: 550, promo: 30 }
                ],
                asia: [
                    { tech: "Tech 2", price: 3200, promo: 60 },
                    { tech: "Tech 3", price: 4000, promo: 40 }
                ],
                europe: [
                    { tech: "Tech 2", price: 320, promo: 30 },
                    { tech: "Tech 3", price: 420, promo: 30 }
                ]
            },
            logistics: "Asia -> Europe -> USA",
            tax: "Transfer Pricing: 2.00",
            finance: "High Dividend ($0.50). Buyback shares if cash > $2M.",
            forecast: {
                demand: { usa: 10840, asia: 18050, europe: 15650 },
                growth: { usa: 20, asia: 30, europe: 10 },
                share: {
                    usa: { "Tech 2": 15, "Tech 3": 5 },
                    asia: { "Tech 2": 18, "Tech 3": 8 },
                    europe: { "Tech 2": 12, "Tech 3": 4 }
                }
            },
            analysis: {
                score: 90,
                compliments: ["T4 is ready!", "Good cash preservation."],
                critiques: [
                    "Logistics Inefficiency: Exporting T2 to USA incurs tariffs ($12/unit).",
                    "Forecast Variance Risk: >10% error triggers inventory holding penalties."
                ],
                outcome: "Ready for dominance."
            },
            competitor_intel: {
                title: "Killer Threat: Market Saturation",
                description: "If 5+ teams dump T2 inventory simultaneously, prices will crash below $300.",
                implication: "Shift focus to T4 R&D immediately. Do not get stuck with T2 inventory."
            },
            competitive_advantage: {
                usa: "Feature Leader (Inelastic Demand)",
                asia: "Local Production (0 Tariffs)",
                europe: "Niche Player (High Margin)"
            },
            scenarios: {
                best_case: {
                    probability: "80%",
                    outcome: "Cash Cow (Margins > 40%)",
                    strategy: "Dividend Payout"
                },
                worst_case: {
                    probability: "20%",
                    outcome: "Inventory Glut",
                    strategy: "Emergency Price Cut"
                }
            }
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
                usa: [
                    { tech: "Tech 3", price: 520, promo: 20 },
                    { tech: "Tech 4", price: 650, promo: 30 }
                ],
                asia: [
                    { tech: "Tech 2", price: 2900, promo: 40 },
                    { tech: "Tech 4", price: 4500, promo: 80 }
                ],
                europe: [
                    { tech: "Tech 3", price: 400, promo: 20 },
                    { tech: "Tech 4", price: 500, promo: 35 }
                ]
            },
            logistics: "Prioritize T4 to USA (Feature Lovers).",
            tax: "Transfer Pricing: 2.00",
            finance: "Dividend: $0.80. Cash accumulation.",
            forecast: {
                demand: { usa: 13000, asia: 23400, europe: 17200 },
                growth: { usa: 20, asia: 30, europe: 10 },
                share: {
                    usa: { "Tech 3": 15, "Tech 4": 10 },
                    asia: { "Tech 2": 20, "Tech 4": 12 },
                    europe: { "Tech 3": 12, "Tech 4": 8 }
                }
            },
            analysis: {
                score: 95,
                compliments: [
                    "Smart split: T4 in rich markets, T1/T2 in Asia.",
                    "Market Fit: High Feature T4 aligns with USA's inelastic demand."
                ],
                critiques: [
                    "Complex logistics.",
                    "Feature Bloat Risk: 10 Features on T4 may be overkill for Europe (Price Sensitive)."
                ],
                outcome: "Market Leader."
            },
            competitor_intel: {
                title: "Killer Threat: Feature War",
                description: "Competitors hitting 8+ features on T4 will steal our 'High End' customers.",
                implication: "We must hit 8 features on T4 this round. No compromise."
            }
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
                usa: [
                    { tech: "Tech 3", price: 500, promo: 15 },
                    { tech: "Tech 4", price: 620, promo: 40 }
                ],
                asia: [
                    { tech: "Tech 3", price: 3800, promo: 30 },
                    { tech: "Tech 4", price: 4200, promo: 90 }
                ],
                europe: [
                    { tech: "Tech 3", price: 380, promo: 20 },
                    { tech: "Tech 4", price: 550, promo: 50 }
                ]
            },
            logistics: "Global distribution optimization.",
            tax: "Transfer Pricing: 2.00",
            finance: "Dividend: $1.00.",
            forecast: {
                demand: { usa: 15600, asia: 30400, europe: 18900 },
                growth: { usa: 20, asia: 30, europe: 10 },
                share: {
                    usa: { "Tech 3": 20, "Tech 4": 25 },
                    asia: { "Tech 3": 15, "Tech 4": 30 },
                    europe: { "Tech 3": 18, "Tech 4": 20 }
                }
            },
            analysis: {
                score: 98,
                compliments: ["Massive margins."],
                critiques: [
                    "Supply Chain Exposure: High reliance on shipping exposes us to fuel cost volatility."
                ],
                outcome: "Profit machine."
            },
            competitor_intel: {
                title: "Killer Threat: T4 Early Adopters",
                description: "Competitors launching T4 in USA/EU early will capture the premium segment.",
                implication: "We must launch T4 NOW in USA/EU to secure the high ground."
            }
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
                usa: [
                    { tech: "Tech 3", price: 450, promo: 10 },
                    { tech: "Tech 4", price: 600, promo: 40 }
                ],
                asia: [
                    { tech: "Tech 3", price: 3500, promo: 20 },
                    { tech: "Tech 4", price: 4000, promo: 80 }
                ],
                europe: [
                    { tech: "Tech 3", price: 350, promo: 15 },
                    { tech: "Tech 4", price: 520, promo: 40 }
                ]
            },
            logistics: "Prioritize T4 (Highest Margin).",
            tax: "Transfer Pricing: 2.00",
            finance: "Dividend: $2.00 (Massive Payout).",
            forecast: {
                demand: { usa: 18700, asia: 39500, europe: 20800 },
                growth: { usa: 20, asia: 30, europe: 10 },
                share: {
                    usa: { "Tech 3": 10, "Tech 4": 40 },
                    asia: { "Tech 3": 15, "Tech 4": 35 },
                    europe: { "Tech 3": 12, "Tech 4": 30 }
                }
            },
            analysis: {
                score: 99,
                compliments: ["Perfect execution."],
                critiques: [
                    "Capital Allocation: R&D spend on T3 yields diminishing returns. Pivot to cash preservation."
                ],
                outcome: "Unbeatable."
            },
            competitor_intel: {
                title: "Killer Threat: T3 Price War",
                description: "T3 becomes a commodity. Competitors will slash prices to clear stock.",
                implication: "Do not engage. Focus on T4 premium margin."
            }
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
                usa: [
                    { tech: "Tech 4", price: 550, promo: 10 },
                    { tech: "Tech 3", price: 400, promo: 5 }
                ],
                asia: [
                    { tech: "Tech 4", price: 3800, promo: 10 },
                    { tech: "Tech 3", price: 3000, promo: 5 }
                ],
                europe: [
                    { tech: "Tech 4", price: 480, promo: 10 },
                    { tech: "Tech 3", price: 300, promo: 5 }
                ]
            },
            logistics: "Clear all stock.",
            tax: "Irrelevant (Game ends).",
            finance: "Pay out ALL remaining cash as dividends.",
            forecast: {
                demand: { usa: 22400, asia: 51300, europe: 22900 },
                network: {
                    usa: { t1: 100, t2: 100, t3: 98, t4: 95 },
                    asia: { t1: 100, t2: 99, t3: 95, t4: 85 },
                    europe: { t1: 100, t2: 100, t3: 97, t4: 92 }
                },
                share: {
                    usa: { "Tech 4": 45, "Tech 3": 5 },
                    asia: { "Tech 4": 40, "Tech 3": 10 },
                    europe: { "Tech 4": 42, "Tech 3": 5 }
                }
            },
            analysis: {
                score: 100,
                compliments: ["Zero Inventory Target Met.", "Victory."],
                critiques: [
                    "Execution Risk: Any unsold inventory is a total loss (Scrapped at $0)."
                ],
                outcome: "Winner."
            },
            competitor_intel: {
                title: "Killer Threat: End Game Loss",
                description: "Unsold inventory is SCRAPPED at zero value (Total Loss). We must hit EXACT demand.",
                implication: "Produce ONLY confirmed demand. Do not build inventory."
            }
        }
    ];

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Strategy Overview */}
            <div className="bg-white rounded-xl p-8 md:p-10 shadow-sm border border-gray-100">
                <h2 className="text-3xl font-bold text-gray-900 mb-6">7-Round Detailed Strategy</h2>
                <p className="text-gray-600 text-xl leading-relaxed mb-8">
                    This playbook provides specific, variable-aware targets for every department. The core strategy relies on <strong>Asia-based production</strong> to minimize tariffs and tax, while aggressively moving up the technology ladder to capture high-margin early adopters.
                </p>

                {/* Financial Logic Section */}
                <div className="bg-slate-50 p-8 rounded-xl border border-slate-200 mb-10">
                    <h3 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-3">
                        <DollarSign className="w-5 h-5" />
                        Financial Logic: Why Asia First?
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-lg">
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
                        <p className="text-base text-red-800 mb-2">
                            Teams that spent <strong>$0 on R&D</strong> in Round 1 ended with <strong>$0 Profit</strong>.
                        </p>
                        <div className="h-20 flex items-end gap-1 mt-2">
                            <Bar label="Winner" height="80%" color="bg-green-500" value="$388k" />
                            <Bar label="Loser" height="5%" color="bg-red-500" value="$0" />
                        </div>
                        <p className="text-sm text-center text-red-600 mt-1">Round 1 R&D Spend</p>
                    </div>

                    <div className="p-4 bg-orange-50 rounded-lg border border-orange-100">
                        <h4 className="font-bold text-orange-900 mb-2">Tech 1 Price Crash</h4>
                        <p className="text-base text-orange-800 mb-2">
                            Tech 1 prices in Asia crashed from $280 to $150 by Round 3.
                        </p>
                        <div className="h-20 flex items-end gap-1 mt-2">
                            <Bar label="R1" height="90%" color="bg-orange-300" value="$280" />
                            <Bar label="R2" height="60%" color="bg-orange-400" value="$200" />
                            <Bar label="R3" height="40%" color="bg-orange-500" value="$150" />
                        </div>
                        <p className="text-sm text-center text-orange-600 mt-1">Tech 1 Price Trend</p>
                    </div>

                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                        <h4 className="font-bold text-blue-900 mb-2">Marketing Inflation</h4>
                        <p className="text-base text-blue-800 mb-2">
                            Avg marketing spend in Asia grew <strong>50% per round</strong>.
                        </p>
                        <div className="h-20 flex items-end gap-1 mt-2">
                            <Bar label="R1" height="40%" color="bg-blue-300" value="$22k" />
                            <Bar label="R2" height="60%" color="bg-blue-400" value="$34k" />
                            <Bar label="R3" height="90%" color="bg-blue-500" value="$37k" />
                        </div>
                        <p className="text-sm text-center text-blue-600 mt-1">Asia Marketing Avg</p>
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
                        <p className="text-base text-red-800">
                            Competitors exporting from USA to Asia will bleed cash due to the $27/unit penalty. <strong>Exploit this</strong> by undercutting them with local Asia production.
                        </p>
                    </div>
                    <div className="p-4 bg-orange-50 rounded-lg border border-orange-100">
                        <h4 className="font-bold text-orange-900 mb-2">R&D Lag</h4>
                        <p className="text-base text-orange-800">
                            Teams starting Tech 4 R&D in Round 5 will be too late. Your Round 4 start ensures you own the "Early Adopter" segment in Round 6.
                        </p>
                    </div>
                    <div className="p-4 bg-green-50 rounded-lg border border-green-100">
                        <h4 className="font-bold text-green-900 mb-2">Feature Bloat</h4>
                        <p className="text-base text-green-800">
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
                    <p className="text-sm text-gray-500 uppercase font-bold">{metric}</p>
                    <p className={`text-2xl font-bold text-${color}-600`}>{value}</p>
                </div>
            </div>
            <h3 className="font-bold text-gray-900 mb-2">{title}</h3>
            <p className="text-base text-gray-600 leading-relaxed">{desc}</p>
        </div>
    );
}

function TimelineItem({ round, title, data }: any) {
    return (
        <div className="relative pl-8">
            <span className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-purple-600 border-4 border-white shadow-sm"></span>
            <div className="mb-1 flex items-center gap-2">
                <span className="text-sm font-bold text-purple-600 bg-purple-50 px-2 py-1 rounded uppercase tracking-wider">{round}</span>
                <h4 className="font-bold text-gray-900">{title}</h4>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 mt-3 grid grid-cols-2 md:grid-cols-3 gap-4">
                {Object.entries(data).map(([key, val]: any) => (
                    <div key={key}>
                        <p className="text-sm text-gray-500 mb-1">{key}</p>
                        <p className="text-base font-medium text-gray-900">{val}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}

function Bar({ label, height, color, value }: any) {
    return (
        <div className="flex flex-col items-center justify-end h-full w-full group">
            <div className="mb-2 text-sm font-bold text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity">{value}</div>
            <div className={`w-full rounded-t-lg ${color} transition-all duration-500 hover:opacity-80`} style={{ height }}></div>
            <div className="mt-2 text-sm text-gray-500 font-medium">{label}</div>
        </div>
    );
}

function DetailedRoundCard({ data, isCritique = false }: any) {
    return (
        <div className={`bg-white rounded-xl shadow-sm border ${isCritique ? 'border-rose-200 ring-4 ring-rose-50' : 'border-gray-200'} overflow-hidden transition-all`}>
            <div className="bg-gray-50 px-8 py-5 border-b border-gray-200 flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <span className="bg-purple-600 text-white text-base font-bold px-3 py-1.5 rounded uppercase">Round {data.round}</span>
                    <h3 className="text-2xl font-bold text-gray-900">{data.focus}</h3>
                </div>
                <span className="text-base font-medium text-gray-500 bg-white px-3 py-1.5 rounded border border-gray-200">{data.demand}</span>
            </div>

            <div className="p-8 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                {/* Production */}
                <div className="space-y-3">
                    <h4 className="text-base font-bold text-gray-400 uppercase flex items-center gap-2">
                        <Target className="w-4 h-4" /> Production
                    </h4>
                    <div className="bg-gray-50 p-4 rounded-lg text-lg space-y-2">
                        <p><span className="font-semibold">Capacity:</span> {data.production.capacity}</p>
                        <p><span className="font-semibold">Allocation:</span> {data.production.allocation}</p>
                        <p><span className="font-semibold">Outsource:</span> {data.production.outsourcing}</p>
                    </div>
                </div>

                {/* R&D */}
                <div className="space-y-3">
                    <h4 className="text-base font-bold text-gray-400 uppercase flex items-center gap-2">
                        <Zap className="w-4 h-4" /> R&D
                    </h4>
                    <div className="bg-yellow-50 p-4 rounded-lg text-lg space-y-2 text-yellow-900">
                        <p><span className="font-semibold">Tech:</span> {data.rnd.tech}</p>
                        <p><span className="font-semibold">Features:</span> {data.rnd.features}</p>
                        <p><span className="font-semibold">Budget:</span> {data.rnd.budget}</p>
                    </div>
                </div>

                {/* Marketing */}
                <div className="space-y-3">
                    <h4 className="text-base font-bold text-gray-400 uppercase flex items-center gap-2">
                        <Globe className="w-4 h-4" /> Marketing (Price / Promo)
                    </h4>
                    <div className="bg-blue-50 p-4 rounded-lg text-lg space-y-2 text-blue-900">
                        {['usa', 'asia', 'europe'].map((region) => {
                            const regionData = data.marketing[region];
                            const regionName = region.toUpperCase();

                            if (Array.isArray(regionData)) {
                                return (
                                    <div key={region} className="border-b border-blue-200 pb-2 mb-2 last:border-0 last:pb-0 last:mb-0">
                                        <div className="font-bold text-sm uppercase text-blue-500 mb-1">{regionName}</div>
                                        {regionData.map((item: any, i: number) => (
                                            <div key={i} className="flex justify-between text-base mb-1 last:mb-0">
                                                <span className="text-blue-700 font-medium">{item.tech}</span>
                                                <span className="font-mono text-blue-900 font-bold">${item.price} / {item.promo}k</span>
                                            </div>
                                        ))}
                                    </div>
                                );
                            }
                            return (
                                <div key={region} className="flex justify-between border-b border-blue-200 pb-1 mb-1 last:border-0 last:pb-0 last:mb-0">
                                    <span>{regionName}</span>
                                    <span className="font-mono font-bold">${regionData.price} / {regionData.promo}k</span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Logistics & Tax */}
                <div className="space-y-3">
                    <h4 className="text-base font-bold text-gray-400 uppercase flex items-center gap-2">
                        <TrendingUp className="w-4 h-4" /> Logistics & Tax
                    </h4>
                    <div className="bg-gray-50 p-4 rounded-lg text-lg space-y-2">
                        <p><span className="font-semibold">Logistics:</span> {data.logistics}</p>
                        <p><span className="font-semibold">Tax:</span> {data.tax}</p>
                    </div>
                </div>

                {/* Finance */}
                <div className="space-y-3">
                    <h4 className="text-base font-bold text-gray-400 uppercase flex items-center gap-2">
                        <DollarSign className="w-4 h-4" /> Finance
                    </h4>
                    <div className="bg-green-50 p-4 rounded-lg text-lg space-y-2 text-green-900">
                        <p>{data.finance}</p>
                    </div>
                </div>

                {/* Market Forecast (Refined) */}
                {data.forecast && (
                    <div className="md:col-span-2 xl:col-span-3 space-y-4 pt-6 border-t border-gray-100">
                        <div className="flex items-center justify-between">
                            <h4 className="text-base font-bold text-gray-400 uppercase flex items-center gap-2">
                                <BarChart3 className="w-4 h-4" /> Market Forecast
                            </h4>
                            <span className="text-sm font-medium text-gray-400 bg-gray-50 px-2 py-1 rounded">
                                *Sales = Total Demand × Market Share
                            </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {['usa', 'asia', 'europe'].map((region) => {
                                const r = region as 'usa' | 'asia' | 'europe';
                                const demand = data.forecast.demand[r];
                                const growth = data.forecast.growth ? data.forecast.growth[r] : 0;
                                const shares = data.forecast.share[r];
                                const totalShare = Object.values(shares).reduce((a: number, b: unknown) => a + (b as number), 0);
                                const projectedSales = Math.round(demand * (totalShare as number / 100));

                                return (
                                    <div key={region} className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                                        {/* Header: Total Market Demand */}
                                        <div className="bg-gray-50 px-4 py-3 border-b border-gray-100 flex justify-between items-center">
                                            <span className="font-bold text-gray-900 uppercase">{region}</span>
                                            <div className="text-right">
                                                <div className="text-sm text-gray-500 uppercase font-bold">Total Demand</div>
                                                <div className="font-mono font-bold text-gray-900">
                                                    {(demand / 1000).toFixed(1)}M
                                                    <span className={`ml-1 text-sm ${growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                        {growth > 0 ? '+' : ''}{growth}%
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Body: Company Share & Sales */}
                                        <div className="p-4 space-y-4">
                                            {/* Market Share Breakdown */}
                                            <div className="space-y-2">
                                                <div className="flex justify-between text-sm font-bold text-gray-400 uppercase">
                                                    <span>Our Share</span>
                                                    <span>{totalShare}% Total</span>
                                                </div>
                                                {Object.entries(shares).map(([tech, share]: any) => (
                                                    <div key={tech} className="flex items-center justify-between text-base">
                                                        <span className="text-gray-600 font-medium">{tech}</span>
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                                                                <div className="h-full bg-blue-500" style={{ width: `${share * 3}%` }}></div> {/* Visual scale x3 for visibility */}
                                                            </div>
                                                            <span className="font-bold text-gray-900 w-8 text-right">{share}%</span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>

                                            {/* Calculated Sales */}
                                            <div className="pt-3 border-t border-gray-100 flex justify-between items-center bg-blue-50/50 -mx-4 -mb-4 px-4 py-3">
                                                <span className="text-sm font-bold text-blue-800 uppercase">Est. Sales Volume</span>
                                                <span className="font-mono font-bold text-blue-700 text-xl">{projectedSales.toLocaleString()}k</span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>

            {/* Competitive Advantage (New) */}
            {data.competitive_advantage && (
                <div className="mt-6 pt-4 border-t border-gray-100 px-8">
                    <h4 className="text-base font-bold text-gray-400 uppercase flex items-center gap-2 mb-3">
                        <Lightbulb className="w-4 h-4" /> Competitive Advantage (Why Us?)
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-emerald-50 border border-emerald-100 p-3 rounded-lg">
                            <div className="text-sm font-bold text-emerald-600 uppercase mb-1">USA</div>
                            <div className="text-base text-emerald-900 font-medium">{data.competitive_advantage.usa}</div>
                        </div>
                        <div className="bg-emerald-50 border border-emerald-100 p-3 rounded-lg">
                            <div className="text-sm font-bold text-emerald-600 uppercase mb-1">Asia</div>
                            <div className="text-base text-emerald-900 font-medium">{data.competitive_advantage.asia}</div>
                        </div>
                        <div className="bg-emerald-50 border border-emerald-100 p-3 rounded-lg">
                            <div className="text-sm font-bold text-emerald-600 uppercase mb-1">Europe</div>
                            <div className="text-base text-emerald-900 font-medium">{data.competitive_advantage.europe}</div>
                        </div>
                    </div>
                </div>
            )}

            {/* Scenario Planning (New) */}
            {data.scenarios && (
                <div className="mt-6 pt-4 border-t border-gray-100 px-8">
                    <h4 className="text-base font-bold text-gray-400 uppercase flex items-center gap-2 mb-3">
                        <GitBranch className="w-4 h-4" /> Scenario Planning
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-green-50 border border-green-100 p-3 rounded-lg">
                            <div className="text-sm font-bold text-green-600 uppercase mb-1 flex justify-between">
                                <span>Best Case (High Demand)</span>
                                <span>{data.scenarios.best_case.probability}</span>
                            </div>
                            <div className="text-base text-green-900 font-medium mb-1">{data.scenarios.best_case.outcome}</div>
                            <div className="text-sm text-green-700">{data.scenarios.best_case.strategy}</div>
                        </div>
                        <div className="bg-red-50 border border-red-100 p-3 rounded-lg">
                            <div className="text-sm font-bold text-red-600 uppercase mb-1 flex justify-between">
                                <span>Worst Case (Price War)</span>
                                <span>{data.scenarios.worst_case.probability}</span>
                            </div>
                            <div className="text-base text-red-900 font-medium mb-1">{data.scenarios.worst_case.outcome}</div>
                            <div className="text-sm text-red-700">{data.scenarios.worst_case.strategy}</div>
                        </div>
                    </div>
                </div>
            )}

            {/* Critique Overlay */}
            {data.analysis && (
                <div className="bg-gray-900 text-white p-8 border-t border-gray-800">
                    <div className="flex items-center justify-between mb-6">
                        <h4 className="text-2xl font-bold flex items-center gap-2">
                            <BrainCircuit className="w-6 h-6 text-rose-400" />
                            Strategic Audit
                        </h4>
                        <div className={`px-4 py-2 rounded-lg font-bold text-2xl ${data.analysis.score > 80 ? 'bg-green-500' : data.analysis.score > 50 ? 'bg-yellow-500 text-black' : 'bg-red-500'}`}>
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
                                    <li key={i} className="flex items-start gap-2 text-base text-gray-300">
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
                                    <li key={i} className="flex items-start gap-2 text-base text-gray-300">
                                        <span className="text-red-500 mt-1">⚠</span> {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    {/* Competitor Intelligence (New) */}
                    {data.competitor_intel && (
                        <div className="mt-8 pt-6 border-t border-gray-800">
                            <h5 className="font-bold text-rose-400 mb-3 flex items-center gap-2 uppercase text-base tracking-wider">
                                <AlertTriangle className="w-4 h-4" /> Competitor Intelligence (Killer Threats)
                            </h5>
                            <div className="bg-rose-900/20 border border-rose-900/50 rounded-lg p-4">
                                <h6 className="font-bold text-rose-200 mb-2">{data.competitor_intel.title}</h6>
                                <p className="text-base text-gray-300 mb-3 leading-relaxed">
                                    {data.competitor_intel.description}
                                </p>
                                <div className="flex items-start gap-2 text-sm font-bold text-rose-400 uppercase">
                                    <span className="shrink-0">⚠ Implication:</span>
                                    <span>{data.competitor_intel.implication}</span>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="mt-8 pt-6 border-t border-gray-800">
                        <h5 className="font-bold text-gray-400 mb-2 text-base uppercase">Projected Outcome</h5>
                        <p className="text-xl font-medium text-white">
                            {data.analysis.outcome}
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}
