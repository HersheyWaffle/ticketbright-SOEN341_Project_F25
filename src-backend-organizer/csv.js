// CSV parsing/normalizing for Users & Events + export helpers
window.TB = window.TB || {};
TB.CSV = {
  parse(text) {
    const lines = String(text || "").replace(/\r/g, "").split("\n").filter(l => l.trim().length > 0);
    if (lines.length === 0) return [];
    const headers = this._splitLine(lines[0]).map(h => h.trim());
    const data = [];
    for (let i = 1; i < lines.length; i++) {
      const cols = this._splitLine(lines[i]);
      const row = {};
      headers.forEach((h, idx) => row[h] = (cols[idx] ?? "").trim());
      data.push(row);
    }
    return data;
  },
  _splitLine(line) {
    const out = []; let cur = ""; let q = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (q) {
        if (ch === '"') {
          if (line[i + 1] === '"') { cur += '"'; i++; }
          else q = false;
        } else cur += ch;
      } else {
        if (ch === '"') q = true;
        else if (ch === ",") { out.push(cur); cur = ""; }
        else cur += ch;
      }
    }
    out.push(cur);
    return out;
  },
  normalizeUsers(rows) {
    if (!Array.isArray(rows) || rows.length === 0) return { ok: false, error: "Empty CSV" };
    const need = ["id","name","email","role"];
    const have = Object.keys(rows[0]).map(k => k.toLowerCase());
    for (const n of need) if (!have.includes(n)) return { ok: false, error: `Missing column "${n}"` };

    const out = []; const seen = new Set();
    for (const r of rows) {
      const id = Number(r.id);
      const name = String(r.name || "").trim();
      const email = String(r.email || "").trim().toLowerCase();
      const role = String(r.role || "").trim();
      if (!name || !email || !role || Number.isNaN(id)) continue;
      if (!TB.Utils.isValidEmail(email)) continue;
      if (seen.has(email)) continue; seen.add(email);
      out.push({ id, name, email, role });
    }
    return { ok: true, rows: out };
  },
  normalizeEvents(rows) {
    // expected headers: id,title,date,location,capacity
    if (!Array.isArray(rows) || rows.length === 0) return { ok: false, error: "Empty CSV" };
    const need = ["id","title","date","location","capacity"];
    const have = Object.keys(rows[0]).map(k => k.toLowerCase());
    for (const n of need) if (!have.includes(n)) return { ok: false, error: `Missing column "${n}"` };

    const out = [];
    for (const r of rows) {
      const id = Number(r.id);
      const title = String(r.title || "").trim();
      const date = String(r.date || "").trim();        // ISO or yyyy-mm-dd
      const location = String(r.location || "").trim();
      const capacity = Number(r.capacity);
      if (!title || !date || !location || Number.isNaN(id) || Number.isNaN(capacity)) continue;
      out.push({ id, title, date, location, capacity });
    }
    return { ok: true, rows: out };
  },
  toCsv(arr, headers) {
    const head = headers.join(",") + "\n";
    const body = arr.map(r => headers.map(h => this._csvEsc(r[h] ?? "")).join(",")).join("\n");
    return head + body + "\n";
  },
  _csvEsc(s) {
    const str = String(s);
    return /[",\n]/.test(str) ? '"' + str.replace(/"/g, '""') + '"' : str;
  },
  download(filename, text) {
    const blob = new Blob([text], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = filename;
    document.body.appendChild(a); a.click(); a.remove();
    URL.revokeObjectURL(url);
  }
};
