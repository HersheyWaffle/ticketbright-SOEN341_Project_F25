// Users: render / add / delete / import / export
window.TB = window.TB || {};
TB.Users = {
  init() {
    // seed demo data once
    if (TB.STATE.users.length === 0) {
      TB.STATE.users = [
        { id: 1, name: "John Doe",  email: "john@example.com", role: "student" },
        { id: 2, name: "Jane Smith",email: "jane@example.com", role: "organizer" }
      ];
      TB.Storage.saveUsers();
    }

    // wire events (if elements exist)
    const importEl = TB.Utils.pick("usersImportFile");
    const exportBtn = TB.Utils.pick("usersExportBtn");
    const clearBtn  = TB.Utils.pick("usersClearBtn");
    const form      = TB.Utils.pick("addUserForm");

    if (importEl) importEl.addEventListener("change", this.onImport.bind(this));
    if (exportBtn) exportBtn.addEventListener("click", this.onExport.bind(this));
    if (clearBtn)  clearBtn.addEventListener("click", this.onClear.bind(this));
    if (form) form.addEventListener("submit", (e) => {
      e.preventDefault(); this.add();
    });

    this.render();
  },

  render() {
    const tbody = (TB.Utils.pick("usersTable") || {}).querySelector?.("tbody");
    if (!tbody) return;
    tbody.innerHTML = "";

    TB.STATE.users
      .slice()
      .sort((a, b) => Number(a.id) - Number(b.id))
      .forEach(u => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td>${u.id}</td>
          <td>${TB.Utils.esc(u.name)}</td>
          <td>${TB.Utils.esc(u.email)}</td>
          <td><span class="tag">${TB.Utils.esc(u.role)}</span></td>
          <td><button class="action-btn" data-id="${u.id}">Delete</button></td>
        `;
        tr.querySelector("button").addEventListener("click", () => this.del(u.id));
        tbody.appendChild(tr);
      });
  },

  add() {
    const name = TB.Utils.pick("nameInput")?.value.trim();
    const email = TB.Utils.pick("emailInput")?.value.trim().toLowerCase();
    const role = TB.Utils.pick("roleInput")?.value.trim();

    if (!name || !email || !role) return alert("Fill name, email, and role.");
    if (!TB.Utils.isValidEmail(email)) return alert("Invalid email.");
    if (TB.STATE.users.some(u => u.email.toLowerCase() === email)) return alert("Email already exists.");

    const id = TB.Utils.nextId(TB.STATE.users);
    TB.STATE.users.push({ id, name, email, role });
    TB.Storage.saveUsers();
    this.render();

    const form = TB.Utils.pick("addUserForm");
    if (form) form.reset();
    if (TB.Utils.pick("nameInput")) TB.Utils.pick("nameInput").focus();
  },

  del(id) {
    const i = TB.STATE.users.findIndex(u => String(u.id) === String(id));
    if (i === -1) return;
    if (!confirm(`Delete user #${id}?`)) return;
    TB.STATE.users.splice(i, 1);
    TB.Storage.saveUsers();
    this.render();
  },

  async onImport(e) {
    const f = e.target.files?.[0];
    if (!f) return;
    try {
      const text = await f.text();
      const rows = TB.CSV.parse(text);
      const norm = TB.CSV.normalizeUsers(rows);
      if (!norm.ok) return alert("CSV error: " + norm.error);
      TB.STATE.users = norm.rows;
      TB.Storage.saveUsers();
      this.render();
      alert(`Imported ${TB.STATE.users.length} users.`);
    } catch (err) {
      alert("Failed to import: " + err.message);
    } finally {
      e.target.value = "";
    }
  },

  onExport() {
    const csv = TB.CSV.toCsv(TB.STATE.users, ["id","name","email","role"]);
    TB.CSV.download("users.csv", csv);
  },

  onClear() {
    if (!confirm("Clear all local user data?")) return;
    TB.STATE.users = [];
    TB.Storage.saveUsers();
    this.render();
  }
};
