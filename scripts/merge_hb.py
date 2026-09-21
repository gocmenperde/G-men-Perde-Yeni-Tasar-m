import zipfile
import shutil
import os
import io
import openpyxl
from openpyxl import load_workbook
from copy import copy

HB_PATH = '/home/runner/workspace/attached_assets/HB_Duzeltilmis_Temiz_1781019586733.xlsx'
KIT_PATH = '/home/runner/workspace/attached_assets/Kirtasiye-ve-Okul-Seti_2_1781019577099.xlsx'
OUT_PATH = '/home/runner/workspace/attached_assets/Kirtasiye_Okul_Seti_HAZIR.xlsx'

# ── 1. HB dosyasını ZIP olarak oku (central directory bozuk ama dosyalar iç bloklarda sağlam)
print("HB dosyası ZIP içeriği okunuyor...")
hb_members = {}
try:
    with zipfile.ZipFile(HB_PATH, 'r') as zf:
        for name in zf.namelist():
            hb_members[name] = zf.read(name)
    print(f"ZIP içinden {len(hb_members)} dosya okundu: {list(hb_members.keys())[:5]}")
except zipfile.BadZipFile as e:
    print(f"Normal ZIP okuma başarısız: {e}")
    # recover modunda dene
    import subprocess
    result = subprocess.run(['python3', '-c', f'''
import zipfile, io
hb_members = {{}}
with open("{HB_PATH}", "rb") as f:
    data = f.read()
# ZIP Local File Headers üzerinden manuel parse
import struct
pos = 0
while pos < len(data) - 4:
    sig = data[pos:pos+4]
    if sig == b'PK\\x03\\x04':
        # Local file header
        fname_len = struct.unpack_from('<H', data, pos+26)[0]
        extra_len = struct.unpack_from('<H', data, pos+28)[0]
        comp_size = struct.unpack_from('<I', data, pos+18)[0]
        fname = data[pos+30:pos+30+fname_len].decode('utf-8','replace')
        start = pos + 30 + fname_len + extra_len
        hb_members[fname] = data[start:start+comp_size]
        pos = start + comp_size
    else:
        pos += 1
import json
print(json.dumps(list(hb_members.keys())))
'''], capture_output=True, text=True)
    print("Recovered keys:", result.stdout[:500])

# ── 2. Tamir edilmiş HB xlsx'i bellekte oluştur
print("\nHB xlsx bellekte yeniden oluşturuluyor...")
buf = io.BytesIO()
with zipfile.ZipFile(buf, 'w', zipfile.ZIP_DEFLATED) as zout:
    for name, content in hb_members.items():
        zout.writestr(name, content)
buf.seek(0)

# ── 3. Her iki workbook'u yükle
print("Workbook'lar yükleniyor...")
wb_hb = load_workbook(buf, data_only=True)
wb_kit = load_workbook(KIT_PATH, data_only=True)

print(f"HB sheets: {wb_hb.sheetnames}")
print(f"Kit sheets: {wb_kit.sheetnames}")

ws_hb = wb_hb.active
ws_kit = wb_kit.active

print(f"HB boyutu: {ws_hb.max_row} satir x {ws_hb.max_column} sutun")
print(f"Kit boyutu: {ws_kit.max_row} satir x {ws_kit.max_column} sutun")

# İlk 3 satır göster
print("\nHB ilk 3 satır:")
for i, row in enumerate(ws_hb.iter_rows(min_row=1, max_row=3, values_only=True)):
    print(f"  [{i}]: {str(row)[:300]}")

print("\nKit ilk 3 satır:")
for i, row in enumerate(ws_kit.iter_rows(min_row=1, max_row=3, values_only=True)):
    print(f"  [{i}]: {str(row)[:300]}")
