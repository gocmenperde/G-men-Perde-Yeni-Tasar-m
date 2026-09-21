"""
HB dosyasının bozuk ZIP central directory'sini tamir eder,
ardından Kirtasiye-ve-Okul-Seti şablonuyla birleştirir.
"""
import struct, io, zlib, zipfile, openpyxl, os

HB_PATH  = '/home/runner/workspace/attached_assets/HB_Duzeltilmis_Temiz_1781019586733.xlsx'
KIT_PATH = '/home/runner/workspace/attached_assets/Kirtasiye-ve-Okul-Seti_2_1781019577099.xlsx'
OUT_PATH = '/home/runner/workspace/attached_assets/Kirtasiye_Okul_Seti_HAZIR.xlsx'

# ── Adım 1: HB ZIP dosyasını raw tarama ile tamir et ──────────────────────────
print("HB dosyası raw byte tarama ile okunuyor...")
with open(HB_PATH, 'rb') as f:
    raw = f.read()
print(f"Dosya boyutu: {len(raw):,} byte")

LFH_SIG = b'PK\x03\x04'  # Local File Header imzası
files = {}
pos = 0
while pos < len(raw) - 30:
    idx = raw.find(LFH_SIG, pos)
    if idx == -1:
        break
    # Local File Header parse
    try:
        version_needed  = struct.unpack_from('<H', raw, idx+4)[0]
        flags           = struct.unpack_from('<H', raw, idx+6)[0]
        compress_method = struct.unpack_from('<H', raw, idx+8)[0]
        crc32           = struct.unpack_from('<I', raw, idx+14)[0]
        comp_size       = struct.unpack_from('<I', raw, idx+18)[0]
        uncomp_size     = struct.unpack_from('<I', raw, idx+22)[0]
        fname_len       = struct.unpack_from('<H', raw, idx+26)[0]
        extra_len       = struct.unpack_from('<H', raw, idx+28)[0]
    except struct.error:
        pos = idx + 1
        continue

    if fname_len == 0 or fname_len > 512:
        pos = idx + 1
        continue

    data_start = idx + 30 + fname_len + extra_len
    if data_start + comp_size > len(raw):
        pos = idx + 1
        continue

    try:
        fname = raw[idx+30:idx+30+fname_len].decode('utf-8')
    except:
        pos = idx + 1
        continue

    comp_data = raw[data_start:data_start+comp_size]

    # Decompress to verify
    try:
        if compress_method == 8:  # Deflate
            uncomp_data = zlib.decompress(comp_data, -15)
        elif compress_method == 0:  # Stored
            uncomp_data = comp_data
        else:
            pos = idx + 4
            continue
    except:
        pos = idx + 4
        continue

    if fname not in files:
        files[fname] = (compress_method, comp_data, uncomp_data)
        # print(f"  + {fname} ({uncomp_size} byte)")

    pos = data_start + comp_size

print(f"Toplam {len(files)} dosya bulundu: {[k for k in files.keys() if not k.endswith('/')][:8]}")

# ── Adım 2: Temiz ZIP bellekte oluştur ────────────────────────────────────────
print("\nTemiz ZIP oluşturuluyor...")
buf = io.BytesIO()
with zipfile.ZipFile(buf, 'w', zipfile.ZIP_DEFLATED) as zout:
    for fname, (method, comp_data, uncomp_data) in files.items():
        zout.writestr(fname, uncomp_data)
buf.seek(0)

# ── Adım 3: Workbook'ları aç ──────────────────────────────────────────────────
print("Workbook'lar açılıyor...")
try:
    wb_hb = openpyxl.load_workbook(buf, data_only=True)
    print(f"HB sheets: {wb_hb.sheetnames}")
except Exception as e:
    print(f"HB açma hatası: {e}")
    raise

try:
    wb_kit = openpyxl.load_workbook(KIT_PATH, data_only=True)
    print(f"Kit sheets: {wb_kit.sheetnames}")
except Exception as e:
    print(f"Kit açma hatası: {e}")
    raise

ws_hb  = wb_hb.active
ws_kit = wb_kit.active

print(f"\nHB boyutu: {ws_hb.max_row} satır x {ws_hb.max_column} sütun")
print(f"Kit boyutu: {ws_kit.max_row} satır x {ws_kit.max_column} sütun")

