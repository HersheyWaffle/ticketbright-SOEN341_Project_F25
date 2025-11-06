// Mock dataset
let organizers = [
  {id:1, name:"Ayla Kent",  email:"ayla.kent@gmail.com",  org:"Robotics Club",     status:"pending",  date:"2025-10-27"},
  {id:2, name:"Ben Martin",  email:"ben.martin@gmail.com",  org:"Music Society",     status:"pending",  date:"2025-10-28"},
  {id:3, name:"Chloe Tran", email:"chloe.tran@hotmail.com", org:"Debate Union",      status:"approved", date:"2025-10-18"},
  {id:4, name:"Diego Park", email:"diego.park@outlook.com", org:"Film Association",  status:"rejected", date:"2025-10-20"},
  {id:5, name:"Emma Wilson",email:"emma.wilson@gmail.com",org:"Art Club",          status:"pending",  date:"2025-10-29"},
  {id:6, name:"Frank Liu",  email:"frank.liu@outlook.com",  org:"Science Society",   status:"pending",  date:"2025-10-26"},
  {id:7, name:"Grace Kim",  email:"grace.kim@gmail.com",  org:"Drama Group",       status:"approved", date:"2025-10-22"},
  {id:8, name:"Henry Brown",email:"henry.brown@gmail.com",org:"Sports Club",       status:"rejected", date:"2025-10-24"},
];

// DOM refs
const els = {
  stats: document.getElementById("orgStats"),
  table: document.getElementById("organizersTable"),
  search: document.getElementById("searchInput"),
  searchBtn: document.getElementById("searchBtn"),
  statusFilter: document.getElementById("statusFilter"),
  sortBy: document.getElementById("sortBy"),
  selectAll: document.getElementById("selectAll"),
  approveSelected: document.getElementById("approveSelected"),
  rejectSelected: document.getElementById("rejectSelected"),
  selectedCount: document.getElementById("selectedCount"),
};

// Stats
function renderStats(){
  const totals = { pending:0, approved:0, rejected:0 };
  organizers.forEach(o => totals[o.status]++);
  els.stats.innerHTML = `
    <div class="statCard pending">
      <div class="statIcon pending"><i class="fas fa-clock"></i></div>
      <div class="statInfo"><div class="statLabel">Pending Review</div>
      <div class="statValue">${totals.pending}</div></div>
    </div>
    <div class="statCard approved">
      <div class="statIcon approved"><i class="fas fa-check-circle"></i></div>
      <div class="statInfo"><div class="statLabel">Approved</div>
      <div class="statValue">${totals.approved}</div></div>
    </div>
    <div class="statCard rejected">
      <div class="statIcon rejected"><i class="fas fa-times-circle"></i></div>
      <div class="statInfo"><div class="statLabel">Rejected</div>
      <div class="statValue">${totals.rejected}</div></div>
    </div>
  `;
}

// Filtering / sort
function applyFilters(data){
  const q = (els.search.value || "").trim().toLowerCase();
  let filtered = data.filter(o =>
    [o.name,o.email,o.org].some(v => v.toLowerCase().includes(q))
  );

  const s = els.statusFilter.value;
  if(s !== "all") filtered = filtered.filter(o => o.status === s);

  switch(els.sortBy.value){
    case "date_asc":  filtered.sort((a,b)=> a.date.localeCompare(b.date)); break;
    case "date_desc": filtered.sort((a,b)=> b.date.localeCompare(a.date)); break;  // fixed
    case "name_asc":  filtered.sort((a,b)=> a.name.localeCompare(b.name)); break;
    case "name_desc": filtered.sort((a,b)=> b.name.localeCompare(a.name)); break;  // fixed
  }
  return filtered;
}

function badge(status){
  const text = status[0].toUpperCase() + status.slice(1);
  return `<span class="badge badge-${status}">${text}</span>`;
}

// Selected count + buttons
function updateSelectedCount(){
  const selectedCount = document.querySelectorAll('.row-checkbox:checked').length;
  els.selectedCount.textContent = `${selectedCount} organizer${selectedCount !== 1 ? 's' : ''} selected`;
  els.approveSelected.disabled = selectedCount === 0;
  els.rejectSelected.disabled  = selectedCount === 0;

  const totalRows = document.querySelectorAll('.row-checkbox').length;
  els.selectAll.checked = totalRows > 0 && selectedCount === totalRows;
  els.selectAll.indeterminate = selectedCount > 0 && selectedCount < totalRows;
}

