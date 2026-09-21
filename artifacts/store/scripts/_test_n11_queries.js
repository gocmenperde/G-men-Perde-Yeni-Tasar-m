const https = require('https');

// Ürün adından akıllı arama sorgusu çıkar
function makeSmartQuery(name) {
  // Türkçe ürün tipi anahtar kelimeleri
  const productKeywords = [
    'defter', 'kalem', 'silgi', 'zimba', 'ataç', 'atac', 'makas', 'cetvel', 'pergel',
    'boya', 'fosforlu', 'keçeli', 'keceli', 'tükenmez', 'tukenmez', 'jel', 'marker',
    'bant', 'yapıştırıcı', 'yapiştırıcı', 'pritt', 'raptiye', 'dosya', 'klasör',
    'fotokopi', 'kağıt', 'kagit', 'karton', 'seffaf', 'ambalaj', 'etiket',
    'hesap', 'makinesi', 'tebeşir', 'tebesir', 'tahta', 'pergel', 'iletki',
    'oyun', 'hamuru', 'puzzle', 'yapboz', 'boncuk', 'renkli', 'kursun',
    'not', 'blok', 'ajanda', 'takvim', 'canta', 'çanta', 'kitap', 'roman',
    'atlas', 'harita', 'sozluk', 'sözlük', 'ansiklopedi',
  ];

  const lower = name.toLowerCase()
    .replace(/[ğ]/g, 'g').replace(/[ü]/g, 'u').replace(/[ş]/g, 's')
    .replace(/[ı]/g, 'i').replace(/[ö]/g, 'o').replace(/[ç]/g, 'c');

  // Bulunan anahtar kelimeleri topla
  const found = productKeywords.filter(kw => lower.includes(kw.toLowerCase()
    .replace(/[ğ]/g, 'g').replace(/[ü]/g, 'u').replace(/[ş]/g, 's')
    .replace(/[ı]/g, 'i').replace(/[ö]/g, 'o').replace(/[ç]/g, 'c')
  ));

  if (found.length >= 2) {
    return found.slice(0, 2).join(' ');
  } else if (found.length === 1) {
    // Ek kelime bul: renk, boyut, vs
    const extras = name.match(/(?:yeşil|kırmızı|mavi|sarı|siyah|beyaz|mor|turuncu|pembe|12'?li|24'?li|6'?li|8'?li|büyük|küçük|orta|ince|kalın)/i);
    return found[0] + (extras ? ' ' + extras[0] : '');
  }

  // Anahtar kelime bulunamazsa ürün adının son anlamlı kısmını al
  const words = name.split(/[\s\-_\/\\]+/).filter(w => w.length > 2 && !/^\d+$/.test(w) && !/^(ve|ile|için|bu|bir|ya|da|de)$/i.test(w));
  return words.slice(-3).join(' ').trim().slice(0, 50);
}

function fetchHtml(url) {
  return new Promise(r => {
    const req = https.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html',
        'Accept-Language': 'tr-TR,tr;q=0.9',
        'Accept-Encoding': 'identity',
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

const testProducts = [
  "ÇINAR 4+1 5 KONULU DEFTER 150 YP",
  "YILDIZLAR PLASTİK ATAÇ KÜÇÜK",
  "FABER CASTELL 187120 DUST FREE SILGI",
  "CARETTA YEŞİL KEÇELİ KALEM",
  "PENSAN SİYAH TÜKENMEZ KALEM",
  "NOVA COLOR AKRILIK BOYA",
  "SID ZIMBA",
  "MOPAK 40 YP LİSE ÇİZGİLİ DEFTER",
  "SCRIKSS JELL KALEM",
  "BRONS BR-700 KORUMALI ÖĞRENCİ MAKASI",
];

async function main() {
  for (const name of testProducts) {
    const query = makeSmartQuery(name);
    const url = `https://www.n11.com/arama?q=${encodeURIComponent(query)}`;
    const { html, status } = await fetchHtml(url);
    const imgMatch = html.match(/"imageUrl":"(https:\/\/n11scdn\.akamaized\.net\/a1\/[^"]+)"/);
    const priceMatch = html.match(/(\d{1,5}[,\.]\d{2})\s*(?:TL|₺)/);
    console.log(`[${status}] "${name.slice(0, 35)}" → query:"${query}" → img:${imgMatch ? '✓' : '✗'} price:${priceMatch ? priceMatch[1] : 'YOK'}`);
    await new Promise(r => setTimeout(r, 200));
  }
}

main().catch(console.error);
