import React, { useState } from 'react';
import { TeamData } from '@/lib/types';
import { DataTable } from '../DataTable';
import { clsx } from 'clsx';

interface FinancialsViewProps {
    teams: TeamData[];
}

type Tab = 'Income Statement' | 'Balance Sheet' | 'Cash Flow' | 'Ratios';
type Region = 'Global' | 'USA' | 'Asia' | 'Europe';

export function FinancialsView({ teams }: FinancialsViewProps) {
    const [activeTab, setActiveTab] = useState<Tab>('Income Statement');
    const [activeRegion, setActiveRegion] = useState<Region>('Global');

    const tabs: Tab[] = ['Income Statement', 'Balance Sheet', 'Cash Flow', 'Ratios'];
    const regions: Region[] = ['Global', 'USA', 'Asia', 'Europe'];

    const getData = (team: TeamData) => {
        switch (activeTab) {
            case 'Income Statement':
                return team.financials.incomeStatement[activeRegion.toLowerCase() as 'global' | 'usa' | 'asia' | 'europe'] || {};
            case 'Balance Sheet':
                return team.financials.balanceSheet[activeRegion.toLowerCase() as 'global' | 'usa' | 'asia' | 'europe'] || {};
            case 'Cash Flow':
                return team.financials.cashFlow[activeRegion.toLowerCase() as 'global' | 'usa' | 'asia' | 'europe'] || {};
            case 'Ratios':
                return team.financials.ratios;
            default:
                return {};
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                {/* Tabs */}
                <div className="flex p-1 bg-gray-100 rounded-lg w-fit overflow-x-auto">
                    {tabs.map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={clsx(
                                "px-4 py-2 text-base font-medium rounded-md transition-all whitespace-nowrap",
                                activeTab === tab
                                    ? "bg-white text-gray-900 shadow-sm"
                                    : "text-gray-500 hover:text-gray-700"
                            )}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {/* Region Selector */}
                {(activeTab === 'Income Statement' || activeTab === 'Balance Sheet' || activeTab === 'Cash Flow') && (
                    <div className="flex items-center gap-2">
                        <span className="text-base font-medium text-gray-500">Region:</span>
                        <select
                            value={activeRegion}
                            onChange={(e) => setActiveRegion(e.target.value as Region)}
                            className="bg-white border border-gray-200 text-gray-700 text-base rounded-lg focus:ring-red-500 focus:border-red-500 block p-2.5"
                        >
                            {regions.map(r => (
                                <option key={r} value={r}>{r}</option>
                            ))}
                        </select>
                    </div>
                )}
            </div>

            <DataTable
                title={`${activeTab} - ${activeRegion}`}
                teams={teams}
                dataExtractor={getData}
                formatValue={(val) => val.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            />
        </div>
    );
}
