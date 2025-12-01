import * as XLSX from 'xlsx';
import { RoundData, TeamData, FinancialMetrics, RegionManufacturing, LogisticsData, MarginData, TechMetrics } from './types';

export const parseCesimData = (fileBuffer: ArrayBuffer): RoundData => {
    const workbook = XLSX.read(fileBuffer, { type: 'array' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];

    // Helper to find row index by keyword
    const findRowIndex = (keyword: string, startFrom = 0): number => {
        for (let i = startFrom; i < data.length; i++) {
            const cell = data[i][0];
            if (cell && String(cell).toLowerCase().includes(keyword.toLowerCase())) {
                return i;
            }
        }
        return -1;
    };

    // Find team names
    let teamRowIndex = -1;
    for (let i = 0; i < 50; i++) {
        if (data[i] && data[i].filter((c: any) => typeof c === 'string' && c.length > 0).length > 3) {
            teamRowIndex = i;
            break;
        }
    }

    if (teamRowIndex === -1) throw new Error("Could not find team names row");

    const teamNames = data[teamRowIndex].slice(1).map(String).filter(n => n.trim() !== '');
    const teams: TeamData[] = teamNames.map(name => ({
        name,
        financials: {
            incomeStatement: { global: {}, usa: {}, asia: {}, europe: {} },
            balanceSheet: { global: {}, usa: {}, asia: {}, europe: {} },
            cashFlow: { global: {} },
            ratios: {}
        },
        market: { global: {}, usa: {}, asia: {}, europe: {} },
        manufacturing: {
            usa: { inHouse: {}, contract: {}, capacityUsage: {} },
            asia: { inHouse: {}, contract: {}, capacityUsage: {} }
        },
        logistics: { usa: {}, asia: {}, europe: {} },
        costs: { usa: {}, asia: {}, europe: {} },
        margins: { usa: {}, asia: {}, europe: {} },
        marketShare: { global: {}, usa: {}, asia: {}, europe: {} },
        features: { usa: {}, asia: {}, europe: {} },
        demand: { usa: {}, asia: {}, europe: {} },
        prices: { usa: {}, asia: {}, europe: {} },
        metrics: { "Financials": {}, "Production": {}, "Market": {}, "R&D": {}, "Other": {} }
    }));

    // Define all section headers we care about
    const sectionHeaders = [
        { key: "Income Statement, k USD, Global", type: "financials", subtype: "incomeStatement", region: "global" },
        { key: "Income Statement, k USD, USA", type: "financials", subtype: "incomeStatement", region: "usa" },
        { key: "Income Statement, k USD, Asia", type: "financials", subtype: "incomeStatement", region: "asia" },
        { key: "Income Statement, k USD, Europe", type: "financials", subtype: "incomeStatement", region: "europe" },
        { key: "Balance sheet, k USD, Global", type: "financials", subtype: "balanceSheet", region: "global" },
        { key: "Balance sheet, k USD, USA", type: "financials", subtype: "balanceSheet", region: "usa" },
        { key: "Balance sheet, k USD, Asia", type: "financials", subtype: "balanceSheet", region: "asia" },
        { key: "Balance sheet, k USD, Europe", type: "financials", subtype: "balanceSheet", region: "europe" },
        { key: "Parent company's cash flow statement", type: "financials", subtype: "cashFlow", region: "global" },
        { key: "Cash flow statement, k USD, USA", type: "financials", subtype: "cashFlow", region: "usa" },
        { key: "Cash flow statement, k USD, Asia", type: "financials", subtype: "cashFlow", region: "asia" },
        { key: "Cash flow statement, k USD, Europe", type: "financials", subtype: "cashFlow", region: "europe" },
        { key: "Ratios and key financial indicators", type: "financials", subtype: "ratios", region: "global" },
        { key: "Market report, Global", type: "market", subtype: "market", region: "global" },
        { key: "Market report, USA", type: "market", subtype: "market", region: "usa" },
        { key: "Market report, Asia", type: "market", subtype: "market", region: "asia" },
        { key: "Market report, Europe", type: "market", subtype: "market", region: "europe" },
        { key: "Manufacturing details", type: "special", subtype: "manufacturing" },
        { key: "Logistics details", type: "special", subtype: "logistics" },
        { key: "Cost report", type: "special", subtype: "costs" },
        { key: "Margin breakdown", type: "special", subtype: "margins" }
    ];

    // Find indices for all sections
    const foundSections = sectionHeaders.map(h => ({
        ...h,
        index: findRowIndex(h.key)
    })).filter(h => h.index !== -1).sort((a, b) => a.index - b.index);

    // Helper to extract simple key-value pairs
    const extractSimpleBlock = (startRow: number, endRow: number, target: (team: TeamData, key: string, val: number) => void) => {
        for (let i = startRow + 1; i < endRow; i++) {
            const row = data[i];
            const label = row && row[0] ? String(row[0]).trim() : null;
            if (!label) continue;

            teams.forEach((team, idx) => {
                let val = row[idx + 1];
                if (typeof val === 'string') {
                    val = parseFloat(val.replace(/,/g, ''));
                }
                if (typeof val === 'number' && !isNaN(val)) {
                    target(team, label, val);
                }
            });
        }
    };

    // Process each section
    for (let i = 0; i < foundSections.length; i++) {
        const section = foundSections[i];
        const nextSection = foundSections[i + 1];
        const endIndex = nextSection ? nextSection.index : data.length;

        if (section.type === "financials") {
            const regionKey = section.region as 'global' | 'usa' | 'asia' | 'europe';
            if (section.subtype === "incomeStatement") {
                extractSimpleBlock(section.index, endIndex, (t, k, v) => t.financials.incomeStatement[regionKey][k] = v);
            } else if (section.subtype === "balanceSheet") {
                extractSimpleBlock(section.index, endIndex, (t, k, v) => t.financials.balanceSheet[regionKey][k] = v);
            } else if (section.subtype === "cashFlow") {
                extractSimpleBlock(section.index, endIndex, (t, k, v) => {
                    if (regionKey === "global") {
                        t.financials.cashFlow.global[k] = v;
                    } else {
                        // Ensure the region object exists before assigning
                        if (!t.financials.cashFlow[regionKey]) {
                            t.financials.cashFlow[regionKey] = {};
                        }
                        t.financials.cashFlow[regionKey]![k] = v;
                    }
                });
            } else if (section.subtype === "ratios") {
                extractSimpleBlock(section.index, endIndex, (t, k, v) => t.financials.ratios[k] = v);
            }
        } else if (section.type === "market") {
            // Expanded Market Parsing
            parseMarketSection(section.index, endIndex, section.region as 'global' | 'usa' | 'asia' | 'europe');
        } else if (section.type === "special") {
            // Handle special sections with custom logic, but constrained by endIndex
            if (section.subtype === "manufacturing") {
                parseManufacturing(section.index, endIndex);
            } else if (section.subtype === "logistics") {
                parseLogistics(section.index, endIndex);
            } else if (section.subtype === "costs") {
                parseCosts(section.index, endIndex);
            } else if (section.subtype === "margins") {
                parseMargins(section.index, endIndex);
            }
        }
    }

    function parseMarketSection(start: number, end: number, region: 'global' | 'usa' | 'asia' | 'europe') {
        let currentSubsection = "";
        let currentTech = "";

        for (let i = start + 1; i < end; i++) {
            const row = data[i];
            const label = row && row[0] ? String(row[0]).trim() : "";
            if (!label) continue;

            // Detect Market Share subsection
            if (label.toLowerCase().includes("market shares")) {
                currentSubsection = "marketShare";
                currentTech = ""; // Reset tech as we are now in a metric-led section
                continue;
            }

            // Handle Tech Rows
            if (label.startsWith("Tech")) {
                if (currentSubsection === "marketShare") {
                    // This is a data row for Market Share
                    teams.forEach((team, idx) => {
                        let val = row[idx + 1];
                        if (typeof val === 'string') val = parseFloat(val.replace(/,/g, ''));
                        if (typeof val === 'number' && !isNaN(val)) {
                            team.marketShare[region][label] = val;
                        }
                    });
                } else {
                    // This is a Header for Tech details (Price, Features, etc.)
                    currentTech = label;
                }
                continue;
            }

            // Handle Metrics under a Tech Header
            if (currentTech) {
                if (label.toLowerCase().includes("selling price")) {
                    teams.forEach((team, idx) => {
                        let val = row[idx + 1];
                        if (typeof val === 'string') val = parseFloat(val.replace(/,/g, ''));
                        if (typeof val === 'number' && !isNaN(val)) {
                            if (region !== 'global') team.prices[region][currentTech] = val;
                        }
                    });
                } else if (label.toLowerCase().includes("number of offered features")) {
                    teams.forEach((team, idx) => {
                        let val = row[idx + 1];
                        if (typeof val === 'string') val = parseFloat(val.replace(/,/g, ''));
                        if (typeof val === 'number' && !isNaN(val)) {
                            if (region !== 'global') team.features[region][currentTech] = val;
                        }
                    });
                } else if (label.toLowerCase().includes("demand, k units")) {
                    teams.forEach((team, idx) => {
                        let val = row[idx + 1];
                        if (typeof val === 'string') val = parseFloat(val.replace(/,/g, ''));
                        if (typeof val === 'number' && !isNaN(val)) {
                            if (region !== 'global') team.demand[region][currentTech] = val;
                        }
                    });
                }
            }

            // Legacy / Other Market Data
            // If it's not one of the above, maybe capture it in generic market metrics?
            // Only if it's NOT a tech detail row we just handled.
            if (!currentTech && !currentSubsection) {
                teams.forEach((team, idx) => {
                    let val = row[idx + 1];
                    if (typeof val === 'string') val = parseFloat(val.replace(/,/g, ''));
                    if (typeof val === 'number' && !isNaN(val)) {
                        team.market[region][label] = val;
                    }
                });
            }
        }
    }

    function parseManufacturing(start: number, end: number) {
        let currentSection = "";
        let currentRegion = "";

        for (let i = start + 1; i < end; i++) {
            const row = data[i];
            const label = row && row[0] ? String(row[0]).trim() : "";
            if (!label) continue;

            if (label.includes("In-house manufacturing")) { currentSection = "inHouse"; continue; }
            if (label.includes("Contract manufacturing")) { currentSection = "contract"; continue; }
            if (label.includes("Capacity usage")) { currentSection = "capacityUsage"; continue; }
            if (label === "USA" || label === "Asia") { currentRegion = label.toLowerCase(); continue; }

            if (label.startsWith("Tech")) {
                teams.forEach((team, idx) => {
                    let val = row[idx + 1];
                    if (typeof val === 'string') val = parseFloat(val.replace(/,/g, ''));
                    if (typeof val === 'number' && !isNaN(val)) {
                        if (currentSection === "inHouse" && (currentRegion === "usa" || currentRegion === "asia")) {
                            team.manufacturing[currentRegion as "usa" | "asia"].inHouse[label] = val;
                        } else if (currentSection === "contract" && (currentRegion === "usa" || currentRegion === "asia")) {
                            team.manufacturing[currentRegion as "usa" | "asia"].contract[label] = val;
                        } else if (currentSection === "capacityUsage" && (currentRegion === "usa" || currentRegion === "asia")) {
                            // Ensure capacityUsage object exists (it might not be initialized in the map above if we didn't update the initial state)
                            if (!team.manufacturing[currentRegion as "usa" | "asia"].capacityUsage) {
                                team.manufacturing[currentRegion as "usa" | "asia"].capacityUsage = {};
                            }
                            team.manufacturing[currentRegion as "usa" | "asia"].capacityUsage[label] = val;
                        }
                    }
                });
            }
        }
    }

    function parseLogistics(start: number, end: number) {
        let currentRegion = "";
        let currentTech = "";

        for (let i = start + 1; i < end; i++) {
            const row = data[i];
            const label = row && row[0] ? String(row[0]).trim() : "";
            if (!label) continue;

            if (label.includes("Tech")) { currentTech = label.split(",")[0].trim(); continue; }
            if (label === "USA" || label === "Asia" || label === "Europe") { currentRegion = label.toLowerCase(); continue; }

            const mapKey = {
                "In-house manufacturing": "inHouse",
                "Contract manufacturing": "contract",
                "Imported from": "imported",
                "Total products": "total",
                "Sales in": "sales",
                "Exported to": "exported",
                "Production buffer": "productionBuffer",
                "Unsatisfied demand": "unsatisfiedDemand"
            };

            let key: string | undefined;
            for (const [k, v] of Object.entries(mapKey)) {
                if (label.includes(k)) { key = v; break; }
            }

            if (key && currentRegion && currentTech) {
                teams.forEach((team, idx) => {
                    let val = row[idx + 1];
                    if (typeof val === 'string') val = parseFloat(val.replace(/,/g, ''));
                    if (typeof val === 'number' && !isNaN(val)) {
                        const regionLogistics = team.logistics[currentRegion as "usa" | "asia" | "europe"];
                        if (!regionLogistics[currentTech]) {
                            regionLogistics[currentTech] = { inHouse: 0, contract: 0, imported: 0, total: 0, sales: 0, exported: 0, productionBuffer: 0, unsatisfiedDemand: 0 };
                        }
                        (regionLogistics[currentTech] as any)[key!] = val;
                    }
                });
            }
        }
    }

    function parseCosts(start: number, end: number) {
        let currentRegion = "";
        let currentMetric = "";

        for (let i = start + 1; i < end; i++) {
            const row = data[i];
            const label = row && row[0] ? String(row[0]).trim() : "";
            if (!label) continue;

            // Identify headers that are not Regions or Techs
            if (label !== "USA" && label !== "Asia" && label !== "Europe" && !label.startsWith("Tech")) {
                currentMetric = label;
                continue;
            }

            if (label === "USA" || label === "Asia" || label === "Europe") {
                currentRegion = label.toLowerCase();
                continue;
            }

            if (label.startsWith("Tech") && currentRegion && currentMetric) {
                teams.forEach((team, idx) => {
                    let val = row[idx + 1];
                    if (typeof val === 'string') val = parseFloat(val.replace(/,/g, ''));
                    if (typeof val === 'number' && !isNaN(val)) {
                        const key = `${currentMetric} - ${label}`;
                        team.costs[currentRegion as "usa" | "asia" | "europe"][key] = val;
                    }
                });
            }
        }
    }

    function parseMargins(start: number, end: number) {
        let currentRegion = "";
        let currentTech = "";

        for (let i = start; i < end; i++) {
            const row = data[i];
            const label = row && row[0] ? String(row[0]).trim() : "";
            if (!label) continue;

            if (label.includes("Margin breakdown")) {
                if (label.includes("USA")) currentRegion = "usa";
                else if (label.includes("Asia")) currentRegion = "asia";
                else if (label.includes("Europe")) currentRegion = "europe";
                continue;
            }

            if (label.startsWith("Tech")) { currentTech = label; continue; }

            if (currentRegion && currentTech) {
                teams.forEach((team, idx) => {
                    let val = row[idx + 1];
                    if (typeof val === 'string') val = parseFloat(val.replace(/,/g, ''));
                    if (typeof val === 'number' && !isNaN(val)) {
                        const regionMargins = team.margins[currentRegion as "usa" | "asia" | "europe"];
                        if (!regionMargins[currentTech]) {
                            regionMargins[currentTech] = { sales: 0, variableCosts: 0, grossProfit: 0, margin: 0, promotion: 0 };
                        }
                        if (label === "Sales revenue") regionMargins[currentTech].sales = val;
                        if (label === "Variable production costs" || label === "Total costs of unit sold") regionMargins[currentTech].variableCosts = val;
                        if (label === "Gross profit") regionMargins[currentTech].grossProfit = val;
                        if (label === "Gross margin %") regionMargins[currentTech].margin = val;
                        if (label === "Promotion") regionMargins[currentTech].promotion = val;
                    }
                });
            }
        }
    }

    // Populate legacy metrics
    teams.forEach(team => {
        Object.entries(team.financials.incomeStatement.global).forEach(([k, v]) => team.metrics["Financials"][k] = v);
        Object.entries(team.market.global).forEach(([k, v]) => team.metrics["Market"][k] = v);
    });

    return {
        roundName: sheetName,
        teams
    };
};
