import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthorized, unauthorizedResponse } from "@/lib/require-admin";
import { db } from "@/lib/db";
import slugify from "slugify";

export const dynamic = "force-dynamic";

// ─── Unsplash görsel havuzu ───────────────────────────────────────────────────
const IMGS = {
  kalem:      ["https://images.unsplash.com/photo-1585776245991-cf89dd7fc73a?w=600&q=80","https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?w=600&q=80","https://images.unsplash.com/photo-1519682337058-a94d519337bc?w=600&q=80"],
  kursun:     ["https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=600&q=80","https://images.unsplash.com/photo-1452860606245-08befc0ff44b?w=600&q=80","https://images.unsplash.com/photo-1510906594845-bc082582c8cc?w=600&q=80"],
  defter:     ["https://images.unsplash.com/photo-1531346878377-a5be20888e57?w=600&q=80","https://images.unsplash.com/photo-1506784983877-45594efa4cbe?w=600&q=80","https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&q=80"],
  boya:       ["https://images.unsplash.com/photo-1547891654-e66ed7ebb968?w=600&q=80","https://images.unsplash.com/photo-1579762715118-a6f1d4b934f1?w=600&q=80","https://images.unsplash.com/photo-1541690090-2634b5ab43f3?w=600&q=80"],
  suluboya:   ["https://images.unsplash.com/photo-1541690090-2634b5ab43f3?w=600&q=80","https://images.unsplash.com/photo-1594736797933-d0501ba2fe65?w=600&q=80","https://images.unsplash.com/photo-1615492627793-9c15c3c15caa?w=600&q=80"],
  ofis:       ["https://images.unsplash.com/photo-1568667256549-094345857637?w=600&q=80","https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=600&q=80","https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=600&q=80"],
  makas:      ["https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=600&q=80","https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=600&q=80"],
  kagit:      ["https://images.unsplash.com/photo-1568667256549-094345857637?w=600&q=80","https://images.unsplash.com/photo-1614854262318-831574f15f1f?w=600&q=80"],
  ajanda:     ["https://images.unsplash.com/photo-1506784983877-45594efa4cbe?w=600&q=80","https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&q=80","https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=600&q=80"],
  sanat:      ["https://images.unsplash.com/photo-1579762715118-a6f1d4b934f1?w=600&q=80","https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=600&q=80","https://images.unsplash.com/photo-1547826039-bfc35e0f1ea8?w=600&q=80"],
};
const img = (key: keyof typeof IMGS, i = 0) => IMGS[key][i % IMGS[key].length];

