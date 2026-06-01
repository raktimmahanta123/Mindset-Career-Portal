/* ===========================================================
   MINDSET — Core App Logic (localStorage store + helpers)
   =========================================================== */

const STORE_KEYS = {
  employers: "mindset.employers",
  employees: "mindset.employees",
  logs:      "mindset.logs",
  session:   "mindset.session"
};

const DB = {
  init() {
    if (!localStorage.getItem(STORE_KEYS.employers)) {
      const seeded = SEED.SEED_EMPLOYERS.map((e, i) => ({ id: "EMP-" + (1001 + i), ...e, createdAt: Date.now() - (i * 86400000) }));
      localStorage.setItem(STORE_KEYS.employers, JSON.stringify(seeded));
    }
    if (!localStorage.getItem(STORE_KEYS.employees)) {
      const seeded = SEED.SEED_EMPLOYEES.map((e, i) => ({ id: "CAN-" + (5001 + i), ...e, createdAt: Date.now() - (i * 43200000) }));
      localStorage.setItem(STORE_KEYS.employees, JSON.stringify(seeded));
    }
    if (!localStorage.getItem(STORE_KEYS.logs)) {
      localStorage.setItem(STORE_KEYS.logs, JSON.stringify(SEED.SEED_LOGS));
    }
  },
  get(key) { return JSON.parse(localStorage.getItem(STORE_KEYS[key]) || "[]"); },
  set(key, val) { localStorage.setItem(STORE_KEYS[key], JSON.stringify(val)); },
  reset() {
    Object.values(STORE_KEYS).forEach(k => localStorage.removeItem(k));
    DB.init();
  }
};

function logEvent(action, target) {
  const session = JSON.parse(localStorage.getItem(STORE_KEYS.session) || "{}");
  const who = session.role === "admin" ? "Admin" : (session.role === "po" ? "PO 01" : "System");
  const logs = DB.get("logs");
  logs.unshift({ t: Date.now(), user: who, action, target });
  DB.set("logs", logs.slice(0, 100));
}

function flash(msg) {
  const el = document.createElement("div");
  el.className = "flash";
  el.textContent = msg;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 2600);
}

function formatTime(ts) {
  const d = new Date(ts);
  const diff = Date.now() - ts;
  const m = Math.round(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return m + "m ago";
  const h = Math.round(m / 60);
  if (h < 24) return h + "h ago";
  const days = Math.round(h / 24);
  if (days < 7) return days + "d ago";
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

function formatINR(n) {
  return "₹" + Number(n).toLocaleString("en-IN");
}

function reveal() {
  const els = document.querySelectorAll("[data-reveal]");
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
    });
  }, { threshold: 0.12 });
  els.forEach(el => io.observe(el));
}

/* ========== Auth (demo) ========== */
function requireAuth() {
  const s = JSON.parse(localStorage.getItem(STORE_KEYS.session) || "null");
  if (!s) { window.location.href = "login.html"; return null; }
  return s;
}

function logout() {
  localStorage.removeItem(STORE_KEYS.session);
  window.location.href = "login.html";
}

/* ========== CSV / Print Export ========== */
function exportCSV(rows, filename) {
  if (!rows.length) { flash("Nothing to export"); return; }
  const headers = Object.keys(rows[0]);
  const csv = [headers.join(",")]
    .concat(rows.map(r => headers.map(h => `"${(r[h] ?? "").toString().replace(/"/g, '""')}"`).join(",")))
    .join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
  flash("Exported " + filename);
  logEvent("exported CSV", filename);
}

/* ========== Bulk CSV Import ==========
   Parses an uploaded CSV (via PapaParse loaded from CDN on the page)
   and inserts records into localStorage with per-row validation.
   Reuses the same duplicate-phone check as the single-add forms.
*/

