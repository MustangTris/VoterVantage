const XLSX = require('xlsx');
const fs = require('fs');

const FILE_PATH = 'Indio_2024.xlsx';

if (!fs.existsSync(FILE_PATH)) {
    console.error(`File not found: ${FILE_PATH}`);
    process.exit(1);
}

const workbook = XLSX.readFile(FILE_PATH);
const result = {};

workbook.SheetNames.forEach(name => {
    const sheet = workbook.Sheets[name];
    const range = XLSX.utils.decode_range(sheet['!ref'] || "A1");
    const headers = [];

    // Read first row only
    for (let C = range.s.c; C <= range.e.c; ++C) {
        const cell = sheet[XLSX.utils.encode_cell({ c: C, r: range.s.r })];
        if (cell && cell.v) headers.push(cell.v);
    }
    result[name] = headers;
});

console.log(JSON.stringify(result, null, 2));
