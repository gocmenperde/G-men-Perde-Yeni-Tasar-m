const XLSX = require('/home/runner/workspace/artifacts/store/node_modules/xlsx');

const hbFile = XLSX.readFile('/home/runner/workspace/attached_assets/HB_Duzeltilmis_Temiz_1781019586733.xlsx');
const kitFile = XLSX.readFile('/home/runner/workspace/attached_assets/Kirtasiye-ve-Okul-Seti_2_1781019577099.xlsx');

console.log('HB sheets:', hbFile.SheetNames);
console.log('Kit sheets:', kitFile.SheetNames);

const hbData = XLSX.utils.sheet_to_json(hbFile.Sheets[hbFile.SheetNames[0]], { header: 1, defval: '' });
const kitData = XLSX.utils.sheet_to_json(kitFile.Sheets[kitFile.SheetNames[0]], { header: 1, defval: '' });

console.log('HB satir:', hbData.length, '| Kit satir:', kitData.length);
console.log('HB[0]:', JSON.stringify(hbData[0]).substring(0, 300));
console.log('HB[1]:', JSON.stringify(hbData[1]).substring(0, 300));
console.log('Kit[0]:', JSON.stringify(kitData[0]).substring(0, 300));
console.log('Kit[1]:', JSON.stringify(kitData[1]).substring(0, 300));
console.log('Kit[2]:', JSON.stringify(kitData[2]).substring(0, 300));
