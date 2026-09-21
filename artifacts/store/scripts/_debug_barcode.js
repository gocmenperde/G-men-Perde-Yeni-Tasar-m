const https = require('https');
const fs = require('fs');

function fetchHtml(url) {
  return new Promise(r => {
    const req = https.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml',
        'Accept-Language': 'tr-TR,tr;q=0.9',
        'Accept-Encoding': 'identity',
      }
    }, res => {
      const chunks = [];
      res.on('data', c => chunks.push(c));
      res.on('end', () => r({ html: Buffer.concat(chunks).toString('utf8'), status: res.statusCode, headers: res.headers }));
    });
    req.on('error', () => r({ html: '', status: 0, headers: {} }));
    req.setTimeout(15000, () => { req.destroy(); r({ html: '', status: 0, headers: {} }); });
  });
}

async function test(label, url) {
  console.log(`\n── ${label} ──`);
  console.log(`URL: ${url}`);
  const { html, status, headers } = await fetchHtml(url);
  console.log(`Status: ${status} | Content-Type: ${headers['content-type']?.slice(0,40)} | Len: ${html.length}`);
  
  // BKM cdn resmi ara
  const bkmImg = html.match(/https:\/\/cdn\.bkmkitap\.com\/[^"'\s]+?-O\.jpg/);
  console.log(`BKM img: ${bkmImg ? bkmImg[0].slice(0,80) : 'YOK'}`);
  
  // Fiyat ara
  const price = html.match(/(\d{1,5}[,\.]\d{2})\s*(?:TL|₺)/);
  console.log(`Fiyat: ${price ? price[1] : 'YOK'}`);
  
  // Product JSON-LD
  const jsonld = html.match(/"@type"\s*:\s*"(Book|Product)"/);
  console.log(`JSON-LD type: ${jsonld ? jsonld[1] : 'YOK'}`);
  
  // Ürün başlığı
  const title = html.match(/<title>([^<]+)<\/title>/);
  console.log(`Title: ${title ? title[1].slice(0,60) : 'YOK'}`);
  
  // Redirect?
  if (status >= 300 && status < 400) {
    console.log(`Redirect to: ${headers.location}`);
  }
  
  // İlk 500 karakter
  if (html.length > 0 && html.length < 1000) {
    console.log(`İçerik: ${html.slice(0,500)}`);
  }
}

async function main() {
  // ISBN araması - BKM
  await test('BKM ISBN arama', 'https://www.bkmkitap.com/arama?q=9789759130138');
  
  // EAN araması - BKM  
  await test('BKM EAN arama', 'https://www.bkmkitap.com/arama?q=8697722808001');
  
  // İsim araması - BKM
  await test('BKM isim arama', 'https://www.bkmkitap.com/arama?q=kul+kedisi');
  
  // N11 EAN araması
  await test('N11 EAN arama', 'https://www.n11.com/arama?q=8697722808001');
  
  // N11 isim araması
  await test('N11 ince kalemlik', 'https://www.n11.com/arama?q=ince+kalemlik');
}

main().catch(console.error);