// ─── Ürün tanımları ───────────────────────────────────────────────────────────
const PRODUCTS = [
  // ── SÜDOR ──────────────────────────────────────────────────────────────────
  { name:"Südor Keçeli Kalem 12'li Karışık Renk",  cat:"Keçeli Kalem",   brand:"Südor",  price:45,  cmp:60,   stock:200, img:img("kalem",0),  sku:"SD-K001", feat:true  },
  { name:"Südor Keçeli Kalem 24'lü Set",            cat:"Keçeli Kalem",   brand:"Südor",  price:79,  cmp:99,   stock:150, img:img("kalem",1),  sku:"SD-K002", feat:true  },
  { name:"Südor Keçeli Kalem 36'lı Set",            cat:"Keçeli Kalem",   brand:"Südor",  price:110, cmp:139,  stock:80,  img:img("kalem",2),  sku:"SD-K003", feat:false },
  { name:"Südor Kuru Boya 12'li",                   cat:"Kuru Boya",      brand:"Südor",  price:38,  cmp:50,   stock:180, img:img("boya",0),   sku:"SD-B001", feat:false },
  { name:"Südor Kuru Boya 24'lü",                   cat:"Kuru Boya",      brand:"Südor",  price:65,  cmp:85,   stock:120, img:img("boya",1),   sku:"SD-B002", feat:true  },
  { name:"Südor Kuru Boya 36'lı",                   cat:"Kuru Boya",      brand:"Südor",  price:95,  cmp:120,  stock:70,  img:img("boya",2),   sku:"SD-B003", feat:false },
  { name:"Südor Pastel Boya 12'li",                 cat:"Pastel Boya",    brand:"Südor",  price:55,  cmp:70,   stock:100, img:img("boya",0),   sku:"SD-P001", feat:false },
  { name:"Südor Pastel Boya 24'lü",                 cat:"Pastel Boya",    brand:"Südor",  price:89,  cmp:110,  stock:60,  img:img("boya",1),   sku:"SD-P002", feat:false },

  // ── PENSAN ─────────────────────────────────────────────────────────────────
  { name:"Pensan My-Pen Tükenmez 0.7mm Mavi 50'li", cat:"Tükenmez Kalem", brand:"Pensan", price:89,  cmp:110,  stock:500, img:img("kalem",1),  sku:"PS-T001", feat:true  },
  { name:"Pensan My-Pen Tükenmez Kırmızı 50'li",    cat:"Tükenmez Kalem", brand:"Pensan", price:89,  cmp:null, stock:400, img:img("kalem",2),  sku:"PS-T002", feat:false },
  { name:"Pensan My-Pen Tükenmez Siyah 50'li",      cat:"Tükenmez Kalem", brand:"Pensan", price:89,  cmp:null, stock:450, img:img("kalem",0),  sku:"PS-T003", feat:false },
  { name:"Pensan Tükenmez Kalem İnce Uç 0.5mm",     cat:"Tükenmez Kalem", brand:"Pensan", price:45,  cmp:58,   stock:300, img:img("kalem",1),  sku:"PS-T004", feat:false },
  { name:"Pensan Fineliner 0.4mm 10'lu Set",         cat:"Fineliner",      brand:"Pensan", price:75,  cmp:95,   stock:150, img:img("kalem",2),  sku:"PS-F001", feat:true  },
  { name:"Pensan Versatil Kalem 0.5mm",              cat:"Versatil Kalem", brand:"Pensan", price:35,  cmp:45,   stock:250, img:img("kursun",0), sku:"PS-V001", feat:false },

  // ── KESKIN COLOR ───────────────────────────────────────────────────────────
  { name:"Keskin Color Kuru Boya 12'li",             cat:"Kuru Boya",      brand:"Keskin Color", price:32, cmp:42,  stock:200, img:img("boya",0),   sku:"KC-B001", feat:false },
  { name:"Keskin Color Kuru Boya 24'lü",             cat:"Kuru Boya",      brand:"Keskin Color", price:55, cmp:70,  stock:150, img:img("boya",1),   sku:"KC-B002", feat:true  },
  { name:"Keskin Color Kuru Boya 36'lı",             cat:"Kuru Boya",      brand:"Keskin Color", price:79, cmp:99,  stock:80,  img:img("boya",2),   sku:"KC-B003", feat:false },
  { name:"Keskin Color Keçeli Kalem 12'li",          cat:"Keçeli Kalem",   brand:"Keskin Color", price:38, cmp:50,  stock:180, img:img("kalem",0),  sku:"KC-K001", feat:false },
  { name:"Keskin Color Keçeli Kalem 24'lü",          cat:"Keçeli Kalem",   brand:"Keskin Color", price:65, cmp:82,  stock:120, img:img("kalem",1),  sku:"KC-K002", feat:true  },
  { name:"Keskin Color Sulu Boya 12'li",             cat:"Sulu Boya",      brand:"Keskin Color", price:42, cmp:55,  stock:130, img:img("suluboya",0),sku:"KC-S001", feat:false },
  { name:"Keskin Color Sulu Boya 24'lü",             cat:"Sulu Boya",      brand:"Keskin Color", price:72, cmp:90,  stock:90,  img:img("suluboya",1),sku:"KC-S002", feat:false },
  { name:"Keskin Color Pastel Boya 24'lü",           cat:"Pastel Boya",    brand:"Keskin Color", price:68, cmp:85,  stock:70,  img:img("boya",0),   sku:"KC-P001", feat:false },
  { name:"Keskin Color Yağlı Boya Tüp 12'li",        cat:"Yağlı Boya",     brand:"Keskin Color", price:120,cmp:150, stock:50,  img:img("sanat",0),  sku:"KC-Y001", feat:false },

  // ── FATİH ──────────────────────────────────────────────────────────────────
  { name:"Fatih Silgi Beyaz Küçük",                  cat:"Silgi",          brand:"Fatih",  price:5,   cmp:null, stock:1000,img:img("ofis",0),   sku:"FT-S001", feat:false },
  { name:"Fatih Silgi Beyaz Büyük",                  cat:"Silgi",          brand:"Fatih",  price:8,   cmp:null, stock:800, img:img("ofis",1),   sku:"FT-S002", feat:false },
  { name:"Fatih Silgi Seti 10'lu",                   cat:"Silgi",          brand:"Fatih",  price:45,  cmp:58,   stock:300, img:img("ofis",2),   sku:"FT-S003", feat:true  },
  { name:"Fatih Tükenmez Kalem Mavi 10'lu",          cat:"Tükenmez Kalem", brand:"Fatih",  price:25,  cmp:35,   stock:500, img:img("kalem",0),  sku:"FT-T001", feat:false },
  { name:"Fatih Kurşun Kalem 2B 12'li",              cat:"Kuru Boya Kalemi",brand:"Fatih", price:30,  cmp:40,   stock:400, img:img("kursun",0), sku:"FT-K001", feat:false },
  { name:"Fatih Kurşun Kalem HB 12'li",              cat:"Kuru Boya Kalemi",brand:"Fatih", price:28,  cmp:null, stock:500, img:img("kursun",1), sku:"FT-K002", feat:false },

  // ── MASİS ──────────────────────────────────────────────────────────────────
  { name:"Masis Zımba Makinesi Küçük",               cat:"Zımba",          brand:"Masis",  price:85,  cmp:110,  stock:100, img:img("ofis",0),   sku:"MS-Z001", feat:false },
  { name:"Masis Zımba Makinesi Orta Boy",            cat:"Zımba",          brand:"Masis",  price:120, cmp:150,  stock:80,  img:img("ofis",1),   sku:"MS-Z002", feat:true  },
  { name:"Masis Zımba Teli No:10 1000'li",           cat:"Zımba",          brand:"Masis",  price:15,  cmp:null, stock:500, img:img("ofis",2),   sku:"MS-ZT01", feat:false },
  { name:"Masis Zımba Teli No:24 1000'li",           cat:"Zımba",          brand:"Masis",  price:18,  cmp:null, stock:400, img:img("ofis",0),   sku:"MS-ZT02", feat:false },

  // ── DELTA ──────────────────────────────────────────────────────────────────
  { name:"Delta Delgeç 2 Delikli Plastik",           cat:"Delgeç",         brand:"Delta",  price:55,  cmp:70,   stock:120, img:img("ofis",1),   sku:"DT-D001", feat:false },
  { name:"Delta Delgeç 2 Delikli Metal",             cat:"Delgeç",         brand:"Delta",  price:95,  cmp:null, stock:80,  img:img("ofis",2),   sku:"DT-D002", feat:true  },
  { name:"Delta Makas 17cm",                         cat:"Makas",          brand:"Delta",  price:35,  cmp:45,   stock:150, img:img("makas",0),  sku:"DT-M001", feat:false },
  { name:"Delta Makas 21cm Profesyonel",             cat:"Makas",          brand:"Delta",  price:65,  cmp:80,   stock:100, img:img("makas",1),  sku:"DT-M002", feat:false },

  // ── FABER-CASTELL ──────────────────────────────────────────────────────────
  { name:"Faber-Castell Kuru Boya 12'li Karışık",   cat:"Kuru Boya",      brand:"Faber-Castell", price:89,  cmp:119,  stock:150, img:img("boya",0),   sku:"FC-B001", feat:true  },
  { name:"Faber-Castell Kuru Boya 24'lü Karışık",   cat:"Kuru Boya",      brand:"Faber-Castell", price:149, cmp:189,  stock:100, img:img("boya",1),   sku:"FC-B002", feat:true  },
  { name:"Faber-Castell Kuru Boya 36'lı",           cat:"Kuru Boya",      brand:"Faber-Castell", price:210, cmp:260,  stock:60,  img:img("boya",2),   sku:"FC-B003", feat:false },
  { name:"Faber-Castell Kuru Boya 48'li",           cat:"Kuru Boya",      brand:"Faber-Castell", price:280, cmp:349,  stock:40,  img:img("boya",0),   sku:"FC-B004", feat:false },
  { name:"Faber-Castell Kurşun Kalem 12'li HB",     cat:"Kuru Boya Kalemi",brand:"Faber-Castell",price:52,  cmp:null, stock:400, img:img("kursun",0), sku:"FC-K001", feat:false },
  { name:"Faber-Castell Kurşun Kalem Üçgen 12'li",  cat:"Kuru Boya Kalemi",brand:"Faber-Castell",price:65,  cmp:82,   stock:250, img:img("kursun",1), sku:"FC-K002", feat:false },
  { name:"Faber-Castell Pastel Boya 24'lü",         cat:"Pastel Boya",    brand:"Faber-Castell", price:175, cmp:null, stock:90,  img:img("boya",1),   sku:"FC-P001", feat:true  },
  { name:"Faber-Castell Pastel Boya 36'lı",         cat:"Pastel Boya",    brand:"Faber-Castell", price:245, cmp:299,  stock:55,  img:img("boya",2),   sku:"FC-P002", feat:false },
  { name:"Faber-Castell Sulu Boya 12'li",           cat:"Sulu Boya",      brand:"Faber-Castell", price:110, cmp:139,  stock:120, img:img("suluboya",0),sku:"FC-S001", feat:false },
  { name:"Faber-Castell Sulu Boya 24'lü",           cat:"Sulu Boya",      brand:"Faber-Castell", price:185, cmp:229,  stock:80,  img:img("suluboya",1),sku:"FC-S002", feat:true  },
  { name:"Faber-Castell Fineliner 0.4mm 10'lu",     cat:"Fineliner",      brand:"Faber-Castell", price:145, cmp:180,  stock:80,  img:img("kalem",0),  sku:"FC-F001", feat:true  },
  { name:"Faber-Castell Fineliner 0.4mm 20'li",     cat:"Fineliner",      brand:"Faber-Castell", price:265, cmp:320,  stock:50,  img:img("kalem",1),  sku:"FC-F002", feat:false },
  { name:"Faber-Castell Silgi Beyaz",               cat:"Silgi",          brand:"Faber-Castell", price:12,  cmp:null, stock:600, img:img("ofis",0),   sku:"FC-E001", feat:false },

  // ── STAEDTLER ──────────────────────────────────────────────────────────────
  { name:"Staedtler Triplus Fineliner 10'lu",       cat:"Fineliner",      brand:"Staedtler", price:145, cmp:189,  stock:80,  img:img("kalem",2),  sku:"ST-F001", feat:true  },
  { name:"Staedtler Triplus Fineliner 20'li",       cat:"Fineliner",      brand:"Staedtler", price:259, cmp:319,  stock:50,  img:img("kalem",0),  sku:"ST-F002", feat:false },
  { name:"Staedtler Triplus Fineliner 30'lu",       cat:"Fineliner",      brand:"Staedtler", price:359, cmp:429,  stock:35,  img:img("kalem",1),  sku:"ST-F003", feat:false },
  { name:"Staedtler Kurşun Kalem Mars HB 12'li",   cat:"Kuru Boya Kalemi",brand:"Staedtler",price:75,  cmp:95,   stock:200, img:img("kursun",0), sku:"ST-K001", feat:false },
  { name:"Staedtler Noris Kurşun Kalem 12'li",     cat:"Kuru Boya Kalemi",brand:"Staedtler",price:65,  cmp:null, stock:250, img:img("kursun",1), sku:"ST-K002", feat:true  },
  { name:"Staedtler Spiralli Defter A4",            cat:"Spiralli Defter", brand:"Staedtler",price:45,  cmp:null, stock:500, img:img("defter",0), sku:"ST-D001", feat:true  },
  { name:"Staedtler Spiralli Defter A5",            cat:"Spiralli Defter", brand:"Staedtler",price:35,  cmp:null, stock:400, img:img("defter",1), sku:"ST-D002", feat:false },
  { name:"Staedtler Teknik Çizim Seti",            cat:"Fineliner",      brand:"Staedtler",price:265, cmp:null, stock:55,  img:img("kalem",2),  sku:"ST-C001", feat:false },
  { name:"Staedtler Silgi Büyük",                  cat:"Silgi",           brand:"Staedtler",price:18,  cmp:24,   stock:400, img:img("ofis",1),   sku:"ST-E001", feat:false },

  // ── PELİKAN ────────────────────────────────────────────────────────────────
  { name:"Pelikan Günlük Ajanda 2025",              cat:"Günlük Ajanda",  brand:"Pelikan", price:129, cmp:null, stock:200, img:img("ajanda",0), sku:"PL-A001", feat:true  },
  { name:"Pelikan Haftalık Ajanda 2025",            cat:"Günlük Ajanda",  brand:"Pelikan", price:99,  cmp:null, stock:180, img:img("ajanda",1), sku:"PL-A002", feat:false },
  { name:"Pelikan Dolma Kalem Başlangıç Seti",     cat:"Dolma Kalem",    brand:"Pelikan", price:389, cmp:450,  stock:35,  img:img("kalem",0),  sku:"PL-D001", feat:true  },
  { name:"Pelikan Tükenmez Kalem Twist",           cat:"Tükenmez Kalem", brand:"Pelikan", price:159, cmp:199,  stock:80,  img:img("kalem",1),  sku:"PL-T001", feat:false },
  { name:"Pelikan Sulu Boya 12'li",                cat:"Sulu Boya",      brand:"Pelikan", price:95,  cmp:120,  stock:100, img:img("suluboya",0),sku:"PL-S001", feat:false },
  { name:"Pelikan Sulu Boya 24'lü",                cat:"Sulu Boya",      brand:"Pelikan", price:165, cmp:199,  stock:70,  img:img("suluboya",1),sku:"PL-S002", feat:true  },

  // ── PENTEL ─────────────────────────────────────────────────────────────────
  { name:"Pentel EnerGel Jel Kalem 0.7mm Mavi",   cat:"Tükenmez Kalem", brand:"Pentel",  price:35,  cmp:45,   stock:300, img:img("kalem",0),  sku:"PN-J001", feat:false },
  { name:"Pentel EnerGel Jel Kalem 5'li Set",     cat:"Tükenmez Kalem", brand:"Pentel",  price:150, cmp:185,  stock:120, img:img("kalem",1),  sku:"PN-J002", feat:true  },
  { name:"Pentel EnerGel Jel Kalem 10'lu Set",    cat:"Tükenmez Kalem", brand:"Pentel",  price:280, cmp:340,  stock:80,  img:img("kalem",2),  sku:"PN-J003", feat:false },
  { name:"Pentel Aquash Su Fırçası Seti",          cat:"Sulu Boya",      brand:"Pentel",  price:145, cmp:180,  stock:60,  img:img("suluboya",2),sku:"PN-F001", feat:false },
  { name:"Pentel Versatil Kalem 0.5mm",            cat:"Versatil Kalem", brand:"Pentel",  price:85,  cmp:105,  stock:150, img:img("kursun",0), sku:"PN-V001", feat:true  },
  { name:"Pentel Versatil Kalem 0.7mm",            cat:"Versatil Kalem", brand:"Pentel",  price:85,  cmp:105,  stock:130, img:img("kursun",1), sku:"PN-V002", feat:false },

  // ── KOH-I-NOOR ─────────────────────────────────────────────────────────────
  { name:"Koh-i-Noor Sulu Boya 12'li",            cat:"Sulu Boya",      brand:"Koh-i-Noor",price:95, cmp:120, stock:100, img:img("suluboya",0),sku:"KN-S001", feat:false },
  { name:"Koh-i-Noor Sulu Boya 24'lü",            cat:"Sulu Boya",      brand:"Koh-i-Noor",price:175,cmp:220, stock:70,  img:img("suluboya",1),sku:"KN-S002", feat:true  },
  { name:"Koh-i-Noor Pastel Kalem 24'lü",         cat:"Pastel Boya",    brand:"Koh-i-Noor",price:220,cmp:269, stock:55,  img:img("boya",1),   sku:"KN-P001", feat:false },
  { name:"Koh-i-Noor Pastel Kalem 48'li",         cat:"Pastel Boya",    brand:"Koh-i-Noor",price:440,cmp:520, stock:30,  img:img("boya",2),   sku:"KN-P002", feat:true  },
  { name:"Koh-i-Noor Kuru Boya 24'lü",            cat:"Kuru Boya",      brand:"Koh-i-Noor",price:185,cmp:225, stock:60,  img:img("boya",0),   sku:"KN-B001", feat:false },
  { name:"Koh-i-Noor Yağlı Boya Seti 12'li",      cat:"Yağlı Boya",     brand:"Koh-i-Noor",price:280,cmp:340, stock:40,  img:img("sanat",0),  sku:"KN-Y001", feat:false },

  // ── STABİLO ────────────────────────────────────────────────────────────────
  { name:"Stabilo Boss Fosforlu Kalem Sarı",       cat:"Keçeli Kalem",   brand:"Stabilo", price:18,  cmp:null, stock:400, img:img("kalem",2),  sku:"SB-F001", feat:false },
  { name:"Stabilo Boss Fosforlu Kalem 4'lü Set",  cat:"Keçeli Kalem",   brand:"Stabilo", price:65,  cmp:82,   stock:250, img:img("kalem",0),  sku:"SB-F002", feat:true  },
  { name:"Stabilo Boss Fosforlu 8'li Set",         cat:"Keçeli Kalem",   brand:"Stabilo", price:120, cmp:149,  stock:150, img:img("kalem",1),  sku:"SB-F003", feat:false },
  { name:"Stabilo Point 88 Fineliner 10'lu",       cat:"Fineliner",      brand:"Stabilo", price:125, cmp:155,  stock:100, img:img("kalem",2),  sku:"SB-P001", feat:true  },
  { name:"Stabilo Point 88 Fineliner 20'li",       cat:"Fineliner",      brand:"Stabilo", price:230, cmp:280,  stock:70,  img:img("kalem",0),  sku:"SB-P002", feat:false },
  { name:"Stabilo Swing Cool Fosforlu 8'li",       cat:"Keçeli Kalem",   brand:"Stabilo", price:110, cmp:138,  stock:120, img:img("kalem",1),  sku:"SB-S001", feat:false },

  // ── MOLESKİNE ──────────────────────────────────────────────────────────────
  { name:"Moleskine Klasik Defter A5 Siyah",       cat:"Günlük Ajanda",  brand:"Moleskine",price:320,cmp:380,  stock:45,  img:img("ajanda",2), sku:"ML-D001", feat:true  },
  { name:"Moleskine Klasik Defter A6 Siyah",       cat:"Günlük Ajanda",  brand:"Moleskine",price:245,cmp:295,  stock:60,  img:img("ajanda",0), sku:"ML-D002", feat:false },
  { name:"Moleskine Spiralli Defter A4",           cat:"Spiralli Defter", brand:"Moleskine",price:395,cmp:469,  stock:30,  img:img("defter",2), sku:"ML-S001", feat:false },
  { name:"Moleskine Haftalık Planlayıcı 2025",     cat:"Günlük Ajanda",  brand:"Moleskine",price:289,cmp:345,  stock:55,  img:img("ajanda",1), sku:"ML-P001", feat:true  },

  // ── MARKASİZ ÜRÜNLER ───────────────────────────────────────────────────────
  { name:"A4 Fotokopi Kağıdı 500 Yaprak 80gr",    cat:"Fotokopi Kağıdı",brand:null,     price:89,  cmp:null, stock:1000,img:img("kagit",0),  sku:"PR-K001", feat:false },
  { name:"A4 Fotokopi Kağıdı 500 Yaprak 70gr",    cat:"Fotokopi Kağıdı",brand:null,     price:75,  cmp:null, stock:800, img:img("kagit",1),  sku:"PR-K002", feat:false },
  { name:"Renkli Karton A4 50'li Paket",           cat:"Renkli Karton",  brand:null,     price:65,  cmp:null, stock:300, img:img("kagit",0),  sku:"PR-C001", feat:false },
  { name:"Renkli Karton A3 25'li Paket",           cat:"Renkli Karton",  brand:null,     price:75,  cmp:90,   stock:200, img:img("kagit",1),  sku:"PR-C002", feat:false },
  { name:"Yapışkanlı Not Kağıdı 5'li Paket",      cat:"Yapışkanlı Not", brand:null,     price:28,  cmp:35,   stock:800, img:img("ofis",2),   sku:"PR-N001", feat:false },
  { name:"Yapışkanlı Not Kağıdı Büyük Boy 3'lü",  cat:"Yapışkanlı Not", brand:null,     price:35,  cmp:45,   stock:600, img:img("ofis",0),   sku:"PR-N002", feat:false },
  { name:"Cetvel 30cm Plastik",                   cat:"Cetvel & Gönye", brand:null,     price:12,  cmp:null, stock:500, img:img("ofis",1),   sku:"PR-R001", feat:false },
  { name:"Gönye Seti 45°/60°",                    cat:"Cetvel & Gönye", brand:null,     price:25,  cmp:32,   stock:300, img:img("ofis",2),   sku:"PR-R002", feat:false },
  { name:"Pergel Seti 7 Parça",                   cat:"Pergel",         brand:null,     price:45,  cmp:58,   stock:150, img:img("ofis",0),   sku:"PR-G001", feat:false },
  { name:"Plastik Şeffaf Dosya 50'li",            cat:"Dosyalama & Düzenleme",brand:null,price:35, cmp:null, stock:600, img:img("ofis",1),   sku:"PR-F001", feat:false },
  { name:"Klasör Dar Sırt 5'li Paket",            cat:"Dosyalama & Düzenleme",brand:null,price:65, cmp:80,   stock:300, img:img("ofis",2),   sku:"PR-F002", feat:false },
  { name:"Akrilik Boya Seti 12 Tüp",             cat:"Akrilik Boya",   brand:null,     price:145, cmp:180,  stock:70,  img:img("sanat",1),  sku:"PR-A001", feat:false },
  { name:"Yağlı Boya Tüp Seti 24 Renk",          cat:"Yağlı Boya",     brand:null,     price:320, cmp:399,  stock:45,  img:img("sanat",2),  sku:"PR-Y001", feat:true  },
  { name:"Fırça Seti 10'lu Sanat",               cat:"Sanat Malzemeleri",brand:null,   price:85,  cmp:105,  stock:100, img:img("sanat",0),  sku:"PR-BR01", feat:false },
];

