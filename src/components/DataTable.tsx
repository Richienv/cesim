import React from 'react';
import { TeamData } from '@/lib/types';

interface DataTableProps {
    title: string;
    teams: TeamData[];
    dataExtractor: (team: TeamData) => Record<string, number | undefined>;
    formatValue?: (val: number, key: string) => string | React.ReactNode;
}

export function DataTable({ title, teams, dataExtractor, formatValue }: DataTableProps) {
    // Get all unique keys from all teams
    const allKeys = Array.from(new Set(teams.flatMap(t => Object.keys(dataExtractor(t) || {}))));

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 text-gray-500 font-medium">
                        <tr>
                            <th className="px-6 py-3">Metric</th>
                            {teams.map(t => (
                                <th key={t.name} className="px-6 py-3 whitespace-nowrap">{t.name}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {allKeys.map(key => (
                            <tr key={key} className="hover:bg-gray-50/50 transition-colors">
                                <td className="px-6 py-3 font-medium text-gray-700">{key}</td>
                                {teams.map(t => {
                                    const val = dataExtractor(t)[key];
                                    return (
                                        <td key={t.name} className="px-6 py-3 text-gray-600">
                                            {val !== undefined ? (formatValue ? formatValue(val, key) : val.toLocaleString()) : "-"}
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
