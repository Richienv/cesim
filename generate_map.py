import csv
import json

csv_path = '/Volumes/Extreme SSD/cesim-data-anlayze/cesim-app/eng-china.csv'
ts_path = '/Volumes/Extreme SSD/cesim-data-anlayze/cesim-app/src/lib/translationMap.ts'

translation_map = {}

try:
    with open(csv_path, 'r', encoding='utf-8') as f:
        reader = csv.reader(f)
        next(reader) # Skip header
        for row in reader:
            if len(row) >= 2:
                english = row[0].strip()
                chinese = row[1].strip()
                if chinese and english:
                    translation_map[chinese] = english

    ts_content = "export const TRANSLATION_MAP: Record<string, string> = {\n"
    for cn, en in translation_map.items():
        # Escape quotes in keys and values
        cn_esc = cn.replace('"', '\\"')
        en_esc = en.replace('"', '\\"')
        ts_content += f'    "{cn_esc}": "{en_esc}",\n'
    ts_content += "};\n"

    with open(ts_path, 'w', encoding='utf-8') as f:
        f.write(ts_content)

    print(f"Successfully generated {ts_path} with {len(translation_map)} entries.")

except Exception as e:
    print(f"Error: {e}")
