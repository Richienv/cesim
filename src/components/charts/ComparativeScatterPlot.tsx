'use client';

import React from 'react';
import {
    ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LabelList, ReferenceLine, Legend
} from 'recharts';

export interface ScatterPoint {
    name: string;
    x: number;
    y: number;
    z?: number; // Size or other dimension
    fill?: string;
}

interface ComparativeScatterPlotProps {
    title: string;
    data: ScatterPoint[];
    xLabel: string;
    yLabel: string;
    xFormatter?: (val: number) => string;
    yFormatter?: (val: number) => string;
    highlightTeam?: string;
    focusedTeam?: string | null;
    onTeamClick?: (team: string) => void;
}

export function ComparativeScatterPlot({
    title,
    data,
    xLabel,
    yLabel,
    xFormatter = (val) => val.toString(),
    yFormatter = (val) => val.toString(),
    highlightTeam,
    focusedTeam,
    onTeamClick
}: ComparativeScatterPlotProps) {

    // Calculate domain padding for better visualization
    const xValues = data.map(d => d.x);
    const yValues = data.map(d => d.y);
    const minX = Math.min(...xValues);
    const maxX = Math.max(...xValues);
    const minY = Math.min(...yValues);
    const maxY = Math.max(...yValues);

    const xPadding = (maxX - minX) * 0.1 || (minX * 0.1);
    const yPadding = (maxY - minY) * 0.1 || (minY * 0.1);

    // Filter out invalid data points (NaN, Infinity) just in case
    const validData = data.filter(d => !isNaN(d.x) && !isNaN(d.y) && isFinite(d.x) && isFinite(d.y));

    if (validData.length === 0) {
        return (
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center justify-center h-[300px]">
                <p className="text-gray-400">No data available for {title}</p>
            </div>
        );
    }

    // Extract unique teams and colors for the legend
    const teams = Array.from(new Set(validData.map(d => d.name)));
    // If specific colors are passed in data.fill, track them. Otherwise, we might need a default map.
    // However, the parent component is likely setting 'fill'.
    const legendItems = teams.map(team => {
        const entry = validData.find(d => d.name === team);
        return { name: team, color: entry?.fill || '#94a3b8' };
    });

    const handleTeamClick = (team: string) => {
        if (onTeamClick) {
            onTeamClick(team);
        }
    };

    return (
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 transition-all hover:shadow-md flex flex-col h-full">
            <h4 className="text-sm font-bold text-gray-700 mb-2 text-center uppercase tracking-wide">{title}</h4>
            <div className="flex-1 min-h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                        <XAxis
                            type="number"
                            dataKey="x"
                            name={xLabel}
                            domain={[minX - xPadding, maxX + xPadding]}
                            tickFormatter={xFormatter}
                            tick={{ fontSize: 10, fill: '#6b7280' }}
                            stroke="#d1d5db"
                            axisLine={{ stroke: '#e5e7eb' }}
                            tickLine={false}
                        />
                        <YAxis
                            type="number"
                            dataKey="y"
                            name={yLabel}
                            domain={[minY - yPadding, maxY + yPadding]}
                            tickFormatter={yFormatter}
                            tick={{ fontSize: 10, fill: '#6b7280' }}
                            stroke="#d1d5db"
                            axisLine={{ stroke: '#e5e7eb' }}
                            tickLine={false}
                        />
                        <Tooltip
                            cursor={{ strokeDasharray: '3 3' }}
                            content={({ active, payload }) => {
                                if (active && payload && payload.length) {
                                    const data = payload[0].payload;
                                    return (
                                        <div className="bg-white p-3 border border-gray-100 shadow-xl rounded-lg z-50">
                                            <div className="flex items-center gap-2 mb-2">
                                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: data.fill }} />
                                                <p className="font-bold text-gray-900 text-sm">{data.name}</p>
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-xs text-gray-500 flex justify-between gap-4">
                                                    <span>{xLabel}:</span>
                                                    <span className="font-mono font-medium text-gray-700">{xFormatter(data.x)}</span>
                                                </p>
                                                <p className="text-xs text-gray-500 flex justify-between gap-4">
                                                    <span>{yLabel}:</span>
                                                    <span className="font-mono font-medium text-gray-700">{yFormatter(data.y)}</span>
                                                </p>
                                            </div>
                                        </div>
                                    );
                                }
                                return null;
                            }}
                        />
                        <Scatter name={title} data={validData}>
                            {validData.map((entry, index) => {
                                const isFocused = focusedTeam === entry.name;
                                const isDimmed = focusedTeam && !isFocused;
                                return (
                                    <Cell
                                        key={`cell-${index}`}
                                        fill={entry.fill || '#94a3b8'}
                                        stroke="#fff"
                                        strokeWidth={isFocused ? 3 : 2}
                                        fillOpacity={isDimmed ? 0.15 : 1}
                                        strokeOpacity={isDimmed ? 0.15 : 1}
                                        className="transition-all duration-300 cursor-pointer hover:opacity-100"
                                        onClick={() => handleTeamClick(entry.name)}
                                    />
                                );
                            })}
                        </Scatter>
                    </ScatterChart>
                </ResponsiveContainer>
            </div>

            {/* Custom Legend */}
            <div className="mt-4 flex flex-wrap justify-center gap-x-4 gap-y-2 px-2 border-t border-gray-50 pt-3">
                {legendItems.map((item) => {
                    const isFocused = focusedTeam === item.name;
                    const isDimmed = focusedTeam && !isFocused;
                    return (
                        <div
                            key={item.name}
                            className={`flex items-center gap-1.5 cursor-pointer transition-opacity duration-300 ${isDimmed ? 'opacity-30' : 'opacity-100'}`}
                            onClick={() => handleTeamClick(item.name)}
                        >
                            <div className={`w-2.5 h-2.5 rounded-full ring-1 ring-inset ring-black/10 ${isFocused ? 'ring-2 ring-offset-1 ring-offset-white ring-gray-400' : ''}`} style={{ backgroundColor: item.color }} />
                            <span className={`text-[10px] font-medium truncate max-w-[80px] ${isFocused ? 'text-gray-900 font-bold' : 'text-gray-600'}`}>{item.name}</span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
