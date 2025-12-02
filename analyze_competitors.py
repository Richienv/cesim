import pandas as pd
import os
import glob

files = [
    "public/data/results-pr01 (2).xls",
    "public/data/results-pr02 (2).xls",
    "public/data/results-pr03.xls"
]

def analyze_file(filepath):
    print(f"--- Analyzing {os.path.basename(filepath)} ---")
    try:
        # Read all sheets to find relevant data
        xls = pd.ExcelFile(filepath)
        print("Sheets:", xls.sheet_names)
        
        # Heuristic: Look for a sheet with 'Results' or 'Decisions' or similar
        # Since I don't know the exact structure, I'll try to read the first sheet or search for keywords
        # Assuming standard Cesim export, there might be a 'decisions' or 'market' sheet.
        
        # Let's try to find a sheet with team names (e.g. "Pink")
        for sheet in xls.sheet_names:
            df = pd.read_excel(xls, sheet_name=sheet)
            # Convert to string to search
            df_str = df.to_string()
            if "Pink" in df_str:
                print(f"Found 'Pink' in sheet: {sheet}")
                # Try to extract row with Pink
                # This is a bit blind, so I'll just print a snippet if found
                # Or better, look for "Price" and "Marketing" columns if possible
                
                # Let's just print the first few rows of the sheet where Pink is found
                print(df.head(10).to_string())
                
                # Try to find the row index for Pink
                pink_rows = df[df.apply(lambda row: row.astype(str).str.contains('Pink', case=False).any(), axis=1)]
                if not pink_rows.empty:
                    print("Pink Team Data Snippet:")
                    print(pink_rows.to_string())
                    
    except Exception as e:
        print(f"Error reading {filepath}: {e}")

for f in files:
    if os.path.exists(f):
        analyze_file(f)
    else:
        print(f"File not found: {f}")
