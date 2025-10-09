// Small helpers used by multiple modules
window.TB = window.TB || {};
TB.Utils = {
  isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || "").trim());
  },
  esc(s) {
    return String(s)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  },
  nextId(list) {
    return list.reduce((m, x) => Math.max(m, Number(x.id) || 0), 0) + 1;
  },
  pick(el) { return document.getElementById(el); }
};
