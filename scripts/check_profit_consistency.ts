
import * as XLSX from 'xlsx';
import * as fs from 'fs';
import * as path from 'path';

const filePath = path.join(process.cwd(), 'results-pr01 (2).xls');
console.log(`Reading file: ${filePath}`);

const fileBuffer = fs.readFileSync(filePath);
const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];
const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];

const teamName = "行之队";
let teamIndex = -1;

// Find team index
for (let i = 0; i < 50; i++) {
    if (data[i]) {
        const idx = data[i].findIndex((c: any) => String(c).trim() === teamName);
        if (idx !== -1) {
            teamIndex = idx;
            console.log(`Found team '${teamName}' at column ${teamIndex} (Row ${i})`);
            break;
        }
    }
}

if (teamIndex === -1) {
    console.error(`Team '${teamName}' not found`);
    process.exit(1);
}

// Helper to find value
function findValue(startKeyword: string, targetRowLabel: string, endKeyword?: string) {
    let startRow = -1;
    for (let i = 0; i < data.length; i++) {
        const cell = String(data[i][0]).trim();
        if (cell.includes(startKeyword)) {
            startRow = i;
            break;
        }
    }

    if (startRow === -1) {
        console.log(`Section '${startKeyword}' not found`);
        return null;
    }

    console.log(`Found section '${startKeyword}' at row ${startRow}`);

    for (let i = startRow + 1; i < data.length; i++) {
        const cell = String(data[i][0]).trim();
        if (endKeyword && cell.includes(endKeyword)) break;

        // Break if we hit another section (heuristic: usually large text or empty space before it)
        // But let's just search for the label
        if (cell === targetRowLabel || cell.includes(targetRowLabel)) {
            const val = data[i][teamIndex];
            console.log(`Found '${targetRowLabel}' at row ${i}: ${val}`);
            return val;
        }
    }
    console.log(`'${targetRowLabel}' not found in section '${startKeyword}'`);
    return null;
}

// 1. Get Net Profit from USA Income Statement
const netProfitUSA = findValue("Income statement, k USD, USA", "Profit for the round");
const ebitdaUSA = findValue("Income statement, k USD, USA", "Operating profit before depreciation (EBITDA)");

// 2. Scan Margin Breakdown
let marginStartRow = -1;
for (let i = 0; i < data.length; i++) {
    if (String(data[i][0]).includes("Margin breakdown") && String(data[i][0]).includes("USA")) {
        marginStartRow = i;
        break;
    }
}

let calculatedProfitE = 0;
let techDetails = [];

if (marginStartRow !== -1) {
    console.log(`\nMargin Breakdown USA found at row ${marginStartRow}`);
    let currentTech = "";

    // We expect 4 techs or similarly structured blocks
    for (let i = marginStartRow + 1; i < data.length; i++) {
        const label = String(data[i][0] || "").trim();
        if (label.startsWith("Income statement")) break; // End of margin section?

        if (label.startsWith("Tech")) {
            currentTech = label;
            continue;
        }

        if (label === "Gross profit" || label === "Sales profit") { // "Sales profit" often used in Chinese versions? Check translation
            const gp = data[i][teamIndex];
            // Find promotion
            let promo = 0;
            // Promotion is usually a few lines down? Or up?
            // Actually parser.ts says: "Promotion"

            // Let's create a mini object for the tech
            techDetails.push({ tech: currentTech, gp: gp, row: i });
        }
    }
} else {
    console.log("Margin Breakdown USA not found");
}

// Since structure is Tech 1 ... metrics ... Tech 2 ... metrics
// We need to look for "Promotion" specifically under each Tech
// Let's re-scan carefully

if (marginStartRow !== -1) {
    let currentTech = "";
    let currentGP = 0;
    let currentPromo = 0;

    for (let i = marginStartRow + 1; i < data.length; i++) {
        const label = String(data[i][0] || "").trim();
        if (label.includes("Margin breakdown") && !label.includes("USA")) break; // Next region

        if (label.startsWith("Tech")) {
            if (currentTech) {
                console.log(`Tech: ${currentTech} | GP: ${currentGP} | Promo: ${currentPromo} | Contrib: ${currentGP - currentPromo}`);
                calculatedProfitE += (currentGP - currentPromo);
            }
            currentTech = label;
            currentGP = 0;
            currentPromo = 0;
        }

        if (label === "Gross profit" || label === "Sales profit" || label === "毛利") {
            currentGP = parseFloat(String(data[i][teamIndex]).replace(/,/g, '')) || 0;
        }
        if (label === "Promotion" || label === "促销") {
            currentPromo = parseFloat(String(data[i][teamIndex]).replace(/,/g, '')) || 0;
        }
    }
    // Add last tech
    if (currentTech) {
        console.log(`Tech: ${currentTech} | GP: ${currentGP} | Promo: ${currentPromo} | Contrib: ${currentGP - currentPromo}`);
        calculatedProfitE += (currentGP - currentPromo);
    }
}

console.log(`\nSummary for ${teamName} (USA):`);
console.log(`Parsed Net Profit: ${netProfitUSA}`);
console.log(`Parsed EBITDA: ${ebitdaUSA}`);
console.log(`Calculated Total Profit-E (Contrib): ${calculatedProfitE}`);
console.log(`Difference (EBITDA - Contrib): ${parseFloat(String(ebitdaUSA || '0').replace(/,/g, '')) - calculatedProfitE}`);

