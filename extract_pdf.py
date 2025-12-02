import pypdf
import os

files = [
    "decision-making-guideline.pdf",
    "case-description.pdf"
]

def extract_text(filepath):
    print(f"--- Extracting {filepath} ---")
    try:
        reader = pypdf.PdfReader(filepath)
        text = ""
        for page in reader.pages:
            text += page.extract_text() + "\n"
        
        # Print first 2000 chars to get an idea
        print(text[:2000])
        
        # Search for keywords
        keywords = ["inventory", "stock", "clearance", "end", "loss", "unsold", "R&D", "license", "production"]
        print("\n--- Keyword Search ---")
        for kw in keywords:
            if kw.lower() in text.lower():
                print(f"Found '{kw}'")
                # Find context
                idx = text.lower().find(kw.lower())
                start = max(0, idx - 100)
                end = min(len(text), idx + 100)
                print(f"...{text[start:end].replace(chr(10), ' ')}...")
                
    except Exception as e:
        print(f"Error reading {filepath}: {e}")

for f in files:
    if os.path.exists(f):
        extract_text(f)
    else:
        print(f"File not found: {f}")
