
import * as XLSX from 'xlsx';
import * as fs from 'fs';
import * as path from 'path';

const filePath = path.join(process.cwd(), '../results-pr03.xls');

try {
    const fileBuffer = fs.readFileSync(filePath);
    const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as any[][];

    let headerRow: any[] = [];
    let revenueRow: any[] = [];

    data.forEach((row, index) => {
        const label = row[0] ? String(row[0]).trim() : "";

        if (label === "Team") {
            headerRow = row;
            console.log(`[${index}] Header Row: ${row.length} columns`);
            console.log(row.join(", "));
        }

        if (label === "Sales revenue") {
            revenueRow = row;
            console.log(`[${index}] Revenue Row: ${row.length} columns`);
            console.log(row.join(", "));
        }
    });

} catch (error) {
    console.error("Error:", error);
}
