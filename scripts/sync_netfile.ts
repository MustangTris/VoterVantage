
import { config } from 'dotenv';
import path from 'path';
config({ path: path.resolve(process.cwd(), '.env.local') });

import { NetFileClient } from '../src/lib/netfile/client';
import { AGENCIES } from '../src/config/agencies';
import pool from '../src/lib/db';
import { createFilingHeader, finalizeFiling, importTransactionBatch } from '../src/app/dashboard/upload/server-actions';

// Mock Server Action Context if needed, or direct DB calls?
// server-actions usually expect Next.js context or auth. 
// For this script, we might need to bypass auth checks or mock them.
// Actually, server-actions imported here might require 'use server' context which doesn't work in standalone scripts easily.
// BETTER APPROACH for Script: Direct DB calls or Refactored Logic.
// Let's use Direct DB calls for simpler scaffold, mimicking the server action logic.

async function syncNetFile(mockMode: boolean = false) {
    const client = new NetFileClient({ vendorId: mockMode ? undefined : process.env.NETFILE_VENDOR_ID });

    console.log(`[Sync] Starting NetFile Sync (MockMode: ${mockMode})...`);
    console.log(`[Sync] Found ${AGENCIES.filter(a => a.enabled).length} enabled agencies.`);

    const db = await pool.connect();

    try {
        for (const agency of AGENCIES) {
            if (!agency.enabled) continue;

            console.log(`[Sync] Processing Agency: ${agency.name} (${agency.netfileId})`);

            // 1. Ensure Jurisdiction Profile Exists
            // Use SELECT + INSERT to avoid constraint issues if unique index is missing/mismatched
            const { rows: existingAgency } = await db.query("SELECT id FROM profiles WHERE name = $1 AND type = $2", [agency.name, agency.type]);
            if (existingAgency.length === 0) {
                await db.query(`
                    INSERT INTO profiles (name, type, description)
                    VALUES ($1, $2, 'Automatically Synced from NetFile')
                `, [agency.name, agency.type]);
            }

            // 2. Fetch Filings
            const filings = await client.fetchFilings(agency.netfileId, 2024);
            console.log(`[Sync] Found ${filings.length} filings for ${agency.name}`);

            for (const filingData of filings) {
                // Upsert Filing
                // Check if exists by source_file_url (using NetFile ID format)
                const netFileSourceId = `NETFILE:${filingData.id}`;
                let filingId = null;
                const { rows: existingFiling } = await db.query("SELECT id FROM filings WHERE source_file_url = $1", [netFileSourceId]);

                if (existingFiling.length > 0) {
                    filingId = existingFiling[0].id;
                    await db.query(`
                        UPDATE filings SET total_contributions = $1
                        WHERE id = $2
                    `, [filingData.totalContributions, filingId]);
                } else {
                    const { rows: newFiling } = await db.query(`
                        INSERT INTO filings (
                            filer_name, 
                            total_contributions, 
                            status, 
                            source_file_url
                        )
                        VALUES ($1, $2, 'PROCESSED', $3)
                        RETURNING id
                    `, [filingData.filerName, filingData.totalContributions, netFileSourceId]);
                    filingId = newFiling[0].id;
                }

                console.log(`[Sync] Synced Filing: ${filingData.filerName} (ID: ${filingId})`);

                // 3. Link Politician to Jurisdiction (Agency)
                // Check if exists
                const { rows: existingPol } = await db.query("SELECT id FROM profiles WHERE name = $1 AND type = 'POLITICIAN'", [filingData.filerName]);
                if (existingPol.length === 0) {
                    await db.query(`
                        INSERT INTO profiles (name, type, city, description)
                        VALUES ($1, 'POLITICIAN', $2, 'Synced Politician')
                    `, [filingData.filerName, agency.name]);
                } else {
                    await db.query("UPDATE profiles SET city = $1 WHERE id = $2", [agency.name, existingPol[0].id]);
                }

                // 4. Fetch & Sync Transactions
                const transactions = await client.fetchTransactions(filingData.id);
                console.log(`[Sync] Fetching ${transactions.length} transactions...`);

                for (const txn of transactions) {
                    const { rows: existingTxn } = await db.query(
                        "SELECT id FROM transactions WHERE external_id = $1 AND filing_id = $2",
                        [txn.id, filingId]
                    );

                    if (existingTxn.length === 0) {
                        await db.query(`
                            INSERT INTO transactions (
                                filing_id,
                                transaction_type,
                                entity_name,
                                amount,
                                transaction_date,
                                entity_city,
                                entity_state,
                                entity_zip,
                                external_id,
                                description
                            )
                            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'NetFile Sync')
                        `, [
                            filingId,
                            txn.tranType,
                            txn.entityName,
                            txn.amount,
                            txn.date,
                            txn.city,
                            txn.state,
                            txn.zip,
                            txn.id
                        ]);
                    }
                }
            }
        }
        console.log("[Sync] Completed successfully.");
    } catch (err) {
        console.error("[Sync] Error:", err);
        process.exit(1);
    } finally {
        db.release();
        process.exit(0);
    }
}

// simplistic cli arg check
const isMock = process.argv.includes('--mock');
syncNetFile(isMock);
