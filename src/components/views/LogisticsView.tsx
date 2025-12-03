import React, { useState } from 'react';
import { TeamData } from '@/lib/types';
import { DataTable } from '../DataTable';
import { clsx } from 'clsx';

interface LogisticsViewProps {
    teams: TeamData[];
}

type Region = 'USA' | 'Asia' | 'Europe';

export function LogisticsView({ teams }: LogisticsViewProps) {
    const [activeRegion, setActiveRegion] = useState<Region>('USA');
    const [activeTech, setActiveTech] = useState<string>('All');
    const regions: Region[] = ['USA', 'Asia', 'Europe'];
    const techs = ['All', 'Tech 1', 'Tech 2', 'Tech 3', 'Tech 4'];

    // Flatten the logistics data for the table
    const getLogisticsData = (team: TeamData) => {
        const regionData = team.logistics[activeRegion.toLowerCase() as 'usa' | 'asia' | 'europe'];
        const flattened: Record<string, number> = {};

        if (!regionData) return {};

        Object.entries(regionData).forEach(([tech, data]) => {
            if (activeTech !== 'All' && tech !== activeTech) return;

            flattened[`${tech} - In-house`] = data.inHouse;
            flattened[`${tech} - Contract`] = data.contract;
            flattened[`${tech} - Imported`] = data.imported;
            flattened[`${tech} - Total Supply`] = data.total;
            flattened[`${tech} - Sales`] = data.sales;
            flattened[`${tech} - Unsold/Inventory`] = data.total - data.sales;
        });

        return flattened;
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                    <span className="text-base font-medium text-gray-500">Region:</span>
                    <div className="flex p-1 bg-gray-100 rounded-lg w-fit">
                        {regions.map(r => (
                            <button
                                key={r}
                                onClick={() => setActiveRegion(r)}
                                className={clsx(
                                    "px-4 py-2 text-base font-medium rounded-md transition-all",
                                    activeRegion === r
                                        ? "bg-white text-gray-900 shadow-sm"
                                        : "text-gray-500 hover:text-gray-700"
                                )}
                            >
                                {r}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <span className="text-base font-medium text-gray-500">Tech:</span>
                    <select
                        value={activeTech}
                        onChange={(e) => setActiveTech(e.target.value)}
                        className="bg-white border border-gray-200 text-gray-700 text-base rounded-lg focus:ring-red-500 focus:border-red-500 block p-2.5"
                    >
                        {techs.map(t => (
                            <option key={t} value={t}>{t}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 text-base text-blue-800">
                <p className="font-semibold mb-1">How to read this table:</p>
                <p>This shows the supply chain flow for each technology in the selected region.
                    <strong> Total Supply</strong> is the sum of In-house, Contract, and Imported products.
                    <strong> Unsold/Inventory</strong> is the difference between Total Supply and Sales.
                </p>
            </div>

            <DataTable
                title={`Logistics Flow - ${activeRegion}`}
                teams={teams}
                dataExtractor={getLogisticsData}
                formatValue={(val) => val.toLocaleString()}
            />
        </div>
    );
}
