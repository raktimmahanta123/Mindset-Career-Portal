/* ===========================================================
   MINDSET CAREER — Frontend client

   Talks to the Express API in server/index.js. Keeps a small
   in-memory cache (STATE) so template render code can read
   data synchronously (DB.get("employers")) while mutations
   and the initial load happen asynchronously via the API.

   Configuration:
     window.MINDSET_API_BASE — base URL of the API.
     Defaults to http://localhost:4000 in development.
     Set on window before this script loads to override for prod.
   =========================================================== */

// Auto-pick the right API base:
//   1. Explicit override via window.MINDSET_API_BASE wins (set in HTML).
//   2. Otherwise, if served from a non-localhost domain, use the
//      hosted Render backend (set this string after the first Render
//      deploy gives you the actual URL — search "MINDSET_API_BASE_PROD").
//   3. Default to localhost:4000 for development.
const MINDSET_API_BASE_PROD = "https://mindset-career-api.onrender.com";

const API_BASE = (() => {
  if (typeof window === "undefined") return "http://localhost:4000";
  if (window.MINDSET_API_BASE) return window.MINDSET_API_BASE;
  const host = window.location.hostname || "";
  const isLocal = host === "" || host === "localhost" || host.startsWith("127.") || host.endsWith(".local");
  return isLocal ? "http://localhost:4000" : MINDSET_API_BASE_PROD;
})();

const TOKEN_KEY = "mindset.token";
const USER_KEY = "mindset.user";

/* ---------- In-memory cache (refilled from server on each page load) ---------- */
const STATE = {
  token: "",
  user: null,
  employers: [],
  employees: [],
  activityLog: [],
};

function loadTokenFromStorage() {
  STATE.token = localStorage.getItem(TOKEN_KEY) || "";
  try { STATE.user = JSON.parse(localStorage.getItem(USER_KEY) || "null"); }
  catch { STATE.user = null; }
}

