import fs from 'fs';
import path from 'path';
import { parseCesimData } from '../src/lib/parser';

const dataDir = path.join(process.cwd(), 'public/data');
const files = fs.readdirSync(dataDir).filter(f => f.endsWith('.xls'));

files.forEach(file => {
    console.log(`\nTesting ${file}...`);
    const buffer = fs.readFileSync(path.join(dataDir, file));
    try {
        const result = parseCesimData(buffer as unknown as ArrayBuffer);
        console.log(`Round: ${result.roundName}`);
        console.log(`Teams found: ${result.teams.length}`);
        if (result.teams.length > 0) {
            console.log("Sample Team:", result.teams[0].name);
            console.log("Revenue:", result.teams[0].metrics["Financials"]?.["Sales revenue"]);
            console.log("EBITDA:", result.teams[0].metrics["Financials"]?.["Operating profit before depreciation (EBITDA)"]);
        }
    } catch (error) {
        console.error(`Failed to parse ${file}:`, error);
    }
});
