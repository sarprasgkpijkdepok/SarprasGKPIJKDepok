"""
Auto-generate index.json untuk halaman Laporan Tahunan
Cara pakai:
  1. Letakkan PDF di folder: assets/Laporan_Tahunan/
  2. Naming: Laporan_YYYY.pdf (mis. Laporan_2025.pdf)
  3. Jalankan: python generate_index.py
  4. File index.json akan ter-generate otomatis
"""

import os
import re
import json
from datetime import datetime

# ====== CONFIG ======
FOLDER = os.path.join('assets', 'Laporan_Tahunan')
OUTPUT = os.path.join(FOLDER, 'index.json')

# Optional: deskripsi custom per tahun (boleh tambah)
DESCRIPTIONS = {
    '2025': 'Laporan Pertanggungjawaban Tim Sarpras GKPI JK Depok Tahun 2025',
    '2026': 'Laporan Tahun 2027 akan dimuat pada akhir tahun 2026',
    '2027': 'Laporan Tahun 2027 akan dimuat pada akhir tahun 2027',
    '2028': 'Laporan Tahun 2028 akan dimuat pada akhir tahun 2028',
    '2029': 'Laporan Tahun 2029 akan dimuat pada akhir tahun 2029',
    '2030': 'Laporan Tahun 2030 - Akhir periode jabatan Anderson',
}


def main():
    if not os.path.isdir(FOLDER):
        print(f'❌ Folder tidak ditemukan: {FOLDER}')
        print(f'   Buat folder dulu, lalu upload file PDF ke sana.')
        return

    # Scan semua file PDF
    files = []
    for fname in sorted(os.listdir(FOLDER)):
        if not fname.lower().endswith('.pdf'):
            continue
        
        full_path = os.path.join(FOLDER, fname)
        size_bytes = os.path.getsize(full_path)
        mtime = datetime.fromtimestamp(os.path.getmtime(full_path))
        
        # Ekstrak tahun dari nama file: Laporan_2025.pdf -> 2025
        match = re.search(r'(\d{4})', fname)
        tahun = match.group(1) if match else 'Unknown'
        
        item = {
            'filename': fname,
            'tahun': tahun,
            'title': f'Laporan Tahun {tahun}',
            'size': size_bytes,
            'date': mtime.strftime('%d %b %Y'),
            'description': DESCRIPTIONS.get(tahun, '')
        }
        files.append(item)
        print(f'  📄 {fname:30s} | {tahun} | {format_size(size_bytes):>10s}')
    
    # Sort by tahun descending (terbaru di atas)
    files.sort(key=lambda x: int(x['tahun']) if x['tahun'].isdigit() else 0, reverse=True)
    
    # Generate JSON
    output_data = {
        'generated_at': datetime.now().isoformat(),
        'total': len(files),
        'files': files
    }
    
    with open(OUTPUT, 'w', encoding='utf-8') as f:
        json.dump(output_data, f, ensure_ascii=False, indent=2)
    
    print('')
    print(f'✅ {len(files)} file PDF terindeks ke: {OUTPUT}')
    print(f'📅 Generated at: {output_data["generated_at"]}')


def format_size(bytes_val):
    if bytes_val < 1024:
        return f'{bytes_val} B'
    elif bytes_val < 1024*1024:
        return f'{bytes_val/1024:.1f} KB'
    else:
        return f'{bytes_val/(1024*1024):.1f} MB'


if __name__ == '__main__':
    main()