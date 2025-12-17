
import React from 'react';
import { TeamData } from '@/lib/types';
import { Users } from 'lucide-react';

interface HRViewProps {
    teams: TeamData[];
}

export function HRView({ teams }: HRViewProps) {
    if (!teams || teams.length === 0) return <div>No data available</div>;

    const metrics = [
        { label: 'Salary/Month (USD)', key: 'salary', format: (v: number) => `$${v.toLocaleString()}` },
        { label: 'Training Budget/Month (USD)', key: 'trainingBudget', format: (v: number) => `$${v.toLocaleString()}` },
        { label: 'Man-day Allocation %', key: 'allocatedWorkdays', format: (v: number) => `${v.toFixed(1)}%` },
        { label: 'Efficiency Multiplier', key: 'efficiency', format: (v: number) => v.toFixed(3) },
        { label: 'Staffing Level (This Round)', key: 'staffingLevel', format: (v: number) => v.toLocaleString() },
        { label: 'Turnover Rate (Voluntary) %', key: 'turnoverRate', format: (v: number) => `${v.toFixed(1)}%` },
        { label: 'Total Turnover Rate %', key: 'totalTurnover', format: (v: number) => `${v.toFixed(1)}%` },
    ];

    const costs = [
        { label: 'Recruitment Costs', key: 'hiringOneOffCost', format: (v: number) => `$${v.toLocaleString()}` },
        { label: 'Training Costs', key: 'trainingCost', format: (v: number) => `$${v.toLocaleString()}` },
        { label: 'Redundancy Costs', key: 'firingOneOffCost', format: (v: number) => `$${v.toLocaleString()}` },
        // Add total HR cost if available or calculate it
    ];

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="bg-purple-50 px-6 py-4 border-b border-purple-100 flex justify-between items-center">
                    <h3 className="font-bold text-xl text-purple-900 flex items-center gap-2">
                        <Users className="w-5 h-5 text-purple-600" />
                        Human Resources Report
                    </h3>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-gray-500 uppercase bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 min-w-[200px]">Metric</th>
                                {teams.map(team => (
                                    <th key={team.name} className="px-6 py-3 text-right whitespace-nowrap">{team.name}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {/* General HR Metrics */}
                            <tr className="bg-gray-50/50">
                                <td colSpan={teams.length + 1} className="px-6 py-2 text-xs font-bold text-gray-500 uppercase tracking-wider">
                                    Personnel
                                </td>
                            </tr>
                            {metrics.map((metric) => (
                                <tr key={metric.key} className="hover:bg-gray-50">
                                    <td className="px-6 py-3 font-medium text-gray-900">{metric.label}</td>
                                    {teams.map(team => {
                                        const val = (team.hr as any)[metric.key];
                                        return (
                                            <td key={team.name} className="px-6 py-3 text-right text-gray-600">
                                                {val !== undefined ? metric.format(val) : '-'}
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}

                            {/* HR Costs */}
                            <tr className="bg-gray-50/50">
                                <td colSpan={teams.length + 1} className="px-6 py-2 text-xs font-bold text-gray-500 uppercase tracking-wider mt-4">
                                    HR Costs (k USD)
                                </td>
                            </tr>
                            {costs.map((metric) => (
                                <tr key={metric.key} className="hover:bg-gray-50">
                                    <td className="px-6 py-3 font-medium text-gray-900">{metric.label}</td>
                                    {teams.map(team => {
                                        const val = (team.hr as any)[metric.key];
                                        return (
                                            <td key={team.name} className="px-6 py-3 text-right text-gray-600">
                                                {val !== undefined ? metric.format(val) : '-'}
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
