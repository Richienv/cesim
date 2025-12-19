
import * as XLSX from 'xlsx';
import * as fs from 'fs';
import * as path from 'path';

// Translation map (subset)
const TRANSLATION_MAP: Record<string, string> = {
    "损益表, 千 USD, global": "Income statement, k USD, global",
    "Global Income statement, k USD": "Income statement, k USD, global",
    "本回合利润": "Profit for the round",
    "息税折旧及摊销前利润(EBITDA)": "Operating profit before depreciation (EBITDA)",
    "销售利润": "Gross profit",
    "销售额": "Sales revenue",
    "累计利润": "Cumulative profit",
    "全球市场份额 %": "Global market share %",
    "Momentum": "Momentum",
    "多财多亿": "Momentum" // User mentioned generic team name or chinese equivalent
};

const translate = (key: string) => TRANSLATION_MAP[key.trim()] || key.trim();

const filePath = path.join(process.cwd(), 'results-r01 (6).xls');
if (!fs.existsSync(filePath)) {
    console.error(`File not found: ${filePath}`);
    process.exit(1);
}

const fileBuffer = fs.readFileSync(filePath);
const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];
const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];

let teamIndex = -1;
const teamName = "Momentum";

// Find team index
for (let i = 0; i < 20; i++) {
    if (data[i]) {
        const idx = data[i].findIndex((c: any) => {
            const val = String(c).trim();
            return val === teamName || val === "多财多亿";
        });
        if (idx !== -1) {
            teamIndex = idx;
            console.log(`Team found: ${data[i][idx]} at index ${teamIndex}`);
            break;
        }
    }
}

if (teamIndex === -1) {
    console.log(`Team '${teamName}' not found in first 20 rows.`);
    process.exit(1);
}

const metrics: Record<string, any> = {};

// Helper to find value by row label
function findValue(labelStarts: string[], limit = 2000): any {
    for (let i = 0; i < Math.min(data.length, limit); i++) {
        const raw = String(data[i]?.[0] || "").trim();
        const translated = translate(raw);
        // Debug logging for potential matches
        if (labelStarts.some(l => l.includes("Sales") && (raw.includes("Sales") || raw.includes("销售")))) {
            console.log(`[DEBUG Sales Candidate] Row ${i}: ${raw} -> Value: ${data[i][teamIndex]}`);
        }

        if (labelStarts.some(l => translated.startsWith(l) || raw.includes(l))) {
            return data[i][teamIndex];
        }
    }
    return null;
}

// Extract Financials
metrics['Sales Revenue'] = findValue(["销售额合计", "Total sales"]); // Removed "Sales revenue" to avoid matching header
if (!metrics['Sales Revenue']) metrics['Sales Revenue'] = findValue(["Sales revenue"]); // Fallback

metrics['Net Profit'] = findValue(["Profit for the round", "本回合利润"]);
metrics['EBITDA'] = findValue(["Operating profit before depreciation (EBITDA)", "息税折旧及摊销前利润(EBITDA)"]);
metrics['Cumulative Profit'] = findValue(["Cumulative profit", "累计利润"]);

// Extract Market Data
// Scan for Market Share Header and get Total
let globalMarketShare: any = null;
for (let i = 0; i < data.length; i++) {
    const raw = String(data[i]?.[0] || "").trim();
    if (raw.includes("Global market share") || raw.includes("全球市场份额")) {
        // Look for "Total" or "总计" in the next few rows
        for (let j = 1; j <= 10; j++) {
            const subRow = String(data[i + j]?.[0] || "").trim();
            if (subRow === "Total" || subRow === "总计") {
                globalMarketShare = data[i + j][teamIndex];
                break;
            }
        }
        if (globalMarketShare) break;
    }
}
metrics['Global Market Share'] = globalMarketShare;

// Ratios
metrics['Shareholder Return'] = findValue(["Total shareholder return", "股东总回报"]);
// Round 1 Shareholder return might be null or initial value

console.log("\n--- Analysis Results for Momentum (Round 1) ---");
console.log(`Sales Revenue: $${Number(metrics['Sales Revenue']).toLocaleString()}`);
console.log(`Net Profit: $${Number(metrics['Net Profit']).toLocaleString()}`);
console.log(`EBITDA: $${Number(metrics['EBITDA']).toLocaleString()}`);
console.log(`Global Market Share: ${metrics['Global Market Share']}%`);

if (metrics['Net Profit'] && metrics['Sales Revenue']) {
    const ros = (Number(metrics['Net Profit']) / Number(metrics['Sales Revenue'])) * 100;
    console.log(`Return on Sales (ROS): ${ros.toFixed(2)}%`);
}

if (metrics['Shareholder Return']) {
    console.log(`Shareholder Return: ${metrics['Shareholder Return']}%`);
}
