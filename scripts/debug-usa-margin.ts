
import * as fs from 'fs';
import * as path from 'path';
import * as XLSX from 'xlsx';
import { TRANSLATION_MAP } from '../src/lib/translationMap';

const filePath = path.join(__dirname, '../results-ir00.xls');
const workbook = XLSX.read(fs.readFileSync(filePath), { type: 'buffer' });
const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];
const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];

console.log("Mock Parsing USA Margin Section...");

function translate(text: string): string {
    const trimmed = text.trim();
    return TRANSLATION_MAP[trimmed] || trimmed;
}

let region = "";
let tech = "";

for (let i = 770; i < 820; i++) {
    const row = data[i];
    const rawLabel = row && row[0] ? String(row[0]).trim() : "";

    const label = translate(rawLabel);

    let info = "";
    if (label.includes("Margin breakdown")) {
        info = " [HEADER MATCH]";
        if (label.includes("USA")) region = "usa";
    }
    if (label.startsWith("Tech")) {
        info = " [TECH MATCH]";
        tech = label;
    }
    if (label === "Sales revenue") {
        info = " [SALES MATCH]";
        const val = row[1]; // Team 1 value
        info += ` Val: ${val} (${typeof val})`;
    }

    console.log(`Row ${i} | Raw: "${rawLabel}" | Trans: "${label}" | Region: ${region} Tech: ${tech} ${info}`);
}
