# Data Upload Guide

This guide explains how to upload Campaign Finance data (Form 460) into VoterVantage.

## Supported Formats
- **CSV / Excel (.csv, .xlsx)**: For bulk data import of transactions.
- **PDF (.pdf)**: For archiving original Form 460 documents (data is not automatically extracted yet).

## CSV/Excel Column Requirements
To ensure your data is correctly imported, your spreadsheet should have the following headers (case-insensitive, but exact matches preferred):

### Filer Information (Required on every row)
- `Filer_NamL` or `Filer Name`: The name of the politician or committee.
- `Filer_ID`: State/City ID.
- `Filer_City`: City of the filer.
- `Committee_Type`: E.g., "Recipient Committee" or "Controlled Committee".

### Transaction Details
- `Tran_NamF`, `Tran_NamL` (or `Name`, `Payee`, `Contributor`): Name of the donor or recipient.
- `Amount`: Transaction amount.
- `Tran_Date` (or `Date`): Date of transaction (YYYY-MM-DD).
- `Rec_Type` (or `Type`): "CONTRIBUTION" or "EXPENDITURE".
- `Description` (or `Memo`, `Tran_Dscr`): Description of the transaction.

### Entity Details (Optional but Recommended)
- `Tran_City`: City of the donor/payee.
- `Tran_State`: State.
- `Tran_Zip4`: Zip code.
- `Tran_Emp`: Employer.
- `Tran_Occ`: Occupation.

## How to Upload
1.  Navigate to the **Dashboard**.
2.  Click on **Upload Filing**.
3.  Drag and drop your file or click to select.
4.  For Spreadsheets: Review the parsed data table. Is the data correct?
5.  Click **Review & Submit**.

## Sample File
You can download a [sample_filing.csv](/sample_filing.csv) to use as a template.
