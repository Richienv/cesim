
import fs from 'fs';
import path from 'path';
import { parseCesimData } from '../lib/parser';
import { TeamData } from '../lib/types';

const dataDir = path.join(process.cwd(), 'public', 'data');
const files = [
    'results-pr01 (2).xls',
    'results-pr02 (2).xls',
    'results-pr03.xls'
];

async function analyze() {
    console.log("Starting Analysis...");

    const rounds = files.map(file => {
        const filePath = path.join(dataDir, file);
        if (!fs.existsSync(filePath)) {
            console.error(`File not found: ${filePath}`);
            return null;
        }
        const buffer = fs.readFileSync(filePath);
        // Convert Buffer to ArrayBuffer
        const arrayBuffer = buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);
        return parseCesimData(arrayBuffer);
    }).filter(r => r !== null);

    if (rounds.length === 0) {
        console.log("No data found.");
        return;
    }

    // 1. Market Growth Analysis (Global Demand per Tech)
    console.log("\n--- Market Growth (Global Demand) ---");
    const techs = ['Tech 1', 'Tech 2', 'Tech 3', 'Tech 4'];

    techs.forEach(tech => {
        console.log(`\n${tech}:`);
        rounds.forEach((round, idx) => {
            if (!round) return;
            // Sum demand across all teams (approximate market size if we assume demand is total market demand)
            // Actually, demand is usually per team. Let's look at the "Market report" section if available or sum up team demands.
            // In the parser, we extract `team.demand`.
            // Let's sum up the demand for all teams to get total market demand.

            let totalDemand = 0;
            round.teams.forEach(t => {
                ['usa', 'asia', 'europe'].forEach(r => {
                    const d = t.demand[r as 'usa' | 'asia' | 'europe']?.[tech] || 0;
                    totalDemand += d;
                });
            });

            // If totalDemand is 0, maybe we need to use sales + unsatisfied?
            // But let's check if we parsed demand correctly.
            console.log(`  Round ${idx + 1}: ${totalDemand.toFixed(0)}`);
        });
    });

    // 2. Winning Team Analysis
    console.log("\n--- Winning Team Analysis (By Cumulative Profit) ---");
    rounds.forEach((round, idx) => {
        if (!round) return;
        console.log(`\nRound ${idx + 1} Leaders:`);
        const sortedTeams = [...round.teams].sort((a, b) => {
            const profitA = a.financials.incomeStatement.global["Profit for the round"] || 0;
            const profitB = b.financials.incomeStatement.global["Profit for the round"] || 0;
            return profitB - profitA;
        });

        sortedTeams.slice(0, 3).forEach((t, i) => {
            const profit = t.financials.incomeStatement.global["Profit for the round"] || 0;
            const revenue = t.financials.incomeStatement.global["Sales revenue"] || 0;
            const share = Object.values(t.marketShare.global).reduce((a, b) => a + b, 0) / 4; // Avg share
            console.log(`  #${i + 1} ${t.name}: Profit $${(profit / 1000).toFixed(1)}k | Rev $${(revenue / 1000).toFixed(1)}k | Share ${share.toFixed(1)}%`);
        });
    });

    // 3. Price Trends
    console.log("\n--- Price Trends (Global Avg) ---");
    techs.forEach(tech => {
        console.log(`\n${tech}:`);
        rounds.forEach((round, idx) => {
            if (!round) return;
            let totalPrice = 0;
            let count = 0;
            round.teams.forEach(t => {
                ['usa', 'asia', 'europe'].forEach(r => {
                    const p = t.prices[r as 'usa' | 'asia' | 'europe']?.[tech] || 0;
                    if (p > 0) {
                        totalPrice += p;
                        count++;
                    }
                });
            });
            const avg = count > 0 ? totalPrice / count : 0;
            console.log(`  Round ${idx + 1}: $${avg.toFixed(0)}`);
        });
    });
}

analyze().catch(console.error);
