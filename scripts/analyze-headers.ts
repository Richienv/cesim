
import * as XLSX from 'xlsx';
import * as fs from 'fs';
import * as path from 'path';

const filePath = path.join(process.cwd(), '../results-pr03.xls');

try {
    const fileBuffer = fs.readFileSync(filePath);
    const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];

    const headers = new Set<string>();
    const sections: { header: string, row: number }[] = [];

    data.forEach((row, index) => {
        if (row && row[0] && typeof row[0] === 'string') {
            const label = row[0].trim();
            if (label) {
                headers.add(label);
                // Detect potential section headers (usually uppercase or specific format, but let's just capture everything for now)
                // We can filter interesting ones.
                if (label.includes('Statement') || label.includes('report') || label.includes('details')) {
                    sections.push({ header: label, row: index });
                }
            }
        }
    });

    console.log("=== SECTIONS FOUND ===");
    sections.forEach(s => console.log(`${s.row}: ${s.header}`));

    console.log("\n=== ALL UNIQUE HEADERS (First 100) ===");
    Array.from(headers).slice(0, 100).forEach(h => console.log(h));

} catch (error) {
    console.error("Error reading file:", error);
}
