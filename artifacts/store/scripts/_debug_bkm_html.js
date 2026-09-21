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
      res.on('end', () => r({ html: Buffer.concat(chunks).toString('utf8'), status: res.statusCode }));
    });
    req.on('error', () => r({ html: '', status: 0 }));
    req.setTimeout(15000, () => { req.destroy(); r({ html: '', status: 0 }); });
  });
}

async function main() {
  const { html, status } = await fetchHtml('https://www.bkmkitap.com/arama?q=kul+kedisi');
  console.log('Status:', status, '| Len:', html.length);
  
  // BKM resim kalıpları
  const patterns = [
    /cdn\.bkmkitap\.com[^"'\s<>]+/g,
    /data-src="([^"]+)"/g,
    /data-lazy="([^"]+)"/g,
    /"img"[^}]*"src":"([^"]+)"/g,
    /"image":"([^"]+)"/g,
    /"thumbnail":"([^"]+)"/g,
    /productImg[^"]*"([^"]+)"/g,
    /class="col-img[^"]*"[^>]*>[^<]*<img[^>]*src="([^"]+)"/g,
  ];
  
  for (const pat of patterns) {
    const matches = [...html.matchAll(pat)].slice(0, 3);
    if (matches.length > 0) {
      console.log(`Pattern ${pat.source.slice(0,40)}: ${matches.map(m=>m[0].slice(0,80)).join(' | ')}`);
    }
  }
  
  // bkmkitap referansları
  const bkmRefs = [...html.matchAll(/bkmkitap[^"'\s<>]+/g)].slice(0, 5).map(m => m[0]);
  console.log('bkmkitap refs:', bkmRefs);
  
  // İlk ürün kartı
  const cardIdx = html.indexOf('productUrl');
  if (cardIdx > 0) console.log('productUrl ctx:', html.slice(cardIdx, cardIdx+200));
  
  // application/json içeriği
  const jsonIdx = html.indexOf('application/json');
  if (jsonIdx > 0) console.log('JSON context:', html.slice(jsonIdx-50, jsonIdx+300));
  
  // __NEXT_DATA__ veya data store
  const nextData = html.match(/__NEXT_DATA__[^>]*>({.*?})<\/script>/s);
  if (nextData) {
    console.log('NEXT_DATA bulundu:', nextData[1].slice(0, 300));
  }
  
  // window.__STATE veya benzeri
  const state = html.match(/window\.__(\w+)\s*=\s*(\{[^;]{0,500})/);
  if (state) console.log('Window state:', state[0].slice(0,200));
  
  // İlk 200 char - sonraki 200 char pattern arama
  const imgSrcs = [...html.matchAll(/src="([^"]{10,}?)"/g)].filter(m=>!m[1].includes('data:')).slice(0,10).map(m=>m[1]);
  console.log('\nİlk 10 src:', imgSrcs);

  fs.writeFileSync('/tmp/bkm_search.html', html.slice(0, 20000));
  console.log('\nHTML /tmp/bkm_search.html dosyasına kaydedildi');
}

main().catch(console.error);
