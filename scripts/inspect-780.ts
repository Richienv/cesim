
import * as fs from 'fs';
import * as path from 'path';
import * as XLSX from 'xlsx';

const filePath = path.join(__dirname, '../results-ir00.xls');
const workbook = XLSX.read(fs.readFileSync(filePath), { type: 'buffer' });
const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];
const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];

console.log("Inspecting Row 780 Context...");
for (let i = 770; i < 790; i++) {
    const row = data[i];
    console.log(`Row ${i}: [${row && row[0]}] Val: ${row && row[1]}`);
}
