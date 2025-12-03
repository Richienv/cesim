
import React from 'react';
import { TeamData } from '@/lib/types';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { DollarSign, Activity, Users, TrendingUp } from 'lucide-react';

interface ComparisonPieChartsProps {
    teamA: TeamData;
    teamB: TeamData;
    region: 'global' | 'usa' | 'asia' | 'europe';
    tech: string;
}

export function ComparisonPieCharts({ teamA, teamB, region, tech }: ComparisonPieChartsProps) {

    const getChartMetrics = (team: TeamData) => {
        const rKey = region as 'global' | 'usa' | 'asia' | 'europe';

        // Revenue
        let revenue = 0;
        if (tech === 'All') {
            revenue = team.financials.incomeStatement[rKey]?.["Sales revenue"] || 0;
        } else {
            // Calculate revenue for specific tech
            if (region === 'global') {
                ['usa', 'asia', 'europe'].forEach(r => {
                    const sales = team.logistics[r as 'usa' | 'asia' | 'europe']?.[tech]?.sales || 0;
                    const price = team.prices[r as 'usa' | 'asia' | 'europe']?.[tech] || 0;
                    revenue += Math.abs(sales) * price;
                });
            } else {
                const sales = team.logistics[region]?.[tech]?.sales || 0;
                const price = team.prices[region]?.[tech] || 0;
                revenue = Math.abs(sales) * price;
            }
        }

        // Gross Profit
        let grossProfit = 0;
        if (tech === 'All') {
            if (region === 'global') {
                grossProfit = (team.financials.incomeStatement.global["Sales revenue"] || 0) - (team.financials.incomeStatement.global["Variable production costs"] || 0);
            } else {
                grossProfit = (team.financials.incomeStatement[region]?.["Sales revenue"] || 0) - (team.financials.incomeStatement[region]?.["Variable production costs"] || 0);
            }
        } else {
            if (region === 'global') {
                ['usa', 'asia', 'europe'].forEach(r => {
                    grossProfit += team.margins[r as 'usa' | 'asia' | 'europe']?.[tech]?.grossProfit || 0;
                });
            } else {
                grossProfit = team.margins[region]?.[tech]?.grossProfit || 0;
            }
        }

        // Market Share
        let marketShare = 0;
        if (tech === 'All') {
            // Average market share
            let total = 0;
            let count = 0;
            const shares = team.marketShare[region];
            if (shares) {
                Object.values(shares).forEach(v => { total += v; count++; });
            }
            marketShare = count > 0 ? total / count : 0;
        } else {
            marketShare = team.marketShare[region]?.[tech] || 0;
        }

        // Earnings (Retained Earnings) - Usually Global only
        // If filtering by tech, we can't really attribute retained earnings. 
        // We will show global/regional total and maybe 0 if not applicable.
        let earnings = 0;
        if (tech === 'All') {
            earnings = team.financials.balanceSheet[rKey]?.["Retained earnings"] || 0;
        } else {
            // Not applicable per tech, show 0 or maybe just global?
            // Let's show 0 to indicate N/A for tech specific
            earnings = 0;
        }

        return { revenue, grossProfit, marketShare, earnings };
    };

    const metricsA = getChartMetrics(teamA);
    const metricsB = getChartMetrics(teamB);

    const createChartData = (valA: number, valB: number, label: string) => [
        { name: teamA.name, value: Math.max(0, valA), color: '#3b82f6' }, // Blue
        { name: teamB.name, value: Math.max(0, valB), color: '#f97316' }, // Orange
    ];

    const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }: any) => {
        const RADIAN = Math.PI / 180;
        const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
        const x = cx + radius * Math.cos(-midAngle * RADIAN);
        const y = cy + radius * Math.sin(-midAngle * RADIAN);

        return (
            <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
                {`${(percent * 100).toFixed(0)}%`}
            </text>
        );
    };

    const charts = [
        {
            title: 'Total Revenue',
            data: createChartData(metricsA.revenue, metricsB.revenue, 'Revenue'),
            icon: <DollarSign className="w-5 h-5 text-gray-500" />,
            total: metricsA.revenue + metricsB.revenue,
            formatter: (v: number) => `$${(v / 1000).toFixed(1)}k`
        },
        {
            title: 'Gross Profit',
            data: createChartData(metricsA.grossProfit, metricsB.grossProfit, 'Profit'),
            icon: <Activity className="w-5 h-5 text-gray-500" />,
            total: metricsA.grossProfit + metricsB.grossProfit,
            formatter: (v: number) => `$${(v / 1000).toFixed(1)}k`
        },
        {
            title: 'Avg Market Share',
            data: createChartData(metricsA.marketShare, metricsB.marketShare, 'Share'),
            icon: <Users className="w-5 h-5 text-gray-500" />,
            total: null, // Don't show total for percentages
            formatter: (v: number) => `${v.toFixed(1)}%`
        },
        {
            title: 'Cum. Earnings',
            data: createChartData(metricsA.earnings, metricsB.earnings, 'Earnings'),
            icon: <TrendingUp className="w-5 h-5 text-gray-500" />,
            total: metricsA.earnings + metricsB.earnings,
            formatter: (v: number) => `$${(v / 1000).toFixed(1)}k`,
            note: tech !== 'All' ? 'Not available per tech' : undefined
        },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {charts.map((chart, idx) => (
                <div key={idx} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col">
                    <div className="flex justify-between items-center mb-2">
                        <h4 className="font-semibold text-gray-700">{chart.title}</h4>
                        {chart.icon}
                    </div>

                    <div className="h-48 relative">
                        {chart.note ? (
                            <div className="flex items-center justify-center h-full text-gray-400 text-sm italic">
                                {chart.note}
                            </div>
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={chart.data}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={40}
                                        outerRadius={70}
                                        paddingAngle={2}
                                        dataKey="value"
                                    >
                                        {chart.data.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip formatter={chart.formatter} />
                                    <Legend verticalAlign="bottom" height={36} />
                                </PieChart>
                            </ResponsiveContainer>
                        )}
                        {/* Center Label for Total */}
                        {!chart.note && chart.total !== null && (
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                <div className="text-xs font-bold text-gray-500 mt-[-10px]">
                                    {/* Optional: Show total in center */}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Values below chart */}
                    {!chart.note && (
                        <div className="flex justify-between text-sm mt-2 px-2">
                            <div className="text-blue-600 font-bold">{chart.formatter(chart.data[0].value)}</div>
                            <div className="text-orange-600 font-bold">{chart.formatter(chart.data[1].value)}</div>
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}
