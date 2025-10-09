const LS_KEY = "ticketbright_users_csv_mvp";
let users = [];

const tbody = document.querySelector("#usersTable tbody");
const importFileEl = document.getElementById("importFile");
const exportBtn = document.getElementById("exportCsvBtn");
const clearBtn = document.getElementById("clearDataBtn");
const addForm = document.getElementById("addUserForm");
const nameInput = document.getElementById("nameInput");
const emailInput = document.getElementById("emailInput");
const roleInput = document.getElementById("roleInput");

init();

function init() {
  loadLocal();
  if (users.length === 0) {
    users = [
      { id: 1, name: "John Doe", email: "john@example.com", role: "student" },
      { id: 2, name: "Jane Smith", email: "jane@example.com", role: "organizer" }
    ];
    saveLocal();
  }
  render();
  importFileEl.addEventListener("change", onImportCsv);
  exportBtn.addEventListener("click", onExportCsv);
  clearBtn.addEventListener("click", onClearLocal);
  addForm.addEventListener("submit", (e) => {
    e.preventDefault();
    addUser();
  });
}

function render() {
  tbody.innerHTML = "";
  users.sort((a, b) => Number(a.id) - Number(b.id)).forEach((u) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${u.id}</td>
      <td>${esc(u.name)}</td>
      <td>${esc(u.email)}</td>
      <td><span class="tag">${esc(u.role)}</span></td>
      <td><button class="action-btn" data-id="${u.id}">Delete</button></td>
    `;
    tr.querySelector("button").addEventListener("click", () => delUser(u.id));
    tbody.appendChild(tr);
  });
}

function addUser() {
  const name = nameInput.value.trim();
  const email = emailInput.value.trim().toLowerCase();
  const role = roleInput.value.trim();
  if (!name || !email || !role) return alert("Fill name, email, and role.");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return alert("Invalid email.");
  if (users.some((u) => u.email.toLowerCase() === email))
    return alert("Email already exists.");

  const nextId = users.reduce((m, u) => Math.max(m, Number(u.id) || 0), 0) + 1;
  users.push({ id: nextId, name, email, role });
  saveLocal();
  render();
  addForm.reset();
  nameInput.focus();
}

function delUser(id) {
  const i = users.findIndex((u) => String(u.id) === String(id));
  if (i === -1) return;
  if (!confirm(`Delete user #${id}?`)) return;
  users.splice(i, 1);
  saveLocal();
  render();
}

function saveLocal() {
  localStorage.setItem(LS_KEY, JSON.stringify(users));
}

function loadLocal() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    users = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(users)) users = [];
  } catch {
    users = [];
  }
}

async function onImportCsv(e) {
  const file = e.target.files && e.target.files[0];
  if (!file) return;
  try {
    const text = await file.text();
    const rows = parseCsv(text);
    const norm = normalize(rows);
    if (!norm.ok) return alert("CSV error: " + norm.error);
    users = norm.rows;
    saveLocal();
    render();
    alert(`Imported ${users.length} users.`);
  } catch (err) {
    alert("Failed to import: " + err.message);
  } finally {
    importFileEl.value = "";
  }
}

function onExportCsv() {
  const csv = toCsv(users, ["id", "name", "email", "role"]);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "users.csv";
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function onClearLocal() {
  if (!confirm("Clear all local data?")) return;
  localStorage.removeItem(LS_KEY);
  users = [];
  render();
}

/* ---------- CSV Helpers ---------- */
function parseCsv(text) {
  const lines = text.replace(/\r/g, "").split("\n").filter((l) => l.trim().length > 0);
  if (lines.length === 0) return [];
  const headers = splitCsvLine(lines[0]).map((h) => h.trim());
  const data = [];
  for (let i = 1; i < lines.length; i++) {
    const cols = splitCsvLine(lines[i]);
    const obj = {};
    headers.forEach((h, idx) => (obj[h] = (cols[idx] ?? "").trim()));
    data.push(obj);
  }
  return data;
}

function splitCsvLine(line) {
  const out = [];
  let cur = "";
  let q = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (q) {
      if (ch === '"') {
        if (line[i + 1] === '"') {
          cur += '"';
          i++;
        } else q = false;
      } else cur += ch;
    } else {
      if (ch === '"') q = true;
      else if (ch === ",") {
        out.push(cur);
        cur = "";
      } else cur += ch;
    }
  }
  out.push(cur);
  return out;
}

function normalize(rows) {
  if (!Array.isArray(rows) || rows.length === 0)
    return { ok: false, error: "Empty CSV" };
  const need = ["id", "name", "email", "role"];
  const have = Object.keys(rows[0]).map((k) => k.toLowerCase());
  for (const n of need)
    if (!have.includes(n)) return { ok: false, error: `Missing column "${n}"` };
  const out = [];
  const seen = new Set();
  for (const r of rows) {
    const id = Number(r.id);
    const name = String(r.name || "").trim();
    const email = String(r.email || "").trim().toLowerCase();
    const role = String(r.role || "").trim();
    if (!name || !email || !role || Number.isNaN(id)) continue;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) continue;
    if (seen.has(email)) continue;
    seen.add(email);
    out.push({ id, name, email, role });
  }
  return { ok: true, rows: out };
}

function toCsv(arr, headers) {
  const head = headers.join(",") + "\n";
  const body = arr
    .map((r) => headers.map((h) => csvEsc(r[h] ?? "")).join(","))
    .join("\n");
  return head + body + "\n";
}

function csvEsc(s) {
  const str = String(s);
  return /[",\n]/.test(str) ? '"' + str.replace(/"/g, '""') + '"' : str;
}

function esc(s) {
  return String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