// Schema config for each entity. Used for templates, validation, and inserts.
const BULK_CONFIGS = {
  employers: {
    storeKey: "employers",
    idPrefix: "EMP-",
    idStart: 1001,
    entitySingular: "employer",
    entityPlural: "employers",
    columns: [
      { name: "company",     required: true,  label: "Company / Organisation" },
      { name: "person",      required: true,  label: "Contact person" },
      { name: "designation", required: false, label: "Designation" },
      { name: "phone",       required: true,  label: "Contact number" },
      { name: "state",       required: true,  label: "State" },
      { name: "district",    required: false, label: "District" },
      { name: "town",        required: false, label: "Town" },
      { name: "remark",      required: false, label: "Remarks" },
    ],
    exampleRow: {
      company: "Brahmaputra Logistics Pvt. Ltd.",
      person: "Bhaskar Saikia",
      designation: "HR Manager",
      phone: "+91 98640 00001",
      state: "Assam",
      district: "Kamrup Metro",
      town: "Guwahati",
      remark: "Looking for 5 drivers and 2 accountants.",
    },
    defaults: { status: "active" },
    nameField: "company",
  },
  employees: {
    storeKey: "employees",
    idPrefix: "CAN-",
    idStart: 5001,
    entitySingular: "candidate",
    entityPlural: "candidates",
    columns: [
      { name: "name",        required: true,  label: "Candidate name" },
      { name: "dept",        required: true,  label: "Department" },
      { name: "designation", required: true,  label: "Designation" },
      { name: "phone",       required: true,  label: "Contact number" },
      { name: "state",       required: true,  label: "State" },
      { name: "district",    required: false, label: "District" },
      { name: "town",        required: false, label: "Town" },
      { name: "remark",      required: false, label: "Remarks" },
      { name: "txn",         required: false, label: "Transaction ID" },
    ],
    exampleRow: {
      name: "Rituraj Borgohain",
      dept: "Accounts & Finance",
      designation: "Accountant",
      phone: "+91 98642 00001",
      state: "Assam",
      district: "Kamrup Metro",
      town: "Guwahati",
      remark: "Completed B.Com, 2 yrs exp. Ready for interview.",
      txn: "UPI8239KD019",
    },
    defaults: { status: "paid" }, // bulk import implies admin has verified offline
    nameField: "name",
  },
};

function getBulkConfig(kind) {
  const cfg = BULK_CONFIGS[kind];
  if (!cfg) throw new Error("Unknown bulk-import kind: " + kind);
  return cfg;
}

function downloadCsvTemplate(kind) {
  const cfg = getBulkConfig(kind);
  const headers = cfg.columns.map(c => c.name);
  const example = headers.map(h => cfg.exampleRow[h] ?? "");
  const csv =
    headers.join(",") + "\n" +
    example.map(v => `"${String(v).replace(/"/g, '""')}"`).join(",") + "\n";
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `mindset-${cfg.entityPlural}-import-template.csv`;
  a.click();
  URL.revokeObjectURL(url);
  flash(`Template downloaded`);
}

/**
 * Parse a File via PapaParse and return a Promise that resolves to
 * { rows, headers } or rejects with an Error. PapaParse must be
 * loaded on the page (via CDN script tag) before this is called.
 */
function parseCsvFile(file) {
  return new Promise((resolve, reject) => {
    if (typeof Papa === "undefined") {
      reject(new Error("CSV parser not loaded — please refresh the page."));
      return;
    }
    Papa.parse(file, {
      header: true,
      skipEmptyLines: "greedy",
      transformHeader: (h) => h.trim(),
      complete: (results) => {
        const rows = (results.data || []).filter(row =>
          Object.values(row).some(v => String(v ?? "").trim() !== "")
        );
        resolve({ rows, headers: results.meta?.fields || [] });
      },
      error: (err) => reject(new Error(err?.message || "Could not read CSV file.")),
    });
  });
}

/**
 * Validate a list of rows and insert valid ones into localStorage.
 * Returns { inserted: [...], failed: [{ row: n, data, error }] }.
 * Preserves CSV order — first valid row appears at top of the table.
 */
