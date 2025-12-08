
import pandas as pd
import pypdf
import sys
import os

def analyze_excel(path):
    print(f"--- Analyzing Excel: {os.path.basename(path)} ---")
    try:
        xls = pd.ExcelFile(path)
        print("Sheet Names:", xls.sheet_names)
        for sheet in xls.sheet_names:
            print(f"\nSheet: {sheet}")
            df = pd.read_excel(xls, sheet_name=sheet, nrows=5)
            print("Columns:", list(df.columns))
            print("First row sample:", df.iloc[0].to_dict() if not df.empty else "Empty")
    except Exception as e:
        print(f"Error reading Excel: {e}")

def analyze_pdf(path):
    print(f"--- Analyzing PDF: {os.path.basename(path)} ---")
    try:
        reader = pypdf.PdfReader(path)
        print(f"Pages: {len(reader.pages)}")
        # Extract text from first few pages to identify form type and key fields
        for i in range(min(3, len(reader.pages))):
            print(f"\n--- Page {i+1} Text Sample ---")
            text = reader.pages[i].extract_text()
            print(text[:500] + "..." if len(text) > 500 else text)
    except Exception as e:
        print(f"Error reading PDF: {e}")

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: py analyze_docs.py <excel_path> <pdf_path>")
        sys.exit(1)
    
    excel_path = sys.argv[1]
    pdf_path = sys.argv[2]
    
    analyze_excel(excel_path)
    print("\n" + "="*50 + "\n")
    analyze_pdf(pdf_path)
