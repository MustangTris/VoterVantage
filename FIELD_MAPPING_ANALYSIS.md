# Excel Data Coverage Analysis

I have analyzed `Indio 2024.xlsx` and compared it with your current database schema and upload logic.

## 🚨 Status: Significant Data Gaps Identified

We are currently only importing about **30%** of the available data. While we capture the "Core" transaction info (Who, Amount, When), we are ignoring detailed compliance data that is present in the file and often required for full reporting.

### 1. Missing "Summary" Sheet Data
The Excel file contains a `Summary` sheet with official report totals and dates.
-   **Excel Fields:** `From_Date`, `Thru_Date`, `Amount_A` (Total Contributions), `Amount_B` (Total Expenditures).
-   **Current State:** IGNORED. We currently calculate totals from raw rows, but we don't store the official reporting period dates or verified totals from the summary page.

### 2. Missing Transaction Details (Schedule A & E)
Your database `transactions` table actually has columns for these, but the **Upload Page** does not map them.

| Data Group | Excel Columns | Database Schema Status | Upload Mapping Status |
| :--- | :--- | :--- | :--- |
| **Treasurer Info** | `Tres_Nam*`, `Tres_Adr*`, `Tres_City`, etc. | ✅ Columns Exist | ❌ **IGNORED** |
| **Intermediary** | `Intr_Nam*`, `Intr_Adr*`, `Intr_Emp` | ✅ Columns Exist | ❌ **IGNORED** |
| **Memo / Refs** | `Memo_Code`, `Memo_RefNo`, `XRef_Match` | ✅ Columns Exist | ❌ **IGNORED** |
| **Loans** | `Loan_Amt*`, `Loan_Rate` | ❌ No Columns | ❌ **IGNORED** |

### 3. Recommendation

To make the database "complete" for a single data point, we should at least map the **Treasurer** and **Memo** fields, as these are standard for committee transactions.

#### Proposed Action Plan
1.  **Expand `REQUIRED_FIELDS`**: Add mappings for Treasurer (`Tres_NamL`, etc.) and Memos.
2.  **Update Validator**: Allow these new fields in `transaction.ts`.
3.  **Update Server Action**: Pass these values to the `transactions` table (columns already exist).
4.  **(Optional) Summary Handling**: Add logic to parse the `Summary` sheet to populate `report_period_start` and `report_period_end` in the `filings` table.
