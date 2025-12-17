
import * as fs from 'fs';
import * as path from 'path';
import * as XLSX from 'xlsx';

const filePath = path.join(__dirname, '../results-ir00.xls');
const workbook = XLSX.read(fs.readFileSync(filePath), { type: 'buffer' });
const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];
const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];

console.log("Dumping Row 811 (Sales revenue) full content:");

const row = data[811];
if (row) {
    row.forEach((cell, idx) => {
        console.log(`Col ${idx}: ${cell}`);
    });
} else {
    console.log("Row 811 is undefined");
}

console.log("\nDumping Row 805 (Sales Profit / Gross Profit):");
const row2 = data[805];
if (row2) {
    row2.forEach((cell, idx) => {
        console.log(`Col ${idx}: ${cell}`);
    });
}

// Search for any numeric value in the margin block (lines 780-900)
console.log("\nSearching for ANY number in Margin block (780-900)...");
let foundNumber = false;
for (let i = 780; i < 900; i++) {
    const r = data[i];
    if (r) {
        for (let j = 1; j < r.length; j++) {
            if (typeof r[j] === 'number') {
                console.log(`Found number at Row ${i} Col ${j}: ${r[j]}`);
                foundNumber = true;
                if (foundNumber) break;
            }
        }
    }
    if (foundNumber) break;
}
