
/**
 * NetFile API Client
 * 
 * Documentation: https://netfile.com/Connect2/api/swagger/ui/index
 * Note: Requires Vendor ID for production access.
 */

const API_BASE_URL = 'https://netfile.com/Connect2/api/public';

interface NetFileConfig {
    vendorId?: string; // Optional for now (mock mode)
    appId?: string;
}

export class NetFileClient {
    private vendorId: string | undefined;

    constructor(config: NetFileConfig = {}) {
        this.vendorId = config.vendorId || process.env.NETFILE_VENDOR_ID;
    }

    /**
     * Fetch filings for a specific agency and year.
     * In Mock Mode (no vendor ID), returns sample data.
     */
    async fetchFilings(agencyId: string, year: number) {
        if (!this.vendorId) {
            console.warn(`[NetFile] No Vendor ID. Returning MOCK data for agency ${agencyId}.`);
            return this.getMockFilings(agencyId, year);
        }

        // Real API Implementation (Placeholder)
        // const url = `${API_BASE_URL}/filings?AgencyID=${agencyId}&Year=${year}`;
        // ... fetch logic
        throw new Error("Real API access requires Vendor ID. Please contact NetFile.");
    }

    /**
     * Fetch transactions for a specific filing.
     */
    async fetchTransactions(filingId: string) {
        if (!this.vendorId) {
            return this.getMockTransactions(filingId);
        }
        throw new Error("Real API access requires Vendor ID.");
    }

    // --- MOCK DATA GENERATORS ---

    private getMockFilings(agencyId: string, year: number) {
        return [
            {
                id: `mock_filing_${agencyId}_1`,
                filerName: "Committee to Elect Mock Candidate",
                formType: "460",
                filingDate: new Date().toISOString(),
                periodStart: `${year}-01-01`,
                periodEnd: `${year}-06-30`,
                totalContributions: 50000,
                agencyId: agencyId
            },
            {
                id: `mock_filing_${agencyId}_2`,
                filerName: "Mock Ballot Measure Committee",
                formType: "460",
                filingDate: new Date().toISOString(),
                periodStart: `${year}-01-01`,
                periodEnd: `${year}-06-30`,
                totalContributions: 125000,
                agencyId: agencyId
            }
        ];
    }

    private getMockTransactions(filingId: string) {
        // Generate random mock transactions
        return Array.from({ length: 5 }).map((_, i) => ({
            id: `txn_${filingId}_${i}`,
            filingId: filingId,
            tranType: 'CONTRIBUTION',
            entityName: `Donor ${i + 1}`,
            amount: Math.floor(Math.random() * 1000) + 100,
            date: new Date().toISOString(),
            city: 'Riverside',
            state: 'CA',
            zip: '92501'
        }));
    }
}
