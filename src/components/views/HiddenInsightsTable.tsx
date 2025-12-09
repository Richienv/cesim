import React from 'react';
import { clsx } from 'clsx';
import { TeamData } from '@/lib/types';
import { Factory, Truck, Scale, Lightbulb, Hammer, Handshake } from 'lucide-react';

interface HiddenInsightsTableProps {
    teams: TeamData[];
}

export function HiddenInsightsTable({ teams }: HiddenInsightsTableProps) {
    // 1. Identify Momentum
    const momentum = teams.find(t => t.name === 'Momentum');

    if (!momentum) return null;

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
                                <th className="px-6 py-4 text-right">
                                    <div className="flex items-center justify-end gap-1">
                                        <Factory className="w-4 h-4" /> Factories
                                    </div>
                                </th>
                                <th className="px-6 py-4 text-right">
                                    <div className="flex items-center justify-end gap-1">
                                        <Hammer className="w-4 h-4" /> Production
                                    </div>
                                </th>
                                <th className="px-6 py-4 text-right">
                                    <div className="flex items-center justify-end gap-1">
                                        <Handshake className="w-4 h-4" /> Outsourcing
                                    </div>
                                </th>
                                <th className="px-6 py-4 text-right">
                                    <div className="flex items-center justify-end gap-1">
                                        <Scale className="w-4 h-4" /> Tax Rate
                                    </div>
                                </th>
                                <th className="px-6 py-4 text-right">
                                    <div className="flex items-center justify-end gap-1">
                                        <Truck className="w-4 h-4" /> Logistics
                                    </div>
                                </th>
                                <th className="px-6 py-4 text-right">
                                    <div className="flex items-center justify-end gap-1">
                                        <Lightbulb className="w-4 h-4" /> R&D Spend
                                    </div>
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {teams.map((team) => {
                                const isMomentum = team.name === 'Momentum';

                                // Metrics Extraction
                                const factoriesUSA = team.manufacturing.usa.factories || 0;
                                const factoriesAsia = team.manufacturing.asia.factories || 0;
                                const totalFactories = factoriesUSA + factoriesAsia;

                                // Production (In-House) - Summing Tech 1-4 for USA & Asia
                                const inHouseUSA = Object.values(team.manufacturing.usa.inHouse).reduce((a, b) => a + b, 0);
                                const inHouseAsia = Object.values(team.manufacturing.asia.inHouse).reduce((a, b) => a + b, 0);
                                const totalProduction = inHouseUSA + inHouseAsia;

                                // Outsourcing (Contract) - Summing Tech 1-4 for USA & Asia
                                const contractUSA = Object.values(team.manufacturing.usa.contract).reduce((a, b) => a + b, 0);
                                const contractAsia = Object.values(team.manufacturing.asia.contract).reduce((a, b) => a + b, 0);
                                const totalOutsourcing = contractUSA + contractAsia;

                                const tax = team.financials.incomeStatement.global.incomeTax || 0;
                                const pbt = team.financials.incomeStatement.global.profitBeforeTax || 0;
                                const taxRate = pbt > 0 ? (tax / pbt) * 100 : 0;

                                const logistics = team.financials.incomeStatement.global.transportationAndTariffs || 0;
                                const rnd = team.financials.incomeStatement.global["R&D"] || 0;

                                return (
                                    <tr key={team.name} className={clsx("hover:bg-gray-50", isMomentum ? "bg-blue-50/30" : "")}>
                                        <td className={clsx("px-6 py-4 font-medium", isMomentum ? "text-blue-700 font-bold" : "text-gray-900")}>
                                            {team.name}
                                        </td>
                                        <td className="px-6 py-4 text-right text-gray-700">
                                            <span className="font-bold">{totalFactories}</span>
                                            <span className="text-gray-400 text-xs ml-1">
                                                ({factoriesUSA} US / {factoriesAsia} Asia)
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right text-gray-600">
                                            {(totalProduction / 1000).toFixed(1)}k
                                        </td>
                                        <td className="px-6 py-4 text-right text-gray-600">
                                            {(totalOutsourcing / 1000).toFixed(1)}k
                                        </td>
                                        <td className={clsx("px-6 py-4 text-right font-medium", taxRate < 20 ? "text-green-600" : "text-gray-600")}>
                                            {taxRate.toFixed(1)}%
                                        </td>
                                        <td className="px-6 py-4 text-right text-gray-600">
                                            ${(logistics / 1000).toFixed(0)}k
                                        </td>
                                        <td className="px-6 py-4 text-right text-gray-600">
                                            ${(rnd / 1000).toFixed(0)}k
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
