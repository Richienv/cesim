
import fs from 'fs';
import path from 'path';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
let pdfFunc = require('pdf-parse');

// Handle potential default export
if (pdfFunc.default) {
    pdfFunc = pdfFunc.default;
}

const files = [
    'decision-making-guideline.pdf',
    'case-description.pdf'
];

async function readPdfs() {
    for (const file of files) {
        const filePath = path.join(process.cwd(), file);
        if (fs.existsSync(filePath)) {
            console.log(`\n==========================================`);
            console.log(`--- Reading ${file} ---`);
            console.log(`==========================================\n`);
            const dataBuffer = fs.readFileSync(filePath);
            try {
                const data = await pdfFunc(dataBuffer);
                console.log(data.text.substring(0, 3000));

                const criteriaRegex = /winning criteria|goal of the simulation|objective/i;
                const match = data.text.match(criteriaRegex);
                if (match) {
                    console.log("\n--- Potential Winning Criteria Section ---");
                    const start = Math.max(0, match.index - 100);
                    const end = Math.min(data.text.length, match.index + 500);
                    console.log(data.text.substring(start, end));
                }

            } catch (e) {
                console.error(`Error parsing ${file}:`, e);
            }
        } else {
            console.log(`File not found: ${filePath}`);
        }
    }
}

readPdfs();
