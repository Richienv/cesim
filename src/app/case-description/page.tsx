'use client';

import React from 'react';
import { Sidebar } from '@/components/Sidebar';
import {
    BookOpen,
    History,
    Globe,
    TrendingUp,
    Factory,
    Megaphone,
    Cpu,
    Truck,
    DollarSign,
    BarChart3,
    AlertTriangle,
    Landmark,
    Menu
} from 'lucide-react';

export default function CaseDescriptionPage() {
    const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

    return (
        <div className="min-h-screen bg-gray-50">
            <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

            <main className="md:pl-[var(--sidebar-width)] transition-all duration-300">
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
                            <h1 className="text-2xl md:text-4xl font-bold text-gray-900 mb-2">Case Description</h1>
                            <p className="text-sm md:text-lg text-gray-500">Global Mobile Phone Market Simulation (Mobilé Inc.)</p>
                        </div>
                    </div>
                </header>

                <div className="p-8 md:p-12 max-w-[1920px] mx-auto space-y-12">

                    {/* Introduction */}
                    <Section
                        title="Company Overview"
                        icon={<BookOpen className="w-8 h-8 text-blue-600" />}
                        color="blue"
                    >
                        <p className="text-gray-600 text-xl leading-relaxed mb-6">
                            <strong>Mobilé Inc.</strong> is a major mobile phone manufacturer. Following a DOJ investigation into monopoly practices (price fixing, delaying technology), the previous board was dismissed. You have been hired as new management to compete in a restructured, competitive market.
                        </p>
                        <p className="text-gray-600 text-xl leading-relaxed">
                            The company currently has strong profits and cash flow (~$1.2B sales), but faces intense competition and rapid technological changes. Core operations include R&D, Production, and Sales.
                        </p>
                    </Section>

                    {/* Industry History & Status */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <Section
                            title="Industry Context"
                            icon={<History className="w-8 h-8 text-purple-600" />}
                            color="purple"
                        >
                            <p className="text-gray-600 text-lg mb-6 leading-relaxed">
                                From the first NMT networks (1981) to GSM (1991) and 3G/4G, the industry is driven by data traffic growth. Key success factors are <strong>attractive design</strong> and <strong>customer-oriented features</strong>.
                            </p>
                            <div className="bg-purple-50 p-6 rounded-xl text-lg text-purple-900 border border-purple-100">
                                <strong>Future Challenge:</strong> 5G and rapid tech evolution require continuous R&D investment. Partnerships and outsourcing are essential strategies.
                            </div>
                        </Section>

                        <Section
                            title="Global Operations"
                            icon={<Globe className="w-8 h-8 text-green-600" />}
                            color="green"
                        >
                            <ul className="space-y-4 text-lg text-gray-600 leading-relaxed">
                                <li className="flex items-start gap-4">
                                    <span className="w-2.5 h-2.5 rounded-full bg-green-500 mt-2.5 shrink-0"></span>
                                    <span><strong>Markets:</strong> USA, Asia, Europe.</span>
                                </li>
                                <li className="flex items-start gap-4">
                                    <span className="w-2.5 h-2.5 rounded-full bg-green-500 mt-2.5 shrink-0"></span>
                                    <span><strong>Production:</strong> Atlanta (USA) and Asia. No production in Europe due to high labor costs.</span>
                                </li>
                                <li className="flex items-start gap-4">
                                    <span className="w-2.5 h-2.5 rounded-full bg-green-500 mt-2.5 shrink-0"></span>
                                    <span><strong>Strategy:</strong> Active use of outsourcing for flexibility.</span>
                                </li>
                            </ul>
                        </Section>
                    </div>

                    {/* Key Functional Areas */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <Section
                            title="Production & Logistics"
                            icon={<Factory className="w-8 h-8 text-orange-600" />}
                            color="orange"
                        >
                            <ul className="space-y-5 text-lg text-gray-600 leading-relaxed">
                                <li><strong>Learning Curve:</strong> Internal production costs drop as you gain experience. Outsourcing does not benefit from this but offers flexibility.</li>
                                <li><strong>JIT Production:</strong> No finished goods inventory.</li>
                                <li><strong>Forecasting Risk:</strong>
                                    <ul className="pl-6 mt-2 list-disc text-gray-500 space-y-1">
                                        <li>Over-estimate: Production is cut, but 5-10% penalty cost applies.</li>
                                        <li>Under-estimate: Lost sales due to inability to increase production.</li>
                                    </ul>
                                </li>
                                <li><strong>Logistics:</strong> Shipping costs + Tariffs apply for exports. Local production avoids these.</li>
                            </ul>
                        </Section>

                        <Section
                            title="R&D and Technology"
                            icon={<Cpu className="w-8 h-8 text-indigo-600" />}
                            color="indigo"
                        >
                            <p className="text-lg text-gray-600 mb-6">
                                You start with <strong>Tech 1</strong>. Developing Tech 2, 3, 4 is critical.
                            </p>
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-lg">
                                <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
                                    <strong className="block text-gray-900 mb-2 text-xl">Internal R&D</strong>
                                    <span className="text-gray-500">Lower long-term cost. Available <strong>next round</strong>.</span>
                                </div>
                                <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
                                    <strong className="block text-gray-900 mb-2 text-xl">Licensing</strong>
                                    <span className="text-gray-500">One-time fee (decreases over time). Available <strong>immediately</strong>.</span>
                                </div>
                            </div>
                            <p className="text-base text-gray-500 mt-4">
                                <strong>Features:</strong> Each tech supports <strong>1 to 10</strong> features. US/Europe consumers value these more than Asia.
                            </p>
                            <p className="text-base text-gray-400 mt-2 italic">
                                * R&D is an operating expense, not capital expenditure. Typical industry spend is ~10% of sales.
                            </p>
                        </Section>
                    </div>

                    {/* Marketing & Markets */}
                    <Section
                        title="Market Characteristics"
                        icon={<Megaphone className="w-8 h-8 text-pink-600" />}
                        color="pink"
                    >
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <MarketCard
                                region="USA"
                                desc="Home market. Tech follower (lags Asia/Europe). Consumers love features. Growth 5-10% (up to 20% with new tech)."
                            />
                            <MarketCard
                                region="Europe"
                                desc="Export only market. High tech adoption. Steady growth ~10%. High labor costs prevent local production."
                            />
                            <MarketCard
                                region="Asia"
                                desc="Highest growth potential (20%). Polarized market (high-end vs low-end). Price sensitive. Slower average tech adoption."
                            />
                        </div>
                        <div className="mt-8 text-lg text-gray-600 bg-pink-50 p-6 rounded-xl border border-pink-100">
                            <strong>Marketing Spend:</strong> Typically 3-5% of sales. USA is most sensitive to advertising.
                        </div>
                    </Section>

                    {/* Finance & Tax */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <Section
                            title="Finance"
                            icon={<DollarSign className="w-8 h-8 text-emerald-600" />}
                            color="emerald"
                        >
                            <ul className="space-y-4 text-lg text-gray-600 leading-relaxed">
                                <li><strong>Goal:</strong> Maximize Shareholder Return (Dividends + Share Price Appreciation).</li>
                                <li><strong>Funding:</strong> Sales, Equity (Shares), Debt.</li>
                                <li><strong>Loans:</strong> Long-term (cheaper) vs Short-term (expensive, emergency use).</li>
                                <li><strong>Internal Loans:</strong> Transfer cash between regions (e.g., repatriate profits from Asia).</li>
                            </ul>
                        </Section>

                        <Section
                            title="Tax & Transfer Pricing"
                            icon={<Landmark className="w-8 h-8 text-slate-600" />}
                            color="slate"
                        >
                            <ul className="space-y-4 text-lg text-gray-600 leading-relaxed">
                                <li><strong>R&D Allocation:</strong> Costs are split between regions based on the number of factories (e.g., 10 US / 2 Asia factories = 83% US / 17% Asia cost allocation).</li>
                                <li><strong>Transfer Pricing:</strong> Can set export prices between <strong>1.0x and 2.0x</strong> variable production cost.</li>
                                <li><strong>Strategy:</strong> Use transfer pricing to shift profits to lower-tax regions or cover losses.</li>
                            </ul>
                        </Section>
                    </div>

                    {/* Performance */}
                    <Section
                        title="Performance Metrics"
                        icon={<BarChart3 className="w-8 h-8 text-red-600" />}
                        color="red"
                    >
                        <p className="text-gray-600 mb-6 text-lg">
                            The Board measures success via <strong>Total Shareholder Return (TSR)</strong>.
                        </p>
                        <div className="flex flex-wrap gap-4">
                            {['ROE', 'Net Profit', 'EPS', 'Market Share', 'Sales Growth'].map(metric => (
                                <span key={metric} className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-full text-lg font-medium">
                                    {metric}
                                </span>
                            ))}
                        </div>
                    </Section>

                </div>
            </main>
        </div>
    );
}

function Section({ title, icon, children, color }: { title: string, icon: React.ReactNode, children: React.ReactNode, color: string }) {
    return (
        <div className={`bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden`}>
            <div className={`px-8 py-6 border-b border-gray-50 flex items-center gap-5 bg-${color}-50/30`}>
                <div className={`p-3 bg-${color}-50 rounded-xl`}>
                    {icon}
                </div>
                <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
            </div>
            <div className="p-8 md:p-10">
                {children}
            </div>
        </div>
    );
}

function MarketCard({ region, desc }: { region: string, desc: string }) {
    return (
        <div className="bg-gray-50 rounded-xl p-8 border border-gray-100 h-full">
            <h3 className="text-xl font-bold text-gray-900 mb-4">{region}</h3>
            <p className="text-lg text-gray-600 leading-relaxed">{desc}</p>
        </div>
    );
}
