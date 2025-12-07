import pandas as pd
import pytesseract
import fitz  # PyMuPDF
import os
import re
import io
from PIL import Image
from flask import current_app # Import current_app to access the logger

# --- Configuration ---
# IMPORTANT: Tesseract OCR must be installed on your system for PDF processing.
# Download from: https://tesseract-ocr.github.io/tessdoc/Downloads.html
# After installation, uncomment the line below and set the correct path to your tesseract.exe
# Example for Windows:
pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'

def extract_data_from_xlsx(file_path):
    """
    Extracts contribution and expenditure data from a Form 460 XLSX file.
    """
    current_app.logger.info(f"Processing XLSX file: {file_path}")
    contributions = []
    expenditures = []
    
    contribution_sheets = ['A-Contributions', 'C-Contributions', 'I-Contributions', 'F496P3-Contributions']
    expenditure_sheets = ['F465P3-Expenditure', 'F461P5-Expenditure', 'D-Expenditure', 'G-Expenditure', 'E-Expenditure', 'F-Expenses']

    try:
        xls = pd.ExcelFile(file_path)
    except FileNotFoundError:
        current_app.logger.error(f"Error: File not found at {file_path}")
        return {"contributions": [], "expenditures": []}
    except Exception as e:
        current_app.logger.error(f"Error opening XLSX file {file_path}: {e}")
        return {"contributions": [], "expenditures": []}

    for sheet_name in xls.sheet_names:
        current_app.logger.info(f"Attempting to process sheet: {sheet_name}")
        try:
            df = pd.read_excel(xls, sheet_name=sheet_name)
            current_app.logger.debug(f"Successfully read sheet '{sheet_name}'.")
            
            # Normalize column names to lowercase for easier matching
            try:
                df.columns = [col.lower() for col in df.columns]
                current_app.logger.debug(f"Normalized columns for sheet '{sheet_name}'.")
            except Exception as e:
                current_app.logger.error(f"Error normalizing columns for sheet '{sheet_name}' in {file_path}: {e}", exc_info=True)
                continue # Skip this sheet if columns can't be normalized

            if sheet_name in contribution_sheets:
                current_app.logger.info(f"  Processing contributions sheet: {sheet_name}")
                for index, row in df.iterrows():
                    try:
                        filer_name = row.get('filer_naml', '')
                        first_name = row.get('tran_namf', '')
                        last_name = row.get('tran_naml', '')
                        contribution_amount = row.get('tran_amt1')
                        contribution_date = row.get('tran_date')

                        contributor_name = f"{first_name} {last_name}".strip()
                        
                        current_app.logger.debug(f"    Row {index}: Filer='{filer_name}', Contributor='{contributor_name}', Amount='{contribution_amount}', Date='{contribution_date}'")

                        if not contributor_name or pd.isna(contribution_amount):
                            current_app.logger.debug(f"      Skipping row {index}: Missing contributor name or amount.")
                            continue

                        record = {
                            "filer_name": filer_name,
                            "contributor_name": contributor_name,
                            "contribution_amount": float(contribution_amount) if pd.notna(contribution_amount) else 0.0,
                            "contribution_date": str(contribution_date) if pd.notna(contribution_date) else None,
                            "source_file": os.path.basename(file_path)
                        }
                        current_app.logger.debug(f"      Appending contribution record: {record}")
                        contributions.append(record)
                        current_app.logger.debug(f"      Finished processing row {index} for contributions.")
                    except Exception as e:
                        current_app.logger.error(f"Error processing row {index} in sheet '{sheet_name}' in {file_path}: {e}", exc_info=True)
                        continue # Continue to next row if error occurs
                current_app.logger.info(f"  Finished processing contributions sheet: {sheet_name}")

            elif sheet_name in expenditure_sheets:
                current_app.logger.info(f"  Processing expenditures sheet: {sheet_name}")
                for index, row in df.iterrows():
                    try:
                        filer_name = row.get('filer_naml', '')
                        payee_name_first = row.get('payee_namf', '')
                        payee_name_last = row.get('payee_naml', '')
                        
                        # Handle different amount columns for expenditures
                        expenditure_amount = row.get('amount') # Common for F461P5, D, G, E
                        if pd.isna(expenditure_amount): # Fallback for F-Expenses
                            expenditure_amount = row.get('amt_paid')

                        # Handle different date columns for expenditures
                        expenditure_date = row.get('expn_date') # Common for F461P5, D, G, E
                        if pd.isna(expenditure_date): # Fallback for F-Expenses
                            expenditure_date = row.get('rpt_date')

                        expenditure_description = row.get('expn_dscr', '')
                        if not expenditure_description: # Fallback for other description columns
                            expenditure_description = row.get('tran_dscr', '')

                        payee_name = f"{payee_name_first} {payee_name_last}".strip()

                        current_app.logger.debug(f"      Extracted: Filer='{filer_name}', Payee='{payee_name}', Amount='{expenditure_amount}', Date='{expenditure_date}', Description='{expenditure_description}'")

                        if not payee_name or pd.isna(expenditure_amount):
                            current_app.logger.debug(f"      Skipping row {index}: Missing payee name or amount.")
                            continue

                        record = {
                            "filer_name": filer_name,
                            "payee_name": payee_name,
                            "expenditure_amount": float(expenditure_amount) if pd.notna(expenditure_amount) else 0.0,
                            "expenditure_date": str(expenditure_date) if pd.notna(expenditure_date) else None,
                            "expenditure_description": expenditure_description,
                            "source_file": os.path.basename(file_path)
                        }
                        current_app.logger.debug(f"      Appending expenditure record: {record}")
                        expenditures.append(record)
                        current_app.logger.debug(f"      Finished processing row {index} for expenditures.")
                    except Exception as e:
                        current_app.logger.error(f"Error processing row {index} in sheet '{sheet_name}' in {file_path}: {e}", exc_info=True)
                        continue # Continue to next row if error occurs
                current_app.logger.info(f"  Finished processing expenditures sheet: {sheet_name}")
            else:
                current_app.logger.info(f"  Skipping unknown sheet: {sheet_name}")

        except Exception as e:
            current_app.logger.error(f"Error processing sheet '{sheet_name}' in {file_path}: {e}", exc_info=True) # exc_info=True to log traceback

    current_app.logger.info(f"  Extracted {len(contributions)} contribution records and {len(expenditures)} expenditure records.")
    return {"contributions": contributions, "expenditures": expenditures}

