
import * as fs from 'fs';
import * as path from 'path';
import * as XLSX from 'xlsx';

const filePath = path.join(__dirname, '../results-ir00.xls');
const workbook = XLSX.read(fs.readFileSync(filePath), { type: 'buffer' });
const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];
const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];

console.log("Checking Margin Layout...");

// Find row with "Margin breakdown ... USA"
let startRow = -1;
for (let i = 0; i < data.length; i++) {
    if (String(data[i][0]).includes("边际收益明细") && String(data[i][0]).includes("美国")) {
        startRow = i;
        break;
    }
}

if (startRow !== -1) {
    // Print next 50 rows
    for (let i = startRow; i < startRow + 50; i++) {
        const row = data[i];
        const label = row[0];
        const col1 = row[1];
        const col2 = row[2];
        console.log(`Row ${i}: [${label}] | ${col1} | ${col2}`);
    }
} else {
    console.log("Margin section not found");
}
