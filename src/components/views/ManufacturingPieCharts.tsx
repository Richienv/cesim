
import React from 'react';
import { TeamData } from '@/lib/types';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Factory, Truck, Box, AlertCircle } from 'lucide-react';

interface ManufacturingPieChartsProps {
    teamA: TeamData;
    teamB: TeamData;
    region: 'global' | 'usa' | 'asia' | 'europe';
    tech: string;
}

export function ManufacturingPieCharts({ teamA, teamB, region, tech }: ManufacturingPieChartsProps) {

    const getMetrics = (team: TeamData) => {
        let inHouse = 0;
        let contract = 0;
        let buffer = 0;
        let unsatisfied = 0;

        const regions = region === 'global' ? ['usa', 'asia', 'europe'] : [region];
        const techs = tech === 'All' ? ['Tech 1', 'Tech 2', 'Tech 3', 'Tech 4'] : [tech];

        regions.forEach(r => {
            const rKey = r as 'usa' | 'asia' | 'europe';

            // Manufacturing data (In-House, Contract) - Note: Europe usually doesn't have manufacturing in some scenarios, but we check safely
            if (team.manufacturing[rKey as 'usa' | 'asia']) {
                techs.forEach(t => {
                    inHouse += team.manufacturing[rKey as 'usa' | 'asia']?.inHouse?.[t] || 0;
                    contract += team.manufacturing[rKey as 'usa' | 'asia']?.contract?.[t] || 0;
                });
            }

            // Logistics data (Buffer, Unsatisfied)
            if (team.logistics[rKey]) {
                techs.forEach(t => {
                    const log = team.logistics[rKey]?.[t];
                    if (log) {
                        buffer += log.productionBuffer || 0;
                        unsatisfied += log.unsatisfiedDemand || 0;
                    }
                });
            }
        });

        return { inHouse, contract, buffer, unsatisfied };
    };

    const metricsA = getMetrics(teamA);
    const metricsB = getMetrics(teamB);

    const createChartData = (valA: number, valB: number) => [
        { name: teamA.name, value: Math.max(0, valA), color: '#3b82f6' }, // Blue
        { name: teamB.name, value: Math.max(0, valB), color: '#f97316' }, // Orange
    ];

    const charts = [
        {
            title: 'In-House Production',
            data: createChartData(metricsA.inHouse, metricsB.inHouse),
            icon: <Factory className="w-5 h-5 text-gray-500" />,
            formatter: (v: number) => `${v.toLocaleString()}`
        },
        {
            title: 'Contract Mfg',
            data: createChartData(metricsA.contract, metricsB.contract),
            icon: <Factory className="w-5 h-5 text-gray-500" />,
            formatter: (v: number) => `${v.toLocaleString()}`
        },
        {
            title: 'Inventory (Buffer)',
            data: createChartData(metricsA.buffer, metricsB.buffer),
            icon: <Box className="w-5 h-5 text-gray-500" />,
            formatter: (v: number) => `${v.toLocaleString()}`
        },
        {
            title: 'Unsatisfied Demand',
            data: createChartData(metricsA.unsatisfied, metricsB.unsatisfied),
            icon: <AlertCircle className="w-5 h-5 text-gray-500" />,
            formatter: (v: number) => `${v.toLocaleString()}`
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
                    </div>

                    {/* Values below chart */}
                    <div className="flex justify-between text-sm mt-2 px-2">
                        <div className="text-blue-600 font-bold">{chart.formatter(chart.data[0].value)}</div>
                        <div className="text-orange-600 font-bold">{chart.formatter(chart.data[1].value)}</div>
                    </div>
                </div>
            ))}
        </div>
    );
}