# İlk 3 satırı göster
print("\nHB ilk 3 satır:")
for i, row in enumerate(ws_hb.iter_rows(min_row=1, max_row=3, values_only=True)):
    print(f"  [{i+1}]: {str(row[:10])}")

print("\nKit ilk 3 satır:")
for i, row in enumerate(ws_kit.iter_rows(min_row=1, max_row=3, values_only=True)):
    print(f"  [{i+1}]: {str(row[:10])}")

# ── Adım 4: Birleştirme stratejisini belirle ──────────────────────────────────
# HB şablonunda header satırı bul
hb_header_row = None
kit_header_row = None
for i, row in enumerate(ws_hb.iter_rows(min_row=1, max_row=10, values_only=True), 1):
    vals = [v for v in row if v]
    if len(vals) > 5:
        hb_header_row = i
        print(f"\nHB header satırı: {i} -> {str(row[:8])}")
        break

for i, row in enumerate(ws_kit.iter_rows(min_row=1, max_row=10, values_only=True), 1):
    vals = [v for v in row if v]
    if len(vals) > 5:
        kit_header_row = i
        print(f"Kit header satırı: {i} -> {str(row[:8])}")
        break

print("\nYapı analizi tamamlandı. Birleştirme başlıyor...")

# ── Adım 5: HB verilerini Kit şablonuna kopyala ───────────────────────────────
# Kit şablonunu yeni workbook olarak düzenlenebilir aç
wb_out = openpyxl.load_workbook(KIT_PATH)
ws_out = wb_out.active

# Kit'te son veri satırını bul
kit_last_data_row = kit_header_row if kit_header_row else 1
for row in ws_kit.iter_rows(min_row=1, max_row=ws_kit.max_row, values_only=True):
    if any(v for v in row):
        kit_last_data_row += 1

# HB header sütun haritası oluştur
hb_headers = {}
if hb_header_row:
    for j, cell in enumerate(next(ws_hb.iter_rows(min_row=hb_header_row, max_row=hb_header_row)), 1):
        if cell.value:
            hb_headers[str(cell.value).strip()] = j

# Kit header sütun haritası oluştur
kit_headers = {}
kit_col_names = {}
if kit_header_row:
    for j, cell in enumerate(next(ws_out.iter_rows(min_row=kit_header_row, max_row=kit_header_row)), 1):
        if cell.value:
            kit_headers[str(cell.value).strip()] = j
            kit_col_names[j] = str(cell.value).strip()

print(f"\nHB başlıkları ({len(hb_headers)}): {list(hb_headers.keys())[:10]}")
print(f"Kit başlıkları ({len(kit_headers)}): {list(kit_headers.keys())[:10]}")

# HB'den tüm veri satırlarını al (header sonrası)
hb_data_start = (hb_header_row or 1) + 1
kit_data_start = (kit_header_row or 1) + 1

hb_rows = list(ws_hb.iter_rows(min_row=hb_data_start, values_only=True))
data_rows = [r for r in hb_rows if any(v for v in r)]
print(f"\nHB'den {len(data_rows)} veri satırı bulundu")

if not data_rows:
    print("UYARI: HB'de veri satırı yok!")
elif not kit_headers:
    print("Kit başlık haritası kurulamadı, direkt kopyalama yapılıyor...")
    # Direkt satır kopyalama
    for ri, row in enumerate(data_rows):
        out_row = kit_data_start + ri
        for ci, val in enumerate(row, 1):
            if val is not None:
                ws_out.cell(row=out_row, column=ci, value=val)
else:
    # Başlık eşleşmesi ile kopyalama
    matched = 0
    for ki, kname in kit_col_names.items():
        if kname in hb_headers:
            matched += 1
    print(f"Eşleşen sütun sayısı: {matched}/{len(kit_headers)}")

    for ri, hb_row in enumerate(data_rows):
        out_row = kit_data_start + ri
        for ki, kname in kit_col_names.items():
            if kname in hb_headers:
                hi = hb_headers[kname] - 1
                val = hb_row[hi] if hi < len(hb_row) else None
                ws_out.cell(row=out_row, column=ki, value=val)

# ── Adım 6: Kaydet ────────────────────────────────────────────────────────────
wb_out.save(OUT_PATH)
print(f"\n✅ Dosya kaydedildi: {OUT_PATH}")
print(f"   Boyut: {os.path.getsize(OUT_PATH):,} byte")
