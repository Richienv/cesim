import * as fs from 'fs';
import * as path from 'path';
import * as XLSX from 'xlsx';

const filePath = path.join(process.cwd(), 'public/data/results-pr03.xls');

try {
    const fileBuffer = fs.readFileSync(filePath);
    const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];

    console.log("Searching for Income Statement rows...");
    let inIncomeStatement = false;
    let printedCount = 0;

    for (let i = 0; i < data.length; i++) {
        const row = data[i];
        const label = row[0] ? String(row[0]).trim() : "";

        if (label.toLowerCase().includes("income statement")) {
            console.log(`Found Income Statement at row ${i} `);
            inIncomeStatement = true;
            continue;
        }

        if (inIncomeStatement) {
            // Stop if we hit another section (usually empty row or new header)
            // But Cesim data might have empty rows.
            // Let's just print the next 30 non-empty labels.
            if (label) {
                console.log(`Row ${i}: ${label}`);
                printedCount++;
            }
            if (printedCount > 20) break;
        }
    }

} catch (error) {
    console.error("Error running script:", error);
}