function bulkImport(kind, rows) {
  const cfg = getBulkConfig(kind);
  const list = DB.get(cfg.storeKey);
  const inserted = [];
  const failed = [];
  // Track phones seen across the existing DB AND earlier rows in this batch
  // so duplicates within the same upload are caught.
  const seenPhones = new Set(list.map(r => String(r.phone || "").trim()));

  rows.forEach((row, idx) => {
    const data = {};
    for (const col of cfg.columns) {
      data[col.name] = String(row[col.name] ?? "").trim();
    }
    // Required-field check
    const missing = cfg.columns
      .filter(c => c.required && !data[c.name])
      .map(c => c.name);
    if (missing.length) {
      failed.push({ row: idx + 1, data, error: `Missing required field${missing.length > 1 ? "s" : ""}: ${missing.join(", ")}.` });
      return;
    }
    // Duplicate phone check (against DB + earlier rows in batch)
    if (seenPhones.has(data.phone)) {
      failed.push({ row: idx + 1, data, error: `Duplicate phone (${data.phone}) — already exists.` });
      return;
    }
    seenPhones.add(data.phone);

    const id = cfg.idPrefix + (cfg.idStart + list.length + inserted.length);
    inserted.push({
      id,
      ...data,
      ...cfg.defaults,
      createdAt: Date.now(),
    });
  });

  if (inserted.length) {
    // Newest at top — match the single-add UX (which uses unshift)
    DB.set(cfg.storeKey, [...inserted].reverse().concat(list));
    logEvent(`bulk imported ${inserted.length} ${cfg.entityPlural}` +
             (failed.length ? ` (${failed.length} skipped)` : ""), "");
  }
  return { inserted, failed };
}

/* ========== Sidebar renderer ========== */
function renderSidebar(active) {
  const session = JSON.parse(localStorage.getItem(STORE_KEYS.session) || "{}");
  const initial = (session.role === "admin" ? "A" : "P");
  const roleLabel = session.role === "admin" ? "Administrator" : "Placement Office";
  const name = session.role === "admin" ? "Raktim M." : "Placement Desk";

  return `
    <aside class="sidebar">
      <a href="dashboard.html" class="brand" style="text-decoration:none">
        <span class="dot"></span>Mindset
        <span class="sub">Pvt. Ltd.</span>
      </a>

      <div class="side-group">
        <h5>Overview</h5>
        <nav class="side-nav">
          <a href="dashboard.html" class="side-link ${active==='dashboard'?'active':''}">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M3 13h8V3H3zM13 21h8V11h-8zM3 21h8v-6H3zM13 9h8V3h-8z"/></svg>
            Dashboard
          </a>
        </nav>
      </div>

      <div class="side-group">
        <h5>Management</h5>
        <nav class="side-nav">
          <a href="employers.html" class="side-link ${active==='employers'?'active':''}">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M3 21h18M5 21V7l7-4 7 4v14M9 9h2M13 9h2M9 13h2M13 13h2M9 17h2M13 17h2"/></svg>
            Employers
          </a>
          <a href="employees.html" class="side-link ${active==='employees'?'active':''}">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="9" cy="7" r="4"/><path d="M3 21v-2a4 4 0 014-4h4a4 4 0 014 4v2M17 11l2 2 4-4"/></svg>
            Employees
          </a>
          <a href="register.html" class="side-link ${active==='register'?'active':''}">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="3" y="4" width="18" height="16" rx="1"/><path d="M8 10h8M8 14h5M8 2v4M16 2v4"/></svg>
            Registration
          </a>
        </nav>
      </div>

      <div class="side-group">
        <h5>Reports</h5>
        <nav class="side-nav">
          <a href="activity.html" class="side-link ${active==='activity'?'active':''}">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M3 12h4l3-8 4 16 3-8h4"/></svg>
            Activity Log
          </a>
        </nav>
      </div>

      <div class="side-user">
        <div class="avatar">${initial}</div>
        <div class="meta">
          <div class="n">${name}</div>
          <div class="r">${roleLabel}</div>
        </div>
        <button class="btn-icon" onclick="logout()" title="Log out" style="margin-left:auto;border-color:rgba(244,239,230,0.2)">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" width="14" height="14"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/></svg>
        </button>
      </div>
    </aside>
  `;
}

/* Init store on every page load */
(function boot() {
  if (typeof SEED !== "undefined") DB.init();
})();
