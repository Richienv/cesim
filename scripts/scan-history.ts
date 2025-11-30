
import * as XLSX from 'xlsx';
import * as fs from 'fs';
import * as path from 'path';

const filePath = path.join(process.cwd(), '../results-pr03.xls');

try {
    const fileBuffer = fs.readFileSync(filePath);
    const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as any[][];

    console.log("Scanning for history/trend keywords...");

    const keywords = ["round", "history", "trend", "previous", "cumulative"];

    data.forEach((row, index) => {
        const label = row[0] ? String(row[0]).trim().toLowerCase() : "";
        if (keywords.some(k => label.includes(k))) {
            console.log(`[${index}] ${row[0]}`);
            // Print next row to see if it looks like data
            if (data[index + 1]) console.log(`    Next: ${data[index + 1].slice(0, 5)}...`);
        }
    });

} catch (error) {
    console.error("Error:", error);
}