// Table render
function renderTable(){
  const filteredData = applyFilters(organizers);

  if(filteredData.length === 0){
    els.table.innerHTML = `
      <tr>
        <td colspan="6" class="emptyState">
          <div class="emptyStateIcon">📭</div>
          <p>No organizers found</p>
          <p>Try adjusting your search or filters</p>
        </td>
      </tr>`;
  } else {
    els.table.innerHTML = filteredData.map(o => `
      <tr data-id="${o.id}">
        <td><input type="checkbox" class="checkbox row-checkbox" data-id="${o.id}"></td>
        <td>${o.name}</td>
        <td>${o.email}</td>
        <td>${o.org}</td>
        <td>${badge(o.status)}</td>
        <td class="actions">
          ${o.status!=="approved" ? `
            <button class="btn btn-success btn-sm" data-act="approve">
              <i class="fas fa-check"></i> Approve
            </button>` : ""}
          ${o.status!=="rejected" ? `
            <button class="btn btn-danger btn-sm" data-act="reject">
              <i class="fas fa-times"></i> Reject
            </button>` : ""}
        </td>
      </tr>
    `).join("");
  }
  updateSelectedCount();
}

// Single update
// ---- SINGLE: Approve/Reject one organizer via backend ----
async function updateStatus(id, nextStatus) {
  const row = organizers.find(o => o.id === id);
  if (!row) return;

  const url = `/api/admin/organizers/${id}/${nextStatus === 'approved' ? 'approve' : 'reject'}`;

  try {
    const res = await fetch(url, { method: 'POST' });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      console.error(`Failed to ${nextStatus} #${id}:`, data.message || res.statusText);
      return;
    }
    // server ok → update local row and rerender
    row.status = nextStatus;
    renderStats();
    renderTable();
  } catch (err) {
    console.error(`Network error ${nextStatus} #${id}:`, err);
  }
}
// function updateStatus(id,status){
//   const org = organizers.find(o => o.id === id);
//   if(!org) return;
//   org.status = status;
//   renderStats(); renderTable();
// }

// Bulk update
// ---- BULK: Approve/Reject selected organizers via backend ----
async function updateSelectedStatus(nextStatus) {
  const ids = [...document.querySelectorAll('.row-checkbox:checked')]
    .map(cb => parseInt(cb.dataset.id, 10));

  if (!ids.length) return;

  try {
    await Promise.all(
      ids.map(id =>
        fetch(`/api/admin/organizers/${id}/${nextStatus === 'approved' ? 'approve' : 'reject'}`, {
          method: 'POST'
        }).then(r => {
          if (!r.ok) throw new Error(`${nextStatus} failed for id ${id} (HTTP ${r.status})`);
        })
      )
    );

    // server ok → update local rows and rerender
    organizers.forEach(o => {
      if (ids.includes(o.id) && o.status === 'pending') o.status = nextStatus;
    });
    renderStats();
    renderTable();
  } catch (err) {
    console.error('Bulk update error:', err);
  }
}

// function updateSelectedStatus(status){
//   const ids = [...document.querySelectorAll('.row-checkbox:checked')]
//                 .map(cb => parseInt(cb.dataset.id,10));
//   if(ids.length === 0) return;
//   organizers.forEach(o => {
//     if(ids.includes(o.id) && o.status === "pending") o.status = status;
//   });
//   renderStats(); renderTable();
// }

/* --------- Events --------- */
els.table.addEventListener('click', (e) => {
  const btn = e.target.closest('button');
  if(!btn) return;
  const id = parseInt(e.target.closest('tr').dataset.id,10);
  if(btn.dataset.act === 'approve') updateStatus(id,'approved');
  if(btn.dataset.act === 'reject')  updateStatus(id,'rejected');
});

els.table.addEventListener('change', (e) => {
  if(e.target.classList.contains('row-checkbox')) updateSelectedCount();
});

els.selectAll.addEventListener('change', (e) => {
  document.querySelectorAll('.row-checkbox').forEach(cb => cb.checked = e.target.checked);
  updateSelectedCount();
});

['input','change'].forEach(ev => {
  els.search.addEventListener(ev, renderTable);
  els.statusFilter.addEventListener(ev, renderTable);
  els.sortBy.addEventListener(ev, renderTable);
});

els.searchBtn.addEventListener('click', renderTable);
els.approveSelected.addEventListener('click', () => updateSelectedStatus('approved'));
els.rejectSelected.addEventListener('click',  () => updateSelectedStatus('rejected'));

/* --------- Init --------- */
renderStats();
renderTable();


// Logout functionality
document.querySelector('.logoutButton').addEventListener('click', function() {
if(confirm('Are you sure you want to log out?')) {
    window.location.href = '../main/main.html';
    }
});
