import * as XLSX from 'xlsx';
import { RoundData, TeamData, FinancialMetrics, RegionManufacturing, LogisticsData, MarginData, TechMetrics } from './types';
import { TRANSLATION_MAP } from './translationMap';

// Helper to translate keys
const translate = (key: string): string => {
    if (!key) return "";
    const trimmed = key.trim();
    // Direct lookup
    if (TRANSLATION_MAP[trimmed]) return TRANSLATION_MAP[trimmed];

    // Try to find if the key contains any of the Chinese keys (partial match for some cases)
    // But for now, let's rely on direct mapping or the key itself if not found
    return trimmed;
};

export const parseCesimData = (fileBuffer: ArrayBuffer): RoundData => {
    console.log("[Parser] Entry point reached");
    const workbook = XLSX.read(fileBuffer, { type: 'array' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];

    // Helper to find row index by keyword (checking both English and Chinese)
    const findRowIndex = (keyword: string, startFrom = 0): number => {
        for (let i = startFrom; i < data.length; i++) {
            const cell = data[i][0];
            if (cell) {
                const cellStr = String(cell).trim();
                const trans = translate(cellStr);
                // if (keyword === "Margin breakdown") {
                // console.log(`[Scanning ${i}] Raw: ${cellStr} Trans: ${trans} Keyword: ${keyword}`);
                // }

                // Check if cell matches keyword directly or if its translation matches
                if (cellStr.toLowerCase().includes(keyword.toLowerCase()) ||
                    trans.toLowerCase().includes(keyword.toLowerCase())) {
                    if (keyword === "Margin breakdown") console.log(`[Found Margin] at ${i}:Raw: ${cellStr} Trans: ${trans}`);
                    return i;
                }
            }
        }
        if (keyword === "Margin breakdown") console.log(`[Failed Margin] Not found`);
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
        metrics: { "Financials": {}, "Production": {}, "Market": {}, "R&D": {}, "Other": {} },
        hr: {
            turnoverRate: 0, staffingLevel: 0, trainingCost: 0, hiringOneOffCost: 0, firingOneOffCost: 0,
            efficiency: 0, salary: 0, trainingBudget: 0, totalTurnover: 0, availableWorkdays: 0, allocatedWorkdays: 0, totalCost: 0
        },
        marketingFocus: { usa: {}, asia: {}, europe: {} }
    }));

    // Define all section headers we care about
    const sectionHeaders = [
        { key: "Income statement, k USD, Global", type: "financials", subtype: "incomeStatement", region: "global" },
        { key: "Income statement, k USD, USA", type: "financials", subtype: "incomeStatement", region: "usa" },
        { key: "Income statement, k USD, Asia", type: "financials", subtype: "incomeStatement", region: "asia" },
        { key: "Income statement, k USD, Europe", type: "financials", subtype: "incomeStatement", region: "europe" },
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
        { key: "Margin breakdown by tech, k USD, USA", type: "special", subtype: "margins", region: "usa" },
        { key: "Margin breakdown by tech, k USD, Asia", type: "special", subtype: "margins", region: "asia" },
        { key: "Margin breakdown by tech, k USD, Europe", type: "special", subtype: "margins", region: "europe" },
        { key: "Human Resources", type: "special", subtype: "hr" } // New HR Section
    ];

    // Find indices for all sections
    const foundSections = sectionHeaders.map(h => ({
        ...h,
        index: findRowIndex(h.key)
    })).filter(h => h.index !== -1).sort((a, b) => a.index - b.index);

    console.log("[Parser] Found Sections:", foundSections.map(s => `${s.key} @ ${s.index}`));

    // Helper to extract simple key-value pairs
    const extractSimpleBlock = (startRow: number, endRow: number, target: (team: TeamData, key: string, val: number) => void) => {
        for (let i = startRow + 1; i < endRow; i++) {
            const row = data[i];
            const rawLabel = row && row[0] ? String(row[0]).trim() : null;
            if (!rawLabel) continue;

            const label = translate(rawLabel);

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
                extractSimpleBlock(section.index, endIndex, (t, k, v) => {
                    t.financials.incomeStatement[regionKey][k] = v;
                    // Map specific keys to explicit properties for easier access
                    if (k === "Transportation and tariffs") t.financials.incomeStatement[regionKey].transportationAndTariffs = v;
                    if (k === "Income taxes") t.financials.incomeStatement[regionKey].incomeTax = v;
                    if (k === "Profit for the round") t.financials.incomeStatement[regionKey].netProfit = v;
                    if (k === "Operating profit before depreciation (EBITDA)" || k === "息税折旧及摊销前利润(EBITDA)") t.financials.incomeStatement[regionKey].ebitda = v;
                    if (k === "Operating profit (EBIT)" || k === "息税前利润(EBIT)") t.financials.incomeStatement[regionKey].ebit = v;
                    if (k === "Profit before taxes" || k === "税前利润") t.financials.incomeStatement[regionKey].profitBeforeTax = v;
                });
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
                parseMargins(section.index, endIndex, section.region);
            } else if (section.subtype === "hr") {
                parseHR(section.index, endIndex, data, teams, translate);
            }
        }
    }

    function parseMarketSection(start: number, end: number, region: 'global' | 'usa' | 'asia' | 'europe') {
        let currentSubsection = "";
        let currentTech = "";

        for (let i = start + 1; i < end; i++) {
            const row = data[i];
            const rawLabel = row && row[0] ? String(row[0]).trim() : "";
            if (!rawLabel) continue;

            const label = translate(rawLabel);

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

            // Marketing Focus
            if (label.includes("Marketing focus")) {
                teams.forEach((team, idx) => {
                    const val = row[idx + 1];
                    if (val && typeof val === 'string') {
                        const strategy = translate(val.trim());
                        if (region !== 'global') {
                            if (currentTech) {
                                team.marketingFocus[region][currentTech] = strategy;
                            }
                        }
                    }
                });
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
            const rawLabel = row && row[0] ? String(row[0]).trim() : "";
            if (!rawLabel) continue;

            const label = translate(rawLabel);

            if (label.includes("In-house manufacturing")) { currentSection = "inHouse"; continue; }
            if (label.includes("Contract manufacturing")) { currentSection = "contract"; continue; }
            // NEW: Parse Production Cost Section
            if (label.includes("In-house manufacturing cost per unit") || label.includes("单件产品的自身生产成本")) {
                currentSection = "productionCost";
                continue;
            }
            if (label.includes("Capacity usage")) { currentSection = "capacityUsage"; continue; }

            // NEW: Parse Factory Count Section
            if (label.includes("Number of plants") || label.includes("工厂数量")) {
                currentSection = "factories";
                continue;
            }

            if (label.includes("This round") || label.includes("本回合")) {
                if (currentSection === "factories") currentSection = "factories_current";
                continue;
            }

            if (label.includes("Next round") || label.includes("下回合")) {
                if (currentSection === "factories_current") currentSection = "factories_next";
                continue;
            }

            // Now handle the data parsing for factories_current
            if ((label === "USA" || label === "Asia") && currentSection === "factories_current") {
                teams.forEach((team, idx) => {
                    let val = row[idx + 1];
                    if (typeof val === 'string') val = parseFloat(val.replace(/,/g, ''));
                    if (typeof val === 'number' && !isNaN(val)) {
                        team.manufacturing[currentRegion as "usa" | "asia"].factories = val;
                    }
                });
                continue;
            }

            if (label === "USA" || label === "Asia" || label === "Europe") {
                currentRegion = label.toLowerCase();

                // Check if this region row itself has data (common for Capacity Usage)
                const hasData = row.length > 1 && (typeof row[1] === 'number' || (typeof row[1] === 'string' && row[1].trim() !== ''));

                if (hasData) {
                    if (currentSection === "capacityUsage") {
                        teams.forEach((team, idx) => {
                            let val = row[idx + 1];
                            if (typeof val === 'string') val = parseFloat(val.replace(/,/g, ''));
                            if (typeof val === 'number' && !isNaN(val)) {
                                if ((currentRegion === "usa" || currentRegion === "asia") && !team.manufacturing[currentRegion].capacityUsage) {
                                    team.manufacturing[currentRegion].capacityUsage = {};
                                }
                                if (currentRegion === "usa" || currentRegion === "asia") {
                                    team.manufacturing[currentRegion].capacityUsage!["Total"] = val;
                                }
                            }
                        });
                    }
                }
                continue;
            }

            if (label.startsWith("Tech")) {
                const techKey = label.replace("Tech ", "Tech"); // "Tech 1" -> "Tech1"

                teams.forEach((team, idx) => {
                    let val = row[idx + 1];
                    if (typeof val === 'string') val = parseFloat(val.replace(/,/g, ''));
                    if (typeof val === 'number' && !isNaN(val)) {
                        if (currentSection === "inHouse" && (currentRegion === "usa" || currentRegion === "asia")) {
                            team.manufacturing[currentRegion].inHouse[techKey] = val;
                        } else if (currentSection === "contract" && (currentRegion === "usa" || currentRegion === "asia")) {
                            team.manufacturing[currentRegion].contract[techKey] = val;
                        } else if (currentSection === "capacityUsage" && (currentRegion === "usa" || currentRegion === "asia")) {
                            if (!team.manufacturing[currentRegion].capacityUsage) {
                                team.manufacturing[currentRegion].capacityUsage = {};
                            }
                            team.manufacturing[currentRegion].capacityUsage![label] = val;
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
            const rawLabel = row && row[0] ? String(row[0]).trim() : "";
            if (!rawLabel) continue;

            const label = translate(rawLabel);

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
            const rawLabel = row && row[0] ? String(row[0]).trim() : "";
            if (!rawLabel) continue;

            const label = translate(rawLabel);

            // Identify headers that are not Regions or Techs
            if (label !== "USA" && label !== "Asia" && label !== "Europe" && !label.startsWith("Tech")) {
                currentMetric = label;
                continue;
            }

            if (label === "USA" || label === "Asia" || label === "Europe") {
                currentRegion = label.toLowerCase();

                // Check if this region row has data (for region-level metrics like Logistics Cost)
                const hasData = row.length > 1 && (typeof row[1] === 'number' || (typeof row[1] === 'string' && row[1].trim() !== ''));
                if (hasData && currentMetric) {
                    teams.forEach((team, idx) => {
                        let val = row[idx + 1];
                        if (typeof val === 'string') val = parseFloat(val.replace(/,/g, ''));
                        if (typeof val === 'number' && !isNaN(val)) {
                            // Store with metric name as key (abusing TechMetrics structure slightly but it works)
                            team.costs[currentRegion as "usa" | "asia" | "europe"][currentMetric] = val;
                        }
                    });
                }
                continue;
            }

            if (label.startsWith("Tech") && currentRegion && currentMetric) {
                const techKey = label.replace("Tech ", "Tech"); // "Tech 1" -> "Tech1"
                teams.forEach((team, idx) => {
                    let val = row[idx + 1];
                    if (typeof val === 'string') val = parseFloat(val.replace(/,/g, ''));
                    if (typeof val === 'number' && !isNaN(val)) {
                        const key = `${currentMetric} - ${label}`;
                        team.costs[currentRegion as "usa" | "asia" | "europe"][key] = val;

                        // NEW: Populate structured productionCost
                        if (currentMetric.includes("In-house manufacturing cost per unit") && (currentRegion === "usa" || currentRegion === "asia")) {
                            if (!team.manufacturing[currentRegion].productionCost) {
                                team.manufacturing[currentRegion].productionCost = {};
                            }
                            team.manufacturing[currentRegion].productionCost![techKey] = val;
                        }
                    }
                });
            }
        }
    }

    function parseMargins(start: number, end: number, regionOverride?: string) {
        let currentRegion = regionOverride || "";
        let currentTech = "";

        for (let i = start; i < end; i++) {
            const row = data[i];
            const rawLabel = row && row[0] ? String(row[0]).trim() : "";
            if (!rawLabel) continue;

            const label = translate(rawLabel);

            if (label.includes("Margin breakdown")) {
                console.log(`[Margin Parse] Header at ${i}: ${label}`);
                if (label.includes("USA")) currentRegion = "usa";
                else if (label.includes("Asia")) currentRegion = "asia";
                else if (label.includes("Europe")) currentRegion = "europe";
                continue;
            }

            if (label.startsWith("Tech")) {
                currentTech = label.split(",")[0].trim(); // Ensure only Tech Name is used "Tech 1" not "Tech 1, k units"
                console.log(`[Margin Parse] Tech at ${i}: ${currentTech} (Reg: ${currentRegion})`);
                continue;
            }

            if (currentRegion && currentTech) {
                teams.forEach((team, idx) => {
                    let val = row[idx + 1];
                    if (typeof val === 'string') {
                        val = val.trim();
                        if (val === '') return; // Skip empty strings
                        val = parseFloat(val.replace(/,/g, ''));
                    }

                    if (typeof val === 'number' && !isNaN(val)) {
                        const regionMargins = team.margins[currentRegion as "usa" | "asia" | "europe"];
                        if (!regionMargins[currentTech]) {
                            regionMargins[currentTech] = { sales: 0, variableCosts: 0, grossProfit: 0, margin: 0, promotion: 0 };
                        }
                        // Normalize label for comparison to handle slight variations if any
                        const nLabel = label.toLowerCase();

                        if (nLabel === "sales revenue" || label === "Sales revenue") {
                            console.log(`   Assigning Sales: ${val} to ${team.name}`);
                            regionMargins[currentTech].sales = val;
                        }
                        if (label === "Variable production costs" || label === "Total costs of unit sold") regionMargins[currentTech].variableCosts = val;
                        if (label === "Gross profit" || label === "Sales profit") regionMargins[currentTech].grossProfit = val;
                        if (label.includes("Gross margin") || label.includes("Contribution margin")) regionMargins[currentTech].margin = val;
                        if (label === "Promotion") regionMargins[currentTech].promotion = val;
                    }
                });
            }
        }
    }

    // Populate legacy metrics
    teams.forEach(team => {
        Object.entries(team.financials.incomeStatement.global).forEach(([k, v]) => {
            if (v !== undefined) team.metrics["Financials"][k] = v;
        });
        Object.entries(team.market.global).forEach(([k, v]) => {
            if (v !== undefined) team.metrics["Market"][k] = v;
        });
    });

    return {
        roundName: sheetName,
        teams
    };
};

function parseHR(start: number, end: number, data: any[][], teams: TeamData[], translate: (key: string) => string) {
    for (let i = start + 1; i < end; i++) {
        const row = data[i];
        const rawLabel = row && row[0] ? String(row[0]).trim() : "";
        if (!rawLabel) continue;

        // Use raw label for specific Chinese matches first, then translate
        const label = translate(rawLabel);

        teams.forEach((team, idx) => {
            let val = row[idx + 1];
            let numVal = 0;
            if (typeof val === 'string') numVal = parseFloat(val.replace(/,/g, ''));
            else if (typeof val === 'number') numVal = val;

            // Updated Mapping logic to catch Chinese headers explicitly
            if (label.includes("Voluntary turnover rate") || rawLabel.includes("人员自愿流动率")) team.hr.turnoverRate = numVal;
            if (label.includes("Total turnover rate")) team.hr.totalTurnover = numVal;
            if (label.includes("Staffing level, this round") || rawLabel.includes("本回合员工规模")) team.hr.staffingLevel = numVal;
            if (label.includes("Training costs") || rawLabel.includes("培训成本")) team.hr.trainingCost = numVal;
            if (label.includes("Training budget") || rawLabel.includes("培训预算")) team.hr.trainingBudget = numVal;
            if (label.includes("Recruitment costs") || rawLabel.includes("招聘成本")) team.hr.hiringOneOffCost = numVal;
            if (label.includes("Redundancy costs") || rawLabel.includes("裁员成本")) team.hr.firingOneOffCost = numVal;
            if (label.includes("Efficiency multiplier") || rawLabel.includes("工作效率乘数")) team.hr.efficiency = numVal;
            if (label.includes("Salary/month") || rawLabel.includes("工资/月")) team.hr.salary = numVal;
            if (label.includes("Total available man-days")) team.hr.availableWorkdays = numVal;
            if (label.includes("Total allocated man-days")) team.hr.allocatedWorkdays = numVal;

            // New Total Cost Mapping
            if (rawLabel.includes("成本总计") || label.includes("Total costs") || label === "Costs and expenses total") {
                team.hr.totalCost = numVal;
            }
        });
    }
}
