import React, { useState } from 'react';
import { TeamData } from '@/lib/types';
import { DataTable } from '../DataTable';
import { clsx } from 'clsx';

interface MarketViewProps {
    teams: TeamData[];
}

type Region = 'Global' | 'USA' | 'Asia' | 'Europe';

export function MarketView({ teams }: MarketViewProps) {
    const [activeRegion, setActiveRegion] = useState<Region>('Global');
    const [activeTech, setActiveTech] = useState<string>('All');
    const regions: Region[] = ['Global', 'USA', 'Asia', 'Europe'];
    const techs = ['All', 'Tech 1', 'Tech 2', 'Tech 3', 'Tech 4'];

    const getData = (team: TeamData) => {
        const data = team.market[activeRegion.toLowerCase() as 'global' | 'usa' | 'asia' | 'europe'] || {};
        if (activeTech === 'All') return data;

        const filtered: Record<string, number> = {};
        Object.entries(data).forEach(([key, val]) => {
            if (key.includes(activeTech)) {
                filtered[key] = val;
            }
        });
        return filtered;
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
                title={`Market Report - ${activeRegion}`}
                teams={teams}
                dataExtractor={getData}
                formatValue={(val) => val.toLocaleString()}
            />
        </div>
    );
}
