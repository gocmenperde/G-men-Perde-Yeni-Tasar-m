const https = require('https');
const fs = require('fs');

function fetch(url) {
  return new Promise(r => {
    const req = https.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html',
        'Accept-Language': 'tr-TR,tr;q=0.9',
        'Accept-Encoding': 'identity'
      }
    }, res => {
      const chunks = [];
      res.on('data', c => chunks.push(c));
      res.on('end', () => r({ html: Buffer.concat(chunks).toString('utf8'), status: res.statusCode }));
    });
    req.on('error', () => r({ html: '', status: 0 }));
    req.setTimeout(12000, () => { req.destroy(); r({ html: '', status: 0 }); });
  });
}

async function main() {
  const r = await fetch('https://www.n11.com/arama?q=zimba+teli');
  console.log('Status:', r.status, 'Len:', r.html.length);

  // n11scdn URL'leri bul
  const n11Pattern = /https:\/\/n11scdn\.akamaized\.net[^"'\s<>]+/g;
  const imgs = [...r.html.matchAll(n11Pattern)].slice(0, 5).map(m => m[0]);
  console.log('N11 CDN imgs:', imgs);

  // Fiyat bul
  const pricePattern = /([0-9]{1,5}[,\.][0-9]{2})\s*(?:TL|₺)/g;
  const prices = [...r.html.matchAll(pricePattern)].slice(0, 5).map(m => m[1]);
  console.log('Prices (TL):', prices);

  // data-src veya src içindeki CDN resimleri
  const srcPattern = /(?:src|data-src)="(https:\/\/n11scdn[^"]+)"/g;
  const srcImgs = [...r.html.matchAll(srcPattern)].slice(0, 5).map(m => m[1]);
  console.log('src imgs:', srcImgs);

  // JSON içindeki yapı
  const jsonImg = r.html.match(/"imageUrl":"(https:\/\/n11scdn[^"]+)"/);
  console.log('JSON imageUrl:', jsonImg ? jsonImg[1].slice(0, 80) : 'YOK');

  // n11scdn etrafında context
  const idx = r.html.indexOf('n11scdn');
  if (idx > 0) {
    console.log('\nContext:', r.html.slice(Math.max(0, idx - 80), idx + 200));
  }

  // İlk 3000 char kaydet
  fs.writeFileSync('/tmp/n11_debug.txt', r.html.slice(0, 3000));
  console.log('\nİlk 3000 char /tmp/n11_debug.txt dosyasına kaydedildi');
}

main().catch(console.error);
