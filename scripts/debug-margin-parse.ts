
import * as fs from 'fs';
import * as path from 'path';
import * as XLSX from 'xlsx';
import { TRANSLATION_MAP } from '../src/lib/translationMap';

const filePath = path.join(__dirname, '../results-ir00.xls');
const workbook = XLSX.read(fs.readFileSync(filePath), { type: 'buffer' });
const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];
const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];

console.log("Mock Parsing Margins...");

let currentRegion = "";
let currentTech = "";

function translate(text: string): string {
    const trimmed = text.trim();
    return TRANSLATION_MAP[trimmed] || trimmed;
}

for (let i = 0; i < data.length; i++) {
    const row = data[i];
    const rawLabel = row && row[0] ? String(row[0]).trim() : "";
    if (!rawLabel) continue;

    const label = translate(rawLabel);

    if (label.includes("Margin breakdown")) {
        console.log(`[Header] Found at ${i}: ${label} -> Region set.`);
        if (label.includes("USA")) currentRegion = "usa";
        else if (label.includes("Asia")) currentRegion = "asia";
        else if (label.includes("Europe")) currentRegion = "europe";
    }

    if (label.startsWith("Tech")) {
        console.log(`[Tech] Found at ${i}: ${label} (Region: ${currentRegion})`);
        currentTech = label;
    }

    if (label === "Sales revenue") {
        console.log(`[Data] Found Sales at ${i}. Region: ${currentRegion}, Tech: ${currentTech}`);
        // Check formatting of value for Team 1 (Column 1)
        const val = row[1];
        console.log(`   Value Team 1: ${val} (Type: ${typeof val})`);
    }
}