export async function POST(req: NextRequest) {
  try {
    const authorized = await isAdminAuthorized(req);
    if (!authorized) return unauthorizedResponse();

    // Kategori ve marka haritası
    const [allCategories, allBrands] = await Promise.all([
      db.category.findMany({ select: { id: true, name: true } }),
      db.brand.findMany({ select: { id: true, name: true } }),
    ]);
    const catMap   = new Map(allCategories.map((c) => [c.name.toLowerCase(), c.id]));
    const brandMap = new Map(allBrands.map((b) => [b.name.toLowerCase(), b.id]));

    let created = 0;
    let skipped = 0;

    for (let i = 0; i < PRODUCTS.length; i++) {
      const p = PRODUCTS[i];
      try {
        // SKU varsa zaten eklenmiş mi?
        if (p.sku) {
          const exists = await db.product.findUnique({ where: { sku: p.sku } });
          if (exists) { skipped++; continue; }
        }

        let slug = slugify(p.name, { lower: true, strict: true, locale: "tr" });
        const slugExists = await db.product.findUnique({ where: { slug } });
        if (slugExists) slug = `${slug}-${Date.now()}-${i}`;

        const categoryId = catMap.get(p.cat.toLowerCase()) ?? null;
        const brandId    = p.brand ? (brandMap.get(p.brand.toLowerCase()) ?? null) : null;

        const brandPart = p.brand ? `${p.brand} markasının güvencesiyle sunulan bu ürün, ` : "";
        const desc = `${p.name}, yüksek kaliteli malzemelerden üretilmiştir. ` +
          `${brandPart}okul, ofis ve hobi çalışmalarında güvenle kullanabilirsiniz. ` +
          `Dayanıklı yapısı ve ergonomik tasarımıyla uzun süreli konfor sağlar.`;

        await db.product.create({
          data: {
            name: p.name,
            slug,
            sku: p.sku ?? null,
            description: desc,
            price: p.price,
            comparePrice: p.cmp ?? null,
            stock: p.stock,
            images: [p.img],
            isFeatured: p.feat,
            isActive: true,
            categoryId,
            brandId,
            tags: ["kırtasiye"],
          },
        });
        created++;
      } catch { skipped++; }
    }

    return NextResponse.json({
      ok: true,
      created,
      skipped,
      message: `${created} ürün eklendi, ${skipped} atlandı (zaten mevcut).`,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message ?? "Hata oluştu." }, { status: 500 });
  }
}