def extract_data_from_pdf(file_path):
    """
    Extracts data from a general Form 460 PDF file using OCR.
    This version includes date extraction.
    """
    current_app.logger.info(f"Processing PDF file with OCR: {file_path}")
    contributions = []
    expenditures = []
    filer_name = "Unknown Filer"

    try:
        doc = fitz.open(file_path)
    except Exception as e:
        current_app.logger.error(f"Error opening PDF {file_path}: {e}")
        return {"contributions": [], "expenditures": []}

    # Regex to find amounts and dates
    amount_regex = re.compile(r'[\$]?\s*(\d{1,3}(?:,\d{3})*\.\d{2})')
    date_regex = re.compile(r'(\d{1,2}/\d{1,2}/\d{2,4})')

    full_text = ""
    for page_num in range(doc.page_count):
        page = doc.load_page(page_num)
        try:
            # Use a higher DPI for better OCR accuracy
            pix = page.get_pixmap(dpi=300)
            img_bytes = pix.tobytes("png")
            full_text += pytesseract.image_to_string(Image.open(io.BytesIO(img_bytes)))
        except Exception as ocr_error:
            current_app.logger.error(f"Could not perform OCR on page {page_num + 1}: {ocr_error}")

    doc.close()

    lines = full_text.split('\n')
    current_schedule = None
    info_buffer = []

    # First pass to find the filer name
    for i, line in enumerate(lines):
        if "NAME OF FILER" in line.upper():
            # Look for the name on the next non-empty line
            for next_line in lines[i+1:]:
                if next_line.strip():
                    filer_name = next_line.strip()
                    current_app.logger.info(f"  Found Filer Name: {filer_name}")
                    break
            break

    # Second pass for data extraction
    for line in lines:
        line_upper = line.upper()
        if "SCHEDULE A" in line_upper or "SCHEDULE C" in line_upper:
            current_schedule = 'CONTRIBUTION'
            info_buffer = []
            continue
        if "SCHEDULE E" in line_upper:
            current_schedule = 'EXPENDITURE'
            info_buffer = []
            continue
        if "SUMMARY PAGE" in line_upper:
            current_schedule = None
            info_buffer = []
            continue

        if not current_schedule:
            continue

        # Check if the line contains a final amount, indicating end of a record
        match = amount_regex.search(line)
        if match:
            amount = float(match.group(1).replace(',', ''))
            
            # Combine the buffer and current line to find all info
            full_record_text = " ".join(info_buffer) + " " + line
            
            # Find date
            date_match = date_regex.search(full_record_text)
            found_date = date_match.group(1) if date_match else None

            # The rest of the line is the description
            description = amount_regex.sub('', line).strip()

            if not info_buffer:
                continue

            name = info_buffer[0]

            record = {
                "filer_name": filer_name,
                "contribution_amount": amount if current_schedule == 'CONTRIBUTION' else None,
                "expenditure_amount": amount if current_schedule == 'EXPENDITURE' else None,
                "contributor_name": name if current_schedule == 'CONTRIBUTION' else None,
                "payee_name": name if current_schedule == 'EXPENDITURE' else None,
                "expenditure_description": description,
                "contribution_date": found_date if current_schedule == 'CONTRIBUTION' else None,
                "expenditure_date": found_date if current_schedule == 'EXPENDITURE' else None,
                "source_file": os.path.basename(file_path)
            }
            
            record = {k: v for k, v in record.items() if v is not None}

            if current_schedule == 'CONTRIBUTION':
                contributions.append(record)
            elif current_schedule == 'EXPENDITURE':
                expenditures.append(record)
            
            info_buffer = [] # Reset for the next record
        else:
            # If it's not an amount line, add its text to the buffer
            if line.strip():
                info_buffer.append(line.strip())

    current_app.logger.info(f"  Extracted {len(contributions)} contributions and {len(expenditures)} expenditures from PDF.")
    return {"contributions": contributions, "expenditures": expenditures}

def process_uploaded_file(file_path):
    current_app.logger.debug(f"[DEBUG] Entering process_uploaded_file for: {file_path}")
    """
    Determines the file type and calls the appropriate extraction function.
    """
    _, file_extension = os.path.splitext(file_path)

    if file_extension.lower() == '.xlsx':
        return extract_data_from_xlsx(file_path)
    elif file_extension.lower() == '.pdf':
        return extract_data_from_pdf(file_path)
    else:
        current_app.logger.warning(f"Unsupported file type: {file_extension}")
        return None