// Events: render / add / delete / import / export
window.TB = window.TB || {};
TB.Events = {
  init() {
    // seed demo events once
    if (TB.STATE.events.length === 0) {
      TB.STATE.events = [
        { id: 1, title: "Welcome Fair", date: "2025-09-10", location: "Hall A", capacity: 200 },
        { id: 2, title: "Hack Night",   date: "2025-10-01", location: "Lab 3", capacity: 60  }
      ];
      TB.Storage.saveEvents();
    }

    // wire events (if elements exist)
    const importEl = TB.Utils.pick("eventsImportFile");
    const exportBtn = TB.Utils.pick("eventsExportBtn");
    const clearBtn  = TB.Utils.pick("eventsClearBtn");
    const form      = TB.Utils.pick("addEventForm");

    if (importEl) importEl.addEventListener("change", this.onImport.bind(this));
    if (exportBtn) exportBtn.addEventListener("click", this.onExport.bind(this));
    if (clearBtn)  clearBtn.addEventListener("click", this.onClear.bind(this));
    if (form) form.addEventListener("submit", (e) => {
      e.preventDefault(); this.add();
    });

    this.render();
  },

  render() {
    const tbody = (TB.Utils.pick("eventsTable") || {}).querySelector?.("tbody");
    if (!tbody) return;
    tbody.innerHTML = "";

    TB.STATE.events
      .slice()
      .sort((a, b) => Number(a.id) - Number(b.id))
      .forEach(ev => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td>${ev.id}</td>
          <td>${TB.Utils.esc(ev.title)}</td>
          <td>${TB.Utils.esc(ev.date)}</td>
          <td>${TB.Utils.esc(ev.location)}</td>
          <td>${Number(ev.capacity)}</td>
          <td><button class="action-btn" data-id="${ev.id}">Delete</button></td>
        `;
        tr.querySelector("button").addEventListener("click", () => this.del(ev.id));
        tbody.appendChild(tr);
      });
  },

  add() {
    const title = TB.Utils.pick("eventTitleInput")?.value.trim();
    const date = TB.Utils.pick("eventDateInput")?.value.trim();          // yyyy-mm-dd
    const location = TB.Utils.pick("eventLocationInput")?.value.trim();
    const capacity = Number(TB.Utils.pick("eventCapacityInput")?.value.trim());

    if (!title || !date || !location || Number.isNaN(capacity))
      return alert("Fill title, date, location, and capacity (number).");

    const id = TB.Utils.nextId(TB.STATE.events);
    TB.STATE.events.push({ id, title, date, location, capacity });
    TB.Storage.saveEvents();
    this.render();

    const form = TB.Utils.pick("addEventForm");
    if (form) form.reset();
    if (TB.Utils.pick("eventTitleInput")) TB.Utils.pick("eventTitleInput").focus();
  },

  del(id) {
    const i = TB.STATE.events.findIndex(ev => String(ev.id) === String(id));
    if (i === -1) return;
    if (!confirm(`Delete event #${id}?`)) return;
    TB.STATE.events.splice(i, 1);
    TB.Storage.saveEvents();
    this.render();
  },

  async onImport(e) {
    const f = e.target.files?.[0];
    if (!f) return;
    try {
      const text = await f.text();
      const rows = TB.CSV.parse(text);
      const norm = TB.CSV.normalizeEvents(rows);
      if (!norm.ok) return alert("CSV error: " + norm.error);
      TB.STATE.events = norm.rows;
      TB.Storage.saveEvents();
      this.render();
      alert(`Imported ${TB.STATE.events.length} events.`);
    } catch (err) {
      alert("Failed to import: " + err.message);
    } finally {
      e.target.value = "";
    }
  },

  onExport() {
    const csv = TB.CSV.toCsv(TB.STATE.events, ["id","title","date","location","capacity"]);
    TB.CSV.download("events.csv", csv);
  },

  onClear() {
    if (!confirm("Clear all local event data?")) return;
    TB.STATE.events = [];
    TB.Storage.saveEvents();
    this.render();
  }
};
