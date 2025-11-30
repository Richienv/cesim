import React, { useState } from 'react';
import { TeamData } from '@/lib/types';
import { DataTable } from '../DataTable';
import { clsx } from 'clsx';

interface MarginsViewProps {
    teams: TeamData[];
}

type Region = 'USA' | 'Asia' | 'Europe';

export function MarginsView({ teams }: MarginsViewProps) {
    const [activeRegion, setActiveRegion] = useState<Region>('USA');
    const [activeTech, setActiveTech] = useState<string>('All');
    const regions: Region[] = ['USA', 'Asia', 'Europe'];
    const techs = ['All', 'Tech 1', 'Tech 2', 'Tech 3', 'Tech 4'];

    const getMarginData = (team: TeamData) => {
        const regionData = team.margins[activeRegion.toLowerCase() as 'usa' | 'asia' | 'europe'];
        const flattened: Record<string, number> = {};

        if (!regionData) return {};

        Object.entries(regionData).forEach(([tech, data]) => {
            if (activeTech !== 'All' && tech !== activeTech) return;

            flattened[`${tech} - Sales Revenue`] = data.sales;
            flattened[`${tech} - Variable Costs`] = data.variableCosts;
            flattened[`${tech} - Gross Profit`] = data.grossProfit;
            flattened[`${tech} - Margin %`] = data.margin;
        });

        return flattened;
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-500">Region:</span>
                    <div className="flex p-1 bg-gray-100 rounded-lg w-fit">
                        {regions.map(r => (
                            <button
                                key={r}
                                onClick={() => setActiveRegion(r)}
                                className={clsx(
                                    "px-4 py-2 text-sm font-medium rounded-md transition-all",
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
                    <span className="text-sm font-medium text-gray-500">Tech:</span>
                    <select
                        value={activeTech}
                        onChange={(e) => setActiveTech(e.target.value)}
                        className="bg-white border border-gray-200 text-gray-700 text-sm rounded-lg focus:ring-red-500 focus:border-red-500 block p-2.5"
                    >
                        {techs.map(t => (
                            <option key={t} value={t}>{t}</option>
                        ))}
                    </select>
                </div>
            </div>

            <DataTable
                title={`Margin Breakdown - ${activeRegion}`}
                teams={teams}
                dataExtractor={getMarginData}
                formatValue={(val, key) => key.includes('%') ? `${val.toFixed(2)}%` : val.toLocaleString()}
            />
        </div>
    );
}
