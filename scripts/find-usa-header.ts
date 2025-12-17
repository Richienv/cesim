
import * as fs from 'fs';
import * as path from 'path';
import * as XLSX from 'xlsx';

const filePath = path.join(__dirname, '../results-ir00.xls');
const workbook = XLSX.read(fs.readFileSync(filePath), { type: 'buffer' });
const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];
const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];

console.log("Searching for USA Margin Header...");

for (let i = 0; i < data.length; i++) {
    const row = data[i];
    const label = row && row[0] ? String(row[0]).trim() : "";

    if (label.includes("边际") && label.includes("美国")) {
        console.log(`[Found Raw Header] Row ${i}: "${label}"`);
    }
}
