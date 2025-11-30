
import * as XLSX from 'xlsx';
import * as fs from 'fs';
import * as path from 'path';

const filePath = path.join(process.cwd(), '../results-pr03.xls');

try {
    const fileBuffer = fs.readFileSync(filePath);
    const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as any[][];

    console.log("Searching for 'Ratios'...");

    data.forEach((row, index) => {
        const label = row[0] ? String(row[0]).trim() : "";
        if (label.includes("Ratios")) {
            console.log(`\n[${index}] ${label}`);
            // Print next 10 rows
            for (let i = 1; i <= 10; i++) {
                console.log(`    [${index + i}] ${data[index + i]}`);
            }
        }
    });

} catch (error) {
    console.error("Error:", error);
}
