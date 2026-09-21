const https = require('https');
const fs = require('fs');

function fetch(url) {
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
      res.on('end', () => r({ html: Buffer.concat(chunks).toString('utf8'), status: res.statusCode }));
    });
    req.on('error', () => r({ html: '', status: 0 }));
    req.setTimeout(20000, () => { req.destroy(); r({ html: '', status: 0 }); });
  });
}

async function main() {
  // BKM product search - tam HTML kaydet
  const r = await fetch('https://www.bkmkitap.com/arama?q=kul+kedisi');
  fs.writeFileSync('/tmp/bkm_full.html', r.html);
  console.log('Status:', r.status, 'Len:', r.html.length);
  
  // Ürün page linkleri ara (tam HTML içinde)
  const productLinks = [...r.html.matchAll(/href="(https:\/\/www\.bkmkitap\.com\/[a-z0-9\-]+)"/g)]
    .map(m => m[1])
    .filter(u => !u.includes('/kitap/') && !u.includes('/arama') && !u.includes('/kampanya') && !u.includes('/Data') && !u.includes('/tema') && !u.includes('/cok-') && !u.includes('-yas-') && !u.includes('-kitap'))
    .slice(0, 20);
  console.log('Ürün linkleri:', productLinks);
  
  // Herhangi bir -O.jpg varmı?
  const oJpgs = [...r.html.matchAll(/cdn\.bkmkitap\.com\/[^"'\s]+?-O\.jpg/g)].slice(0,5);
  console.log('O.jpg:', oJpgs.map(m=>m[0]));
  
  // Script tagları içinde JSON var mı?
  const scripts = [...r.html.matchAll(/<script[^>]*>([\s\S]{100,5000}?)<\/script>/g)];
  for (const s of scripts.slice(0, 20)) {
    if (s[1].includes('image') && s[1].includes('bkmkitap')) {
      console.log('Script with image:', s[1].slice(0, 300));
      break;
    }
  }
}

main().catch(console.error);
