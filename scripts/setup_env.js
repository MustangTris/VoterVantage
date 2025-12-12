const readline = require('readline');
const fs = require('fs');
const path = require('path');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const questions = [
    { key: 'NEXT_PUBLIC_SUPABASE_URL', question: 'Enter your Supabase URL (e.g., https://xyz.supabase.co): ' },
    { key: 'NEXT_PUBLIC_SUPABASE_ANON_KEY', question: 'Enter your Supabase Anon Key: ' },
    { key: 'SUPABASE_SERVICE_ROLE_KEY', question: 'Enter your Supabase Service Role Key: ' },
    { key: 'DB_PASSWORD', question: 'Enter your Database Password (to generate connection string): ' }
];

const answers = {};

function ask(index) {
    if (index === questions.length) {
        saveEnv();
        return;
    }

    rl.question(questions[index].question, (answer) => {
        answers[questions[index].key] = answer.trim();
        ask(index + 1);
    });
}

function saveEnv() {
    console.log('\nGenerating configuration...');

    // Extract Project ID from URL
    // URL: https://<project-id>.supabase.co
    const urlParts = answers['NEXT_PUBLIC_SUPABASE_URL'].split('.');
    let projectId = '';
    if (urlParts.length > 0) {
        // Handle https:// prefix
        const firstPart = urlParts[0];
        projectId = firstPart.replace('https://', '').replace('http://', '');
    }

    if (!projectId) {
        console.error('Error: Could not extract project ID from URL.');
        process.exit(1);
    }

    // specific handling for password containing special characters if needed, 
    // but basic encoding is safer
    const password = encodeURIComponent(answers['DB_PASSWORD']);
    const connectionString = `postgresql://postgres:${password}@db.${projectId}.supabase.co:5432/postgres`;

    const envContent = `
# Database (US East 1)
DATABASE_URL="${connectionString}"

# Authentication (Supabase)
NEXT_PUBLIC_SUPABASE_URL="${answers['NEXT_PUBLIC_SUPABASE_URL']}"
NEXT_PUBLIC_SUPABASE_ANON_KEY="${answers['NEXT_PUBLIC_SUPABASE_ANON_KEY']}"
SUPABASE_SERVICE_ROLE_KEY="${answers['SUPABASE_SERVICE_ROLE_KEY']}"

# NextAuth (Generated)
AUTH_SECRET="${require('crypto').randomBytes(32).toString('hex')}"
    `.trim();

    const envPath = path.resolve(process.cwd(), '.env.local');
    fs.writeFileSync(envPath, envContent);

    console.log(`\nSuccess! Configuration written to ${envPath}`);
    console.log('You can now run: node scripts/init_db.js');
    rl.close();
}

console.log("--- Supabase Environment Setup ---");
ask(0);
