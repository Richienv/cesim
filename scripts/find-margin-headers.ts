
import * as fs from 'fs';
import * as path from 'path';
import * as XLSX from 'xlsx';

const filePath = path.join(__dirname, '../results-ir00.xls');

if (!fs.existsSync(filePath)) {
    console.error(`File not found: ${filePath}`);
    process.exit(1);
}

const workbook = XLSX.read(fs.readFileSync(filePath), { type: 'buffer' });
const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];
const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];

console.log("Searching for Margin related rows...");

for (let i = 0; i < data.length; i++) {
    const row = data[i];
    const label = row && row[0] ? String(row[0]).trim() : "";

    // Look for anything that might be the start of the margin section
    if (label.includes("Margin") || label.includes("利润") || label.includes("breakdown") || label.includes("Report")) {
        console.log(`[Found] Row ${i}: ${label}`);
        // Print next few lines to verify context
        for (let j = 1; j <= 5; j++) {
            if (i + j < data.length) {
                const nextRow = data[i + j];
                console.log(`    +${j}: ${nextRow && nextRow[0]}`);
            }
        }
    }
}
