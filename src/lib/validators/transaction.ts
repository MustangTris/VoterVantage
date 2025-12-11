import { z } from "zod"

export const TransactionSchema = z.object({
    // Core Fields
    Filer_NamL: z.string().optional(),
    Filer_ID: z.string().optional(),

    // Entity / Contributor Split Name
    Entity_NamF: z.string().optional(),

    // Transaction Fields
    Entity_Name: z.string().min(1, "Name is required"),
    Amount: z.number(),
    Tran_Date: z.union([z.string(), z.date(), z.number()]).optional().transform((val) => {
        if (!val) return null
        let date: Date
        if (typeof val === 'number') {
            // Excel serial date to JS Date
            // (Serial - 25569) * 86400 * 1000
            // Note: This assumes 1900 date system (standard for PC Excel)
            date = new Date(Math.round((val - 25569) * 86400 * 1000))
        } else {
            date = new Date(val)
        }
        return isNaN(date.getTime()) ? null : date.toISOString()
    }),

    // Detailed Fields
    Tran_City: z.string().optional().nullable(),
    Tran_State: z.string().optional().nullable(),
    Tran_Zip4: z.string().optional().nullable(),
    Tran_Adr1: z.string().optional().nullable(),
    Tran_Adr2: z.string().optional().nullable(),
    Tran_Emp: z.string().optional().nullable(),
    Tran_Occ: z.string().optional().nullable(),
    Rec_Type: z.enum(['CONTRIBUTION', 'EXPENDITURE', 'UNKNOWN']).optional().default('UNKNOWN'),

    // Treasurer Info
    Tres_NamL: z.string().optional().nullable(),
    Tres_NamF: z.string().optional().nullable(),
    Tres_NamT: z.string().optional().nullable(),
    Tres_NamS: z.string().optional().nullable(),
    Tres_Adr1: z.string().optional().nullable(),
    Tres_Adr2: z.string().optional().nullable(),
    Tres_City: z.string().optional().nullable(),
    Tres_ST: z.string().optional().nullable(),
    Tres_ZIP4: z.string().optional().nullable(),

    // Intermediary Info
    Intr_NamL: z.string().optional().nullable(),
    Intr_NamF: z.string().optional().nullable(),
    Intr_NamT: z.string().optional().nullable(),
    Intr_NamS: z.string().optional().nullable(),
    Intr_Adr1: z.string().optional().nullable(),
    Intr_Adr2: z.string().optional().nullable(),
    Intr_City: z.string().optional().nullable(),
    Intr_ST: z.string().optional().nullable(),
    Intr_ZIP4: z.string().optional().nullable(),
    Intr_Emp: z.string().optional().nullable(),
    Intr_Occ: z.string().optional().nullable(),

    // Memo / Admin
    Memo_Code: z.string().optional().nullable(),
    Memo_RefNo: z.string().optional().nullable(),
    Tran_ID: z.string().optional().nullable(), // External ID
})

export type Transaction = z.infer<typeof TransactionSchema>

// Helper to clean raw CSV rows before Zod validation
export const cleanRow = (row: any): any => {
    const amountRaw = row['Amount'] || row['Amount Received'] || row['Amount Paid'] || '0'
    let amountClean: number | null = 0

    try {
        if (typeof amountRaw === 'number') {
            amountClean = amountRaw
        } else {
            // Safe string conversion before replace
            const strVal = String(amountRaw || "").replace(/[^0-9.-]+/g, "")
            amountClean = strVal ? parseFloat(strVal) : 0
        }
    } catch (e) {
        amountClean = 0
    }

    return {
        ...row,
        Amount: (amountClean === null || isNaN(amountClean)) ? 0 : amountClean, // Ensure number
        Entity_Name: row['Entity_Name'] || row['Entity Name'] || row['Payee'] || row['Contributor'] || row['Name'] || "Unknown Entity",
    }
}
