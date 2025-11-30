
import * as XLSX from 'xlsx';
import * as fs from 'fs';
import * as path from 'path';

const filePath = path.join(process.cwd(), '../results-pr03.xls');

try {
    const fileBuffer = fs.readFileSync(filePath);
    const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as any[][];

    console.log("Scanning for 'Round' in first column...");

    data.forEach((row, index) => {
        const label = row[0] ? String(row[0]).trim() : "";
        if (label.toLowerCase().includes("round")) {
            console.log(`[${index}] ${label}`);
            console.log(`    ${row.slice(0, 5)}...`);
        }
    });

} catch (error) {
    console.error("Error:", error);
}
