# Upload Processing Fix Plan - Detailed Audit

## Goal
Ensure **ALL** address and entity data from uploaded files is correctly validated and stored.

## Findings

After a comprehensive audit of `schema.sql`, `page.tsx` (UI), `transaction.ts` (validator), and `server-actions.ts` (DB insert), I found the following gaps:

| Field | Database Column | UI Status (`REQUIRED_FIELDS`) | Validator Status (`TransactionSchema`) | Payload Status (`server-actions.ts`) | Action Required |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Address Line 1** | `entity_adr1` | **MISSING** | **MISSING** | **MISSING** | Add `Tran_Adr1` to Config, Validator, and Payload. |
| **Address Line 2** | `entity_adr2` | **MISSING** | **MISSING** | **MISSING** | Add `Tran_Adr2` to Config, Validator, and Payload. |
| **City** | `entity_city` | Present (`Tran_City`) | Present | Present | None (OK) |
| **State** | `entity_state` | Present (`Tran_State`) | Present | Present | None (OK) |
| **Zip** | `entity_zip` | Present (`Tran_Zip4`) | Present | Present | None (OK) |
| **Employer** | `contributor_employer` | Present (`Tran_Emp`) | Present | Present | None (OK) |
| **Occupation** | `contributor_occupation` | Present (`Tran_Occ`) | Present | Present | None (OK) |

**Conclusion:** The critical missing pieces are `Tran_Adr1` and `Tran_Adr2`. All other standard fields (City, State, Zip, Employer, Occupation) are correctly configured.

## Proposed Changes

### 1. Update `src/app/dashboard/upload/page.tsx`
-   **Add to `REQUIRED_FIELDS`**:
    -   `Tran_Adr1` (Address Line 1)
    -   `Tran_Adr2` (Address Line 2)
-   **Update `handleSubmit` payload**:
    -   Map `entity_adr1: row.Tran_Adr1`
    -   Map `entity_adr2: row.Tran_Adr2`

### 2. Update `src/lib/validators/transaction.ts`
-   **Add to `TransactionSchema`**:
    -   `Tran_Adr1` (Optional string)
    -   `Tran_Adr2` (Optional string)

### 3. Verification
-   Review code changes.
-   Run type check.