function persistSession(token, user) {
  STATE.token = token;
  STATE.user = user;
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

function clearSession() {
  STATE.token = "";
  STATE.user = null;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

/* ---------- Low-level fetch helper ---------- */
async function api(path, options = {}) {
  const headers = {
    "Content-Type": "application/json",
    ...(STATE.token ? { Authorization: `Bearer ${STATE.token}` } : {}),
    ...(options.headers || {}),
  };
  const res = await fetch(API_BASE + path, { ...options, headers });
  const ct = res.headers.get("content-type") || "";
  const body = ct.includes("application/json") ? await res.json().catch(() => null) : null;
  if (!res.ok) {
    if (res.status === 401) {
      clearSession();
      if (!location.pathname.endsWith("login.html") && !location.pathname.endsWith("index.html") && location.pathname !== "/") {
        location.href = "login.html";
      }
    }
    throw new Error(body?.message || res.statusText || "Request failed");
  }
  return body;
}

/* ---------- High-level API (one method per resource action) ---------- */
const API = {
  async login(username, password) {
    const r = await api("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    });
    persistSession(r.token, r.user);
    return r;
  },
  async logout() {
    try { await api("/api/auth/logout", { method: "POST" }); } catch { /* ignore */ }
    clearSession();
  },
  async bootstrap() {
    const r = await api("/api/bootstrap");
    STATE.user = r.user;
    STATE.employers = r.employers || [];
    STATE.employees = r.employees || [];
    STATE.activityLog = r.activityLog || [];
    return r;
  },
  async changePassword(currentPassword, newPassword) {
    return api("/api/auth/change-password", {
      method: "POST",
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  },
  async resetPassword(username) {
    return api("/api/auth/reset-password", {
      method: "POST",
      body: JSON.stringify({ username }),
    });
  },

  employers: {
    async create(data) {
      const r = await api("/api/employers", { method: "POST", body: JSON.stringify(data) });
      STATE.employers = [r, ...STATE.employers];
      return r;
    },
    async update(id, data) {
      const r = await api(`/api/employers/${encodeURIComponent(id)}`, {
        method: "PUT", body: JSON.stringify(data),
      });
      STATE.employers = STATE.employers.map(x => x.id === id ? r : x);
      return r;
    },
    async remark(id, remark) {
      const r = await api(`/api/employers/${encodeURIComponent(id)}/remark`, {
        method: "PATCH", body: JSON.stringify({ remark }),
      });
      STATE.employers = STATE.employers.map(x => x.id === id ? r : x);
      return r;
    },
    async followup(id, note) {
      const r = await api(`/api/employers/${encodeURIComponent(id)}/followups`, {
        method: "POST", body: JSON.stringify({ note }),
      });
      STATE.employers = STATE.employers.map(x => x.id === id ? r : x);
      return r;
    },
    async archive(id) {
      const r = await api(`/api/employers/${encodeURIComponent(id)}/archive`, { method: "PATCH" });
      STATE.employers = STATE.employers.map(x => x.id === id ? r : x);
      return r;
    },
    async remove(id) {
      await api(`/api/employers/${encodeURIComponent(id)}`, { method: "DELETE" });
      STATE.employers = STATE.employers.filter(x => x.id !== id);
    },
    async bulk(rows) {
      const r = await api("/api/employers/bulk", { method: "POST", body: JSON.stringify({ rows }) });
      if (r.inserted?.length) {
        STATE.employers = [...r.inserted].reverse().concat(STATE.employers);
      }
      return r;
    },
  },

  employees: {
    async create(data) {
      const r = await api("/api/employees", { method: "POST", body: JSON.stringify(data) });
      STATE.employees = [r, ...STATE.employees];
      return r;
    },
    async update(id, data) {
      const r = await api(`/api/employees/${encodeURIComponent(id)}`, {
        method: "PUT", body: JSON.stringify(data),
      });
      STATE.employees = STATE.employees.map(x => x.id === id ? r : x);
      return r;
    },
    async remark(id, remark) {
      const r = await api(`/api/employees/${encodeURIComponent(id)}/remark`, {
        method: "PATCH", body: JSON.stringify({ remark }),
      });
      STATE.employees = STATE.employees.map(x => x.id === id ? r : x);
      return r;
    },
    async followup(id, note) {
      const r = await api(`/api/employees/${encodeURIComponent(id)}/followups`, {
        method: "POST", body: JSON.stringify({ note }),
      });
      STATE.employees = STATE.employees.map(x => x.id === id ? r : x);
      return r;
    },
    async archive(id) {
      const r = await api(`/api/employees/${encodeURIComponent(id)}/archive`, { method: "PATCH" });
      STATE.employees = STATE.employees.map(x => x.id === id ? r : x);
      return r;
    },
    async remove(id) {
      await api(`/api/employees/${encodeURIComponent(id)}`, { method: "DELETE" });
      STATE.employees = STATE.employees.filter(x => x.id !== id);
    },
    async bulk(rows) {
      const r = await api("/api/employees/bulk", { method: "POST", body: JSON.stringify({ rows }) });
      if (r.inserted?.length) {
        STATE.employees = [...r.inserted].reverse().concat(STATE.employees);
      }
      return r;
    },
  },
};

/* ---------- Backward-compat shim for old DB.get/set patterns ----------
   The existing page templates call `DB.get("employers")` synchronously
   inside render functions. We keep that working by reading from the
   in-memory STATE cache (which is filled by API.bootstrap()).
*/
const DB = {
  get(key) {
    if (key === "employers") return STATE.employers;
    if (key === "employees") return STATE.employees;
    if (key === "logs") {
      // Map server log shape -> demo's expected shape
      return STATE.activityLog.map(l => ({
        t: l.t, user: l.user, action: l.action, target: l.target || "",
      }));
    }
    return [];
  },
  // Deprecated — kept as no-op so any leftover callers don't crash.
  // All writes now go through the API methods above.
  set(_key, _val) { /* no-op: API is the source of truth */ },
  // Test / dev convenience
  reset() {
    clearSession();
    STATE.employers = [];
    STATE.employees = [];
    STATE.activityLog = [];
  },
};

/* logEvent is now a no-op — the server logs every mutation automatically. */
function logEvent(_action, _target) { /* server handles activity log */ }

/* ---------- Auth flow ---------- */
async function requireAuth() {
  loadTokenFromStorage();
  if (!STATE.token) { location.href = "login.html"; return null; }
  try {
    await API.bootstrap();
    return STATE.user;
  } catch {
    clearSession();
    location.href = "login.html";
    return null;
  }
}

async function logout() {
  await API.logout();
  location.href = "login.html";
}

/* ---------- UI helpers (unchanged behaviour) ---------- */
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

/* ---------- Exports (CSV / Excel / PDF) ----------
   CSV is built inline. Excel uses SheetJS (loaded via CDN on pages
   that export). PDF uses jsPDF + autotable (loaded via CDN). */

/**
 * Normalise a record list for export — strips internal fields and
 * formats arrays into readable text. Pass the kind ("employers"
 * or "employees") so we know which columns to include.
 */
function rowsForExport(rows, kind) {
  if (!rows.length) return [];
  return rows.map((r, i) => {
    const base = {
      "S.No.": i + 1,
      ID: r.id,
    };
    if (kind === "employers") {
      return {
        ...base,
        Company: r.company,
        "Contact Person": r.person,
        Designation: r.designation || "",
        Phone: r.phone,
        State: r.state,
        District: r.district || "",
        Town: r.town || "",
        Remarks: r.remark || "",
        Status: r.status || "active",
        "Follow-ups": (r.followUps || []).map(f => `${f.date}: ${f.note}`).join(" | "),
      };
    }
    if (kind === "employees") {
      return {
        ...base,
        Name: r.name,
        Department: r.dept,
        Designation: r.designation,
        Phone: r.phone,
        State: r.state,
        District: r.district || "",
        Town: r.town || "",
        Remarks: r.remark || "",
        Status: r.status || "paid",
        "Transaction ID": r.txn || "",
        "Amount Paid": r.amountPaid || 0,
        "Payment Date": r.paymentDate || "",
        Receipt: r.receiptNumber || "",
        "Follow-ups": (r.followUps || []).map(f => `${f.date}: ${f.note}`).join(" | "),
      };
    }
    return r;
  });
}

/* ---------- CSV export ---------- */
function exportCSV(rows, filename) {
  if (!rows.length) { flash("Nothing to export"); return; }
  const headers = Object.keys(rows[0]);
  const csv = [headers.join(",")]
    .concat(rows.map(r => headers.map(h => {
      const v = r[h];
      const str = v == null ? "" : (typeof v === "object" ? JSON.stringify(v) : String(v));
      return `"${str.replace(/"/g, '""')}"`;
    }).join(",")))
    .join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
  flash("Exported " + filename);
}

/**
 * Excel export — requires SheetJS / XLSX loaded on the page.
 * Pages that want Excel export must include the xlsx CDN script.
 */
function exportXLSX(rows, kind, filename) {
  if (typeof XLSX === "undefined") {
    flash("Excel exporter not loaded — please refresh");
    return;
  }
  const data = rowsForExport(rows, kind);
  if (!data.length) { flash("Nothing to export"); return; }
  const sheet = XLSX.utils.json_to_sheet(data);
  const book = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(book, sheet, kind === "employers" ? "Employers" : "Candidates");
  XLSX.writeFile(book, filename);
  flash("Exported " + filename);
}

/**
 * PDF export — requires jsPDF + jsPDF AutoTable loaded on the page.
 * Renders a landscape A4 table with all visible columns. Long
 * columns (Remarks, Follow-ups) wrap automatically via autotable.
 */
function exportPDF(rows, kind, filename, titleLine) {
  if (typeof window.jspdf === "undefined" && typeof jsPDF === "undefined") {
    flash("PDF exporter not loaded — please refresh");
    return;
  }
  const data = rowsForExport(rows, kind);
  if (!data.length) { flash("Nothing to export"); return; }
  const { jsPDF: JS } = (window.jspdf || { jsPDF: jsPDF });
  const doc = new JS({ orientation: "landscape", unit: "pt", format: "a4" });
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text(titleLine || (kind === "employers" ? "Mindset Career — Employer Ledger" : "Mindset Career — Candidate Ledger"), 40, 38);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text("Generated: " + new Date().toLocaleString("en-IN"), 40, 54);

  const headers = Object.keys(data[0]);
  const body = data.map(r => headers.map(h => String(r[h] ?? "")));
  doc.autoTable({
    head: [headers],
    body,
    startY: 70,
    styles: { fontSize: 8, cellPadding: 4, overflow: "linebreak" },
    headStyles: { fillColor: [122, 31, 26], textColor: 244, fontStyle: "bold" }, // oxblood
    alternateRowStyles: { fillColor: [248, 245, 238] },
    columnStyles: { 0: { cellWidth: 32 } },
  });
  doc.save(filename);
  flash("Exported " + filename);
}

/* ---------- Bulk CSV import config + helpers ---------- */
const BULK_CONFIGS = {
  employers: {
    storeKey: "employers",
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
  },
  employees: {
    storeKey: "employees",
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
  },
};

function downloadCsvTemplate(kind) {
  const cfg = BULK_CONFIGS[kind];
  if (!cfg) { flash("Unknown template"); return; }
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
  flash("Template downloaded");
}

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
 * Submit a parsed CSV batch to the bulk-import endpoint.
 * Returns { inserted, failed } same shape as the server response.
 */
async function bulkImport(kind, rows) {
  if (kind === "employers") return API.employers.bulk(rows);
  if (kind === "employees") return API.employees.bulk(rows);
  throw new Error("Unknown bulk-import kind: " + kind);
}

/* ---------- Sidebar (unchanged) ---------- */
function renderSidebar(active) {
  const role = STATE.user?.role || "po";
  const initial = role === "admin" ? "A" : "P";
  const roleLabel = role === "admin" ? "Administrator" : "Placement Office";
  const name = STATE.user?.name || (role === "admin" ? "Mindset Admin" : "Placement Desk");

  return `
    <aside class="sidebar">
      <a href="dashboard.html" class="brand" style="text-decoration:none;padding:6px 0">
        <img src="assets/logo.png" alt="Mindset Career" style="height:38px;width:auto;background:#fff;padding:5px 10px;border-radius:5px;display:block" />
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

      <div class="side-group">
        <h5>Account</h5>
        <nav class="side-nav">
          <a href="settings.html" class="side-link ${active==='settings'?'active':''}">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 11-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 11-4 0v-.09a1.65 1.65 0 00-1-1.51 1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 11-2.83-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 110-4h.09a1.65 1.65 0 001.51-1 1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 112.83-2.83l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 114 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 112.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 110 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>
            Settings
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

/* ---------- Boot ---------- */
(function boot() {
  loadTokenFromStorage();
})();
