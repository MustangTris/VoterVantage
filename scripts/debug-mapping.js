const xlsx = require('xlsx');

// --- MOCK CONFIG FROM PAGE.TSX ---
const REQUIRED_FIELDS = [
    { key: "Filer_NamL", label: "Filer Name", required: false, aliases: ["filer_naml", "filer"] },
    { key: "Filer_ID", label: "Filer ID", required: false, aliases: ["filer_id", "id"] },
    { key: "Entity_Name", label: "Contributor/Payee", required: true, aliases: ["tran_naml", "tran_nam", "payee_naml", "name", "entity"] },
    { key: "Amount", label: "Amount", required: true, aliases: ["tran_amt1", "tran_amt2", "amount", "amt"] },
    { key: "Tran_Date", label: "Date", required: false, aliases: ["tran_date", "date"] },
    // ... others
];

const generateAutoMapping = (headers) => {
    const newMapping = {};
    const normalizedHeaders = headers.map(h => ({
        raw: h,
        norm: h.toLowerCase().replace(/[^a-z0-9]/g, ""),
        lower: h.toLowerCase()
    }));

    REQUIRED_FIELDS.forEach(field => {
        // 1. Exact
        const exact = normalizedHeaders.find(h => h.raw === field.key || h.lower === field.key.toLowerCase());
        if (exact) { newMapping[field.key] = exact.raw; return; }

        // 2. Alias
        for (const alias of field.aliases) {
            let match = normalizedHeaders.find(h => h.lower === alias || h.norm === alias);
            if (!match) match = normalizedHeaders.find(h => h.lower.startsWith(alias));
            if (match) {
                newMapping[field.key] = match.raw;
                break;
            }
        }
    });
    return newMapping;
};

// --- TEST SCRIPT ---
const filePath = 'analysis_rancho_2022.xlsx';
const workbook = xlsx.readFile(filePath);
const sheetName = workbook.SheetNames[0];
const sheet = workbook.Sheets[sheetName];

// Get Headers
const range = xlsx.utils.decode_range(sheet['!ref']);
const headers = [];
for (let C = range.s.c; C <= range.e.c; ++C) {
    const cell = sheet[xlsx.utils.encode_cell({ c: C, r: range.s.r })];
    if (cell && cell.v) headers.push(cell.v);
}

console.log('Headers found:', headers.length);

// Generate Mapping
const mapping = generateAutoMapping(headers);
console.log('\nGenerated Mapping:', mapping);

// Check if Required Fields are Mapped
const missing = REQUIRED_FIELDS.filter(f => f.required && !mapping[f.key]);
if (missing.length > 0) {
    console.error('\nCRITICAL: Missing Required Fields:', missing.map(f => f.key));
} else {
    console.log('\nAll required fields mapped!');
}

// Simulate Validation for Row 1
const rows = xlsx.utils.sheet_to_json(sheet);
if (rows.length > 0) {
    const row = rows[0];
    const mappedRow = {};
    const missingFields = [];

    REQUIRED_FIELDS.forEach(field => {
        const sourceHeader = mapping[field.key];
        const value = sourceHeader ? row[sourceHeader] : undefined;

        if (field.required && (value === undefined || value === null || value === "")) {
            missingFields.push(field.label);
        }
        mappedRow[field.key] = value;
    });

    console.log('\nRow 1 Mapped Data:', mappedRow);

    if (missingFields.length > 0) {
        console.error('Row 1 INVALID:', missingFields);
    } else {
        console.log('Row 1 VALID (structure-wise)');
    }
}
