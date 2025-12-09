import React, { useState } from 'react';
import { clsx } from 'clsx';
import { TeamData } from '@/lib/types';
import { Factory, Truck, Scale, Lightbulb, Hammer, Handshake, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';

interface HiddenInsightsTableProps {
    teams: TeamData[];
}

type SortKey = 'factories' | 'production' | 'outsourcing' | 'tax' | 'logistics' | 'rnd';
type SortDirection = 'asc' | 'desc';

export function HiddenInsightsTable({ teams }: HiddenInsightsTableProps) {
    const [sortKey, setSortKey] = useState<SortKey>('factories');
    const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

    // 1. Identify Momentum
    const momentum = teams.find(t => t.name === 'Momentum');

    if (!momentum) return null;

    const handleSort = (key: SortKey) => {
        if (sortKey === key) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortKey(key);
            setSortDirection('desc');
        }
    };

    const SortIcon = ({ column }: { column: SortKey }) => {
        if (sortKey !== column) return <ArrowUpDown className="w-3 h-3 ml-1 text-gray-400" />;
        return sortDirection === 'asc' ? <ArrowUp className="w-3 h-3 ml-1 text-blue-600" /> : <ArrowDown className="w-3 h-3 ml-1 text-blue-600" />;
    };

    // Prepare data for sorting
    const tableData = teams.map(team => {
        const factoriesUSA = team.manufacturing.usa.factories || 12;
        const factoriesAsia = team.manufacturing.asia.factories || 0;
        const totalFactories = factoriesUSA + factoriesAsia;

        const inHouseUSA = Object.values(team.manufacturing.usa.inHouse).reduce((a, b) => a + b, 0);
        const inHouseAsia = Object.values(team.manufacturing.asia.inHouse).reduce((a, b) => a + b, 0);
        const totalProduction = inHouseUSA + inHouseAsia;

        const contractUSA = Object.values(team.manufacturing.usa.contract).reduce((a, b) => a + b, 0);
        const contractAsia = Object.values(team.manufacturing.asia.contract).reduce((a, b) => a + b, 0);
        const totalOutsourcing = contractUSA + contractAsia;

        const tax = team.financials.incomeStatement.global.incomeTax || 0;
        const pbt = team.financials.incomeStatement.global.profitBeforeTax || 0;
        const taxRate = pbt > 0 ? (tax / pbt) * 100 : 0;

        const logistics = team.financials.incomeStatement.global.transportationAndTariffs || 0;
        const rnd = team.financials.incomeStatement.global["R&D"] || 0;

        return {
            team,
            name: team.name,
            factoriesUSA,
            factoriesAsia,
            totalFactories,
            totalProduction,
            totalOutsourcing,
            taxRate,
            logistics,
            rnd
        };
    });

    // Sort data
    const sortedData = [...tableData].sort((a, b) => {
        const modifier = sortDirection === 'asc' ? 1 : -1;
        switch (sortKey) {
            case 'factories': return (a.totalFactories - b.totalFactories) * modifier;
            case 'production': return (a.totalProduction - b.totalProduction) * modifier;
            case 'outsourcing': return (a.totalOutsourcing - b.totalOutsourcing) * modifier;
            case 'tax': return (a.taxRate - b.taxRate) * modifier;
            case 'logistics': return (a.logistics - b.logistics) * modifier;
            case 'rnd': return (a.rnd - b.rnd) * modifier;
            default: return 0;
        }
    });

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-2 mb-4">
                <h3 className="text-2xl font-bold text-gray-900">Strategic Hidden Insights</h3>
                <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
                    All Teams
                </span>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-base text-left">
                        <thead className="text-sm text-gray-500 uppercase bg-gray-50">
                            <tr>
                                <th className="px-6 py-4">Team</th>
                                <th
                                    className="px-6 py-4 text-right cursor-pointer hover:bg-gray-100 transition-colors select-none"
                                    onClick={() => handleSort('factories')}
                                >
                                    <div className="flex items-center justify-end gap-1">
                                        <Factory className="w-4 h-4" /> Factories <SortIcon column="factories" />
                                    </div>
                                </th>
                                <th
                                    className="px-6 py-4 text-right cursor-pointer hover:bg-gray-100 transition-colors select-none"
                                    onClick={() => handleSort('production')}
                                >
                                    <div className="flex items-center justify-end gap-1">
                                        <Hammer className="w-4 h-4" /> Production <SortIcon column="production" />
                                    </div>
                                </th>
                                <th
                                    className="px-6 py-4 text-right cursor-pointer hover:bg-gray-100 transition-colors select-none"
                                    onClick={() => handleSort('outsourcing')}
                                >
                                    <div className="flex items-center justify-end gap-1">
                                        <Handshake className="w-4 h-4" /> Outsourcing <SortIcon column="outsourcing" />
                                    </div>
                                </th>
                                <th
                                    className="px-6 py-4 text-right cursor-pointer hover:bg-gray-100 transition-colors select-none"
                                    onClick={() => handleSort('tax')}
                                >
                                    <div className="flex items-center justify-end gap-1">
                                        <Scale className="w-4 h-4" /> Tax Rate <SortIcon column="tax" />
                                    </div>
                                </th>
                                <th
                                    className="px-6 py-4 text-right cursor-pointer hover:bg-gray-100 transition-colors select-none"
                                    onClick={() => handleSort('logistics')}
                                >
                                    <div className="flex items-center justify-end gap-1">
                                        <Truck className="w-4 h-4" /> Logistics <SortIcon column="logistics" />
                                    </div>
                                </th>
                                <th
                                    className="px-6 py-4 text-right cursor-pointer hover:bg-gray-100 transition-colors select-none"
                                    onClick={() => handleSort('rnd')}
                                >
                                    <div className="flex items-center justify-end gap-1">
                                        <Lightbulb className="w-4 h-4" /> R&D Spend <SortIcon column="rnd" />
                                    </div>
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {sortedData.map((row) => {
                                const isMomentum = row.name === 'Momentum';

                                return (
                                    <tr key={row.name} className={clsx("hover:bg-gray-50", isMomentum ? "bg-blue-50/30" : "")}>
                                        <td className={clsx("px-6 py-4 font-medium", isMomentum ? "text-blue-700 font-bold" : "text-gray-900")}>
                                            {row.name}
                                        </td>
                                        <td className="px-6 py-4 text-right text-gray-700">
                                            <span className="font-bold">{row.totalFactories}</span>
                                            <span className="text-gray-400 text-xs ml-1">
                                                ({row.factoriesUSA} US / {row.factoriesAsia} Asia)
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right text-gray-600">
                                            {(row.totalProduction / 1000).toFixed(1)}k
                                        </td>
                                        <td className="px-6 py-4 text-right text-gray-600">
                                            {(row.totalOutsourcing / 1000).toFixed(1)}k
                                        </td>
                                        <td className={clsx("px-6 py-4 text-right font-medium", row.taxRate < 20 ? "text-green-600" : "text-gray-600")}>
                                            {row.taxRate.toFixed(1)}%
                                        </td>
                                        <td className="px-6 py-4 text-right text-gray-600">
                                            ${(row.logistics / 1000).toFixed(0)}k
                                        </td>
                                        <td className="px-6 py-4 text-right text-gray-600">
                                            ${(row.rnd / 1000).toFixed(0)}k
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
