
import * as XLSX from 'xlsx';
import * as fs from 'fs';
import * as path from 'path';

// Minimal translation map copy
const TRANSLATION_MAP: Record<string, string> = {
    "损益表, 千 USD, 美国": "Income statement, k USD, USA",
    "本回合利润": "Profit for the round",
    "息税折旧及摊销前利润(EBITDA)": "Operating profit before depreciation (EBITDA)",
    "边际收益明细（按技术划分）, 千 USD, 美国": "Margin breakdown by tech, k USD, USA",
    "内燃机技术": "Tech 1",
    "销售利润": "Gross profit",
    "促销": "Promotion",
    "广告": "Promotion", // Sometimes used
    "行之队": "行之队"
};

const translate = (key: string) => TRANSLATION_MAP[key.trim()] || key.trim();

const filePath = path.join(process.cwd(), 'results-pr01 (2).xls');
const fileBuffer = fs.readFileSync(filePath);
const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];
const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];

let teamIndex = -1;
// Search first 10 rows for team names
for (let i = 0; i < 10; i++) {
    if (data[i] && data[i].length > 5) {
        console.log(`Row ${i} candidates:`, data[i].slice(0, 5));
        const idx = data[i].findIndex((c: any) => String(c).trim() === "行之队");
        if (idx !== -1) {
            teamIndex = idx;
            break;
        }
        // Also try printing all values to see what they are
        data[i].forEach((c, idx) => {
            if (typeof c === 'string') console.log(`   [${idx}] "${c}"`);
        });
    }
}

if (teamIndex === -1) { console.log("Team not found"); process.exit(1); }

console.log("Team found at index:", teamIndex);

// Find USA Income Statement
let incStmtStart = -1;
for (let i = 0; i < data.length; i++) {
    const label = translate(String(data[i][0] || ""));
    if (label === "Income statement, k USD, USA") {
        incStmtStart = i;
        break;
    }
}

if (incStmtStart === -1) { console.log("Inc Stmt USA not found"); }
else {
    console.log("Inc Stmt USA found at", incStmtStart);
    // Scan Income Statement block
    for (let i = incStmtStart; i < incStmtStart + 10; i++) { // First 10 lines cover Sales
        const raw = String(data[i][0] || "");
        const val = data[i][teamIndex];
        console.log(`[SalesCheck] ${translate(raw)}: ${val}`);
    }
}

// Find Margin Breakdown
let marginStart = -1;
for (let i = 0; i < data.length; i++) {
    const label = translate(String(data[i][0] || ""));
    if (label === "Margin breakdown by tech, k USD, USA") {
        marginStart = i;
        break;
    }
}

if (marginStart === -1) { console.log("Margin Breakdown USA not found"); }
else {
    console.log("Margin Breakdown found at", marginStart);
    let currentTech = "";
    for (let i = marginStart; i < marginStart + 50; i++) {
        const raw = String(data[i][0] || "");
        if (raw.includes("Margin breakdown") && !raw.includes("USA")) break; // Next region

        if (raw.includes("Tech") || raw.includes("技术")) {
            currentTech = raw;
            console.log("--> Tech:", currentTech);
        }

        if (translate(raw) === "Gross profit" || raw === "销售利润" || raw === "毛利") {
            const val = data[i][teamIndex];
            console.log(`   Gross Profit: ${val}`);
        }
        if (translate(raw) === "Promotion" || raw === "促销" || raw === "广告") {
            const val = data[i][teamIndex];
            console.log(`   Promotion: ${val}`);
        }
    }
}
