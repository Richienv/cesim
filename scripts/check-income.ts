
import * as XLSX from 'xlsx';
import * as fs from 'fs';
import * as path from 'path';

const filePath = path.join(process.cwd(), '../results-pr03.xls');

try {
    const fileBuffer = fs.readFileSync(filePath);
    const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as any[][];

    data.forEach((row, index) => {
        const label = row[0] ? String(row[0]).trim() : "";
        if (label.includes("Income Statement")) {
            console.log(`\n[${index}] ${label}`);
            // Print next few rows
            for (let i = 1; i <= 3; i++) {
                console.log(`    [${index + i}] ${data[index + i]}`);
            }
        }
    });

} catch (error) {
    console.error("Error:", error);
}
