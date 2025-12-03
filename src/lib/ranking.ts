import { TeamData } from './types';

export interface TeamRank {
    teamName: string;
    totalScore: number;
    rank: number;
    metrics: {
        tsr: number;
        roe: number;
        netProfit: number;
        eps: number;
        marketShare: number;
        salesGrowth: number;
    };
    metricRanks: {
        tsr: number;
        roe: number;
        netProfit: number;
        eps: number;
        marketShare: number;
        salesGrowth: number;
    };
}

export const calculateRankings = (teams: TeamData[]): TeamRank[] => {
    if (teams.length === 0) return [];

    // Helper to get metric value safely
    const getMetric = (team: TeamData, category: string, key: string): number => {
        // Try to find in legacy metrics first
        if (team.metrics[category] && team.metrics[category][key] !== undefined) {
            return team.metrics[category][key];
        }

        // Fallback to specific locations
        if (key === "Cumulative total shareholder return (p.a.), %") return team.financials.ratios["Cumulative total shareholder return (p.a.), %"] || 0;
        if (key === "Return on equity (ROE)") return team.financials.ratios["Return on equity (ROE)"] || 0;
        if (key === "Profit for the round") return team.financials.incomeStatement.global["Profit for the round"] || 0;
        if (key === "Earnings per share (EPS), USD") return team.financials.ratios["Earnings per share (EPS), USD"] || 0;
        if (key === "Global market shares, %") return team.market.global["Global market shares, %"] || 0;
        if (key === "Sales revenue") return team.financials.incomeStatement.global["Sales revenue"] || 0; // Proxy for growth if growth not explicit

        return 0;
    };

    // 1. Extract raw values
    const rawData = teams.map(team => ({
        name: team.name,
        tsr: getMetric(team, "Financials", "Cumulative total shareholder return (p.a.), %"),
        roe: getMetric(team, "Financials", "Return on equity (ROE)"),
        netProfit: getMetric(team, "Financials", "Profit for the round"),
        eps: getMetric(team, "Financials", "Earnings per share (EPS), USD"),
        marketShare: getMetric(team, "Market", "Global market shares, %"),
        salesGrowth: getMetric(team, "Financials", "Sales revenue") // Using Revenue as proxy for now, ideally calculate growth
    }));

    // 2. Rank each metric (Higher is better)
    const rankMetric = (key: keyof typeof rawData[0]) => {
        const sorted = [...rawData].sort((a, b) => (b[key] as number) - (a[key] as number));
        return rawData.map(team => {
            const rank = sorted.findIndex(t => t.name === team.name) + 1;
            // Points: Rank 1 = N, Rank N = 1
            const points = teams.length - rank + 1;
            return { name: team.name, rank, points };
        });
    };

    const tsrRanks = rankMetric('tsr');
    const roeRanks = rankMetric('roe');
    const netProfitRanks = rankMetric('netProfit');
    const epsRanks = rankMetric('eps');
    const marketShareRanks = rankMetric('marketShare');
    const salesGrowthRanks = rankMetric('salesGrowth');

    // 3. Calculate Weighted Score
    const rankings: TeamRank[] = rawData.map(team => {
        const getPoints = (ranks: { name: string, points: number }[]) => ranks.find(r => r.name === team.name)?.points || 0;
        const getRank = (ranks: { name: string, rank: number }[]) => ranks.find(r => r.name === team.name)?.rank || 0;

        const tsrPoints = getPoints(tsrRanks);
        const roePoints = getPoints(roeRanks);
        const netProfitPoints = getPoints(netProfitRanks);
        const epsPoints = getPoints(epsRanks);
        const marketSharePoints = getPoints(marketShareRanks);
        const salesGrowthPoints = getPoints(salesGrowthRanks);

        // Weights: TSR = 3x, Others = 1x
        const totalScore = (tsrPoints * 3) + roePoints + netProfitPoints + epsPoints + marketSharePoints + salesGrowthPoints;

        return {
            teamName: team.name,
            totalScore,
            rank: 0, // Assigned later
            metrics: {
                tsr: team.tsr,
                roe: team.roe,
                netProfit: team.netProfit,
                eps: team.eps,
                marketShare: team.marketShare,
                salesGrowth: team.salesGrowth
            },
            metricRanks: {
                tsr: getRank(tsrRanks),
                roe: getRank(roeRanks),
                netProfit: getRank(netProfitRanks),
                eps: getRank(epsRanks),
                marketShare: getRank(marketShareRanks),
                salesGrowth: getRank(salesGrowthRanks)
            }
        };
    });

    // 4. Sort by Total Score
    rankings.sort((a, b) => b.totalScore - a.totalScore);

    // 5. Assign Final Rank
    rankings.forEach((r, i) => r.rank = i + 1);

    return rankings;
};
