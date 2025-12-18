
import * as XLSX from 'xlsx';
import * as fs from 'fs';
import * as path from 'path';

const searchTeam = "行之队";
const files = fs.readdirSync('.').filter(f => f.endsWith('.xls'));
const publicFiles = fs.existsSync('./public/data') ? fs.readdirSync('./public/data').filter(f => f.endsWith('.xls')).map(f => path.join('public/data', f)) : [];
const allFiles = [...files, ...publicFiles];

console.log(`Scanning ${allFiles.length} files for team '${searchTeam}'...`);

allFiles.forEach(f => {
    try {
        const wb = XLSX.read(fs.readFileSync(f));
        const data = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { header: 1 }) as any[][];
        for (let i = 0; i < 20; i++) { // Check first 20 rows
            if (data[i]) {
                const found = data[i].some(c => String(c).trim() === searchTeam);
                if (found) {
                    console.log(`[FOUND] Team '${searchTeam}' found in file: ${f}`);
                    return;
                }
            }
        }
    } catch (e: any) {
        console.log(`Error reading ${f}: ${e.message}`);
    }
});
