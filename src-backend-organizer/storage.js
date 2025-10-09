// Load/save STATE to LocalStorage
window.TB = window.TB || {};
TB.Storage = {
  saveUsers() {
    localStorage.setItem(TB.CONST.LS_USERS, JSON.stringify(TB.STATE.users));
  },
  loadUsers() {
    try {
      const raw = localStorage.getItem(TB.CONST.LS_USERS);
      TB.STATE.users = raw ? JSON.parse(raw) : [];
      if (!Array.isArray(TB.STATE.users)) TB.STATE.users = [];
    } catch { TB.STATE.users = []; }
  },
  saveEvents() {
    localStorage.setItem(TB.CONST.LS_EVENTS, JSON.stringify(TB.STATE.events));
  },
  loadEvents() {
    try {
      const raw = localStorage.getItem(TB.CONST.LS_EVENTS);
      TB.STATE.events = raw ? JSON.parse(raw) : [];
      if (!Array.isArray(TB.STATE.events)) TB.STATE.events = [];
    } catch { TB.STATE.events = []; }
  }
};
