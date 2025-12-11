import pool from "@/lib/db";
import { GlassCard, GlassCardContent, GlassCardHeader, GlassCardTitle } from "@/components/ui/glass-card";

export const dynamic = 'force-dynamic';

export default async function TestConnectivityPage() {
    let dbStatus = "Unknown";
    let profiles: any[] = [];
    let errorMsg = "";
    let debugInfo: any = {};

    // Simulate the logic from db.ts to see what we are trying to connect with
    try {
        const originalString = process.env.DATABASE_URL || "";
        const url = new URL(originalString);

        // Logic from db.ts
        if (url.hostname.includes('pooler.supabase.com') && url.port === '5432') {
            url.port = '6543';
        }

        url.searchParams.delete('sslmode');

        debugInfo = {
            host: url.hostname,
            port: url.port,
            user: url.username,
            database: url.pathname.replace('/', ''),
            protocol: url.protocol,
            // Check if password has special chars that might break parsing
            passwordLength: url.password ? url.password.length : 0,
            passwordHasAt: url.password ? url.password.includes('@') : false,
            passwordHasHash: url.password ? url.password.includes('#') : false
        };
    } catch (parseErr: any) {
        debugInfo = { error: "Failed to parse DATABASE_URL", details: parseErr.message };
    }

    try {
        const client = await pool.connect();
        try {
            const res = await client.query('SELECT * FROM profiles ORDER BY created_at DESC LIMIT 5');
            profiles = res.rows;
            dbStatus = "Connected";
        } finally {
            client.release();
        }
    } catch (e: any) {
        dbStatus = "Failed";
        errorMsg = e.message;
        if (e.code) errorMsg += ` (Code: ${e.code})`;
    }

    const envUrl = process.env.DATABASE_URL ? "Set" : "Missing";

    return (
        <div className="min-h-screen bg-slate-950 p-8 text-white">
            <div className="max-w-4xl mx-auto space-y-8">
                <h1 className="text-3xl font-bold">Database Connectivity Test</h1>

                <GlassCard className={dbStatus === 'Connected' ? 'border-green-500/50' : 'border-red-500/50'}>
                    <GlassCardHeader>
                        <GlassCardTitle>Status: <span className={dbStatus === 'Connected' ? 'text-green-400' : 'text-red-400'}>{dbStatus}</span></GlassCardTitle>
                    </GlassCardHeader>
                    <GlassCardContent className="space-y-4">
                        <div>
                            <p>Time Checked: {new Date().toLocaleString()}</p>
                            <p className="text-sm text-slate-400">DATABASE_URL Env: {envUrl}</p>
                            {errorMsg && <p className="text-red-400 font-bold mt-2">Error: {errorMsg}</p>}
                        </div>

                        <div className="bg-black/40 p-4 rounded-md font-mono text-sm space-y-2 border border-white/10">
                            <p className="text-slate-400 border-b border-white/10 pb-2 mb-2">Connection Debug Info</p>
                            <p>Host: <span className="text-blue-300">{debugInfo.host}</span></p>
                            <p>Port: <span className="text-blue-300">{debugInfo.port}</span></p>
                            <p>User: <span className="text-blue-300">{debugInfo.user}</span></p>
                            <p>Database: <span className="text-blue-300">{debugInfo.database}</span></p>
                            {debugInfo.error && <p className="text-red-400">{debugInfo.error}: {debugInfo.details}</p>}
                        </div>
                    </GlassCardContent>
                </GlassCard>

                {profiles.length > 0 && (
                    <div className="space-y-4">
                        <h2 className="text-xl font-semibold">Recent Profiles (Data Check)</h2>
                        <div className="grid gap-4 md:grid-cols-2">
                            {profiles.map(p => (
                                <GlassCard key={p.id}>
                                    <GlassCardContent className="p-4">
                                        <div className="font-bold text-lg">{p.name}</div>
                                        <div className="text-sm text-slate-400">{p.type}</div>
                                        <div className="mt-2 text-sm">{p.description}</div>
                                        <div className="mt-2 text-xs text-slate-500">ID: {p.id}</div>
                                    </GlassCardContent>
                                </GlassCard>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
