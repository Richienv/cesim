import React, { useState } from 'react';
import { TeamData } from '@/lib/types';
import { DataTable } from '../DataTable';
import { clsx } from 'clsx';

interface ManufacturingViewProps {
    teams: TeamData[];
}

type Region = 'USA' | 'Asia';

export function ManufacturingView({ teams }: ManufacturingViewProps) {
    const [activeRegion, setActiveRegion] = useState<Region>('USA');
    const [activeTech, setActiveTech] = useState<string>('All');
    const regions: Region[] = ['USA', 'Asia'];
    const techs = ['All', 'Tech 1', 'Tech 2', 'Tech 3', 'Tech 4'];

    const filterData = (data: Record<string, number>) => {
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

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <DataTable
                    title={`In-House Manufacturing (${activeRegion})`}
                    teams={teams}
                    dataExtractor={(t) => filterData(t.manufacturing[activeRegion.toLowerCase() as 'usa' | 'asia'].inHouse)}
                    formatValue={(val) => val.toLocaleString()}
                />
                <DataTable
                    title={`Contract Manufacturing (${activeRegion})`}
                    teams={teams}
                    dataExtractor={(t) => filterData(t.manufacturing[activeRegion.toLowerCase() as 'usa' | 'asia'].contract)}
                    formatValue={(val) => val.toLocaleString()}
                />
            </div>
        </div>
    );
}
