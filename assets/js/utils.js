const Utils = {
  
  /** Format Rupiah: 17910000 → "Rp 17.910.000" */
  formatRupiah(num) {
    if (num === null || num === undefined || num === '' || isNaN(num)) return 'Rp 0';
    return 'Rp ' + Number(num).toLocaleString('id-ID');
  },
  
  /** Format tanggal: "2026-06-22" → "22 Jun 2026" */
  formatDate(str) {
  if (!str) return '-';
  str = String(str).trim();
  if (!str || str === '-') return '-';
  
  var d;
  // ISO: 2026-02-15
  if (/^\d{4}[-/]\d{1,2}[-/]\d{1,2}/.test(str)) {
    var p = str.split(' ')[0].split(/[-/]/);
    d = new Date(Number(p[0]), Number(p[1])-1, Number(p[2]));
  }
  // M/D/Y atau D/M/Y
  else if (/^\d{1,2}[-/]\d{1,2}[-/]\d{4}/.test(str)) {
    var parts = str.split(/[-/]/);
    var p1 = Number(parts[0]), p2 = Number(parts[1]), p3 = Number(parts[2]);
    if (p1 > 12) {
      // DD/MM/YYYY (pasti Indonesia)
      d = new Date(p3, p2-1, p1);
    } else {
      // M/D/Y (US, sesuai data existing kamu)
      d = new Date(p3, p1-1, p2);
    }
  }
  else {
    d = new Date(str);
  }
  
  if (isNaN(d.getTime())) return str;
  return d.toLocaleDateString('id-ID', { day:'2-digit', month:'short', year:'numeric' });
},
  
  /** Badge HTML untuk status/kondisi */
  badge(text, type) {
    const t = String(text || '').toLowerCase();
    let cls = 'badge-secondary';
    
    // Kondisi
    if (t.includes('baik'))         cls = 'badge-success';
    else if (t.includes('rusak ringan')) cls = 'badge-warning';
    else if (t.includes('rusak berat'))  cls = 'badge-danger';
    // Status jadwal
    else if (t === 'terjadwal')     cls = 'badge-info';
    else if (t === 'sedang berjalan') cls = 'badge-warning';
    else if (t === 'selesai')       cls = 'badge-success';
    else if (t === 'tertunda' || t === 'ditunda') cls = 'badge-danger';
    // Status lapor
    else if (t === 'diproses')      cls = 'badge-warning';
    // Prioritas
    else if (t === 'tinggi')        cls = 'badge-danger';
    else if (t === 'sedang')        cls = 'badge-warning';
    else if (t === 'rendah')        cls = 'badge-info';
    
    return `<span class="badge ${cls}">${text || '-'}</span>`;
  },
  
  /** Extract URL dari teks status lapor (yang menggabung status + link) */
  extractLink(text) {
    if (!text) return null;
    const m = String(text).match(/(https?:\/\/[^\s]+)/);
    return m ? m[1] : null;
  },
  
  /** Hilangkan URL dari teks status */
  cleanStatus(text) {
    if (!text) return '-';
    return String(text).replace(/https?:\/\/[^\s]+/g, '').trim() || '-';
  },
  
  /** Loading spinner HTML */
  loading() {
    return '<div class="loading"><div class="spinner"></div><p>Memuat data...</p></div>';
  },
  
  /** Render last update info */
  renderLastUpdate(elemId, sheet = 'all') {
    const el = document.getElementById(elemId);
    if (!el) return;
    const t = SarprasAPI.getLastUpdate(sheet);
    el.textContent = t 
      ? `Update terakhir: ${t.toLocaleString('id-ID')}` 
      : 'Data belum dimuat';
  }
};