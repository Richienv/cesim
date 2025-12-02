const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

const files = [
    'public/data/results-pr01 (2).xls',
    'public/data/results-pr02 (2).xls',
    'public/data/results-pr03.xls'
];

function analyzeFile(filePath) {
    console.log(`\n--- Analyzing ${filePath} ---`);
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });

    // 1. Get Team Names
    const teamRowIndex = 4;
    const teamRow = data[teamRowIndex];
    const teams = [];
    if (teamRow) {
        for (let i = 1; i < teamRow.length; i++) {
            if (teamRow[i]) {
                teams.push({ name: teamRow[i], index: i, data: { prices: {}, promotion: {}, rnd: 0, revenue: 0, profit: 0 } });
            }
        }
    }

    // 2. Scan rows
    let currentSection = '';
    let currentMarket = '';
    let currentTech = '';

    data.forEach((row, rowIndex) => {
        if (!row || row.length === 0) return;
        const label = String(row[0]).trim();

        // Detect Sections
        if (label.includes('Market report, USA')) { currentSection = 'MarketReport'; currentMarket = 'USA'; }
        else if (label.includes('Market report, Asia')) { currentSection = 'MarketReport'; currentMarket = 'Asia'; }
        else if (label.includes('Market report, Europe')) { currentSection = 'MarketReport'; currentMarket = 'Europe'; }
        else if (label.includes('Income statement, k USD, USA')) { currentSection = 'IncomeStatement'; currentMarket = 'USA'; }
        else if (label.includes('Income statement, k USD, Asia')) { currentSection = 'IncomeStatement'; currentMarket = 'Asia'; }
        else if (label.includes('Income statement, k USD, Europe')) { currentSection = 'IncomeStatement'; currentMarket = 'Europe'; }

        // Detect Tech
        if (currentSection === 'MarketReport') {
            if (label === 'Tech 1') currentTech = 'Tech 1';
            if (label === 'Tech 2') currentTech = 'Tech 2';
            if (label === 'Tech 3') currentTech = 'Tech 3';
            if (label === 'Tech 4') currentTech = 'Tech 4';
        }

        // Extract Data
        if (label.includes('Round profit')) {
            teams.forEach(team => team.data.profit = parseFloat(row[team.index]) || 0);
        }
        if (label.includes('Sales revenue') && !currentSection) {
            teams.forEach(team => team.data.revenue = parseFloat(row[team.index]) || 0);
        }
        if (label.includes('R&D') && !currentSection) {
            teams.forEach(team => team.data.rnd = parseFloat(row[team.index]) || 0);
        }

        if (currentSection === 'MarketReport') {
            if (label.includes('Selling price') || label.includes('Selling Price')) {
                teams.forEach(team => {
                    const key = `${currentMarket}_${currentTech}`;
                    team.data.prices[key] = parseFloat(row[team.index]) || 0;
                });
            }
        }

        if (currentSection === 'IncomeStatement') {
            if (label.includes('Promotion')) {
                teams.forEach(team => {
                    team.data.promotion[currentMarket] = parseFloat(row[team.index]) || 0;
                });
            }
        }
    });

    // 3. Analyze Market Dynamics
    console.log("MARKET DYNAMICS:");

    // R&D Analysis
    const avgRnD = teams.reduce((sum, t) => sum + t.data.rnd, 0) / teams.length;
    const maxRnD = Math.max(...teams.map(t => t.data.rnd));
    console.log(`Average R&D: $${avgRnD.toFixed(0)}k | Max R&D: $${maxRnD.toFixed(0)}k`);

    // Price Analysis
    const markets = ['USA', 'Asia', 'Europe'];
    const techs = ['Tech 1', 'Tech 2', 'Tech 3', 'Tech 4'];

    markets.forEach(market => {
        techs.forEach(tech => {
            const key = `${market}_${tech}`;
            const prices = teams.map(t => t.data.prices[key]).filter(p => p > 0);
            if (prices.length > 0) {
                const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length;
                const minPrice = Math.min(...prices);
                const maxPrice = Math.max(...prices);
                console.log(`${key} Price: Avg ${avgPrice.toFixed(0)} | Min ${minPrice} | Max ${maxPrice} | Spread: ${maxPrice - minPrice}`);
            }
        });
    });

    // Promotion Analysis
    markets.forEach(market => {
        const promos = teams.map(t => t.data.promotion[market]).filter(p => p > 0);
        if (promos.length > 0) {
            const avgPromo = promos.reduce((a, b) => a + b, 0) / promos.length;
            console.log(`${market} Avg Promotion: $${avgPromo.toFixed(0)}k`);
        }
    });

    // Loser Analysis (Bottom 3 Teams)
    const sortedTeams = [...teams].sort((a, b) => b.data.profit - a.data.profit);
    const losers = sortedTeams.slice(-3);
    console.log("\nBOTTOM 3 TEAMS (What NOT to do):");
    losers.forEach(loser => {
        console.log(`- ${loser.name} (Profit: ${loser.data.profit}): R&D ${loser.data.rnd} | USA T1 Price: ${loser.data.prices['USA_Tech 1']}`);
    });
}

files.forEach(file => {
    try {
        analyzeFile(file);
    } catch (e) {
        console.error(`Error analyzing ${file}:`, e.message);
    }
});
