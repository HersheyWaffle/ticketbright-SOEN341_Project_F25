// Boot sequence: load storage, then init modules present on the page
(function () {
  TB.Storage.loadUsers();
  TB.Storage.loadEvents();

  // Users section present?
  if (document.getElementById("usersTable")) {
    TB.Users.init();
  }

  // Events section present?
  if (document.getElementById("eventsTable")) {
    TB.Events.init();
  }
})();
