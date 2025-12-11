const XLSX = require('xlsx');
const fs = require('fs');

const FILE_PATH = 'Indio_2024.xlsx';

if (!fs.existsSync(FILE_PATH)) {
    console.error(`File not found: ${FILE_PATH}`);
    process.exit(1);
}

const workbook = XLSX.readFile(FILE_PATH);

console.log('\n=== Sheet Names ===');
workbook.SheetNames.forEach((name, idx) => {
    console.log(`${idx + 1}. ${name}`);
});

console.log('\n=== Checking for Entity_Cd column ===');
workbook.SheetNames.forEach(name => {
    const sheet = workbook.Sheets[name];
    const json = XLSX.utils.sheet_to_json(sheet, { defval: "" });

    if (json.length > 0) {
        const hasEntityCd = 'Entity_Cd' in json[0];
        const sampleEntityCd = hasEntityCd ? json.slice(0, 5).map(row => row.Entity_Cd).filter(v => v).join(', ') : 'N/A';

        console.log(`\n${name}:`);
        console.log(`  - Has Entity_Cd column: ${hasEntityCd}`);
        console.log(`  - Sample values: ${sampleEntityCd || 'None'}`);
        console.log(`  - Row count: ${json.length}`);
    }
});
