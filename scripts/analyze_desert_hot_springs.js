const XLSX = require('xlsx');
const path = require('path');

const FILE_PATH = String.raw`C:\Users\trist\OneDrive\Documents\Career\sIDE hUSTLES\Non Profit\Cities_Recovery\Cities\Desert Hot Springs\2024.xlsx`;

console.log('Analyzing file:', FILE_PATH);

try {
    const workbook = XLSX.readFile(FILE_PATH);

    console.log('\n=== SHEET ANALYSIS ===\n');
    console.log(`Total sheets: ${workbook.SheetNames.length}`);

    workbook.SheetNames.forEach((sheetName, idx) => {
        console.log(`\n${'='.repeat(80)}`);
        console.log(`SHEET ${idx + 1}: ${sheetName}`);
        console.log('='.repeat(80));

        const sheet = workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json(sheet, { defval: "" });

        if (data.length === 0) {
            console.log('⚠️  EMPTY SHEET - No data rows');
            return;
        }

        // Get headers
        const headers = Object.keys(data[0]);
        console.log(`\nRow count: ${data.length}`);
        console.log(`Column count: ${headers.length}`);

        // Check for key fields
        const keyFields = {
            'Filer_NamL': headers.find(h => h.toLowerCase().includes('filer') && h.toLowerCase().includes('nam')),
            'Entity_Name': headers.find(h => h.toLowerCase().includes('tran') || h.toLowerCase().includes('entity') || h.toLowerCase().includes('payee')),
            'Entity_Cd': headers.find(h => h.toLowerCase().includes('entity') && h.toLowerCase().includes('cd')),
            'Amount': headers.find(h => h.toLowerCase().includes('amt') || h === 'Amount'),
            'Tran_Date': headers.find(h => h.toLowerCase().includes('date')),
            'Tran_ID': headers.find(h => h.toLowerCase().includes('tran') && h.toLowerCase().includes('id')),
        };

        console.log('\n📋 Key Field Detection:');
        Object.entries(keyFields).forEach(([expected, found]) => {
            const status = found ? '✓' : '✗';
            console.log(`  ${status} ${expected.padEnd(15)} -> ${found || 'NOT FOUND'}`);
        });

        // Show all headers
        console.log('\n📑 All Headers:');
        headers.forEach((h, i) => {
            console.log(`  ${String(i + 1).padStart(3)}. ${h}`);
        });

        // Sample first row
        console.log('\n📊 Sample Data (First Row):');
        const sampleRow = data[0];
        Object.entries(sampleRow).slice(0, 10).forEach(([key, value]) => {
            const displayValue = String(value).length > 40 ? String(value).substring(0, 40) + '...' : value;
            console.log(`  ${key}: ${displayValue}`);
        });

        if (Object.keys(sampleRow).length > 10) {
            console.log(`  ... and ${Object.keys(sampleRow).length - 10} more columns`);
        }
    });

    console.log('\n' + '='.repeat(80));
    console.log('ANALYSIS COMPLETE');
    console.log('='.repeat(80));

} catch (error) {
    console.error('Error analyzing file:', error.message);
    process.exit(1);
}
