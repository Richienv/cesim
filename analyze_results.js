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

    // 1. Get Team Names from Row 4 (Index 4)
    const teamRowIndex = 4;
    const teamRow = data[teamRowIndex];
    const teams = [];
    if (teamRow) {
        for (let i = 1; i < teamRow.length; i++) {
            if (teamRow[i]) {
                teams.push({ name: teamRow[i], index: i, data: {} });
            }
        }
    }
    console.log("Teams found:", teams.map(t => t.name).join(", "));

    // 2. Scan rows for metrics with state tracking
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
        else if (label.includes('Manufacturing details')) { currentSection = 'Manufacturing'; }

        // Detect Tech (only within Market Report for now to avoid confusion)
        if (currentSection === 'MarketReport') {
            if (label === 'Tech 1') currentTech = 'Tech 1';
            if (label === 'Tech 2') currentTech = 'Tech 2';
            if (label === 'Tech 3') currentTech = 'Tech 3';
            if (label === 'Tech 4') currentTech = 'Tech 4';
        }

        // Extract Data

        // Global Metrics
        if (label.includes('Cumulative total shareholder return') || label.includes('Shareholder return')) {
            teams.forEach(team => team.data.tsr = row[team.index]);
        }
        if (label.includes('Round profit')) {
            teams.forEach(team => team.data.profit = row[team.index]);
        }
        if (label.includes('Sales revenue') && !currentSection) {
            teams.forEach(team => team.data.revenue = row[team.index]);
        }
        if (label.includes('R&D') && !currentSection) {
            teams.forEach(team => team.data.rnd = row[team.index]);
        }

        // Market Specific Metrics
        if (currentSection === 'MarketReport') {
            if (label.includes('Selling price') || label.includes('Selling Price')) {
                teams.forEach(team => {
                    if (!team.data.prices) team.data.prices = {};
                    const key = `${currentMarket}_${currentTech}`;
                    team.data.prices[key] = row[team.index];
                });
            }
        }

        if (currentSection === 'IncomeStatement') {
            if (label.includes('Promotion')) {
                teams.forEach(team => {
                    if (!team.data.promotion) team.data.promotion = {};
                    team.data.promotion[currentMarket] = row[team.index];
                });
            }
        }

        // Manufacturing
        if (currentSection === 'Manufacturing') {
            if (label.includes('Number of plants') && label.includes('Next round')) {
                // This might need more specific parsing as "Next round" is a sub-header
                // Let's look for "USA" and "Asia" under "Number of plants" -> "Next round"
                // Actually, let's just grab "Capacity usage" for now as a proxy for aggression
            }
            if (label.includes('Capacity usage')) {
                teams.forEach(team => {
                    if (!team.data.capacity) team.data.capacity = {};
                    team.data.capacity[`${currentMarket || 'Global'}_${currentTech || 'Total'}`] = row[team.index];
                });
            }
        }

        // Finance (Global Balance Sheet / Cash Flow)
        if (label.includes('Dividends') && !label.includes('received')) {
            teams.forEach(team => team.data.dividends = row[team.index]);
        }
        if (label.includes('Long-term debts')) {
            teams.forEach(team => team.data.debt = row[team.index]);
        }
        if (label.includes('Share capital')) {
            teams.forEach(team => team.data.equity = row[team.index]);
        }
    });

    // 3. Find Winner
    let winner = teams.reduce((prev, current) => {
        const prevScore = prev.data.tsr || prev.data.profit || 0;
        const currScore = current.data.tsr || current.data.profit || 0;
        return (currScore > prevScore) ? current : prev;
    });

    console.log(`WINNER: ${winner.name} (Score: ${winner.data.tsr || winner.data.profit})`);

    // Explicitly print Pink's data
    const pink = teams.find(t => t.name === 'Pink');
    if (pink) {
        console.log("PINK Strategy:");
        console.log("Global Revenue:", pink.data.revenue);
        console.log("Global R&D:", pink.data.rnd);
        console.log("Dividends:", pink.data.dividends);
        console.log("Debt:", pink.data.debt);
        console.log("Equity:", pink.data.equity);
        console.log("Prices:", JSON.stringify(pink.data.prices, null, 2));
        console.log("Promotion:", JSON.stringify(pink.data.promotion, null, 2));
        console.log("Capacity Usage:", JSON.stringify(pink.data.capacity, null, 2));
    }

    // Dump labels to file for inspection
    // fs.writeFileSync('row_labels.txt', rowLabels.join('\n')); // This line was removed as rowLabels is no longer collected
}

files.forEach(file => {
    try {
        analyzeFile(file);
    } catch (e) {
        console.error(`Error analyzing ${file}:`, e.message);
    }
});
