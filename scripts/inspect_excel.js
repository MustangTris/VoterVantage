const XLSX = require('xlsx');
const path = 'C:\\Users\\trist\\Downloads\\Indio 2024.xlsx';

try {
    const workbook = XLSX.readFile(path);
    console.log('Sheet Names:', workbook.SheetNames);

    workbook.SheetNames.forEach(sheetName => {
        const sheet = workbook.Sheets[sheetName];
        // Convert first row to JSON to get headers
        const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });
        if (data.length > 0) {
            console.log(`\n--- Sheet: ${sheetName} ---`);
            console.log('Headers:', data[0]);
            // Show a sample row if available
            if (data.length > 1) {
                console.log('Sample Row 1:', data[1]);
            }
        } else {
            console.log(`\n--- Sheet: ${sheetName} is empty ---`);
        }
    });
} catch (error) {
    console.error('Error reading file:', error.message);
}
