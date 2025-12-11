const xlsx = require('xlsx');

const filePath = 'analysis_rancho_2022.xlsx';

try {
    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];

    // Get headers (row 1)
    const range = xlsx.utils.decode_range(sheet['!ref']);
    const R = range.s.r;

    console.log(`\n=== Analyzing Headers (Range: ${sheet['!ref']}) ===`);

    const headers = [];
    for (let C = range.s.c; C <= range.e.c; ++C) {
        const cell_address = { c: C, r: R };
        const cell_ref = xlsx.utils.encode_cell(cell_address);
        const cell = sheet[cell_ref];
        if (cell && cell.v) {
            console.log(`Col ${C}: "${cell.v}"`);
            headers[C] = cell.v;
        }
    }

    console.log(`\n=== First Row Data ===`);
    // Print data for the first row (R+1) matching these headers
    const dataR = R + 1;
    for (let C = range.s.c; C <= range.e.c; ++C) {
        if (headers[C]) {
            const cell_address = { c: C, r: dataR };
            const cell_ref = xlsx.utils.encode_cell(cell_address);
            const cell = sheet[cell_ref];
            const val = cell ? cell.v : 'NULL';
            console.log(`[${headers[C]}]: ${val}`);
        }
    }

} catch (err) {
    console.error("Error reading file:", err.message);
}
