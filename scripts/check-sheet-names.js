const xlsx = require('xlsx');
const filePath = 'analysis_rancho_2022.xlsx';

try {
    const workbook = xlsx.readFile(filePath);
    console.log('Sheet Names:', workbook.SheetNames);

    // Test regex
    const detectSheetType = (name) => {
        const n = name.toLowerCase();
        if (n.match(/(expend|payment|bill|expense|sched e|schedule e|disbursement|expn)/)) return 'EXPENDITURE';
        if (n.match(/(receipt|contrib|donation|sched a|schedule a|rcpt|income)/)) return 'CONTRIBUTION';
        return 'UNKNOWN';
    };

    workbook.SheetNames.forEach(name => {
        console.log(`Sheet "${name}" -> Type: ${detectSheetType(name)}`);
    });

} catch (err) {
    console.error(err);
}
